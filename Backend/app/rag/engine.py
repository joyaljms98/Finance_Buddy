"""
RAG Engine — Uses the google-genai SDK for Gemini, with Ollama as a fallback.
Supports two modes:
  - simple: plain chatbot (system prompt + user query only)
  - context: full RAG with user profile, cashbook, goals, budgets, and document retrieval
"""

import os
import hashlib
from typing import List, Optional, AsyncGenerator
from pathlib import Path

from fastapi import HTTPException

os.environ["ANONYMIZED_TELEMETRY"] = "False"

import chromadb
from chromadb.utils.embedding_functions import EmbeddingFunction


# ---------------------------------------------------------------------------
# Custom Embedding Function for ChromaDB using google-genai SDK
# ---------------------------------------------------------------------------
class GeminiEmbeddingFunction(EmbeddingFunction):
    """Wraps google-genai embed_content for use with ChromaDB."""

    def __init__(self, api_key: str, model: str = "gemini-embedding-001"):
        from google import genai
        self._client = genai.Client(api_key=api_key)
        self._model = model

    def __call__(self, input: List[str]) -> List[List[float]]:
        result = self._client.models.embed_content(
            model=self._model,
            contents=input,
        )
        return [e.values for e in result.embeddings]


class OllamaEmbeddingFunction(EmbeddingFunction):
    """Calls Ollama's /api/embeddings endpoint for local offline embeddings.
    Requires: ollama pull nomic-embed-text
    """

    def __init__(self, model: str = "nomic-embed-text", endpoint: str = "http://127.0.0.1:11434"):
        import urllib.request as _urllib
        import json as _json
        self._model = model
        self._endpoint = endpoint.rstrip('/')
        # Verify connectivity on init
        try:
            req = _urllib.Request(f"{self._endpoint}/api/tags")
            with _urllib.urlopen(req, timeout=5):
                pass
        except Exception as e:
            print(f"[RAG] Ollama not reachable at {self._endpoint}: {e}")

    def __call__(self, input: List[str]) -> List[List[float]]:
        import urllib.request as _urllib
        import json as _json
        embeddings = []
        for text in input:
            payload = _json.dumps({"model": self._model, "prompt": text}).encode()
            req = _urllib.Request(
                f"{self._endpoint}/api/embeddings",
                data=payload,
                headers={"Content-Type": "application/json"},
                method="POST",
            )
            with _urllib.urlopen(req, timeout=30) as resp:
                data = _json.loads(resp.read().decode())
            embeddings.append(data["embedding"])
        return embeddings


# ---------------------------------------------------------------------------
# Document loader helpers
# ---------------------------------------------------------------------------
import json

def _load_specific_documents(file_paths: List[str]) -> List[dict]:
    """Load text from specific .pdf, .txt, .md files. Returns list of {text, source}."""
    documents = []
    for full_path in file_paths:
        if not os.path.exists(full_path):
            continue
        ext = os.path.splitext(full_path)[1].lower()
        try:
            if ext == '.pdf':
                from pypdf import PdfReader
                reader = PdfReader(full_path)
                text = "\n".join(page.extract_text() or "" for page in reader.pages)
            else:
                # .txt / .md
                try:
                    with open(full_path, 'r', encoding='utf-8') as f:
                        text = f.read()
                except UnicodeDecodeError:
                    with open(full_path, 'r', encoding='latin-1') as f:
                        text = f.read()

            if text.strip():
                documents.append({"text": text, "source": full_path})
        except Exception as e:
            print(f"[RAG] Error loading {full_path}: {e}")
    return documents


def _chunk_text(text: str, chunk_size: int = 1000, overlap: int = 150) -> List[str]:
    """Split text into overlapping chunks."""
    chunks = []
    start = 0
    while start < len(text):
        end = start + chunk_size
        chunks.append(text[start:end])
        start = end - overlap
    return [c for c in chunks if c.strip()]


