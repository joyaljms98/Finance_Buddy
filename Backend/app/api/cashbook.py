from fastapi import APIRouter, Depends, HTTPException
from typing import Any, List
from datetime import datetime
from bson import ObjectId

from app.db.mongodb import get_database
from app.models.cashbook import Book, Head, Transaction
from app.api.deps import get_current_active_user

router = APIRouter()

# --- Books ---
@router.get("/books", response_model=List[Book])
async def get_books(
    current_user: dict = Depends(get_current_active_user),
    db=Depends(get_database)
) -> Any:
    cursor = db.cashbook_books.find({"user_id": current_user["user_id"]})
    books = await cursor.to_list(length=100)
    for b in books:
        b["id"] = str(b["_id"])
    return books

@router.post("/books", response_model=Book)
async def create_book(
    book_in: Book,
    current_user: dict = Depends(get_current_active_user),
    db=Depends(get_database)
) -> Any:
    book_data = book_in.dict(exclude={"id"})
    book_data["user_id"] = current_user["user_id"]
    
    result = await db.cashbook_books.insert_one(book_data)
    book_data["_id"] = str(result.inserted_id)
    book_data["id"] = book_data["_id"]
    return book_data

@router.put("/books/{book_id}", response_model=dict)
async def update_book(
    book_id: str,
    book_in: dict,
    current_user: dict = Depends(get_current_active_user),
    db=Depends(get_database)
) -> Any:
    update_data = {k: v for k, v in book_in.items() if k in ["name", "initialBalance"]}
    if not update_data:
        raise HTTPException(status_code=400, detail="No valid fields to update")

    res = await db.cashbook_books.update_one(
        {"_id": ObjectId(book_id), "user_id": current_user["user_id"]},
        {"$set": update_data}
    )
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Book not found")
        
    return {"message": "Updated successfully"}

@router.delete("/books/{book_id}", response_model=dict)
async def delete_book(
    book_id: str,
    current_user: dict = Depends(get_current_active_user),
    db=Depends(get_database)
) -> Any:
    result = await db.cashbook_books.delete_one(
        {"_id": ObjectId(book_id), "user_id": current_user["user_id"]}
    )
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Book not found or unauthorized")
    
    # Cascade delete related transactions
    await db.cashbook_transactions.delete_many({"book_id": book_id, "user_id": current_user["user_id"]})
    return {"message": "Book and associated transactions deleted"}

# --- Heads ---
@router.get("/heads", response_model=List[Head])
async def get_heads(
    current_user: dict = Depends(get_current_active_user),
    db=Depends(get_database)
) -> Any:
    cursor = db.cashbook_heads.find({"user_id": current_user["user_id"]})
    heads = await cursor.to_list(length=200)
    for h in heads:
        h["id"] = str(h["_id"])
    return heads

@router.post("/heads", response_model=Head)
async def create_head(
    head_in: Head,
    current_user: dict = Depends(get_current_active_user),
    db=Depends(get_database)
) -> Any:
    head_data = head_in.dict(exclude={"id"})
    head_data["user_id"] = current_user["user_id"]
    
    result = await db.cashbook_heads.insert_one(head_data)
    head_data["_id"] = str(result.inserted_id)
    head_data["id"] = head_data["_id"]
    return head_data

# --- Transactions ---
@router.get("/transactions", response_model=List[Transaction])
async def get_transactions(
    current_user: dict = Depends(get_current_active_user),
    db=Depends(get_database)
) -> Any:
    cursor = db.cashbook_transactions.find({"user_id": current_user["user_id"]}).sort("date", -1)
    transactions = await cursor.to_list(length=1000)
    for t in transactions:
        t["id"] = str(t["_id"])
    return transactions

@router.post("/transactions", response_model=Transaction)
async def create_transaction(
    trans_in: Transaction,
    current_user: dict = Depends(get_current_active_user),
    db=Depends(get_database)
) -> Any:
    trans_data = trans_in.dict(exclude={"id"})
    trans_data["user_id"] = current_user["user_id"]
    
    result = await db.cashbook_transactions.insert_one(trans_data)
    trans_data["_id"] = str(result.inserted_id)
    trans_data["id"] = trans_data["_id"]
    return trans_data

@router.delete("/transactions/{trans_id}", response_model=dict)
async def delete_transaction(
    trans_id: str,
    current_user: dict = Depends(get_current_active_user),
    db=Depends(get_database)
) -> Any:
    result = await db.cashbook_transactions.delete_one(
        {"_id": ObjectId(trans_id), "user_id": current_user["user_id"]}
    )
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Transaction not found or unauthorized")
    return {"message": "Transaction deleted"}

@router.put("/transactions/{trans_id}", response_model=Transaction)
async def update_transaction(
    trans_id: str,
    trans_in: Transaction,
    current_user: dict = Depends(get_current_active_user),
    db=Depends(get_database)
) -> Any:
    trans_data = trans_in.dict(exclude={"id"})
    
    # Do not allow modifying user_id
    trans_data.pop("user_id", None)

    result = await db.cashbook_transactions.update_one(
        {"_id": ObjectId(trans_id), "user_id": current_user["user_id"]},
        {"$set": trans_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Transaction not found or unauthorized")
        
    trans_data["_id"] = trans_id
    trans_data["id"] = trans_id
    return trans_data
