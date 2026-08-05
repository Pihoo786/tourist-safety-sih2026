import random

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.core.config import settings
from app.db.supabase import supabase

router = APIRouter(prefix="/api/tourists", tags=["Tourists"])


class TouristCreate(BaseModel):
    name: str
    phone: str
    emergency_contact: str
    entry_point: str
    expected_exit_date: str


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
        "expected_exit_date": tourist.expected_exit_date,
        "status": "ACTIVE",
    }

    result = supabase.table("tourists").insert(data).execute()

    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to register tourist")

    return result.data[0]


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