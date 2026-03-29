"""
AI Decision Engine — powered by Google Gemini
Replaces the keyword-matching heuristics with real AI reasoning.
Also validates inputs and rejects nonsensical/crazy text.
"""
from __future__ import annotations
import os
import json
import re
from google import genai

# ── Gemini Setup ───────────────────────────────────────────────────────────────

def _get_client():
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise RuntimeError("GEMINI_API_KEY not set in environment.")
    return genai.Client(api_key=api_key)


# ── Dimension definitions per goal  ───────────────────────────────────────────

GOAL_DIMENSIONS = {
    "career": ["financial_feasibility", "growth_potential", "risk_alignment", "time_feasibility", "passion_alignment"],
    "education": ["affordability", "reputation_quality", "duration_feasibility", "employability", "learning_fit"],
    "finance": ["expected_returns", "risk_alignment", "liquidity", "time_feasibility", "effort_simplicity"],
    "lifestyle": ["wellbeing_impact", "financial_feasibility", "time_feasibility", "social_impact", "risk_alignment"],
}


# ── Input Validation ───────────────────────────────────────────────────────────

VALIDATION_PROMPT = """\
You are a strict input validator for a life decision support system.

The user is making a '{goal}' decision and submitted these options:
{options_list}

Your task:
1. Check if each option is a legitimate, meaningful '{goal}' choice that a real person might consider.
2. A valid option should be a coherent phrase or concept (e.g. "Software Engineer at a startup", "MBA at IIT", "S&P 500 Index Fund", "Daily Yoga Routine").
3. Reject options that are: random characters (e.g. "asdfghjkl"), numbers only, gibberish, profanity, or completely unrelated to the category.

Respond in strict JSON only:
{{
  "all_valid": true | false,
  "invalid_options": ["list of invalid option strings"],
  "reason": "short explanation if any are invalid, else empty string"
}}
"""


def validate_options(goal: str, options: list[str]) -> None:
    """
    Raises ValueError with a user-friendly message if any option is nonsensical.
    """
    client = _get_client()
    options_list = "\n".join(f"- {o}" for o in options)
    prompt = VALIDATION_PROMPT.format(goal=goal, options_list=options_list)

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt
    )
    raw = response.text.strip()

    # Strip markdown code fences if present
    raw = re.sub(r"^```(?:json)?\s*", "", raw)
    raw = re.sub(r"\s*```$", "", raw)

    try:
        result = json.loads(raw)
    except json.JSONDecodeError:
        # If Gemini can't parse, allow through (fail open to avoid false positives)
        return

    if not result.get("all_valid", True):
        invalid = result.get("invalid_options", [])
        reason = result.get("reason", "")
        invalid_str = ", ".join(f'"{o}"' for o in invalid) if invalid else "one or more options"
        raise ValueError(
            f"Invalid input detected: {invalid_str}. "
            f"{reason} Please enter meaningful {goal} options."
        )


# ── AI Decision Evaluation ─────────────────────────────────────────────────────

DECISION_PROMPT = """\
You are an expert life decision advisor helping someone with a '{goal}' decision.

User context:
- Budget/Financial capacity: {budget}
- Risk tolerance: {risk_tolerance}
- Time available: {time_months} months
- Personal priorities: {priorities}
- Additional context: {context}

Evaluate each of the following options:
{options_list}

For each option, score it on these dimensions (each score between 0.0 and 1.0):
{dimensions}

Also provide:
- pros: list of 2-4 concrete advantages (strings)
- cons: list of 1-3 concrete disadvantages (strings)
- explanation: 2-3 sentence analysis explaining the key strengths and trade-offs

Respond in strict JSON only, using this exact format:
{{
  "evaluations": [
    {{
      "option": "exact option name",
      "dimension_scores": {{
        "dimension_name": 0.0_to_1.0,
        ...
      }},
      "pros": ["pro1", "pro2"],
      "cons": ["con1"],
      "explanation": "Detailed 2-3 sentence analysis."
    }}
  ]
}}

Be specific, analytical, and realistic. Base scores on the user's context.
"""


def evaluate_options_with_ai(
    goal: str,
    options: list[str],
    budget: float,
    risk_tolerance: str,
    time_months: int,
    priorities: list[str],
    context: dict,
) -> list[dict]:
    """
    Uses Gemini to evaluate all options and return structured results.
    Returns list of dicts matching the decision engine schema.
    """
    client = _get_client()
    dimensions = GOAL_DIMENSIONS.get(goal, GOAL_DIMENSIONS["career"])
    options_list = "\n".join(f"- {o}" for o in options)
    dims_list = "\n".join(f"- {d}" for d in dimensions)

    prompt = DECISION_PROMPT.format(
        goal=goal,
        budget=budget,
        risk_tolerance=risk_tolerance,
        time_months=time_months,
        priorities=", ".join(priorities) if priorities else "none specified",
        context=json.dumps(context) if context else "none",
        options_list=options_list,
        dimensions=dims_list,
    )

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt
    )
    raw = response.text.strip()

    # Strip markdown code fences if present
    raw = re.sub(r"^```(?:json)?\s*", "", raw)
    raw = re.sub(r"\s*```$", "", raw)

    parsed = json.loads(raw)
    evaluations = parsed.get("evaluations", [])

    results = []
    for ev in evaluations:
        dim_scores_raw = ev.get("dimension_scores", {})
        # Clamp all scores to [0, 1]
        dim_scores = {k: max(0.0, min(1.0, float(v))) for k, v in dim_scores_raw.items()}

        # Weighted average score (equal weights across dimensions)
        if dim_scores:
            score = round(sum(dim_scores.values()) / len(dim_scores), 4)
        else:
            score = 0.5

        pros = ev.get("pros", [])
        cons = ev.get("cons", [])

        # Confidence = score weighted by pros/cons balance
        balance = len(pros) / max(len(pros) + len(cons), 1)
        confidence = round(min(score * 0.7 + balance * 0.3, 1.0), 4)

        results.append({
            "option": ev.get("option", ""),
            "score": score,
            "score_pct": round(score * 100, 1),
            "confidence": confidence,
            "confidence_pct": round(confidence * 100, 1),
            "pros": pros,
            "cons": cons,
            "dimension_scores": {k: round(v * 100, 1) for k, v in dim_scores.items()},
            "explanation": ev.get("explanation", ""),
        })

    return results
