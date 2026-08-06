from fastapi import APIRouter

from app.db.supabase import supabase

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])


@router.get("")
def get_dashboard():
    # Active tourists
    tourists_result = (
        supabase.table("tourists")
        .select("id")
        .eq("status", "ACTIVE")
        .execute()
    )

    # Active SOS incidents
    incidents_result = (
        supabase.table("incidents")
        .select("id, status")
        .execute()
    )

    # Risk events
    risk_events_result = (
        supabase.table("risk_events")
        .select("id")
        .execute()
    )

    tourists = tourists_result.data or []
    incidents = incidents_result.data or []
    risk_events = risk_events_result.data or []

    active_sos = sum(
        1
        for incident in incidents
        if incident.get("status") in ["NEW", "ACCEPTED"]
    )

    return {
        "active_tourists": len(tourists),
        "active_sos": active_sos,
        "risk_alerts": len(risk_events),
    }