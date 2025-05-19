'use client';

import { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tabs,
  Tab,
  Box,
  Typography,
  Tooltip,
  CircularProgress
} from '@mui/material';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import RemoveIcon from '@mui/icons-material/Remove';

interface RaceResult {
  position: number;
  driver: string;
  team: string;
  finishTime: string;
  points: number;
}

interface RacePrediction {
  Driver: string;
  'PredictedRaceTime (s)': number;
}

interface ChampionshipStanding {
  position: number;
  driver: string;
  team: string;
  points: number;
  predictedPoints?: number;
  positionChange?: number;
}

interface RaceResultsProps {
  raceName: string;
  selectedModel: string;
  predictions: RacePrediction[];
}

const API_BASE = 'https://api.jolpi.ca/ergast/f1'; // Ergast‑compatible Jolpica API (FastF1 backend)

export default function RaceResults({ raceName, selectedModel, predictions }: RaceResultsProps) {
  const [tabValue, setTabValue] = useState(0);
  const [actualResults, setActualResults] = useState<RaceResult[]>([]);
  const [championshipStandings, setChampionshipStandings] = useState<ChampionshipStanding[]>([]);
  const [predictedStandings, setPredictedStandings] = useState<ChampionshipStanding[]>([]);
  const [loading, setLoading] = useState(true);

  const pointsSystem = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1];

  useEffect(() => {
    const fetchResults = async () => {
      try {
        // 1. Fetch live driver standings
        const liveStandings = await fetchDriverStandings();

        // 2. Fetch (or simulate) current race results
        const mockResults = getMockRaceResults(raceName);

        setActualResults(mockResults);
        setChampionshipStandings(liveStandings);

        // 3. Calculate championship impact of the predictions
        if (predictions && predictions.length) {
          const orderedPredictions = [...predictions].sort(
            (a, b) => a['PredictedRaceTime (s)'] - b['PredictedRaceTime (s)']
          );

          const newStandings = calculatePredictedStandings(
            liveStandings,
            orderedPredictions,
            mockResults
          );

          setPredictedStandings(newStandings);
        }

        setLoading(false);
      } catch (error) {
        console.error('Error fetching results:', error);
        setLoading(false);
      }
    };

    fetchResults();
  }, [raceName, selectedModel, predictions]);

  // Fetch current driver standings from the Jolpica Ergast‑compatible API
  const fetchDriverStandings = async (): Promise<ChampionshipStanding[]> => {
    const url = `${API_BASE}/current/driverStandings.json`;
    const res = await fetch(url, { next: { revalidate: 60 } }); // revalidate once a minute on Vercel
    if (!res.ok) throw new Error(`Failed to fetch driver standings – ${res.status}`);
    const data = await res.json();

    const list =
      data?.MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings ?? [];

    return list.map((item: any) => ({
      position: Number(item.position),
      driver: `${item.Driver.givenName} ${item.Driver.familyName}`,
      team: item.Constructors?.[0]?.name ?? 'N/A',
      points: Number(item.points)
    }));
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Format seconds to mm:ss.ms format
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toFixed(3).padStart(6, '0')}`;
  };

  // Calculate gap to leader
  const calculateGap = (times: RacePrediction[], idx: number): string => {
    if (idx === 0) return '';
    const leaderTime = times[0]['PredictedRaceTime (s)'];
    const driverTime = times[idx]['PredictedRaceTime (s)'];
    const gap = driverTime - leaderTime;
    return `+${gap.toFixed(3)}s`;
  };

  // Helper function to get position change indicator
  const getPositionChangeIndicator = (change: number) => {
    if (change > 0) {
      return <ArrowUpwardIcon fontSize="small" sx={{ color: 'green' }} />;
    } else if (change < 0) {
      return <ArrowDownwardIcon fontSize="small" sx={{ color: 'red' }} />;
    } else {
      return <RemoveIcon fontSize="small" sx={{ color: 'gray' }} />;
    }
  };

  /* --------------------------------------------------------------------------
      Mock data generator for the current race (unchanged)
     -------------------------------------------------------------------------- */
  const getMockRaceResults = (raceName: string): RaceResult[] => {
    // Current 2025 F1 drivers
    const drivers = [
      { name: 'Max Verstappen', team: 'Red Bull Racing' },
      { name: 'Sergio Perez', team: 'Red Bull Racing' },
      { name: 'Charles Leclerc', team: 'Ferrari' },
      { name: 'Carlos Sainz', team: 'Ferrari' },
      { name: 'Lewis Hamilton', team: 'Mercedes' },
      { name: 'George Russell', team: 'Mercedes' },
      { name: 'Lando Norris', team: 'McLaren' },
      { name: 'Oscar Piastri', team: 'McLaren' },
      { name: 'Fernando Alonso', team: 'Aston Martin' },
      { name: 'Lance Stroll', team: 'Aston Martin' },
      { name: 'Esteban Ocon', team: 'Alpine' },
      { name: 'Pierre Gasly', team: 'Alpine' },
      { name: 'Daniel Ricciardo', team: 'RB F1 Team' },
      { name: 'Yuki Tsunoda', team: 'RB F1 Team' },
      { name: 'Valtteri Bottas', team: 'Kick Sauber' },
      { name: 'Zhou Guanyu', team: 'Kick Sauber' },
      { name: 'Kevin Magnussen', team: 'Haas F1 Team' },
      { name: 'Nico Hulkenberg', team: 'Haas F1 Team' },
      { name: 'Alexander Albon', team: 'Williams' },
      { name: 'Logan Sargeant', team: 'Williams' }
    ];

    const performanceTiers = [
      [0, 4, 6],
      [1, 2, 3, 5, 7],
      [8, 9, 10, 11, 12, 13],
      [14, 15, 16, 17, 18, 19]
    ];

    const raceOrder: number[] = [];
    performanceTiers.forEach(tier => {
      const shuffledTier = [...tier].sort(() => Math.random() - 0.5);
      raceOrder.push(...shuffledTier);
    });

    const baseTimeInSeconds = 1 * 3600 + 30 * 60; // 1h30m

    return raceOrder.map((driverIndex, position) => {
      let gap = 0;
      if (position > 0) {
        if (position < 3) gap = position * 3 + Math.random() * 5;
        else if (position < 10) gap = 15 + position * 5 + Math.random() * 8;
        else gap = 60 + position * 8 + Math.random() * 12;
      }

      const totalTimeInSeconds = baseTimeInSeconds + gap;
      const hours = Math.floor(totalTimeInSeconds / 3600);
      const minutes = Math.floor((totalTimeInSeconds % 3600) / 60);
      const seconds = Math.floor(totalTimeInSeconds % 60);
      const milliseconds = Math.floor(Math.random() * 999);

      const finishTime = position === 0
        ? `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`
        : `+${gap.toFixed(3)}s`;

      const points = position < 10 ? pointsSystem[position] : 0;

      return {
        position: position + 1,
        driver: drivers[driverIndex].name,
        team: drivers[driverIndex].team,
        finishTime,
        points
      };
    });
  };

  /* --------------------------------------------------------------------------
      Championship impact calculator (unchanged)
     -------------------------------------------------------------------------- */
  const calculatePredictedStandings = (
    currentStandings: ChampionshipStanding[],
    predictedResults: RacePrediction[],
    actualResults: RaceResult[]
  ): ChampionshipStanding[] => {
    const newStandings = [...currentStandings].map(s => ({
      ...s,
      predictedPoints: s.points
    }));

    actualResults.forEach(result => {
      const sIdx = newStandings.findIndex(s => s.driver === result.driver);
      if (sIdx !== -1) newStandings[sIdx].predictedPoints! -= result.points;
    });

    predictedResults.slice(0, 10).forEach((prediction, idx) => {
      const sIdx = newStandings.findIndex(s => s.driver === prediction.Driver);
      if (sIdx !== -1) newStandings[sIdx].predictedPoints! += pointsSystem[idx];
    });

    newStandings.sort((a, b) => (b.predictedPoints ?? 0) - (a.predictedPoints ?? 0));

    newStandings.forEach((standing, idx) => {
      standing.position = idx + 1;
      const originalPos = currentStandings.find(s => s.driver === standing.driver)?.position ?? idx + 1;
      standing.positionChange = originalPos - standing.position;
    });

    return newStandings;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  const sortedPredictions = predictions
    ? [...predictions].sort((a, b) => a['PredictedRaceTime (s)'] - b['PredictedRaceTime (s)'])
    : [];

  return (
    <div className="bg-f1-card rounded-lg shadow-lg overflow-hidden">
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center">
          <div className="h-6 w-1.5 bg-[var(--f1-red)] mr-3"></div>
          <h2 className="text-2xl font-bold text-white">Race Results</h2>
        </div>
      </div>

      <div className="p-6">
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="race results tabs">
            <Tab label={`${selectedModel} Model Predictions`} />
            <Tab label="Race Results" />
            <Tab label="Championship Impact" />
          </Tabs>
        </Box>

        {/* ----------------------- Model Predictions ----------------------- */}
        <TabPanel value={tabValue} index={0}>
          <TableContainer component={Paper} sx={{ bgcolor: 'var(--f1-dark-gray)', color: 'white' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Pos</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Driver</TableCell>
                  <TableCell align="right" sx={{ color: 'white', fontWeight: 'bold' }}>
                    Predicted Race Time
                  </TableCell>
                  <TableCell align="right" sx={{ color: 'white', fontWeight: 'bold' }}>Gap</TableCell>
                  <TableCell align="right" sx={{ color: 'white', fontWeight: 'bold' }}>Points</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sortedPredictions.map((prediction, index) => (
                  <TableRow key={prediction.Driver} className="hover:bg-gray-700">
                    <TableCell sx={{ color: 'white' }}>{index + 1}</TableCell>
                    <TableCell sx={{ color: 'white' }}>{prediction.Driver}</TableCell>
                    <TableCell align="right" sx={{ color: 'white' }}>
                      {formatTime(prediction['PredictedRaceTime (s)'])}
                    </TableCell>
                    <TableCell align="right" sx={{ color: 'white' }}>
                      {calculateGap(sortedPredictions, index)}
                    </TableCell>
                    <TableCell align="right" sx={{ color: 'white' }}>
                      {index < 10 ? pointsSystem[index] : 0}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* -------------------------- Race Results ------------------------- */}
        <TabPanel value={tabValue} index={1}>
          <TableContainer component={Paper} sx={{ bgcolor: 'var(--f1-dark-gray)', color: 'white' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Pos</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Driver</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Team</TableCell>
                  <TableCell align="right" sx={{ color: 'white', fontWeight: 'bold' }}>
                    Race Finish
                  </TableCell>
                  <TableCell align="right" sx={{ color: 'white', fontWeight: 'bold' }}>Points</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {actualResults.map(result => (
                  <TableRow key={result.driver} className="hover:bg-gray-700">
                    <TableCell sx={{ color: 'white' }}>{result.position}</TableCell>
                    <TableCell sx={{ color: 'white' }}>{result.driver}</TableCell>
                    <TableCell sx={{ color: 'white' }}>{result.team}</TableCell>
                    <TableCell align="right" sx={{ color: 'white' }}>{result.finishTime}</TableCell>
                    <TableCell align="right" sx={{ color: 'white' }}>{result.points}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Typography variant="caption" sx={{ display: 'block', mt: 2, color: 'gray' }}>
            Note: These are simulated race results showing actual finish times and gaps to the leader.
          </Typography>
        </TabPanel>

        {/* ---------------------- Championship Impact ---------------------- */}
        <TabPanel value={tabValue} index={2}>
          <TableContainer component={Paper} sx={{ bgcolor: 'var(--f1-dark-gray)', color: 'white' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Pos</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Driver</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Team</TableCell>
                  <TableCell align="right" sx={{ color: 'white', fontWeight: 'bold' }}>
                    Current Points
                  </TableCell>
                  <TableCell align="right" sx={{ color: 'white', fontWeight: 'bold' }}>
                    Predicted Points
                  </TableCell>
                  <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold' }}>
                    Change
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {predictedStandings.map(standing => (
                  <TableRow key={standing.driver} className="hover:bg-gray-700">
                    <TableCell sx={{ color: 'white' }}>{standing.position}</TableCell>
                    <TableCell sx={{ color: 'white' }}>{standing.driver}</TableCell>
                    <TableCell sx={{ color: 'white' }}>{standing.team}</TableCell>
                    <TableCell align="right" sx={{ color: 'white' }}>{standing.points}</TableCell>
                    <TableCell align="right" sx={{ color: 'white' }}>{standing.predictedPoints}</TableCell>
                    <TableCell align="center" sx={{ color: 'white' }}>
                      <Tooltip
                        title={
                          standing.positionChange! > 0
                            ? `Up ${standing.positionChange} position(s)`
                            : standing.positionChange! < 0
                            ? `Down ${Math.abs(standing.positionChange!)} position(s)`
                            : 'No change'
                        }
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {getPositionChangeIndicator(standing.positionChange!)}
                          {standing.positionChange !== 0 && ` ${Math.abs(standing.positionChange!)}`}
                        </Box>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Typography variant="caption" sx={{ display: 'block', mt: 2, color: 'gray' }}>
            Note: Championship impact shows how the current standings would change if the {selectedModel} model predictions come true.
          </Typography>
        </TabPanel>
      </div>
    </div>
  );
}

function TabPanel(props: { children: React.ReactNode; value: number; index: number }) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}
