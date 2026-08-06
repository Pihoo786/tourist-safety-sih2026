from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.routes.tourists import router as tourists_router

from app.routes.incidents import router as incidents_router
from app.routes.risk_zones import router as risk_zones_router
from app.routes.risk_events import router as risk_events_router


app = FastAPI(
    title="TouristShield API",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(tourists_router)
app.include_router(incidents_router)
app.include_router(risk_zones_router)
app.include_router(risk_events_router)


@app.get("/")
def health():
    return {"status": "ok"}