"""
Career Decision Rules
Evaluates career options based on salary, growth, stability, passion alignment and risk.
"""

CAREER_WEIGHTS = {
    "financial_feasibility": 0.25,
    "growth_potential": 0.25,
    "risk_alignment": 0.20,
    "time_feasibility": 0.15,
    "passion_alignment": 0.15,
}


def evaluate_career_option(option: str, budget: float, risk: str, time_months: int, priorities: list[str], context: dict = {}) -> dict:
    """
    Applies career-specific heuristic rules to score an option.
    Returns a dict with dimension_scores, pros, cons, explanation.
    """
    opt_lower = option.lower()
    pros = []
    cons = []
    scores = {}

    # --- Financial Feasibility ---
    high_salary_keywords = ["software", "engineer", "doctor", "finance", "data scientist", "manager", "consultant"]
    low_salary_keywords = ["artist", "writer", "musician", "social worker", "teacher", "volunteer"]
    if any(k in opt_lower for k in high_salary_keywords):
        scores["financial_feasibility"] = 0.85
        pros.append("Strong earning potential")
    elif any(k in opt_lower for k in low_salary_keywords):
        scores["financial_feasibility"] = 0.45
        cons.append("Modest starting salary")
    else:
        scores["financial_feasibility"] = 0.65

    # Budget boost: if budget > 50000 it is feasible regardless
    if budget >= 50000:
        scores["financial_feasibility"] = min(1.0, scores["financial_feasibility"] + 0.10)

    # --- Growth Potential ---
    high_growth = ["tech", "software", "ai", "machine learning", "data", "health", "biotech", "cloud"]
    moderate_growth = ["marketing", "sales", "education", "design", "management"]
    if any(k in opt_lower for k in high_growth):
        scores["growth_potential"] = 0.90
        pros.append("High industry growth trajectory")
    elif any(k in opt_lower for k in moderate_growth):
        scores["growth_potential"] = 0.65
        pros.append("Steady career growth expected")
    else:
        scores["growth_potential"] = 0.50
        cons.append("Growth trajectory is uncertain")

    # --- Risk Alignment ---
    high_risk_options = ["startup", "entrepreneur", "freelance", "business owner", "invest"]
    low_risk_options = ["government", "civil", "teacher", "bank", "public sector"]
    option_risk = "high" if any(k in opt_lower for k in high_risk_options) else \
                  "low" if any(k in opt_lower for k in low_risk_options) else "medium"

    risk_match_map = {"low": {"low": 1.0, "medium": 0.6, "high": 0.3},
                      "medium": {"low": 0.7, "medium": 1.0, "high": 0.7},
                      "high": {"low": 0.3, "medium": 0.6, "high": 1.0}}
    scores["risk_alignment"] = risk_match_map[option_risk][risk]
    if option_risk == risk:
        pros.append("Matches your risk tolerance perfectly")
    else:
        cons.append(f"Option risk level ({option_risk}) may not match your tolerance ({risk})")

    # --- Relocation Support (Context) ---
    relocate = context.get("relocate", "no")
    if relocate == "no" and any(k in opt_lower for k in ["abroad", "international", "global", "remote"]):
        if "remote" not in opt_lower:
            scores["risk_alignment"] = max(0.1, scores["risk_alignment"] - 0.2)
            cons.append("Requires relocation which you prefer to avoid")
        else:
            pros.append("Remote option fits your 'No Relocation' preference")
    elif relocate == "yes":
        pros.append("Flexible for international or remote opportunities")

    # --- Time Feasibility ---
    long_prep = ["doctor", "lawyer", "phd", "surgeon", "professor", "research"]
    short_prep = ["sales", "support", "assistant", "entry", "junior", "intern", "freelance"]
    if any(k in opt_lower for k in long_prep):
        req_months = 60
    elif any(k in opt_lower for k in short_prep):
        req_months = 3
    else:
        req_months = 18

    if time_months >= req_months:
        scores["time_feasibility"] = 1.0
        pros.append("Achievable within your time frame")
    elif time_months >= req_months * 0.6:
        scores["time_feasibility"] = 0.65
        cons.append("Tight but possibly achievable timeline")
    else:
        scores["time_feasibility"] = 0.25
        cons.append("Requires significantly more time than available")

    # Experience Boost
    years_exp = int(context.get("years_exp", 0) or 0)
    if years_exp > 5 and any(k in opt_lower for k in ["senior", "lead", "manager", "head"]):
        scores["time_feasibility"] = min(1.0, scores["time_feasibility"] + 0.15)
        pros.append(f"Your {years_exp} years of experience is a major asset for this role")

    # --- Passion Alignment ---
    passion_score = 0.5
    for priority in priorities:
        pl = priority.lower()
        if pl in opt_lower or any(word in opt_lower for word in pl.split()):
            passion_score = min(1.0, passion_score + 0.25)
            pros.append(f"Aligns with your priority: '{priority}'")
    scores["passion_alignment"] = passion_score

    # --- Build explanation ---
    top_strength = max(scores, key=scores.get)
    top_weakness = min(scores, key=scores.get)
    explanation = (
        f"This career option scores highest in {top_strength.replace('_', ' ')} "
        f"({scores[top_strength]:.0%}) which is a key advantage. "
        f"The main area to watch is {top_weakness.replace('_', ' ')} "
        f"({scores[top_weakness]:.0%}). "
    )
    if scores["growth_potential"] > 0.75:
        explanation += "The industry shows strong growth signals. "
    if scores["risk_alignment"] < 0.5:
        explanation += f"Risk level mismatch may cause stress — consider adjusting expectations. "

    return {"dimension_scores": scores, "pros": pros, "cons": cons, "explanation": explanation}
