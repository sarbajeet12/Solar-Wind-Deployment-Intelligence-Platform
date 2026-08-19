import joblib
import pandas as pd
from pathlib import Path


# Locate the saved model relative to this file
MODEL_PATH = (
    Path(__file__).resolve().parent.parent
    / "models"
    / "random_forest_regressor.pkl"
)


# Load the trained Random Forest model
model = joblib.load(MODEL_PATH)


# Exact feature order used during model training
FEATURES = [
    "MODULE_TEMP",
    "Amb_Temp",
    "WIND_Speed",
    "IRR (W/m2)",
    "DC Current in Amps",
    "AC Ir in Amps",
    "AC Iy in Amps",
    "AC Ib in Amps",
]


def predict_power(
    module_temp,
    amb_temp,
    wind_speed,
    irradiance,
    dc_current,
    ac_ir,
    ac_iy,
    ac_ib,
):
    """
    Generate a prediction using the trained Random Forest model.
    """

    input_data = pd.DataFrame(
        [[
            module_temp,
            amb_temp,
            wind_speed,
            irradiance,
            dc_current,
            ac_ir,
            ac_iy,
            ac_ib,
        ]],
        columns=FEATURES,
    )

    prediction = model.predict(input_data)

    return float(prediction[0])


def predict_power_from_dict(features):
    """
    Generate a prediction from a dictionary containing
    the required model features.
    """

    input_data = pd.DataFrame(
        [[features[feature] for feature in FEATURES]],
        columns=FEATURES,
    )

    prediction = model.predict(input_data)

    return float(prediction[0])