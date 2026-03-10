"""
Lifestyle Decision Rules
Evaluates lifestyle options: relocation, diet change, hobby, health plans, etc.
"""

LIFESTYLE_WEIGHTS = {
    "wellbeing_impact": 0.30,
    "financial_feasibility": 0.20,
    "time_feasibility": 0.20,
    "social_impact": 0.15,
    "risk_alignment": 0.15,
}


def evaluate_lifestyle_option(option: str, budget: float, risk: str, time_months: int, priorities: list[str], context: dict = {}) -> dict:
    opt_lower = option.lower()
    pros = []
    cons = []
    scores = {}

    # --- Wellbeing Impact ---
    high_wellbeing = ["exercise", "yoga", "meditation", "travel", "hobby", "therapy", "diet", "sport", "nature"]
    low_wellbeing = ["overwork", "stress", "debt", "sedentary"]
    if any(k in opt_lower for k in high_wellbeing):
        scores["wellbeing_impact"] = 0.90
        pros.append("Strongly positive impact on health and happiness")
    elif any(k in opt_lower for k in low_wellbeing):
        scores["wellbeing_impact"] = 0.30
        cons.append("May negatively affect wellbeing")
    else:
        scores["wellbeing_impact"] = 0.60

    # --- Financial Feasibility ---
    expensive_lifestyle = ["relocation abroad", "luxury", "private", "premium membership", "yacht"]
    affordable_lifestyle = ["minimalism", "budget travel", "local", "diy", "free", "public"]
    if any(k in opt_lower for k in affordable_lifestyle):
        scores["financial_feasibility"] = 0.92
        pros.append("Very affordable lifestyle choice")
    elif any(k in opt_lower for k in expensive_lifestyle):
        scores["financial_feasibility"] = 0.40 if budget < 50000 else 0.75
        if budget < 50000:
            cons.append("Expensive — may strain budget")
    else:
        scores["financial_feasibility"] = 0.70 if budget > 20000 else 0.50

    # --- Time Feasibility ---
    time_intensive = ["marathon training", "learn instrument", "degree", "startup", "travel year"]
    quick = ["meditation", "diet change", "habit", "routine", "morning"]
    if any(k in opt_lower for k in time_intensive):
        req = 12
    elif any(k in opt_lower for k in quick):
        req = 1
    else:
        req = 6
    scores["time_feasibility"] = 1.0 if time_months >= req else (0.55 if time_months >= req * 0.5 else 0.25)
    if time_months >= req:
        pros.append("Fits within your available time")
    else:
        cons.append("May require more time commitment than available")

    # Frequency Context
    freq = context.get("frequency", "daily")
    if freq == "daily" and any(k in opt_lower for k in ["routine", "habit", "daily", "morning"]):
        scores["time_feasibility"] = min(1.0, scores["time_feasibility"] + 0.1)
        pros.append("Alignment with your desire for a daily habit")

    # --- Social Impact ---
    positive_social = ["community", "family", "social", "networking", "volunteer", "group", "club"]
    negative_social = ["isolation", "solo", "remote desert", "hermit"]
    if any(k in opt_lower for k in positive_social):
        scores["social_impact"] = 0.88
        pros.append("Strengthens social connections")
    elif any(k in opt_lower for k in negative_social):
        scores["social_impact"] = 0.35
        cons.append("May reduce social interactions")
    else:
        scores["social_impact"] = 0.60

    # --- Risk Alignment ---
    high_risk_life = ["extreme sport", "skydive", "bungee", "startup", "emigrate"]
    low_risk_life = ["routine", "meditation", "diet", "savings habit", "stay home"]
    opt_risk = "high" if any(k in opt_lower for k in high_risk_life) else \
               "low" if any(k in opt_lower for k in low_risk_life) else "medium"
    risk_map = {"low": {"low": 1.0, "medium": 0.6, "high": 0.3},
                "medium": {"low": 0.6, "medium": 1.0, "high": 0.6},
                "high": {"low": 0.3, "medium": 0.6, "high": 1.0}}
    scores["risk_alignment"] = risk_map[opt_risk][risk]
    if opt_risk == risk:
        pros.append("Risk level suits your personality")
    else:
        cons.append(f"This option may feel too {opt_risk} for your {risk} tolerance")

    # Focus Context
    focus = context.get("focus", "wellbeing")
    if focus == "productivity" and any(k in opt_lower for k in ["growth", "learn", "study", "work", "focus"]):
        scores["wellbeing_impact"] = min(1.0, scores["wellbeing_impact"] + 0.1)
        pros.append("Matches your primary focus on productivity")
    elif focus == "social" and any(k in opt_lower for k in ["group", "club", "team", "community"]):
        scores["social_impact"] = min(1.0, scores["social_impact"] + 0.15)
        pros.append("Highly aligned with your social connection goal")

    top_strength = max(scores, key=scores.get)
    top_weakness = min(scores, key=scores.get)
    explanation = (
        f"This lifestyle choice scores best in {top_strength.replace('_', ' ')} ({scores[top_strength]:.0%}), "
        f"making it a meaningful change for your wellbeing. "
        f"The dimension needing most attention is {top_weakness.replace('_', ' ')} ({scores[top_weakness]:.0%}). "
    )
    if scores["wellbeing_impact"] > 0.80:
        explanation += "Research consistently links this lifestyle pattern with higher life satisfaction. "

    return {"dimension_scores": scores, "pros": pros, "cons": cons, "explanation": explanation}
