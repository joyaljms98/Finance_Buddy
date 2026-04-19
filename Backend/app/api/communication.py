from fastapi import APIRouter, Depends, HTTPException, status, WebSocket, WebSocketDisconnect
from typing import Any, List
from datetime import datetime
from bson import ObjectId

class FeedbackConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except Exception:
                pass

manager = FeedbackConnectionManager()

from app.db.mongodb import get_database
from app.models.communication import Reminder, Feedback
from app.api.deps import get_current_active_user, get_current_active_admin, get_current_active_editor

router = APIRouter()

# --- Reminders ---
@router.get("/reminders", response_model=List[Reminder])
async def get_reminders(
    current_user: dict = Depends(get_current_active_user),
    db=Depends(get_database)
) -> Any:
    # Build query depending on role
    if current_user["role"] == "Admin":
        query = {}
    elif current_user["role"] == "Editor":
        query = {
            "$or": [
                {"targetGroup": {"$in": ["all_users", "all_editors", current_user["user_id"]]}},
                {"createdBy": current_user["user_id"]}
            ]
        }
    else:
        query = {"targetGroup": "all_users"}
        
    cursor = db.reminders.find(query)
    reminders = await cursor.to_list(length=200)
    for r in reminders:
        r["id"] = str(r["_id"])
    return reminders

@router.post("/reminders", response_model=Reminder)
async def create_reminder(
    reminder_in: Reminder,
    current_editor: dict = Depends(get_current_active_editor),
    db=Depends(get_database)
) -> Any:
    reminder_data = reminder_in.dict(exclude={"id"})
    reminder_data["createdBy"] = current_editor["user_id"]
    
    result = await db.reminders.insert_one(reminder_data)
    reminder_data["_id"] = str(result.inserted_id)
    reminder_data["id"] = reminder_data["_id"]
    return reminder_data

@router.put("/reminders/{reminder_id}", response_model=dict)
async def update_reminder(
    reminder_id: str,
    reminder_in: dict,
    current_editor: dict = Depends(get_current_active_editor),
    db=Depends(get_database)
) -> Any:
    query = {"_id": ObjectId(reminder_id)}
    if current_editor["role"] != "Admin":
        query["createdBy"] = current_editor["user_id"]

    res = await db.reminders.update_one(
        query,
        {"$set": reminder_in}
    )
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Reminder not found or unauthorized")
    return {"message": "Reminder updated"}

@router.delete("/reminders/{reminder_id}", response_model=dict)
async def delete_reminder(
    reminder_id: str,
    current_editor: dict = Depends(get_current_active_editor),
    db=Depends(get_database)
) -> Any:
    query = {"_id": ObjectId(reminder_id)}
    if current_editor["role"] != "Admin":
        query["createdBy"] = current_editor["user_id"]
        
    result = await db.reminders.delete_one(query)
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Reminder not found or unauthorized")
    return {"message": "Reminder deleted"}

# --- Feedback ---
@router.websocket("/feedback/ws")
async def websocket_feedback_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)

@router.get("/feedback", response_model=List[Feedback])
async def get_feedback(
    current_user: dict = Depends(get_current_active_user),
    db=Depends(get_database)
) -> Any:
    if current_user["role"] == "Admin" or current_user["role"] == "Editor":
        query = {}
    else:
        query = {"sender_id": current_user["user_id"]}
        
    cursor = db.feedback.find(query).sort("time", -1)
    feedbacks = await cursor.to_list(length=100)
    for f in feedbacks:
        f["id"] = str(f["_id"])
    return feedbacks

@router.post("/feedback", response_model=Feedback)
async def create_feedback(
    feedback_in: Feedback,
    current_user: dict = Depends(get_current_active_user),
    db=Depends(get_database)
) -> Any:
    feedback_data = feedback_in.dict(exclude={"id"})
    feedback_data["sender_id"] = current_user["user_id"]
    
    result = await db.feedback.insert_one(feedback_data)
    feedback_data["_id"] = str(result.inserted_id)
    feedback_data["id"] = feedback_data["_id"]
    
    await manager.broadcast("new_feedback")
    return feedback_data

@router.put("/feedback/{feedback_id}", response_model=dict)
async def update_feedback_status(
    feedback_id: str,
    feedback_in: dict,
    current_user: dict = Depends(get_current_active_user),
    db=Depends(get_database)
) -> Any:
    # Update status or push replies
    data = {}
    if "status" in feedback_in:
        data["status"] = feedback_in["status"]
    if "replies" in feedback_in:
        data["replies"] = feedback_in["replies"]

    if not data:
        raise HTTPException(status_code=400, detail="Invalid update payload format")

    res = await db.feedback.update_one(
        {"_id": ObjectId(feedback_id)},
        {"$set": data}
    )
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Feedback not found")
        
    await manager.broadcast("feedback_updated")
    return {"message": "Feedback updated"}
