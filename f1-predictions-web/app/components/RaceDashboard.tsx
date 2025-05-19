'use client';

import { useEffect, useState } from 'react';
import Plot from 'react-plotly.js';
import { Box, CircularProgress, Typography, Paper, Grid, Card, CardContent } from '@mui/material';
import { Data, Layout } from 'plotly.js';

interface RaceAnalytics {
  driver_stats: Record<string, any>;
  model_comparison: Record<string, any>;
  race_trends: Array<{
    'Grand Prix': string;
    'Best Model': string;
    'Worst Model': string;
    'Prediction Spread': number;
    'Last Updated': string;
  }>;
  last_updated: string;
}

interface RaceDashboardProps {
  raceName: string;
}

export default function RaceDashboard({ raceName }: RaceDashboardProps) {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<RaceAnalytics | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/predictions/race_analytics.json');
        const data = await response.json();
        setAnalytics(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load race analytics');
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

  if (error || !analytics) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography color="error">{error || 'No analytics available'}</Typography>
      </Box>
    );
  }

  // Find the current race's data
  const raceData = analytics.race_trends.find(r => r['Grand Prix'] === raceName);
  if (!raceData) return null;

  // Prepare driver performance data
  const driverPerformanceData: Data[] = [{
    type: 'bar',
    x: Object.keys(analytics.driver_stats),
    y: Object.values(analytics.driver_stats).map((stats: any) => stats.Predicted_Time_mean),
    name: 'Average Predicted Time',
    marker: {
      color: 'rgb(55, 83, 109)'
    }
  }];

  // Prepare model comparison data
  const modelComparisonData: Data[] = [{
    type: 'bar',
    x: Object.keys(analytics.model_comparison),
    y: Object.values(analytics.model_comparison).map((stats: any) => stats.Mean_Error_mean),
    name: 'Average Error',
    marker: {
      color: 'rgb(26, 118, 255)'
    }
  }];

  const driverPerformanceLayout: Partial<Layout> = {
    title: { text: 'Driver Performance Overview' },
    xaxis: { title: { text: 'Driver' } },
    yaxis: { title: { text: 'Average Predicted Time (s)' } },
    height: 400
  };

  const modelComparisonLayout: Partial<Layout> = {
    title: { text: 'Model Performance Comparison' },
    xaxis: { title: { text: 'Model Type' } },
    yaxis: { title: { text: 'Average Error (s)' } },
    height: 400
  };

  return (
    <Box p={3}>
      <Typography variant="h4" component="h2" gutterBottom>
        Race Analytics Dashboard
      </Typography>

      <Grid container spacing={3}>
        {/* Summary Cards */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Best Performing Model
              </Typography>
              <Typography variant="h4" color="primary">
                {raceData['Best Model']}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Prediction Spread
              </Typography>
              <Typography variant="h4" color="primary">
                {raceData['Prediction Spread'].toFixed(3)}s
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Last Updated
              </Typography>
              <Typography variant="h4" color="primary">
                {new Date(raceData['Last Updated']).toLocaleDateString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Charts */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Plot
              data={driverPerformanceData}
              layout={driverPerformanceLayout}
              style={{ width: '100%', height: '400px' }}
            />
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Plot
              data={modelComparisonData}
              layout={modelComparisonLayout}
              style={{ width: '100%', height: '400px' }}
            />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
} 