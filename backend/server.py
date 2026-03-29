"""
HAIL-DSS Backend — FastAPI Server (AI-Powered by Google Gemini)
"""
import os
from dotenv import load_dotenv
load_dotenv()  # Load GEMINI_API_KEY from .env

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, field_validator
from typing import Literal
from engine.decision_engine import run_decision_engine

app = FastAPI(
    title="HAIL-DSS API",
    description="Human-AI Life Decision Support System — Privacy-First Decision Engine",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Request / Response Models ──────────────────────────────────────────────────

class DecisionRequest(BaseModel):
    goal: Literal["career", "education", "finance", "lifestyle"] = Field(
        ..., description="The decision category"
    )
    options: list[str] = Field(..., min_length=2, max_length=5, description="2-5 options to compare")
    budget: float = Field(..., ge=0, description="Available budget in your currency")
    risk_tolerance: Literal["low", "medium", "high"] = Field(..., description="Risk appetite")
    time_months: int = Field(..., ge=1, le=600, description="Time available in months")
    priorities: list[str] = Field(default=[], max_length=5, description="Personal priority keywords")
    context: dict = Field(default={}, description="Optional category-specific variables")

    @field_validator("options")
    @classmethod
    def options_not_blank(cls, v):
        cleaned = [o.strip() for o in v if o.strip()]
        if len(cleaned) < 2:
            raise ValueError("At least 2 non-empty options are required")
        return cleaned


class DecisionResponse(BaseModel):
    goal: str
    ranked_paths: list[dict]
    summary: str


# ── Routes ─────────────────────────────────────────────────────────────────────

@app.get("/", tags=["Health"])
async def root():
    return {"status": "ok", "service": "HAIL-DSS Decision API", "version": "1.0.0"}


@app.get("/api/health", tags=["Health"])
async def health():
    return {"status": "healthy"}


@app.post("/api/decide", response_model=DecisionResponse, tags=["Decision"])
async def decide(req: DecisionRequest):
    """
    Core decision endpoint. Accepts decision parameters and returns ranked options
    with scores, pros/cons, dimension breakdowns, confidence levels, and explanations.
    No data is stored server-side — privacy is preserved.
    """
    try:
        ranked = run_decision_engine(
            goal=req.goal,
            options=req.options,
            budget=req.budget,
            risk_tolerance=req.risk_tolerance,
            time_months=req.time_months,
            priorities=req.priorities,
            context=req.context,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Engine error: {str(e)}")

    top = ranked[0] if ranked else None
    summary = (
        f"AI analysis complete for your {req.goal} decision. "
        f"\u2018{top['option']}\u2019 is the top recommendation with a score of {top['score_pct']}% "
        f"and confidence of {top['confidence_pct']}%."
        if top else "No valid options were evaluated."
    )

    return DecisionResponse(goal=req.goal, ranked_paths=ranked, summary=summary)


# ── Entry Point ────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=True)