# ---------------------------------------------------------------------------
# RAG System
# ---------------------------------------------------------------------------
class RAGSystem:
    def __init__(self):
        self._genai_client = None  # google.genai.Client
        self._chroma_client: Optional[chromadb.PersistentClient] = None
        self._collection = None
        self._embedding_fn = None

        # Ollama fallback
        self._ollama_llm = None

        # Config
        self.provider: str = "gemini"
        self.ai_model: str = "gemini-2.0-flash"
        self.embedding_model: str = "gemini-embedding-001"
        self.temperature: float = 0.7
        self.max_tokens: int = 4096
        self.system_prompt: str = "You are Finance Buddy, an expert Indian CA and AI financial advisor. Provide concise, polite financial strategies using the provided context and RAG documents. Use Indian IT Act (FY 2025-26) for tax. Evaluate goal feasibility via 'BankBalances' and suggest actionable steps. Use simple English, avoid specific stock tips, and state clearly if data is insufficient."
        self.chunk_size: int = 1000
        self.top_k: int = 5

        self.is_initialized: bool = False
        self._init_error: Optional[str] = None
        self._ollama_endpoint: str = "http://127.0.0.1:11434"
        self._collection_name: str = "rag_docs_gemini"

        self.reindex_progress: int = 0
        self.reindex_total: int = 0
        self.reindex_status: str = "idle"  # "idle", "indexing", "stopped", "completed", "error"
        self.force_stop_reindex: bool = False

    # ------------------------------------------------------------------
    # Initialization
    # ------------------------------------------------------------------
    def initialize(
        self,
        provider: str = "gemini",
        ai_model: str = "gemini-2.0-flash",
        embedding_model: str = "gemini-embedding-001",
        ollama_endpoint: str = "http://127.0.0.1:11434",
        temperature: float = 0.7,
        max_tokens: int = 4096,
        rag_folder_path: str = "",
        system_prompt: str = "You are Finance Buddy, an expert Indian CA and AI financial advisor. Provide concise, polite financial strategies using the provided context and RAG documents. Use Indian IT Act (FY 2025-26) for tax. Evaluate goal feasibility via 'BankBalances' and suggest actionable steps. Use simple English, avoid specific stock tips, and state clearly if data is insufficient.",
        chunk_size: int = 1000,
        top_k: int = 5,
    ):
        self._init_error = None
        self.provider = provider
        self.ai_model = ai_model
        self.embedding_model = embedding_model
        self.temperature = temperature
        self.max_tokens = max_tokens
        self.system_prompt = system_prompt
        self.chunk_size = chunk_size
        self.top_k = top_k

        try:
            base_dir = Path(__file__).resolve().parent
            chroma_path = str(base_dir / "chroma_db")
            os.makedirs(chroma_path, exist_ok=True)

            # Store endpoint for later use
            self._ollama_endpoint = ollama_endpoint

            # Determine embedding function and ChromaDB collection name based on model
            NOMIC_MODELS = {"nomic-embed-text"}
            is_nomic = embedding_model in NOMIC_MODELS

            if is_nomic:
                self._embedding_fn = OllamaEmbeddingFunction(
                    model=embedding_model,
                    endpoint=ollama_endpoint,
                )
                self._collection_name = f"rag_docs_{embedding_model.replace('-', '_').replace(':', '_')}"
            else:
                # Default: Gemini online embedding
                from app.core.config import get_settings
                app_settings = get_settings()
                api_key = app_settings.GEMINI_API_KEY
                if not api_key:
                    raise ValueError("GEMINI_API_KEY is not set in Backend/.env")
                from google import genai
                self._genai_client = genai.Client(api_key=api_key)
                self._embedding_fn = GeminiEmbeddingFunction(api_key=api_key, model=embedding_model)
                self._collection_name = "rag_docs_gemini"

            # Set up shared ChromaDB client with model-specific collection
            self._chroma_client = chromadb.PersistentClient(path=chroma_path)
            self._collection = self._chroma_client.get_or_create_collection(
                name=self._collection_name,
                embedding_function=self._embedding_fn,
            )

            # Also set up Gemini LLM client if not already set (for chat generation)
            if provider == "gemini":
                from app.core.config import get_settings
                app_settings = get_settings()
                api_key = app_settings.GEMINI_API_KEY
                if not api_key:
                    raise ValueError("GEMINI_API_KEY is not set in Backend/.env")
                if not self._genai_client:
                    from google import genai
                    self._genai_client = genai.Client(api_key=api_key)

            elif provider == "ollama":
                from langchain_ollama import ChatOllama
                self._ollama_llm = ChatOllama(
                    model=ai_model,
                    base_url=ollama_endpoint,
                    temperature=temperature,
                )
            else:
                raise ValueError(f"Unknown provider: {provider}")

            self.is_initialized = True
            print(f"[RAG] Initialized: provider={provider}, model={ai_model}, embedding={embedding_model}, collection={self._collection_name}")

        except Exception as e:
            self._init_error = str(e)
            self.is_initialized = False
            print(f"[RAG] Initialization FAILED: {e}")
            raise

    # ------------------------------------------------------------------
    # Vectorstore management
    # ------------------------------------------------------------------
    def build_or_update_vectorstore(self, rag_folder_path: str, force_rebuild: bool = False):
        if not self.is_initialized or not self._collection:
            print("[RAG] Skipping vectorstore build — not initialized or no collection.")
            return False

        if not os.path.isabs(rag_folder_path):
            app_dir = Path(__file__).resolve().parent.parent  # Backend/app
            resolved_path = app_dir / rag_folder_path
            if resolved_path.exists():
                rag_folder_path = str(resolved_path)

        if not rag_folder_path or not os.path.exists(rag_folder_path):
            print(f"[RAG] Invalid folder path: {rag_folder_path}")
            return False

        base_dir = Path(__file__).resolve().parent
        # Use collection-specific state file to avoid cross-model contamination
        state_file = base_dir / "chroma_db" / f"index_state_{self._collection_name}.json"
        
        current_state = {}
        supported_ext = {'.pdf', '.txt', '.md'}
        
        for root, _, files in os.walk(rag_folder_path):
            for file in files:
                ext = os.path.splitext(file)[1].lower()
                if ext in supported_ext:
                    full_path = os.path.join(root, file)
                    current_state[full_path] = os.path.getmtime(full_path)
                    
        old_state = {}
        if os.path.exists(state_file) and not force_rebuild:
            try:
                with open(state_file, 'r') as f:
                    old_state = json.load(f)
            except Exception:
                pass
                
        # Find changed/new and deleted
        added_or_modified = []
        for path, mtime in current_state.items():
            if path not in old_state or old_state[path] != mtime:
                added_or_modified.append(path)
                
        deleted = [path for path in old_state if path not in current_state]
        
        if not added_or_modified and not deleted and not force_rebuild:
            print("[RAG] No changes detected in RAG documents. Skipping re-indexing.")
            return True

        if force_rebuild:
            added_or_modified = list(current_state.keys())
            deleted = []
        else:
            # Delete chunks for modified/deleted files
            for path in added_or_modified + deleted:
                try:
                    self._collection.delete(where={"source": path})
                except Exception as e:
                    print(f"[RAG] Failed to delete old chunks for {path}: {e}")

        if not added_or_modified and deleted:
            print(f"[RAG] Deleted {len(deleted)} files from index.")
            with open(state_file, 'w') as f:
                json.dump(current_state, f)
            return True

        docs = _load_specific_documents(added_or_modified)
        if force_rebuild and docs:
            # ONLY drop collection if we actually read docs successfully
            try:
                self._chroma_client.delete_collection("rag_docs")
                self._collection = self._chroma_client.get_or_create_collection(
                    name="rag_docs",
                    embedding_function=self._embedding_fn,
                )
            except Exception:
                pass

        if not docs and added_or_modified:
            print("[RAG] No readable content found in added/modified files.")
            with open(state_file, 'w') as f:
                json.dump(current_state, f)
            return True

        all_chunks = []
        all_ids = []
        all_metadatas = []

        for doc in docs:
            chunks = _chunk_text(doc["text"], self.chunk_size, int(self.chunk_size * 0.15))
            for i, chunk in enumerate(chunks):
                chunk_id = hashlib.md5(f"{doc['source']}:{i}:{chunk[:50]}".encode()).hexdigest()
                all_chunks.append(chunk)
                all_ids.append(chunk_id)
                all_metadatas.append({"source": doc["source"], "chunk_index": i})

        # Setup state for progress tracking
        self.reindex_status = "indexing"
        self.reindex_progress = 0
        self.reindex_total = len(all_chunks)
        self.force_stop_reindex = False

        # Add in batches of 100 (ChromaDB limit)
        batch_size = 100
        for i in range(0, len(all_chunks), batch_size):
            if self.force_stop_reindex:
                self.reindex_status = "stopped"
                print(f"[RAG] Re-index force stopped at {i}/{len(all_chunks)} chunks.")
                break

            batch_end = min(i + batch_size, len(all_chunks))
            self._collection.upsert(
                documents=all_chunks[i:batch_end],
                ids=all_ids[i:batch_end],
                metadatas=all_metadatas[i:batch_end],
            )
            self.reindex_progress = batch_end

        if self.force_stop_reindex:
            return False

        self.reindex_status = "completed"
        print(f"[RAG] Vectorstore updated: processed {len(docs)} files, {len(all_chunks)} chunks added. Deletions: {len(deleted)}.")
        with open(state_file, 'w') as f:
            json.dump(current_state, f)
            
        return True

    # ------------------------------------------------------------------
    # Retrieval
    # ------------------------------------------------------------------
    def retrieve(self, query: str) -> str:
        """Retrieve relevant document chunks for a query."""
        if not self._collection:
            return ""
        try:
            results = self._collection.query(query_texts=[query], n_results=self.top_k)
            if results and results["documents"]:
                return "\n\n---\n\n".join(results["documents"][0])
        except Exception as e:
            print(f"[RAG] Retrieval error: {e}")
        return ""

    # ------------------------------------------------------------------
    # Chat generation (streaming)
    # ------------------------------------------------------------------
    def _check_guardrails(self, query: str, prompt: str):
        """Guardrails using standard FastAPI error codes."""
        forbidden_phrases = [
            "ignore all previous instructions",
            "ignore previous instructions",
            "system bypass",
            "forget your instructions"
        ]
        q_lower = query.lower()
        p_lower = prompt.lower()
        for phrase in forbidden_phrases:
            if phrase in q_lower or phrase in p_lower:
                raise HTTPException(status_code=400, detail="Security guardrail triggered: Malicious injection detected.")

    async def generate_simple_stream(self, query: str, system_prompt: str = "") -> AsyncGenerator[str, None]:
        """Simple chat: system prompt + user query only. No RAG, no context."""
        prompt = system_prompt or self.system_prompt
        self._check_guardrails(query, prompt)

        if not self.is_initialized:
            error_detail = self._init_error or "No settings saved yet."
            yield f"⚠️ AI provider not initialized. Reason: {error_detail}\n\nPlease check your Admin → Chatbot & RAG Settings."
            return

        if self.provider == "gemini":
            yield_from = self._gemini_stream(query, prompt)
        else:
            yield_from = self._ollama_stream(query, prompt)

        async for chunk in yield_from:
            yield chunk

    async def summarize_query(self, query: str) -> str:
        """Extract core intent and metadata from complex queries for better RAG retrieval."""
        if not self.is_initialized or len(query) < 50:
            return query
            
        sys_prompt = "Extract the core financial intent and keywords from the user's query into a concise search term of max 15 words. Do not answer the question, just summarize the intent for vector search."
        try:
            if self.provider == "gemini" and self._genai_client:
                from google.genai import types
                import asyncio
                def _call():
                    res = self._genai_client.models.generate_content(
                        model=self.ai_model,
                        contents=query,
                        config=types.GenerateContentConfig(
                            system_instruction=sys_prompt,
                            temperature=0.3,
                            max_output_tokens=50,
                        ),
                    )
                    return res.text
                loop = asyncio.get_event_loop()
                summary = await loop.run_in_executor(None, _call)
                return summary.strip() if summary else query
            elif self.provider == "ollama" and getattr(self, "_ollama_llm", None):
                from langchain.schema import HumanMessage, SystemMessage
                messages = [SystemMessage(content=sys_prompt), HumanMessage(content=query)]
                res = await self._ollama_llm.ainvoke(messages)
                return res.content.strip() if res and res.content else query
        except Exception as e:
            print(f"[RAG] Summarization error: {e}")
            
        return query

    async def generate_context_stream(
        self, query: str, context: str, system_prompt: str = "", include_rag_docs: bool = True
    ) -> AsyncGenerator[str, None]:
        """Context chat: RAG docs + user profile context + system prompt."""
        prompt = system_prompt or self.system_prompt
        self._check_guardrails(query, prompt)

        if not self.is_initialized:
            error_detail = self._init_error or "No settings saved yet."
            yield f"⚠️ AI provider not initialized. Reason: {error_detail}\n\nPlease check your Admin → Chatbot & RAG Settings."
            return

        # Pre-process complex queries using summarization/metadata extraction wrapper
        search_query = await self.summarize_query(query) if include_rag_docs else query

        # Retrieve RAG documents
        rag_context = self.retrieve(search_query) if include_rag_docs else ""

        full_system_prompt = (
            f"{prompt}\n\n"
            f"=== USER PERSONAL CONTEXT (YAML) ===\n"
            f"{context}\n"
            f"====================================\n\n"
            f"=== KNOWLEDGE BASE RAG DOCUMENTS ===\n"
            f"{rag_context if rag_context else 'No extra documents found.'}\n"
            f"====================================\n\n"
            f"Please respond as Finance Buddy using the rules above."
        )

        if self.provider == "gemini":
            yield_from = self._gemini_stream(query, full_system_prompt)
        else:
            yield_from = self._ollama_stream(query, full_system_prompt)

        async for chunk in yield_from:
            yield chunk

    # ------------------------------------------------------------------
    # Provider-specific streaming
    # ------------------------------------------------------------------
    async def _gemini_stream(self, query: str, system_prompt: str) -> AsyncGenerator[str, None]:
        """Stream response from Gemini using google-genai SDK."""
        from google.genai import types
        import asyncio

        try:
            def _sync_stream():
                """Run the synchronous streaming in a thread."""
                collected = []
                for chunk in self._genai_client.models.generate_content_stream(
                    model=self.ai_model,
                    contents=query,
                    config=types.GenerateContentConfig(
                        system_instruction=system_prompt,
                        temperature=self.temperature,
                        max_output_tokens=self.max_tokens,
                    ),
                ):
                    if chunk.text:
                        collected.append(chunk.text)
                return collected

            # Run sync streaming in thread pool and yield chunks
            loop = asyncio.get_event_loop()
            chunks = await loop.run_in_executor(None, _sync_stream)
            for chunk_text in chunks:
                yield chunk_text

        except Exception as e:
            yield f"\n\n⚠️ Generation error: {str(e)}"

    async def _ollama_stream(self, query: str, system_prompt: str) -> AsyncGenerator[str, None]:
        """Stream response from Ollama using langchain."""
        if not self._ollama_llm:
            yield "⚠️ Ollama is not configured."
            return

        from langchain.schema import HumanMessage, SystemMessage

        messages = [
            SystemMessage(content=system_prompt),
            HumanMessage(content=query),
        ]
        try:
            async for chunk in self._ollama_llm.astream(messages):
                if chunk.content:
                    yield chunk.content
        except Exception as e:
            yield f"\n\n⚠️ Generation error: {str(e)}"


# Singleton instance
rag_system = RAGSystem()
