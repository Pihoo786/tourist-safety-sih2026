from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Literal

from app.db.supabase import supabase

router = APIRouter(prefix="/api/risk-events", tags=["Risk Events"])


class RiskEventCreate(BaseModel):
    tourist_id: str
    risk_zone_id: str
    event_type: Literal["ENTERED_RISK_ZONE", "EXITED_RISK_ZONE"]
    latitude: float
    longitude: float


@router.post("")
def create_risk_event(payload: RiskEventCreate):

    tourist = (
        supabase.table("tourists")
        .select("id")
        .eq("tourist_id", payload.tourist_id)
        .execute()
    )

    if not tourist.data:
        raise HTTPException(
            status_code=404,
            detail="Tourist not found"
        )

    zone = (
        supabase.table("risk_zones")
        .select("id")
        .eq("id", payload.risk_zone_id)
        .execute()
    )

    if not zone.data:
        raise HTTPException(
            status_code=404,
            detail="Risk zone not found"
        )

    result = (
        supabase.table("risk_events")
        .insert({
            "tourist_id": tourist.data[0]["id"],
            "risk_zone_id": payload.risk_zone_id,
            "event_type": payload.event_type,
            "latitude": payload.latitude,
            "longitude": payload.longitude,
        })
        .execute()
    )

    return result.data[0]