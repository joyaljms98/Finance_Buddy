from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class Reminder(BaseModel):
    id: Optional[str] = None
    title: str
    description: str
    date: str
    targetGroup: str
    createdBy: Optional[str] = None
    createdAt: str

class Note(BaseModel):
    id: Optional[str] = None
    user_id: str
    title: str
    content: str
    folder: str = "Uncategorized"
    created_at: datetime
    updated_at: datetime

class Reply(BaseModel):
    sender: str
    time: str
    content: str

class Feedback(BaseModel):
    id: Optional[str] = None
    sender_id: Optional[str] = None
    senderName: str
    senderRole: str
    time: str
    type: str
    title: str
    content: str
    status: str = "New"
    replies: List[Reply] = []
