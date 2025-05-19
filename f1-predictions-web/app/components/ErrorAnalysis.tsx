'use client';

import { useEffect, useState } from 'react';
import Plot from 'react-plotly.js';
import { Box, CircularProgress, Typography } from '@mui/material';
import { Data, Layout } from 'plotly.js';

interface ErrorAnalysisProps {
  raceName: string;
}

interface ErrorData {
  'Grand Prix': string;
  'Model Type': string;
  'Error (seconds)': number;
}

export default function ErrorAnalysis({ raceName }: ErrorAnalysisProps) {
  const [loading, setLoading] = useState(true);
  const [errorData, setErrorData] = useState<ErrorData[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/predictions/error_data.csv');
        const text = await response.text();
        const rows = text.split('\n').slice(1); // Skip header
        const data = rows.map(row => {
          const [gp, model, error] = row.split(',');
          return {
            'Grand Prix': gp,
            'Model Type': model,
            'Error (seconds)': parseFloat(error)
          };
        }).filter(row => !isNaN(row['Error (seconds)']));

        setErrorData(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load error data');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (!errorData.length) {
    return null;
  }

  // Filter data for the selected race
  const raceData = errorData.filter(row => row['Grand Prix'] === raceName);

  // Create box plot data
  const boxPlotData: Data[] = [{
    type: 'box',
    y: raceData.map(row => row['Error (seconds)']),
    x: raceData.map(row => row['Model Type']),
    name: 'Error Distribution',
    boxpoints: 'all',
    jitter: 0.3,
    pointpos: -1.8
  }];

  // Create heatmap data
  const modelTypes = [...new Set(raceData.map(row => row['Model Type']))];
  const heatmapData: Data[] = [{
    type: 'heatmap',
    z: [modelTypes.map(model => {
      const modelData = raceData.filter(row => row['Model Type'] === model);
      return modelData.map(row => row['Error (seconds)']);
    })],
    x: modelTypes,
    y: ['Error (seconds)'],
    colorscale: 'YlOrRd'
  }];

  const boxPlotLayout: Partial<Layout> = {
    title: { text: 'Error Distribution by Model Type' },
    yaxis: { title: { text: 'Error (seconds)' } },
    showlegend: false
  };

  const heatmapLayout: Partial<Layout> = {
    title: { text: 'Error Heatmap' },
    xaxis: { title: { text: 'Model Type' } },
    yaxis: { title: { text: 'Error (seconds)' } }
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Model Error Analysis
      </Typography>
      
      <Box display="flex" flexDirection="column" gap={4}>
        <Plot
          data={boxPlotData}
          layout={boxPlotLayout}
          style={{ width: '100%', height: '400px' }}
        />

        <Plot
          data={heatmapData}
          layout={heatmapLayout}
          style={{ width: '100%', height: '300px' }}
        />
      </Box>
    </Box>
  );
} 