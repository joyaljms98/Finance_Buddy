from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class Book(BaseModel):
    id: Optional[str] = None
    user_id: Optional[str] = None
    name: str
    initialBalance: float = 0.0
    isSystem: bool = False

class Head(BaseModel):
    id: Optional[str] = None
    user_id: Optional[str] = None
    name: str
    type: str # income or expense
    isSystem: bool = False

class Transaction(BaseModel):
    id: Optional[str] = None
    user_id: Optional[str] = None
    bookId: str
    headId: str
    amount: float
    description: str = ""
    type: str # income or expense
    date: str
    isRecurring: bool = False
    recurringType: str = "none"
