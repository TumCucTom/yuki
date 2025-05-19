import json
import sys
import os
from datetime import datetime
import fastf1
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.metrics import mean_absolute_error

# Add the parent directory to the path so we can import our prediction modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Enable FastF1 caching
fastf1.Cache.enable_cache("f1_cache")

# List of all 2024 F1 races
RACES_2024 = [
    "Bahrain", "Saudi Arabia", "Australia", "Japan", "China", "Miami",
    "Emilia Romagna", "Monaco", "Canada", "Spain", "Austria", "Great Britain",
    "Hungary", "Belgium", "Netherlands", "Italy", "Azerbaijan", "Singapore",
    "United States", "Mexico", "Brazil", "Las Vegas", "Qatar", "Abu Dhabi"
]

def run_prediction(gp_name, model_type="advanced"):
    """
    Run predictions for a specific Grand Prix using the specified model type.
    
    Args:
        gp_name (str): Name of the Grand Prix
        model_type (str): Type of model to use ("basic", "advanced", "nochange", "olddrivers")
    
    Returns:
        dict: Prediction results
    """
    try:
        # Load the race session
        session = fastf1.get_session(2024, gp_name, "R")
        session.load()
        
        # Extract lap and sector times
        laps = session.laps[["Driver", "LapTime", "Sector1Time", "Sector2Time", "Sector3Time"]].copy()
        laps.dropna(inplace=True)
        
        # Convert times to seconds
        for col in ["LapTime", "Sector1Time", "Sector2Time", "Sector3Time"]:
            laps[f"{col} (s)"] = laps[col].dt.total_seconds()
        
        # Group by driver to get average sector times
        sector_times = laps.groupby("Driver")[["Sector1Time (s)", "Sector2Time (s)", "Sector3Time (s)"]].mean().reset_index()
        
        # 2025 Qualifying Data
        qualifying_2025 = pd.DataFrame({
            "Driver": ["Oscar Piastri", "George Russell", "Lando Norris", "Max Verstappen", "Lewis Hamilton",
                      "Charles Leclerc", "Isack Hadjar", "Andrea Kimi Antonelli", "Yuki Tsunoda", "Alexander Albon",
                      "Esteban Ocon", "Nico Hülkenberg", "Fernando Alonso", "Lance Stroll", "Carlos Sainz Jr.",
                      "Pierre Gasly", "Oliver Bearman", "Jack Doohan", "Gabriel Bortoleto", "Liam Lawson"],
            "QualifyingTime (s)": [75.641, 75.723, 75.793, 75.817, 75.927,
                                  76.021, 76.079, 76.103, 76.638, 76.706,
                                  76.625, 76.632, 76.688, 76.773, 76.840,
                                  76.992, 77.018, 77.092, 77.141, 77.174]
        })
        
        # Map full names to FastF1 3-letter codes
        driver_mapping = {
            "Oscar Piastri": "PIA", "George Russell": "RUS", "Lando Norris": "NOR", "Max Verstappen": "VER",
            "Lewis Hamilton": "HAM", "Charles Leclerc": "LEC", "Isack Hadjar": "HAD", "Andrea Kimi Antonelli": "ANT",
            "Yuki Tsunoda": "TSU", "Alexander Albon": "ALB", "Esteban Ocon": "OCO", "Nico Hülkenberg": "HUL",
            "Fernando Alonso": "ALO", "Lance Stroll": "STR", "Carlos Sainz Jr.": "SAI", "Pierre Gasly": "GAS",
            "Oliver Bearman": "BEA", "Jack Doohan": "DOO", "Gabriel Bortoleto": "BOR", "Liam Lawson": "LAW"
        }
        
        qualifying_2025["DriverCode"] = qualifying_2025["Driver"].map(driver_mapping)
        
        # Merge qualifying data with sector times
        merged_data = qualifying_2025.merge(sector_times, left_on="DriverCode", right_on="Driver", how="left")
        
        # Define feature set based on model type
        if model_type == "basic":
            X = merged_data[["QualifyingTime (s)"]]
        else:
            X = merged_data[["QualifyingTime (s)", "Sector1Time (s)", "Sector2Time (s)", "Sector3Time (s)"]].fillna(0)
        
        y = laps.groupby("Driver")["LapTime (s)"].mean().reset_index()["LapTime (s)"]
        
        # Train model with train_test_split
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=38)
        model = GradientBoostingRegressor(n_estimators=200, learning_rate=0.1, random_state=38)
        model.fit(X_train, y_train)
        
        # Make predictions
        predicted_times = model.predict(X)
        qualifying_2025["PredictedRaceTime (s)"] = predicted_times
        
        # Sort by predicted time
        qualifying_2025 = qualifying_2025.sort_values(by="PredictedRaceTime (s)")
        
        # Calculate model error
        y_pred = model.predict(X_test)
        mae = mean_absolute_error(y_test, y_pred)
        
        # Convert to list of dictionaries for JSON serialization
        results = qualifying_2025[["Driver", "PredictedRaceTime (s)"]].to_dict('records')
        
        return {
            "gp_name": gp_name,
            "model_type": model_type,
            "predictions": results,
            "model_error": mae,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        return {
            "gp_name": gp_name,
            "model_type": model_type,
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }

def main():
    # Create predictions directory if it doesn't exist
    os.makedirs("../public/predictions", exist_ok=True)
    
    # Run predictions for all races and model types
    all_predictions = {}
    
    for gp in RACES_2024:
        print(f"Computing predictions for {gp}...")
        all_predictions[gp] = {
            "basic": run_prediction(gp, "basic"),
            "advanced": run_prediction(gp, "advanced"),
            "nochange": run_prediction(gp, "nochange"),
            "olddrivers": run_prediction(gp, "olddrivers")
        }
    
    # Save to JSON file
    with open("../public/predictions/all_predictions.json", "w") as f:
        json.dump(all_predictions, f, indent=2)
    
    print("Predictions saved to public/predictions/all_predictions.json")

if __name__ == "__main__":
    main() 