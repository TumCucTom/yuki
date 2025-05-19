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
  BarChart,
  Bar,
} from 'recharts';

interface ModelMetrics {
  model_type: string;
  average_error: number;
  predictions_count: number;
  last_updated: string;
}

interface DriverPerformance {
  driver: string;
  average_position: number;
  consistency_score: number;
}

function standardDeviation(arr: number[]) {
  const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
  return Math.sqrt(arr.reduce((a, b) => a + (b - mean) ** 2, 0) / arr.length);
}

export default function DashboardMetrics() {
  const [modelMetrics, setModelMetrics] = useState<ModelMetrics[]>([]);
  const [driverPerformance, setDriverPerformance] = useState<DriverPerformance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await fetch('/predictions/all_predictions.json');
        const data = await response.json();
        
        // Process model metrics
        const metrics: ModelMetrics[] = [];
        const driverStats: { [key: string]: { positions: number[], count: number } } = {};
        
        Object.entries(data).forEach(([race, raceData]: [string, any]) => {
          Object.entries(raceData).forEach(([modelType, modelData]: [string, any]) => {
            if (modelData.error) return;
            
            const existingMetric = metrics.find(m => m.model_type === modelType);
            if (existingMetric) {
              existingMetric.average_error += modelData.model_error;
              existingMetric.predictions_count += modelData.predictions.length;
            } else {
              metrics.push({
                model_type: modelType,
                average_error: modelData.model_error,
                predictions_count: modelData.predictions.length,
                last_updated: modelData.timestamp
              });
            }

            // Process driver performance
            modelData.predictions.forEach((pred: any, index: number) => {
              if (!driverStats[pred.Driver]) {
                driverStats[pred.Driver] = { positions: [], count: 0 };
              }
              driverStats[pred.Driver].positions.push(index + 1);
              driverStats[pred.Driver].count++;
            });
          });
        });

        // Calculate averages
        metrics.forEach(metric => {
          metric.average_error /= Object.keys(data).length;
        });

        // Process driver performance data
        const driverPerformanceData = Object.entries(driverStats).map(([driver, stats]) => ({
          driver,
          average_position: stats.positions.reduce((a, b) => a + b, 0) / stats.count,
          consistency_score: 1 / (standardDeviation(stats.positions) || 1) // Higher score means more consistent
        }));

        setModelMetrics(metrics);
        setDriverPerformance(driverPerformanceData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching metrics:', error);
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Model Performance Metrics */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-6">Model Performance</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {modelMetrics.map((metric) => (
            <div key={metric.model_type} className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold capitalize">{metric.model_type} Model</h3>
              <p className="text-2xl font-bold text-blue-600">
                {metric.average_error.toFixed(3)}s
              </p>
              <p className="text-sm text-gray-600">Average Error</p>
            </div>
          ))}
        </div>
      </div>

      {/* Driver Performance Chart */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-6">Driver Performance</h2>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={driverPerformance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="driver" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="average_position" name="Average Position" fill="#3B82F6" />
              <Bar dataKey="consistency_score" name="Consistency Score" fill="#10B981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Model Error Trends */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-6">Model Error Trends</h2>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={modelMetrics}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="model_type" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="average_error" name="Average Error" stroke="#3B82F6" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
} 