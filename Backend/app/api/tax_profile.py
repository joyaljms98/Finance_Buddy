from fastapi import APIRouter, Depends, HTTPException
from typing import Any, List
from datetime import datetime
from bson import ObjectId

from app.db.mongodb import get_database
from app.models.user import TaxProfile
from app.api.deps import get_current_active_user

router = APIRouter()

@router.get("/", response_model=List[TaxProfile])
async def get_tax_profiles(
    current_user: dict = Depends(get_current_active_user),
    db=Depends(get_database)
) -> Any:
    cursor = db.tax_profiles.find({"user_id": current_user["user_id"]})
    profiles = await cursor.to_list(length=50)
    for p in profiles:
        p["id"] = str(p["_id"])
    return profiles

@router.post("/", response_model=TaxProfile)
async def create_tax_profile(
    profile_in: TaxProfile,
    current_user: dict = Depends(get_current_active_user),
    db=Depends(get_database)
) -> Any:
    profile_data = profile_in.dict(exclude={"id"})
    profile_data["user_id"] = current_user["user_id"]
    profile_data["updated_at"] = datetime.utcnow()

    result = await db.tax_profiles.insert_one(profile_data)
    profile_data["_id"] = str(result.inserted_id)
    profile_data["id"] = profile_data["_id"]
    
    if not current_user.get("is_onboarded"):
        await db.users.update_one(
            {"user_id": current_user["user_id"]},
            {"$set": {"is_onboarded": True}}
        )

    return profile_data

@router.put("/{profile_id}", response_model=dict)
async def update_tax_profile(
    profile_id: str,
    profile_in: TaxProfile,
    current_user: dict = Depends(get_current_active_user),
    db=Depends(get_database)
) -> Any:
    profile_data = profile_in.dict(exclude={"id", "user_id"})
    profile_data["updated_at"] = datetime.utcnow()

    res = await db.tax_profiles.update_one(
        {"_id": ObjectId(profile_id), "user_id": current_user["user_id"]},
        {"$set": profile_data}
    )
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Profile not found or unauthorized")
        
    return {"message": "Updated successfully"}

@router.delete("/{profile_id}", response_model=dict)
async def delete_tax_profile(
    profile_id: str,
    current_user: dict = Depends(get_current_active_user),
    db=Depends(get_database)
) -> Any:
    res = await db.tax_profiles.delete_one(
        {"_id": ObjectId(profile_id), "user_id": current_user["user_id"]}
    )
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Profile not found")
        
    return {"message": "Deleted successfully"}
