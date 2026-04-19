from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from bson import ObjectId
from datetime import datetime

from app.db.mongodb import get_database
from app.models.article import ArticleCreate, ArticleUpdate, ArticleResponse
from app.api.deps import get_current_user

router = APIRouter()

@router.get("/", response_model=List[ArticleResponse])
async def get_articles(db=Depends(get_database)):
    articles_cursor = db.articles.find({}).sort("created_at", -1)
    articles = await articles_cursor.to_list(length=1000)

    for article in articles:
        article["id"] = str(article.pop("_id"))

    return articles

@router.post("/", response_model=ArticleResponse)
async def create_article(
    article_in: ArticleCreate,
    current_user: dict = Depends(get_current_user),
    db=Depends(get_database)
):
    if current_user.get("role") not in ["Admin", "Editor"]:
        raise HTTPException(status_code=403, detail="Not enough permissions")

    new_article = article_in.dict()
    new_article["authors"] = [current_user.get("name", "Unknown")]
    new_article["created_at"] = datetime.utcnow()
    new_article["read_count"] = 0

    result = await db.articles.insert_one(new_article)
    new_article["id"] = str(result.inserted_id)

    return new_article

@router.put("/{article_id}", response_model=ArticleResponse)
async def update_article(
    article_id: str,
    article_in: ArticleUpdate,
    current_user: dict = Depends(get_current_user),
    db=Depends(get_database)
):
    if current_user.get("role") not in ["Admin", "Editor"]:
        raise HTTPException(status_code=403, detail="Not enough permissions")

    if not ObjectId.is_valid(article_id):
        raise HTTPException(status_code=400, detail="Invalid Article ID")

    existing_article = await db.articles.find_one({"_id": ObjectId(article_id)})
    if not existing_article:
        raise HTTPException(status_code=404, detail="Article not found")

    update_data = {k: v for k, v in article_in.dict(exclude_unset=True).items() if v is not None}

    # Append the current user to authors if not already listed
    current_username = current_user.get("name", "Unknown")
    authors = existing_article.get("authors", [])
    if current_username not in authors:
        authors.append(current_username)
        update_data["authors"] = authors

    if update_data:
        await db.articles.update_one({"_id": ObjectId(article_id)}, {"$set": update_data})

    updated_article = await db.articles.find_one({"_id": ObjectId(article_id)})
    updated_article["id"] = str(updated_article.pop("_id"))

    return updated_article

@router.delete("/{article_id}")
async def delete_article(
    article_id: str,
    current_user: dict = Depends(get_current_user),
    db=Depends(get_database)
):
    if current_user.get("role") not in ["Admin", "Editor"]:
        raise HTTPException(status_code=403, detail="Not enough permissions")

    if not ObjectId.is_valid(article_id):
        raise HTTPException(status_code=400, detail="Invalid Article ID")

    delete_result = await db.articles.delete_one({"_id": ObjectId(article_id)})
    if delete_result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Article not found")

    return {"success": True, "message": "Article deleted successfully"}

@router.post("/{article_id}/read")
async def register_read(article_id: str, db=Depends(get_database)):
    if not ObjectId.is_valid(article_id):
        raise HTTPException(status_code=400, detail="Invalid Article ID")

    update_result = await db.articles.update_one(
        {"_id": ObjectId(article_id)},
        {"$inc": {"read_count": 1}}
    )

    if update_result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Article not found")

    return {"success": True}
