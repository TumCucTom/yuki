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
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-r-4 border-[var(--f1-red)]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
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
            {modelMetrics.map((metric) => (
              <div key={metric.model_type} className="bg-[var(--f1-dark-gray)] p-6 rounded-lg relative overflow-hidden transition-transform hover:scale-105 duration-300">
                <div className="absolute top-0 right-0 w-20 h-20 bg-[var(--f1-red)]/5 rounded-bl-full"></div>
                <h3 className="capitalize text-gray-200">{metric.model_type}</h3>
                <p className="text-3xl font-bold mt-2 mb-1">
                  {metric.average_error.toFixed(3)}
                  <span className="text-base ml-1 text-gray-400">sec</span>
                </p>
                <div className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-[var(--f1-red)] mr-2"></div>
                  <p className="text-sm text-gray-400">Average Error</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Driver Performance Chart */}
      <div className="bg-f1-card rounded-lg shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center">
            <div className="h-6 w-1.5 bg-[var(--f1-accent)] mr-3"></div>
            <h2 className="text-2xl font-bold">Driver Performance</h2>
          </div>
        </div>
        <div className="p-6">
          <div className="h-[500px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={driverPerformance.sort((a, b) => a.average_position - b.average_position).slice(0, 10)}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                <XAxis dataKey="driver" stroke="rgba(255, 255, 255, 0.65)" />
                <YAxis stroke="rgba(255, 255, 255, 0.65)" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--f1-dark-gray)', 
                    borderColor: 'var(--f1-red)',
                    borderRadius: '4px',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
                  }}
                />
                <Legend />
                <Bar 
                  dataKey="average_position" 
                  name="Average Position" 
                  fill="var(--f1-red)"
                  radius={[4, 4, 0, 0]}
                />
                <Bar 
                  dataKey="consistency_score" 
                  name="Consistency Score" 
                  fill="var(--f1-accent)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Model Error Trends */}
      <div className="bg-f1-card rounded-lg shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center">
            <div className="h-6 w-1.5 bg-[var(--f1-red)] mr-3"></div>
            <h2 className="text-2xl font-bold">Model Error Trends</h2>
          </div>
        </div>
        <div className="p-6">
          <div className="h-[500px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={modelMetrics}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                <XAxis dataKey="model_type" stroke="rgba(255, 255, 255, 0.65)" />
                <YAxis stroke="rgba(255, 255, 255, 0.65)" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--f1-dark-gray)', 
                    borderColor: 'var(--f1-red)',
                    borderRadius: '4px' 
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="average_error" 
                  name="Average Error" 
                  stroke="var(--f1-red)"
                  strokeWidth={3}
                  dot={{ 
                    stroke: 'var(--f1-white)', 
                    strokeWidth: 2, 
                    fill: 'var(--f1-red)', 
                    r: 6 
                  }}
                  activeDot={{ 
                    stroke: 'var(--f1-white)', 
                    strokeWidth: 2, 
                    r: 8, 
                    fill: 'var(--f1-red)' 
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
} 