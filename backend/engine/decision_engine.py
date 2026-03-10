"""
Core Decision Engine
Orchestrates domain-specific rule modules and produces ranked decision paths.
"""
from __future__ import annotations
from typing import Literal
from engine.career_rules import evaluate_career_option, CAREER_WEIGHTS
from engine.education_rules import evaluate_education_option, EDUCATION_WEIGHTS
from engine.finance_rules import evaluate_finance_option, FINANCE_WEIGHTS
from engine.lifestyle_rules import evaluate_lifestyle_option, LIFESTYLE_WEIGHTS

GOAL_MAP = {
    "career": (evaluate_career_option, CAREER_WEIGHTS),
    "education": (evaluate_education_option, EDUCATION_WEIGHTS),
    "finance": (evaluate_finance_option, FINANCE_WEIGHTS),
    "lifestyle": (evaluate_lifestyle_option, LIFESTYLE_WEIGHTS),
}


def _compute_weighted_score(dimension_scores: dict, weights: dict) -> float:
    total = 0.0
    weight_sum = sum(weights.values())
    for dim, weight in weights.items():
        total += dimension_scores.get(dim, 0.5) * (weight / weight_sum)
    return round(total, 4)


def _compute_confidence(score: float, pros: list, cons: list) -> float:
    """Confidence is the score attenuated by the pros/cons balance."""
    balance = len(pros) / max(len(pros) + len(cons), 1)
    confidence = score * 0.7 + balance * 0.3
    return round(min(confidence, 1.0), 4)


def run_decision_engine(
    goal: Literal["career", "education", "finance", "lifestyle"],
    options: list[str],
    budget: float,
    risk_tolerance: Literal["low", "medium", "high"],
    time_months: int,
    priorities: list[str],
    context: dict = {},
) -> list[dict]:
    """
    Main entry point.
    Returns a ranked list of decision paths, each with:
      - option: str
      - score: float (0-1)
      - confidence: float (0-1)
      - rank: int
      - pros: list[str]
      - cons: list[str]
      - dimension_scores: dict
      - explanation: str
    """
    if goal not in GOAL_MAP:
        raise ValueError(f"Unknown goal: {goal}. Must be one of {list(GOAL_MAP.keys())}")

    evaluate_fn, weights = GOAL_MAP[goal]
    results = []

    for option in options:
        if not option.strip():
            continue
        raw = evaluate_fn(option.strip(), budget, risk_tolerance, time_months, priorities, context)
        score = _compute_weighted_score(raw["dimension_scores"], weights)
        confidence = _compute_confidence(score, raw["pros"], raw["cons"])
        results.append({
            "option": option.strip(),
            "score": score,
            "score_pct": round(score * 100, 1),
            "confidence": confidence,
            "confidence_pct": round(confidence * 100, 1),
            "pros": raw["pros"],
            "cons": raw["cons"],
            "dimension_scores": {k: round(v * 100, 1) for k, v in raw["dimension_scores"].items()},
            "explanation": raw["explanation"],
        })

    # Rank by score descending
    results.sort(key=lambda x: x["score"], reverse=True)
    for i, r in enumerate(results):
        r["rank"] = i + 1

    return results
