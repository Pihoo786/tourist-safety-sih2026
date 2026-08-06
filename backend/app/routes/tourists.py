import random

from datetime import date
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.core.config import settings
from app.db.supabase import supabase
from app.services.qr_service import generate_qr_base64

router = APIRouter(prefix="/api/tourists", tags=["Tourists"])



class TouristCreate(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    phone: str = Field(min_length=7, max_length=15)
    emergency_contact: str = Field(min_length=7, max_length=15)
    entry_point: str = Field(min_length=2, max_length=100)
    expected_exit_date: date


def generate_tourist_id():
    return f"{settings.TOURIST_ID_PREFIX}-{random.randint(1000, 9999)}"


@router.post("")
def register_tourist(tourist: TouristCreate):
    # Ensure generated ID is unique
    for _ in range(10):
        tourist_id = generate_tourist_id()

        existing = (
            supabase.table("tourists")
            .select("id")
            .eq("tourist_id", tourist_id)
            .execute()
        )

        if not existing.data:
            break
    else:
        raise HTTPException(
            status_code=500,
            detail="Unable to generate unique Tourist ID"
        )

    data = {
        "tourist_id": tourist_id,
        "name": tourist.name,
        "phone": tourist.phone,
        "emergency_contact": tourist.emergency_contact,
        "entry_point": tourist.entry_point,
        "expected_exit_date": tourist.expected_exit_date.isoformat(),
        "status": "ACTIVE",
    }

    result = supabase.table("tourists").insert(data).execute()

    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to register tourist")
    
    tourist_data = result.data[0]
    tourist_data["qr_code"] = generate_qr_base64(tourist_data["tourist_id"])

    return tourist_data



@router.get("/{tourist_id}")
def get_tourist(tourist_id: str):
    result = (
        supabase.table("tourists")
        .select("*")
        .eq("tourist_id", tourist_id)
        .execute()
    )

    if not result.data:
        raise HTTPException(status_code=404, detail="Tourist not found")

    return result.data[0]