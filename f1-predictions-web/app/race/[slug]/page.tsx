'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import RaceAnalytics from '../../components/RaceAnalytics';

interface Prediction {
  Driver: string;
  'PredictedRaceTime (s)': number;
}

interface RacePredictions {
  basic: {
    predictions: Prediction[];
    timestamp: string;
  };
  advanced: {
    predictions: Prediction[];
    timestamp: string;
  };
  nochange: {
    predictions: Prediction[];
    timestamp: string;
  };
  olddrivers: {
    predictions: Prediction[];
    timestamp: string;
  };
}

export default function RacePage() {
  const params = useParams();
  const raceName = (params.slug as string).split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');

  return (
    <main className="min-h-screen p-8">
      <h1 className="text-4xl font-bold text-center mb-8">
        {raceName} Grand Prix Predictions
      </h1>

      <div className="max-w-7xl mx-auto">
        <RaceAnalytics raceName={raceName} />
      </div>
    </main>
  );
} 