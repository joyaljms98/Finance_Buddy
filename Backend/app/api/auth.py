from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from typing import Any
from datetime import datetime

from app.db.mongodb import get_database
from app.core.security import verify_password, get_password_hash, create_access_token
from app.models.user import UserCreate, UserResponse, UserInDB, PasswordUpdate
from app.api.deps import get_current_active_user


router = APIRouter()

@router.post("/login", response_model=dict)
async def login_access_token(db=Depends(get_database), form_data: OAuth2PasswordRequestForm = Depends()) -> Any:
    username = form_data.username.strip()
    
    # Handle short ID login (e.g., imadmin007)
    if "@" not in username:
        mapping = {
            "imadmin007": "0000001",
            "imeditor1": "0000002",
            "imuser1": "0000003"
        }
        user_id = mapping.get(username)
        if user_id:
            user_dict = await db.users.find_one({"user_id": user_id})
        else:
            user_dict = None
    else:
        user_dict = await db.users.find_one({"email": username})

    if not user_dict:
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    
    if not verify_password(form_data.password, user_dict["hashed_password"]):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    
    if user_dict.get("status") != "Active":
        raise HTTPException(status_code=400, detail="Inactive user")

    return {
        "access_token": create_access_token(user_dict["user_id"]),
        "token_type": "bearer",
    }

@router.post("/register", response_model=UserResponse)
async def register_user(user_in: UserCreate, db=Depends(get_database)) -> Any:
    user = await db.users.find_one({"email": user_in.email})
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this email already exists in the system.",
        )
    
    # Generate sequential user_id
    last_user = await db.users.find_one(sort=[("user_id", -1)])
    next_id = 4
    if last_user and "user_id" in last_user:
        try:
            next_id = int(last_user["user_id"]) + 1
        except ValueError:
            pass
            
    new_user_id = f"{next_id:07d}"
    
    user_data = user_in.dict()
    hashed_password = get_password_hash(user_data.pop("password"))
    
    user_doc = {
        **user_data,
        "user_id": new_user_id,
        "hashed_password": hashed_password,
        "created_at": datetime.utcnow(),
        "status": "Active"
    }
    
    result = await db.users.insert_one(user_doc)
    user_doc["_id"] = str(result.inserted_id)
    user_doc["id"] = user_doc["_id"]
    
    return user_doc

@router.get("/me", response_model=UserResponse)
async def read_users_me(current_user: dict = Depends(get_current_active_user)) -> Any:
    current_user["id"] = str(current_user["_id"])
    return current_user

@router.put("/update-password", response_model=dict)
async def update_password(
    password_data: PasswordUpdate, 
    current_user: dict = Depends(get_current_active_user),
    db=Depends(get_database)
) -> Any:
    # Verify current password
    if not verify_password(password_data.current_password, current_user["hashed_password"]):
        raise HTTPException(status_code=400, detail="Incorrect current password")
    
    # Hash new password
    new_hashed_password = get_password_hash(password_data.new_password)
    
    # Update in DB
    await db.users.update_one(
        {"_id": current_user["_id"]},
        {"$set": {"hashed_password": new_hashed_password}}
    )
    
    return {"message": "Password updated successfully"}
