"""
Education Decision Rules
Evaluates education options based on cost, duration, job outcomes, and personal fit.
"""

EDUCATION_WEIGHTS = {
    "financial_feasibility": 0.30,
    "career_outcome": 0.25,
    "time_feasibility": 0.20,
    "personal_fit": 0.15,
    "reputation": 0.10,
}


def evaluate_education_option(option: str, budget: float, risk: str, time_months: int, priorities: list[str], context: dict = {}) -> dict:
    opt_lower = option.lower()
    pros = []
    cons = []
    scores = {}

    # --- Financial Feasibility ---
    expensive = ["ivy", "mit", "stanford", "oxford", "cambridge", "mba", "phd fully funded", "medical"]
    affordable = ["community college", "online", "mooc", "bootcamp", "vocational", "scholarship", "open university"]
    if any(k in opt_lower for k in affordable):
        scores["financial_feasibility"] = 0.90
        pros.append("Cost-effective education path")
    elif any(k in opt_lower for k in expensive):
        scores["financial_feasibility"] = 0.40 if budget < 80000 else 0.75
        if budget < 80000:
            cons.append("High tuition may strain your budget")
        else:
            pros.append("Budget supports this prestigious option")
    else:
        base = 0.70 if budget > 30000 else 0.50
        scores["financial_feasibility"] = base

    # Scale by budget
    if budget > 100000:
        scores["financial_feasibility"] = min(1.0, scores.get("financial_feasibility", 0.6) + 0.10)

    # --- Career Outcome ---
    high_outcome = ["engineering", "medicine", "law", "data science", "computer science", "mba", "finance", "nursing"]
    moderate_outcome = ["arts", "humanities", "social science", "education", "design", "journalism"]
    if any(k in opt_lower for k in high_outcome):
        scores["career_outcome"] = 0.88
        pros.append("Strong employment outcomes after graduation")
    elif any(k in opt_lower for k in moderate_outcome):
        scores["career_outcome"] = 0.60
        cons.append("Variable job market depending on specialization")
    else:
        scores["career_outcome"] = 0.65

    # --- Time Feasibility ---
    long_dur = ["phd", "medicine", "mbbs", "law degree", "architecture"]
    medium_dur = ["bachelor", "undergraduate", "b.tech", "bsc", "msc", "masters"]
    short_dur = ["bootcamp", "certification", "diploma", "mooc", "short course", "online course"]
    if any(k in opt_lower for k in long_dur):
        req = 60
    elif any(k in opt_lower for k in medium_dur):
        req = 36
    elif any(k in opt_lower for k in short_dur):
        req = 6
    else:
        req = 24

    if time_months >= req:
        scores["time_feasibility"] = 1.0
        pros.append("Duration fits within your timeline")
    elif time_months >= req * 0.6:
        scores["time_feasibility"] = 0.60
        cons.append("Program may exceed your available time")
    else:
        scores["time_feasibility"] = 0.25
        cons.append("This program is too long given your constraints")

    # --- Personal Fit from Priorities ---
    fit_score = 0.5
    for p in priorities:
        if p.lower() in opt_lower or any(w in opt_lower for w in p.lower().split()):
            fit_score = min(1.0, fit_score + 0.2)
            pros.append(f"Aligns with your priority: '{p}'")
    scores["personal_fit"] = fit_score

    # --- Reputation ---
    prestigious = ["iit", "iim", "mit", "harvard", "oxford", "stanford", "cambridge", "bits"]
    if any(k in opt_lower for k in prestigious):
        scores["reputation"] = 0.95
        pros.append("Prestigious institution with strong alumni network")
    else:
        scores["reputation"] = 0.60

    # Context study mode
    study_mode = context.get("study_mode", "on_campus")
    if study_mode == "online" and "online" in opt_lower:
        scores["personal_fit"] = min(1.0, scores["personal_fit"] + 0.15)
        pros.append("Perfectly matches your preference for online learning")
    elif study_mode == "on_campus" and any(k in opt_lower for k in ["campus", "university", "college", "offline"]):
        pros.append("Fits your preference for on-campus education")

    # Current Education
    current_edu = context.get("current_edu", "high_school")
    if current_edu == "bachelors" and any(k in opt_lower for k in ["masters", "msc", "mba"]):
        pros.append(f"Logical next step following your Bachelor's degree")

    top_strength = max(scores, key=scores.get)
    top_weakness = min(scores, key=scores.get)
    explanation = (
        f"This education option stands out for its {top_strength.replace('_', ' ')} score "
        f"({scores[top_strength]:.0%}). "
        f"Key concern is {top_weakness.replace('_', ' ')} ({scores[top_weakness]:.0%}). "
    )
    if scores["career_outcome"] > 0.80:
        explanation += "Graduates from this track typically have strong job placement rates. "
    if scores["financial_feasibility"] < 0.50:
        explanation += "Explore scholarships or loans to bridge the financial gap. "

    return {"dimension_scores": scores, "pros": pros, "cons": cons, "explanation": explanation}
