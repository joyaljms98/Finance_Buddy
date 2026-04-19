from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class ChatMessage(BaseModel):
    id: str
    sender: str  # "user" | "ai"
    text: str
    timestamp: datetime


class ChatConversation(BaseModel):
    id: str
    user_id: str
    title: str
    messages: List[ChatMessage] = []
    created_at: datetime
    updated_at: datetime


class ChatSettings(BaseModel):
    id: str
    admin_id: str
    rag_folder_path: str
    ai_model: str  # "gemini-2.0-flash", "gemini-2.5-flash", etc.
    provider: str  # "gemini" | "ollama"
    ollama_endpoint: str
    embedding_model: str
    temperature: float = 0.7
    max_tokens: int = 500
    chunk_size: int = 1000
    top_k: int = 5
    system_prompt: str
    updated_at: datetime


class ChatRequest(BaseModel):
    query: str
    chat_mode: str = "simple"  # "simple" | "context"
    conversation_id: Optional[str] = None
    include_cashbook: bool = False
    include_goals: bool = False
    include_budget: bool = False
    include_profile: bool = True
    include_rag_docs: bool = True


class ChatSettingsUpdate(BaseModel):
    rag_folder_path: str
    ai_model: str
    provider: str
    ollama_endpoint: str
    embedding_model: str
    temperature: float
    max_tokens: int
    chunk_size: int
    top_k: int
    system_prompt: str
