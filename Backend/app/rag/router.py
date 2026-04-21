"""
Chatbot & RAG API Router
Handles chat settings, chat endpoint (simple/context modes), and chat history.
"""

from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from fastapi.responses import StreamingResponse
from typing import Any
from datetime import datetime
import uuid
import urllib.request
import json
import yaml

from app.db.mongodb import get_database
from app.rag.models import (
    ChatMessage, ChatConversation, ChatSettings,
    ChatRequest, ChatSettingsUpdate,
)
from app.api.deps import get_current_active_user
from app.rag.engine import rag_system

router = APIRouter()

# -----------------------------------------------------------------------
# Default settings — used when admin hasn't configured anything yet
# -----------------------------------------------------------------------
DEFAULT_SETTINGS = {
    "rag_folder_path": "",
    "ai_model": "gemini-2.0-flash",
    "provider": "gemini",
    "ollama_endpoint": "http://127.0.0.1:11434",
    "embedding_model": "gemini-embedding-001",
    "temperature": 0.7,
    "max_tokens": 4096,
    "chunk_size": 1000,
    "top_k": 5,
    "system_prompt": "You are Finance Buddy, an expert Indian CA and AI financial advisor. Provide concise, polite financial strategies using the provided context and RAG documents. When mentioning information retrieved from documents, explicitly cite the source filename. Use Indian IT Act (FY 2025-26) for tax. Evaluate goal feasibility via 'BankBalances' and suggest actionable steps. Use simple English, avoid specific stock tips, and state clearly if data is insufficient.",
}

# Deprecated / non-canonical model names → correct stable API names
_DEPRECATED_MODELS = {
    # Old versions
    "gemini-2.0-flash-exp": "gemini-2.0-flash",
    "gemini-1.5-flash": "gemini-2.0-flash",
    "gemini-1.5-pro": "gemini-2.5-pro",
    # Preview names that have now been promoted to stable
    "gemini-2.5-flash-preview-04-17": "gemini-2.5-flash",
    "gemini-2.5-pro-preview-03-25": "gemini-2.5-pro",
}
_DEPRECATED_EMBEDDINGS = {
    "models/text-embedding-004": "gemini-embedding-001",
    "text-embedding-004": "gemini-embedding-001",
    "models/embedding-001": "gemini-embedding-001",
}


def _sanitize_settings(settings: dict) -> dict:
    """Fix deprecated model names stored in MongoDB."""
    ai_model = settings.get("ai_model", "")
    if ai_model in _DEPRECATED_MODELS:
        print(f"[RAG] Replacing deprecated model {ai_model!r} -> {_DEPRECATED_MODELS[ai_model]!r}")
        settings["ai_model"] = _DEPRECATED_MODELS[ai_model]
    emb_model = settings.get("embedding_model", "")
    if emb_model in _DEPRECATED_EMBEDDINGS:
        print(f"[RAG] Replacing deprecated embedding {emb_model!r} -> {_DEPRECATED_EMBEDDINGS[emb_model]!r}")
        settings["embedding_model"] = _DEPRECATED_EMBEDDINGS[emb_model]
    # Enforce minimum max_tokens
    if settings.get("max_tokens", 0) < 1024:
        settings["max_tokens"] = 4096
    return settings


def _clean_dict_for_yaml(d: dict) -> dict:
    """Removes None/empty values to minimize token footprint."""
    if not isinstance(d, dict):
        return d
    return {k: v for k, v in d.items() if v not in (None, "", [], {})}


# -----------------------------------------------------------------------
# Settings endpoints
# -----------------------------------------------------------------------
@router.get("/settings", response_model=ChatSettings)
async def get_settings(
    current_user: dict = Depends(get_current_active_user),
    db=Depends(get_database),
) -> Any:
    settings = await db.chat_settings.find_one({"admin_id": "global"})
    if not settings:
        return {
            "id": "default",
            "admin_id": "global",
            **DEFAULT_SETTINGS,
            "updated_at": datetime.utcnow(),
        }
    settings["id"] = str(settings["_id"])
    return settings


