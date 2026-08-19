def generate_forecast(overall_score: int):
    """Return a suitability-based planning outlook, not a time-series forecast.

    No validated future-generation model is currently coupled to a site's
    historical production or weather time series. This keeps the suitability
    assessment distinct from the Random Forest operating-power estimator.
    """
    if overall_score >= 90:
        potential, indicator = "Excellent resource potential", "High planning potential based on suitability"
    elif overall_score >= 75:
        potential, indicator = "High resource potential", "Favourable planning potential based on suitability"
    elif overall_score >= 60:
        potential, indicator = "Moderate resource potential", "Moderate planning potential based on suitability"
    elif overall_score >= 45:
        potential, indicator = "Limited resource potential", "Further assessment is recommended"
    else:
        potential, indicator = "Low resource potential", "Not recommended from the available suitability inputs"

    return {
        "future_potential": potential,
        "growth_trend": "Not modelled",
        "confidence": "Not applicable",
        "prediction": indicator,
        "model_type": "Suitability-based planning indicator",
        "limitation": "No validated future-generation model is included for this site.",
    }
