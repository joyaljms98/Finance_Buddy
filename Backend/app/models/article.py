from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class ArticleBase(BaseModel):
    title: str
    description: Optional[str] = ""
    content: Optional[str] = ""
    contentType: str = "markdown"  # 'markdown' or 'pdf'
    section: str = "Both"
    folder: str = "General"
    category: str = "Wealth Management"
    readTime: int = 5
    tags: Optional[str] = ""
    status: str = "Draft"

class ArticleCreate(ArticleBase):
    pass

class ArticleUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    content: Optional[str] = None
    contentType: Optional[str] = None
    section: Optional[str] = None
    folder: Optional[str] = None
    category: Optional[str] = None
    readTime: Optional[int] = None
    tags: Optional[str] = None
    status: Optional[str] = None

class ArticleInDB(ArticleBase):
    id: str = Field(alias="_id")
    authors: List[str] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)
    read_count: int = 0

class ArticleResponse(ArticleBase):
    id: str
    authors: List[str] = []
    created_at: datetime
    read_count: int

    class Config:
        populate_by_name = True
