"""
Finance Decision Rules
Evaluates financial options: investments, savings plans, loans, etc.
"""

FINANCE_WEIGHTS = {
    "return_potential": 0.30,
    "risk_alignment": 0.25,
    "liquidity": 0.20,
    "time_feasibility": 0.15,
    "budget_fit": 0.10,
}


def evaluate_finance_option(option: str, budget: float, risk: str, time_months: int, priorities: list[str], context: dict = {}) -> dict:
    opt_lower = option.lower()
    pros = []
    cons = []
    scores = {}

    # --- Return Potential ---
    high_return = ["stocks", "equity", "crypto", "startup investment", "real estate", "mutual fund", "index fund"]
    moderate_return = ["bonds", "fd", "fixed deposit", "ppf", "nsc", "recurring deposit", "gold etf"]
    low_return = ["savings account", "cash", "current account"]
    if any(k in opt_lower for k in high_return):
        scores["return_potential"] = 0.88
        pros.append("High long-term return potential")
    elif any(k in opt_lower for k in moderate_return):
        scores["return_potential"] = 0.60
        pros.append("Stable and predictable returns")
    elif any(k in opt_lower for k in low_return):
        scores["return_potential"] = 0.30
        cons.append("Low return barely keeps up with inflation")
    else:
        scores["return_potential"] = 0.55

    # --- Risk Alignment ---
    high_risk = ["crypto", "penny stock", "startup", "option", "futures", "leverage", "forex"]
    low_risk = ["savings", "ppf", "fd", "fixed deposit", "government bond", "nsc", "gold"]
    opt_risk = "high" if any(k in opt_lower for k in high_risk) else \
               "low" if any(k in opt_lower for k in low_risk) else "medium"
    risk_match = {"low": {"low": 1.0, "medium": 0.55, "high": 0.25},
                  "medium": {"low": 0.65, "medium": 1.0, "high": 0.65},
                  "high": {"low": 0.25, "medium": 0.55, "high": 1.0}}
    scores["risk_alignment"] = risk_match[opt_risk][risk]
    if opt_risk == risk:
        pros.append("Risk level matches your tolerance")
    else:
        cons.append(f"Risk mismatch: option is {opt_risk}, you prefer {risk}")

    # --- Liquidity ---
    high_liq = ["savings", "stocks", "mutual fund", "etf", "liquid fund", "cash"]
    low_liq = ["real estate", "ppf", "nsc", "fixed deposit", "property"]
    if any(k in opt_lower for k in high_liq):
        scores["liquidity"] = 0.90
        pros.append("Highly liquid — access funds anytime")
    elif any(k in opt_lower for k in low_liq):
        scores["liquidity"] = 0.35
        cons.append("Low liquidity — funds may be locked in")
    else:
        scores["liquidity"] = 0.60

    # --- Time Feasibility ---
    long_term = ["real estate", "ppf", "pension", "nps", "retirement"]
    short_term = ["savings", "fd", "liquid", "cash", "short term"]
    if any(k in opt_lower for k in long_term):
        req = 60
    elif any(k in opt_lower for k in short_term):
        req = 6
    else:
        req = 24
    scores["time_feasibility"] = 1.0 if time_months >= req else (0.60 if time_months >= req * 0.5 else 0.30)
    if time_months < req:
        cons.append("Investment horizon may be too short for optimal returns")
    else:
        pros.append("Time horizon aligns well with this instrument")

    # Context Horizon
    horizon = int(context.get("horizon_years", 0) or 0)
    if horizon >= 10 and any(k in opt_lower for k in ["equity", "stocks", "retirement", "real estate"]):
        scores["time_feasibility"] = 1.0
        pros.append(f"Excellent long-term horizon ({horizon} years) for this asset class")
    elif horizon < 3 and any(k in opt_lower for k in ["stocks", "crypto", "equity"]):
        scores["time_feasibility"] = max(0.2, scores["time_feasibility"] - 0.4)
        cons.append(f"Short horizon ({horizon} years) is risky for volatile assets")

    # --- Budget Fit ---
    if budget >= 100000:
        scores["budget_fit"] = 0.95
        pros.append("Budget is well-suited for this option")
    elif budget >= 10000:
        scores["budget_fit"] = 0.70
    else:
        scores["budget_fit"] = 0.40
        cons.append("Limited budget constrains investment size")

    # Monthly Contribution
    monthly = float(context.get("monthly_contrib", 0) or 0)
    if monthly > 1000:
        scores["budget_fit"] = min(1.0, scores["budget_fit"] + 0.1)
        pros.append(f"Strong monthly contribution of {monthly} enhances growth")

    # Priorities
    for p in priorities:
        if any(w in opt_lower for w in p.lower().split()):
            pros.append(f"Matches your priority: '{p}'")

    top_strength = max(scores, key=scores.get)
    top_weakness = min(scores, key=scores.get)
    explanation = (
        f"This financial instrument excels in {top_strength.replace('_', ' ')} ({scores[top_strength]:.0%}). "
        f"Watch out for {top_weakness.replace('_', ' ')} ({scores[top_weakness]:.0%}). "
    )
    if scores["return_potential"] > 0.80:
        explanation += "Historically strong returns make this attractive for wealth building. "
    if scores["risk_alignment"] < 0.4:
        explanation += "Consider this option only if you are prepared to adjust your risk stance. "

    return {"dimension_scores": scores, "pros": pros, "cons": cons, "explanation": explanation}
