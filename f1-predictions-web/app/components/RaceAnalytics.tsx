'use client';

import { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';

interface RacePrediction {
  Driver: string;
  'PredictedRaceTime (s)': number;
}

interface RaceData {
  basic: {
    predictions: RacePrediction[];
    model_error: number;
    timestamp: string;
  };
  advanced: {
    predictions: RacePrediction[];
    model_error: number;
    timestamp: string;
  };
  nochange: {
    predictions: RacePrediction[];
    model_error: number;
    timestamp: string;
  };
  olddrivers: {
    predictions: RacePrediction[];
    model_error: number;
    timestamp: string;
  };
}

interface DriverComparison {
  driver: string;
  basic: number;
  advanced: number;
  nochange: number;
  olddrivers: number;
}

export default function RaceAnalytics({ raceName }: { raceName: string }) {
  const [raceData, setRaceData] = useState<RaceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedModel, setSelectedModel] = useState<'basic' | 'advanced' | 'nochange' | 'olddrivers'>('advanced');

  useEffect(() => {
    const fetchRaceData = async () => {
      try {
        const response = await fetch('/predictions/all_predictions.json');
        const data = await response.json();
        setRaceData(data[raceName]);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching race data:', error);
        setLoading(false);
      }
    };

    fetchRaceData();
  }, [raceName]);

  if (loading || !raceData) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Process data for driver comparison chart
  const driverComparisonData: DriverComparison[] = [];
  const drivers = new Set<string>();
  
  Object.values(raceData).forEach(modelData => {
    if (Array.isArray(modelData.predictions)) {
      modelData.predictions.forEach((pred: RacePrediction) => {
        drivers.add(pred.Driver);
      });
    }
  });

  drivers.forEach(driver => {
    const comparison: DriverComparison = {
      driver,
      basic: 0,
      advanced: 0,
      nochange: 0,
      olddrivers: 0
    };

    Object.entries(raceData).forEach(([modelType, modelData]) => {
      const prediction = (modelData.predictions as RacePrediction[]).find((p: RacePrediction) => p.Driver === driver);
      if (prediction) {
        (comparison as any)[modelType] = prediction['PredictedRaceTime (s)'];
      }
    });

    driverComparisonData.push(comparison);
  });

  return (
    <div className="space-y-8">
      {/* Model Selection */}
      <div className="flex justify-center gap-4 mb-8">
        {(['basic', 'advanced', 'nochange', 'olddrivers'] as const).map((model) => (
          <button
            key={model}
            onClick={() => setSelectedModel(model)}
            className={`px-4 py-2 rounded ${
              selectedModel === model ? 'bg-blue-500 text-white' : 'bg-gray-200'
            }`}
          >
            {model.charAt(0).toUpperCase() + model.slice(1)} Model
          </button>
        ))}
      </div>

      {/* Model Performance Metrics */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-6">Model Performance</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(raceData).map(([modelType, data]) => (
            <div key={modelType} className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold capitalize">{modelType} Model</h3>
              <p className="text-2xl font-bold text-blue-600">
                {typeof data.model_error === 'number' ? data.model_error.toFixed(3) : 'N/A'}s
              </p>
              <p className="text-sm text-gray-600">Model Error</p>
            </div>
          ))}
        </div>
      </div>

      {/* Driver Comparison Chart */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-6">Driver Comparison Across Models</h2>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={driverComparisonData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="driver" />
              <PolarRadiusAxis />
              <Radar
                name="Basic Model"
                dataKey="basic"
                stroke="#3B82F6"
                fill="#3B82F6"
                fillOpacity={0.6}
              />
              <Radar
                name="Advanced Model"
                dataKey="advanced"
                stroke="#10B981"
                fill="#10B981"
                fillOpacity={0.6}
              />
              <Radar
                name="No Change Model"
                dataKey="nochange"
                stroke="#F59E0B"
                fill="#F59E0B"
                fillOpacity={0.6}
              />
              <Radar
                name="Old Drivers Model"
                dataKey="olddrivers"
                stroke="#EF4444"
                fill="#EF4444"
                fillOpacity={0.6}
              />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Selected Model Predictions */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-6">
          {selectedModel.charAt(0).toUpperCase() + selectedModel.slice(1)} Model Predictions
        </h2>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={raceData[selectedModel].predictions}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="Driver" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="PredictedRaceTime (s)"
                name="Predicted Time"
                stroke="#3B82F6"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
} 