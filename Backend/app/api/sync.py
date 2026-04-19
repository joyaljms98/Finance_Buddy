from fastapi import APIRouter, Depends, HTTPException, Body
from typing import Any, Dict
from datetime import datetime

from app.db.mongodb import get_database
from app.api.deps import get_current_active_user

router = APIRouter()

@router.get("/data", response_model=Dict[str, Any])
async def get_sync_data(
    current_user: dict = Depends(get_current_active_user),
    db=Depends(get_database)
) -> Any:
    # Fetch user data from mongo for: budgets, goals, notes, knowledge
    doc = await db.user_synced_data.find_one({"user_id": current_user["user_id"]})
    if not doc:
        return {"budgets": None, "goals": None, "notes": None, "knowledge": None, "folders": None}
    
    return {
        "budgets": doc.get("budgets"),
        "goals": doc.get("goals"),
        "notes": doc.get("notes"),
        "knowledge": doc.get("knowledge"),
        "folders": doc.get("folders")
    }

@router.post("/data", response_model=dict)
async def post_sync_data(
    payload: Dict[str, Any] = Body(...),
    current_user: dict = Depends(get_current_active_user),
    db=Depends(get_database)
) -> Any:
    """
    Payload can contain one or more keys: 'budgets', 'goals', 'notes', 'knowledge', 'folders'
    The frontend sends whatever it wants to update.
    """
    update_data = {}
    allowed_keys = ["budgets", "goals", "notes", "knowledge", "folders"]
    
    for key in allowed_keys:
        if key in payload:
            update_data[key] = payload[key]
            
    if not update_data:
        raise HTTPException(status_code=400, detail="No valid sync keys provided.")
        
    update_data["updated_at"] = datetime.utcnow()
    
    await db.user_synced_data.update_one(
        {"user_id": current_user["user_id"]},
        {"$set": update_data},
        upsert=True
    )
    
    return {"message": "Sync successful", "synced_keys": list(update_data.keys())}
