from app.services.environmental_engine import get_environmental_profile
from app.services.solar_engine import predict_solar
from app.services.wind_engine import predict_wind


def generate_resource_report(latitude: float, longitude: float):
    """
    Generate a complete renewable energy
    resource assessment report.
    """

    environmental = get_environmental_profile(latitude, longitude)

    solar = predict_solar(latitude, longitude)
    wind = predict_wind(latitude, longitude)

    if "error" in environmental:
        return environmental

    if "error" in solar:
        return solar

    if "error" in wind:
        return wind

    overall_score = round(
        (solar["score"] + wind["score"]) / 2
    )

    if overall_score >= 90:
        recommendation = "Excellent for Renewable Energy Deployment"

    elif overall_score >= 75:
        recommendation = "Highly Suitable for Solar & Wind Deployment"

    elif overall_score >= 60:
        recommendation = "Suitable for Renewable Energy Deployment"

    elif overall_score >= 45:
        recommendation = "Moderately Suitable"

    else:
        recommendation = "Not Recommended"

    return {
        "location": environmental["location"],
        "terrain": environmental["terrain"],
        "solar": solar,
        "wind": wind,
        "overall_score": overall_score,
        "recommendation": recommendation
    }