'use client';

import { useEffect, useState } from 'react';
import Plot from 'react-plotly.js';
import { Box, CircularProgress, Typography, Paper, Grid } from '@mui/material';
import { Data, Layout } from 'plotly.js';

interface ErrorData {
  'Grand Prix': string;
  'Model Type': string;
  'Error (seconds)': number;
}

export default function ModelAnalysis() {
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

  // Prepare data for box plot
  const modelTypes = [...new Set(errorData.map(row => row['Model Type']))];
  const boxPlotData: Data[] = modelTypes.map(modelType => ({
    type: 'box',
    y: errorData
      .filter(row => row['Model Type'] === modelType)
      .map(row => row['Error (seconds)']),
    name: modelType,
    boxpoints: 'all',
    jitter: 0.3,
    pointpos: -1.8
  }));

  // Prepare data for line plot
  const linePlotData: Data[] = modelTypes.map(modelType => ({
    type: 'scatter',
    mode: 'lines+markers',
    x: errorData
      .filter(row => row['Model Type'] === modelType)
      .map(row => row['Grand Prix']),
    y: errorData
      .filter(row => row['Model Type'] === modelType)
      .map(row => row['Error (seconds)']),
    name: modelType
  }));

  // Prepare data for heatmap
  const grandPrixes = [...new Set(errorData.map(row => row['Grand Prix']))];
  const heatmapData: Data[] = [{
    type: 'heatmap',
    z: modelTypes.map(modelType => 
      grandPrixes.map(gp => {
        const match = errorData.find(row => row['Grand Prix'] === gp && row['Model Type'] === modelType);
        return match ? match['Error (seconds)'] : null;
      })
    ),
    x: grandPrixes,
    y: modelTypes,
    colorscale: 'YlOrRd'
  }];

  const boxPlotLayout: Partial<Layout> = {
    title: { text: 'Error Distribution by Model Type' },
    yaxis: { title: { text: 'Error (seconds)' } },
    showlegend: true,
    height: 400
  };

  const linePlotLayout: Partial<Layout> = {
    title: { text: 'Error Trends Across Races' },
    xaxis: { title: { text: 'Grand Prix' } },
    yaxis: { title: { text: 'Error (seconds)' } },
    showlegend: true,
    height: 400
  };

  const heatmapLayout: Partial<Layout> = {
    title: { text: 'Error Heatmap by Race and Model Type' },
    xaxis: { title: { text: 'Grand Prix' } },
    yaxis: { title: { text: 'Model Type' } },
    height: 500
  };

  return (
    <Box p={3}>
      <Typography variant="h4" component="h2" gutterBottom>
        Model Performance Analysis
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Plot
              data={boxPlotData}
              layout={boxPlotLayout}
              style={{ width: '100%', height: '400px' }}
            />
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Plot
              data={linePlotData}
              layout={linePlotLayout}
              style={{ width: '100%', height: '400px' }}
            />
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Plot
              data={heatmapData}
              layout={heatmapLayout}
              style={{ width: '100%', height: '500px' }}
            />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
} 