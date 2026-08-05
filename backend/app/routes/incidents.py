from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Literal, Optional

from app.db.supabase import supabase

router = APIRouter(prefix="/api/incidents", tags=["Incidents"])


class SOSCreate(BaseModel):
    tourist_id: str
    latitude: float
    longitude: float


class StatusUpdate(BaseModel):
    status: Literal["ACCEPTED", "RESOLVED"]


@router.post("/sos")
def create_sos(payload: SOSCreate):
    tourist = (
        supabase.table("tourists")
        .select("id")
        .eq("tourist_id", payload.tourist_id)
        .execute()
    )

    if not tourist.data:
        raise HTTPException(status_code=404, detail="Tourist not found")

    result = (
        supabase.table("incidents")
        .insert({
            "tourist_id": tourist.data[0]["id"],
            "incident_type": "SOS",
            "status": "NEW",
            "risk_level": "CRITICAL",
            "latitude": payload.latitude,
            "longitude": payload.longitude,
        })
        .execute()
    )

    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to create SOS")

    incident = result.data[0]

    return {
        "incident_id": incident["id"],
        "status": incident["status"],
        "message": "SOS received",
    }


@router.get("")
def get_incidents(status: Optional[str] = None):
    query = supabase.table("incidents").select(
        "*, tourist:tourists(*)"
    )

    if status:
        query = query.eq("status", status)

    result = query.order("created_at", desc=True).execute()

    return result.data


@router.patch("/{incident_id}/status")
def update_incident_status(incident_id: str, payload: StatusUpdate):
    current = (
        supabase.table("incidents")
        .select("id,status")
        .eq("id", incident_id)
        .execute()
    )

    if not current.data:
        raise HTTPException(status_code=404, detail="Incident not found")

    current_status = current.data[0]["status"]

    valid_transition = (
        (current_status == "NEW" and payload.status == "ACCEPTED")
        or
        (current_status == "ACCEPTED" and payload.status == "RESOLVED")
    )

    if not valid_transition:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid transition: {current_status} -> {payload.status}",
        )

    result = (
        supabase.table("incidents")
        .update({"status": payload.status})
        .eq("id", incident_id)
        .execute()
    )

    return result.data[0]