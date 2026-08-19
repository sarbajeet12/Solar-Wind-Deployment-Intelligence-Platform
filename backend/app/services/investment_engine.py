def generate_investment_recommendation(overall_score: int):
    """Generate screening indicators from suitability, not financial advice."""
    if overall_score >= 90:
        result = {"decision": "Strongly Recommended", "estimated_roi": "25%", "investment_level": "High", "payback_period": "4 Years"}
    elif overall_score >= 75:
        result = {"decision": "Recommended", "estimated_roi": "20%", "investment_level": "High", "payback_period": "5 Years"}
    elif overall_score >= 60:
        result = {"decision": "Worth Considering", "estimated_roi": "15%", "investment_level": "Medium", "payback_period": "8 Years"}
    elif overall_score >= 45:
        result = {"decision": "Proceed with Caution", "estimated_roi": "10%", "investment_level": "Low", "payback_period": "12 Years"}
    else:
        result = {"decision": "Not Recommended", "estimated_roi": "4%", "investment_level": "Very Low", "payback_period": "18 Years"}

    result["basis"] = "Suitability-score planning heuristic"
    result["disclaimer"] = "Screening estimate only; validate costs, tariffs, financing, grid access, land, permits and production with qualified advisers before investing."
    return result
