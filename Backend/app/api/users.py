from fastapi import APIRouter, Depends, HTTPException
from typing import Any, List
from bson import ObjectId

from app.db.mongodb import get_database
from app.models.user import UserResponse
from app.api.deps import get_current_active_admin

router = APIRouter()

@router.get("/", response_model=List[UserResponse])
async def read_users(
    skip: int = 0, limit: int = 100, 
    db=Depends(get_database), 
    current_admin: dict = Depends(get_current_active_admin)
) -> Any:
    """
    Retrieve users. Only accessible by Admins.
    """
    cursor = db.users.find().skip(skip).limit(limit)
    users = await cursor.to_list(length=limit)
    for u in users:
        u["id"] = str(u["_id"])
    return users

@router.delete("/{user_id}", response_model=dict)
async def delete_user(
    user_id: str, 
    db=Depends(get_database),
    current_admin: dict = Depends(get_current_active_admin)
) -> Any:
    """
    Delete a user by their custom user_id alias.
    """
    if user_id == "admin":
        raise HTTPException(status_code=400, detail="Cannot delete super admin")
        
    result = await db.users.delete_one({"user_id": user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
        
    # Cascade delete associated tax profiles
    await db.tax_profiles.delete_many({"user_id": user_id})
    # Optional: could also cascade delete cashbook budgets if tied to user_id
        
    return {"message": f"User {user_id} deleted successfully"}

