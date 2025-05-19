import json
from typing import Dict, List
import pandas as pd
from datetime import datetime
import os

def load_predictions() -> Dict:
    """Load predictions from the JSON file."""
    predictions_path = os.path.join('../public', 'predictions', 'all_predictions.json')
    with open(predictions_path, 'r') as f:
        return json.load(f)

def calculate_driver_stats(predictions: Dict) -> Dict:
    """Calculate driver-specific statistics across all races."""
    driver_stats = {}
    
    for race, race_predictions in predictions.items():
        for pred in race_predictions:
            driver = pred['driver']
            if driver not in driver_stats:
                driver_stats[driver] = {
                    'Predicted_Time': [],
                    'Predicted_Position': []
                }
            
            driver_stats[driver]['Predicted_Time'].append(pred['predicted_time'])
            driver_stats[driver]['Predicted_Position'].append(pred['predicted_position'])
    
    # Calculate statistics for each driver
    for driver in driver_stats:
        stats = driver_stats[driver]
        stats['Predicted_Time_mean'] = sum(stats['Predicted_Time']) / len(stats['Predicted_Time'])
        stats['Predicted_Time_std'] = pd.Series(stats['Predicted_Time']).std()
        stats['Predicted_Time_min'] = min(stats['Predicted_Time'])
        stats['Predicted_Time_max'] = max(stats['Predicted_Time'])
        
        stats['Predicted_Position_mean'] = sum(stats['Predicted_Position']) / len(stats['Predicted_Position'])
        stats['Predicted_Position_std'] = pd.Series(stats['Predicted_Position']).std()
        stats['Predicted_Position_min'] = min(stats['Predicted_Position'])
        stats['Predicted_Position_max'] = max(stats['Predicted_Position'])
        
        # Remove raw data lists
        del stats['Predicted_Time']
        del stats['Predicted_Position']
    
    return driver_stats

def calculate_model_comparison(predictions: Dict) -> Dict:
    """Calculate model comparison statistics."""
    model_stats = {}
    
    for race, race_predictions in predictions.items():
        for pred in race_predictions:
            model_type = pred['model_type']
            if model_type not in model_stats:
                model_stats[model_type] = {
                    'Mean_Error': [],
                    'Prediction_Count': 0
                }
            
            # Calculate error (difference between predicted and actual time)
            # For now, we'll use a placeholder error calculation
            error = abs(pred['predicted_time'] - 90)  # Assuming 90s as a baseline
            model_stats[model_type]['Mean_Error'].append(error)
            model_stats[model_type]['Prediction_Count'] += 1
    
    # Calculate statistics for each model
    for model in model_stats:
        stats = model_stats[model]
        stats['Mean_Error_mean'] = sum(stats['Mean_Error']) / len(stats['Mean_Error'])
        stats['Mean_Error_std'] = pd.Series(stats['Mean_Error']).std()
        stats['Mean_Error_min'] = min(stats['Mean_Error'])
        stats['Mean_Error_max'] = max(stats['Mean_Error'])
        
        # Remove raw data lists
        del stats['Mean_Error']
    
    return model_stats

def calculate_race_trends(predictions: Dict) -> List[Dict]:
    """Calculate race-specific trends and statistics."""
    race_trends = []
    
    for race, race_predictions in predictions.items():
        race_data = {
            'Grand Prix': race,
            'Best Model': '',
            'Worst Model': '',
            'Prediction Spread': 0,
            'Last Updated': datetime.now().isoformat()
        }
        
        # Calculate model performance for this race
        model_performance = {}
        for pred in race_predictions:
            model_type = pred['model_type']
            if model_type not in model_performance:
                model_performance[model_type] = []
            
            # Use the same error calculation as in model comparison
            error = abs(pred['predicted_time'] - 90)
            model_performance[model_type].append(error)
        
        # Find best and worst models
        model_means = {model: sum(errors) / len(errors) 
                      for model, errors in model_performance.items()}
        
        if model_means:
            race_data['Best Model'] = min(model_means.items(), key=lambda x: x[1])[0]
            race_data['Worst Model'] = max(model_means.items(), key=lambda x: x[1])[0]
        
        # Calculate prediction spread
        times = [pred['predicted_time'] for pred in race_predictions]
        race_data['Prediction Spread'] = max(times) - min(times)
        
        race_trends.append(race_data)
    
    return race_trends

def generate_race_analytics():
    """Generate comprehensive race analytics data."""
    predictions = load_predictions()
    
    analytics = {
        'driver_stats': calculate_driver_stats(predictions),
        'model_comparison': calculate_model_comparison(predictions),
        'race_trends': calculate_race_trends(predictions),
        'last_updated': datetime.now().isoformat()
    }
    
    # Save analytics to JSON file
    analytics_path = os.path.join('../public', 'predictions', 'race_analytics.json')
    with open(analytics_path, 'w') as f:
        json.dump(analytics, f, indent=2)
    
    print(f"Race analytics generated and saved to {analytics_path}")

if __name__ == '__main__':
    generate_race_analytics() 