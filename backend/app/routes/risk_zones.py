from fastapi import APIRouter
from app.db.supabase import supabase

router = APIRouter(prefix="/api/risk-zones", tags=["Risk Zones"])


@router.get("")
def get_risk_zones():
    result = (
        supabase.table("risk_zones")
        .select("*")
        .execute()
    )

    return result.data