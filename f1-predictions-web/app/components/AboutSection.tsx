'use client';

import { useState } from 'react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';

export default function AboutSection() {
  const [activeTab, setActiveTab] = useState<'overview' | 'code' | 'features'>('overview');

  const modelCode = `def run_prediction(gp_name, model_type="advanced"):
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
        
        # Merge qualifying data with sector times
        merged_data = qualifying_2025.merge(sector_times, left_on="DriverCode", right_on="Driver", how="left")
        
        # Define feature set based on model type
        if model_type == "basic":
            X = merged_data[["QualifyingTime (s)"]]
        else:
            X = merged_data[["QualifyingTime (s)", "Sector1Time (s)", "Sector2Time (s)", "Sector3Time (s)"]].fillna(0)
        
        y = laps.groupby("Driver")["LapTime (s)"].mean().reset_index()["LapTime (s)"]
        
        # Train model
        model = GradientBoostingRegressor(n_estimators=200, learning_rate=0.1, random_state=38)
        model.fit(X, y)
        
        # Make predictions
        predicted_times = model.predict(X)
        qualifying_2025["PredictedRaceTime (s)"] = predicted_times
        
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
        }`;

  return (
    <div className="bg-gradient-to-br from-gray-900 to-black rounded-lg shadow-2xl p-8 border border-red-600/20">
      <div className="flex justify-center gap-4 mb-8">
        {(['overview', 'code', 'features'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 rounded-md font-medium transition-all duration-300 ${
              activeTab === tab
                ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-4">About the Model</h2>
            <div className="w-24 h-1 bg-red-600 mx-auto"></div>
          </div>
          
          <p className="text-gray-300 text-lg leading-relaxed">
            Our F1 prediction model uses machine learning to forecast race outcomes for the 2025 season.
            The model analyzes historical race data and current driver performance to make accurate predictions.
          </p>
          
          <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
            <h3 className="text-2xl font-semibold text-white mb-4">How It Works</h3>
            <ol className="space-y-4">
              {[
                'Historical race data is collected using the FastF1 API',
                'Lap times and sector times are analyzed for each driver',
                'Qualifying performance is used as a baseline',
                'A Gradient Boosting Regressor is trained on this data',
                'Predictions are made for each race using different model variants'
              ].map((step, index) => (
                <li key={index} className="flex items-start gap-3 text-gray-300">
                  <span className="flex-shrink-0 w-6 h-6 bg-red-600 rounded-full flex items-center justify-center text-white font-bold">
                    {index + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
            <h3 className="text-2xl font-semibold text-white mb-6">Model Types</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  name: 'Basic Model',
                  description: 'Uses only qualifying times for predictions',
                  color: 'from-blue-600/20 to-blue-800/20'
                },
                {
                  name: 'Advanced Model',
                  description: 'Incorporates sector times and historical performance',
                  color: 'from-red-600/20 to-red-800/20'
                },
                {
                  name: 'No Change Model',
                  description: 'Assumes no significant changes in driver performance',
                  color: 'from-yellow-600/20 to-yellow-800/20'
                },
                {
                  name: 'Old Drivers Model',
                  description: 'Focuses on experienced drivers historical data',
                  color: 'from-green-600/20 to-green-800/20'
                }
              ].map((model) => (
                <div
                  key={model.name}
                  className={`bg-gradient-to-br ${model.color} p-6 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors duration-300`}
                >
                  <h4 className="text-xl font-semibold text-white mb-2">{model.name}</h4>
                  <p className="text-gray-300">{model.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'code' && (
        <div className="space-y-6">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-4">Model Implementation</h2>
            <div className="w-24 h-1 bg-red-600 mx-auto"></div>
          </div>
          <div className="rounded-lg overflow-hidden border border-gray-700">
            <div className="bg-gray-800 px-4 py-2 border-b border-gray-700">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
            </div>
            <SyntaxHighlighter
              language="python"
              style={docco}
              customStyle={{
                background: '#1a1a1a',
                padding: '1.5rem',
                margin: 0,
                borderRadius: '0 0 0.5rem 0.5rem'
              }}
            >
              {modelCode}
            </SyntaxHighlighter>
          </div>
        </div>
      )}

      {activeTab === 'features' && (
        <div className="space-y-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-4">Key Features</h2>
            <div className="w-24 h-1 bg-red-600 mx-auto"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                title: 'Data Collection',
                items: [
                  'Real-time race data from FastF1 API',
                  'Historical performance analysis',
                  'Sector-by-sector timing data',
                  'Qualifying performance metrics'
                ],
                icon: '📊'
              },
              {
                title: 'Model Features',
                items: [
                  'Gradient Boosting algorithm',
                  'Multiple prediction models',
                  'Error analysis and validation',
                  'Real-time updates'
                ],
                icon: '⚡'
              },
              {
                title: 'Visualization',
                items: [
                  'Interactive race predictions',
                  'Model performance metrics',
                  'Driver comparison charts',
                  'Historical trend analysis'
                ],
                icon: '📈'
              },
              {
                title: 'Analysis Tools',
                items: [
                  'Model error tracking',
                  'Driver consistency scoring',
                  'Performance comparisons',
                  'Prediction confidence metrics'
                ],
                icon: '🔍'
              }
            ].map((section) => (
              <div
                key={section.title}
                className="bg-gray-800/50 p-6 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors duration-300"
              >
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">{section.icon}</span>
                  <h3 className="text-xl font-semibold text-white">{section.title}</h3>
                </div>
                <ul className="space-y-3">
                  {section.items.map((item, index) => (
                    <li key={index} className="flex items-center gap-2 text-gray-300">
                      <span className="w-1.5 h-1.5 bg-red-600 rounded-full"></span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 