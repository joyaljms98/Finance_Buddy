from fastapi import APIRouter, Depends, HTTPException
from typing import Any, List, Dict
from app.db.mongodb import get_database
from app.api.deps import get_current_active_user

router = APIRouter()

@router.get("/")
async def get_roles(db=Depends(get_database)) -> Any:
    doc = await db.roles.find_one({"_id": "global_roles"})
    if doc and "roles" in doc:
        return {"roles": doc["roles"]}
    return {"roles": []}

@router.post("/")
async def save_roles(
    payload: dict,
    current_user: dict = Depends(get_current_active_user),
    db=Depends(get_database)
) -> Any:
    if current_user["role"] != "Admin":
        raise HTTPException(status_code=403, detail="Only Admins can modify global roles")
        
    roles = payload.get("roles", [])
    await db.roles.update_one(
        {"_id": "global_roles"},
        {"$set": {"roles": roles}},
        upsert=True
    )
    return {"message": "Roles updated successfully"}