@router.post("/settings", response_model=ChatSettings)
async def update_settings(
    settings_in: ChatSettingsUpdate,
    current_user: dict = Depends(get_current_active_user),
    db=Depends(get_database),
) -> Any:
    update_data = settings_in.dict()
    update_data["updated_at"] = datetime.utcnow()

    await db.chat_settings.update_one(
        {"admin_id": "global"},
        {"$set": update_data},
        upsert=True,
    )

    # Re-initialize RAG System with new settings
    try:
        rag_system.initialize(
            rag_folder_path=settings_in.rag_folder_path,
            provider=settings_in.provider,
            ai_model=settings_in.ai_model,
            embedding_model=settings_in.embedding_model,
            ollama_endpoint=settings_in.ollama_endpoint,
            temperature=settings_in.temperature,
            max_tokens=settings_in.max_tokens,
            system_prompt=settings_in.system_prompt,
            chunk_size=settings_in.chunk_size,
            top_k=settings_in.top_k,
        )
        # Note: Indexing is specifically decoupled from saving settings per user request.
        # It must be triggered manually via the reindex endpoint.
    except Exception as e:
        print(f"[RAG] Re-init error: {e}")

    updated = await db.chat_settings.find_one({"admin_id": "global"})
    updated["id"] = str(updated["_id"])
    return updated


@router.post("/reindex")
async def force_reindex(
    background_tasks: BackgroundTasks,
    current_user: dict = Depends(get_current_active_user),
    db=Depends(get_database),
):
    settings = await db.chat_settings.find_one({"admin_id": "global"})
    if not settings or not settings.get("rag_folder_path"):
        raise HTTPException(status_code=400, detail="RAG folder path is not set in settings.")
    
    rag_folder_path = settings.get("rag_folder_path")

    def run_reindex():
        try:
            # force_rebuild=True: always override existing index when admin explicitly clicks Sync
            rag_system.build_or_update_vectorstore(
                rag_folder_path,
                force_rebuild=True,
            )
        except Exception as e:
            print(f"[RAG] Background re-index error: {e}")
            rag_system.reindex_status = "error"

    background_tasks.add_task(run_reindex)
    return {"message": "Re-indexing started in the background."}


@router.get("/reindex/progress")
async def get_reindex_progress(
    current_user: dict = Depends(get_current_active_user),
):
    return {
        "status": rag_system.reindex_status,
        "progress": rag_system.reindex_progress,
        "total": rag_system.reindex_total
    }


@router.post("/reindex/stop")
async def stop_reindex(
    current_user: dict = Depends(get_current_active_user),
):
    if rag_system.reindex_status == "indexing":
        rag_system.force_stop_reindex = True
        return {"message": "Stop signal sent."}
    return {"message": "Not currently indexing."}


@router.get("/ollama_models")
async def get_ollama_models(
    endpoint: str = "http://127.0.0.1:11434",
    current_user: dict = Depends(get_current_active_user),
):
    try:
        url = f"{endpoint.rstrip('/')}/api/tags"
        req = urllib.request.Request(url)
        with urllib.request.urlopen(req, timeout=5) as response:
            data = json.loads(response.read().decode())
            return {"models": [model["name"] for model in data.get("models", [])]}
    except Exception as e:
        return {"models": [], "error": str(e)}


