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
import RaceResults from './RaceResults';

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
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-r-4 border-[var(--f1-red)]"></div>
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
    <div className="space-y-10">
      {/* Race Header */}
      <div className="relative rounded-lg overflow-hidden bg-f1-card p-8">
        <div className="absolute top-0 left-0 w-2 h-full bg-[var(--f1-red)]"></div>
        <h1 className="text-4xl font-bold mb-2">{raceName.replace(/-/g, ' ')} Grand Prix</h1>
        <p className="text-gray-400">Model predictions and performance analysis</p>
      </div>

      {/* Model Selection */}
      <div className="flex flex-wrap justify-center gap-4">
        {(['basic', 'advanced', 'nochange', 'olddrivers'] as const).map((model) => (
          <button
            key={model}
            onClick={() => setSelectedModel(model)}
            className={`px-5 py-3 rounded-md transition-all duration-300 ${
              selectedModel === model
                ? 'bg-[var(--f1-red)] text-white font-medium shadow-lg shadow-[var(--f1-red)]/30'
                : 'bg-[var(--f1-dark-gray)] text-gray-300 hover:bg-[var(--f1-light-gray)]'
            }`}
          >
            {model.charAt(0).toUpperCase() + model.slice(1)} Model
          </button>
        ))}
      </div>

      {/* Race Results Component - NEW */}
      <RaceResults 
        raceName={raceName} 
        selectedModel={selectedModel} 
        predictions={raceData[selectedModel].predictions} 
      />

      {/* Model Performance Metrics */}
      <div className="bg-f1-card rounded-lg shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center">
            <div className="h-6 w-1.5 bg-[var(--f1-red)] mr-3"></div>
            <h2 className="text-2xl font-bold">Model Performance</h2>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(raceData).map(([modelType, data]) => (
              <div key={modelType} className="bg-[var(--f1-dark-gray)] p-6 rounded-lg relative overflow-hidden transition-transform hover:scale-105 duration-300">
                <div className="absolute top-0 right-0 w-20 h-20 bg-[var(--f1-red)]/5 rounded-bl-full"></div>
                <h3 className="capitalize text-gray-200">{modelType}</h3>
                <p className="text-3xl font-bold mt-2 mb-1">
                  {typeof data.model_error === 'number' ? data.model_error.toFixed(3) : 'N/A'}
                  <span className="text-base ml-1 text-gray-400">sec</span>
                </p>
                <div className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-[var(--f1-red)] mr-2"></div>
                  <p className="text-sm text-gray-400">Model Error</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Driver Comparison Chart */}
      <div className="bg-f1-card rounded-lg shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center">
            <div className="h-6 w-1.5 bg-[var(--f1-accent)] mr-3"></div>
            <h2 className="text-2xl font-bold">Driver Comparison Across Models</h2>
          </div>
        </div>
        <div className="p-6">
          <div className="h-[500px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={driverComparisonData}>
                <PolarGrid stroke="rgba(255, 255, 255, 0.1)" />
                <PolarAngleAxis dataKey="driver" stroke="rgba(255, 255, 255, 0.65)" />
                <PolarRadiusAxis stroke="rgba(255, 255, 255, 0.3)" />
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
      </div>

      {/* Selected Model Predictions */}
      <div className="bg-f1-card rounded-lg shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center">
            <div className="h-6 w-1.5 bg-[var(--f1-red)] mr-3"></div>
            <h2 className="text-2xl font-bold">
              {selectedModel.charAt(0).toUpperCase() + selectedModel.slice(1)} Model Predictions
            </h2>
          </div>
        </div>
        <div className="p-6">
          <div className="h-[500px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={raceData[selectedModel].predictions}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                <XAxis dataKey="Driver" stroke="rgba(255, 255, 255, 0.65)" />
                <YAxis stroke="rgba(255, 255, 255, 0.65)" />
                <Tooltip contentStyle={{ backgroundColor: 'var(--f1-dark-gray)', borderColor: 'var(--f1-red)' }} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="PredictedRaceTime (s)"
                  name="Predicted Time"
                  stroke="var(--f1-red)"
                  activeDot={{ r: 8, stroke: 'var(--f1-white)', strokeWidth: 2 }}
                  dot={{ stroke: 'var(--f1-red)', strokeWidth: 2, r: 4, fill: 'var(--f1-dark-gray)' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
} 