# -----------------------------------------------------------------------
# Chat endpoint
# -----------------------------------------------------------------------
@router.post("/chat")
async def chat_endpoint(
    request: ChatRequest,
    current_user: dict = Depends(get_current_active_user),
    db=Depends(get_database),
):
    # Load settings
    settings = await db.chat_settings.find_one({"admin_id": "global"})
    if not settings:
        settings = dict(DEFAULT_SETTINGS)
    else:
        settings = _sanitize_settings(dict(settings))

    # Ensure RAG system is initialized or needs update
    needs_init = not rag_system.is_initialized
    if rag_system.is_initialized:
        if (rag_system.provider != settings.get("provider", "gemini") or
            rag_system.ai_model != settings.get("ai_model", "gemini-2.0-flash")):
            needs_init = True

    if needs_init:
        try:
            rag_system.initialize(
                rag_folder_path=settings.get("rag_folder_path", ""),
                provider=settings.get("provider", "gemini"),
                ai_model=settings.get("ai_model", "gemini-2.0-flash"),
                embedding_model=settings.get("embedding_model", "gemini-embedding-001"),
                ollama_endpoint=settings.get("ollama_endpoint", "http://127.0.0.1:11434"),
                temperature=settings.get("temperature", 0.7),
                max_tokens=settings.get("max_tokens", 4096),
                system_prompt=settings.get("system_prompt", DEFAULT_SETTINGS["system_prompt"]),
                chunk_size=settings.get("chunk_size", 1000),
                top_k=settings.get("top_k", 5),
            )
        except Exception as e:
            print(f"[RAG] Init error on chat: {e}")

    # Generate a conversation_id if this is a new chat
    conv_id = request.conversation_id or str(uuid.uuid4())

    # Save User Message
    user_msg = ChatMessage(
        id=str(uuid.uuid4()),
        sender="user",
        text=request.query,
        timestamp=datetime.utcnow(),
    )

    await db.chat_conversations.update_one(
        {"id": conv_id},
        {
            "$setOnInsert": {
                "id": conv_id,
                "user_id": current_user["user_id"],
                "title": request.query[:50] + ("..." if len(request.query) > 50 else ""),
                "created_at": datetime.utcnow(),
            },
            "$push": {"messages": user_msg.dict()},
            "$set": {"updated_at": datetime.utcnow()},
        },
        upsert=True,
    )

    sys_prompt = settings.get("system_prompt", DEFAULT_SETTINGS["system_prompt"])

    async def stream_generator():
        full_response = ""

        if request.chat_mode == "context":
            # --- Pre-fetch reference maps for enrichment ---
            # This ensures the AI sees "Salary" instead of a raw DB ID.
            heads_cursor = db.cashbook_heads.find({"user_id": current_user["user_id"]})
            heads_list = await heads_cursor.to_list(length=500)
            head_map = {str(h["_id"]): h.get("name", "Unknown") for h in heads_list}
            
            books_cursor = db.cashbook_books.find({"user_id": current_user["user_id"]})
            books_list = await books_cursor.to_list(length=100)
            book_map = {str(b["_id"]): b.get("name", "Unknown") for b in books_list}

            # --- Fetch Synced Data (Goals, Budgets, and Notes) ---
            synced_data = await db.user_synced_data.find_one({"user_id": current_user["user_id"]})
            if not synced_data:
                synced_data = {}

            # --- Build YAML context ---
            context_data = {"Profiles": []}
            # Always initialize profiles list — used as a fallback in goals block
            # even when include_profile=False, so it must exist.
            profiles = []

            if request.include_profile:
                profiles_cursor = db.tax_profiles.find({"user_id": current_user["user_id"]})
                profiles = await profiles_cursor.to_list(length=10)

                # Always include ALL profiles so the chatbot has full family context
                for idx, p in enumerate(profiles):
                    clean_p = _clean_dict_for_yaml(p)
                    clean_p.pop("_id", None)
                    clean_p.pop("user_id", None)
                    
                    # Handle goals explicitly if specifically requested or present in profile
                    if not request.include_goals:
                        clean_p.pop("goals", None)
                    
                    context_data["Profiles"].append(clean_p)

            if request.include_goals:
                # Prioritize goals from user_synced_data, fallback to profiles
                goals = synced_data.get("goals", [])
                if goals:
                    # If it's a list (structured), clean it; if string, keep it
                    if isinstance(goals, list):
                        context_data["FinancialGoals"] = [_clean_dict_for_yaml(g) if isinstance(g, dict) else g for g in goals]
                    else:
                        context_data["FinancialGoals"] = goals
                else:
                    # Collect goals from all profiles if synced_data goals are empty
                    all_p_goals = [p.get("goals") for p in profiles if p.get("goals")]
                    if all_p_goals:
                        context_data["FinancialGoals"] = all_p_goals

            if request.include_cashbook:
                tx_cursor = (
                    db.cashbook_transactions.find({"user_id": current_user["user_id"]})
                    .sort([("date", -1), ("_id", -1)])  # compound sort: newest date first, then newest inserted
                    .limit(20)
                )
                transactions = await tx_cursor.to_list(length=20)
                context_data["RecentCashbook"] = [
                    {
                        "date": tx.get("date"),
                        "amount": tx.get("amount"),
                        "type": tx.get("type"),
                        "head": head_map.get(str(tx.get("headId", "")), "Other"),
                        "book": book_map.get(str(tx.get("bookId", "")), "Main"),
                        "desc": tx.get("description", ""),
                        "recurring": tx.get("isRecurring", False),
                    }
                    for tx in transactions
                ]
                
                # Fetch and calculate balances for all books
                all_books = await db.cashbook_books.find({"user_id": current_user["user_id"]}).to_list(length=100)
                book_balances = {}
                for b in all_books:
                    book_balances[str(b["_id"])] = {
                        "name": b.get("name", "Unknown Book"),
                        "balance": float(b.get("initialBalance", 0.0))
                    }
                    
                pipeline = [
                    {"$match": {"user_id": current_user["user_id"]}},
                    {"$group": {
                        "_id": {"bookId": "$bookId", "type": "$type"},
                        "total": {"$sum": "$amount"}
                    }}
                ]
                agg_cursor = db.cashbook_transactions.aggregate(pipeline)
                agg_results = await agg_cursor.to_list(length=1000)
                
                for res in agg_results:
                    b_id = res["_id"].get("bookId")
                    tx_type = res["_id"].get("type")
                    total = float(res.get("total", 0.0))
                    
                    if b_id in book_balances:
                        if tx_type == "income":
                            book_balances[b_id]["balance"] += total
                        elif tx_type == "expense":
                            book_balances[b_id]["balance"] -= total

                context_data["BankBalances"] = [
                    {"book_name": b_data["name"], "current_balance": b_data["balance"]}
                    for b_data in book_balances.values()
                ]

            if request.include_budget:
                # 1. Try fetching from dedicated budgets collection (if used)
                budget_cursor = db.budgets.find({"user_id": current_user["user_id"]}).limit(10)
                db_budgets = await budget_cursor.to_list(length=10)
                
                # 2. Try fetching from synced_data (which is where the dashboard saves them)
                synced_budgets = synced_data.get("budgets", [])
                
                context_data["Budgets"] = []
                # Combine both sources if necessary, but prioritize synced_budgets
                all_raw_budgets = (db_budgets or []) + (synced_budgets if isinstance(synced_budgets, list) else [])
                
                for b in all_raw_budgets:
                    if not isinstance(b, dict): continue
                    clean_b = {k: v for k, v in b.items() if k not in ("_id", "user_id")}
                    # Enrich headId if present
                    if "headId" in clean_b:
                        clean_b["category"] = head_map.get(str(clean_b["headId"]), clean_b.get("category", "Unknown"))
                    context_data["Budgets"].append(_clean_dict_for_yaml(clean_b))

            yaml_context = yaml.dump(context_data, default_flow_style=False, sort_keys=False)

            try:
                async for chunk in rag_system.generate_context_stream(
                    query=request.query,
                    context=yaml_context,
                    system_prompt=sys_prompt,
                    include_rag_docs=request.include_rag_docs
                ):
                    full_response += chunk
                    yield chunk
            except Exception as e:
                err_msg = f"\n\n[System Interface Error: Could not generate AI response due to an internal or quota error.]"
                full_response += err_msg
                yield err_msg

        else:
            # Simple chat mode — no RAG, no context
            try:
                async for chunk in rag_system.generate_simple_stream(
                    query=request.query,
                    system_prompt=sys_prompt,
                ):
                    full_response += chunk
                    yield chunk
            except Exception as e:
                err_msg = f"\n\n[System Interface Error: Could not generate AI response due to an internal or quota error.]"
                full_response += err_msg
                yield err_msg

        # Save AI Response
        ai_msg = ChatMessage(
            id=str(uuid.uuid4()),
            sender="ai",
            text=full_response,
            timestamp=datetime.utcnow(),
        )
        await db.chat_conversations.update_one(
            {"id": conv_id},
            {"$push": {"messages": ai_msg.dict()}},
        )

    headers = {"X-Conversation-Id": conv_id}
    return StreamingResponse(
        stream_generator(),
        media_type="text/event-stream",
        headers=headers,
    )


# -----------------------------------------------------------------------
# History endpoints
# -----------------------------------------------------------------------
@router.get("/history")
async def get_history(
    current_user: dict = Depends(get_current_active_user),
    db=Depends(get_database),
):
    cursor = db.chat_conversations.find({"user_id": current_user["user_id"]}).sort("updated_at", -1)
    history = await cursor.to_list(length=50)
    for h in history:
        h.pop("_id", None)
    return history


@router.delete("/history/{conv_id}")
async def delete_history(
    conv_id: str,
    current_user: dict = Depends(get_current_active_user),
    db=Depends(get_database),
):
    await db.chat_conversations.delete_one({"id": conv_id, "user_id": current_user["user_id"]})
    return {"status": "success"}
