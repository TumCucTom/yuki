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
    <main className="min-h-screen pb-16">
      {/* Hero Section with Track Image */}
      <div className="relative h-64 md:h-96 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent z-10"></div>
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-[url('/tracks/hero.jpg')] bg-cover bg-center opacity-70"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[var(--f1-black)]"></div>
        </div>
        
        <div className="relative z-20 h-full flex flex-col justify-center items-center text-center">
          <div className="inline-flex items-center mb-4 bg-[var(--f1-red)]/10 border border-[var(--f1-red)]/20 rounded-full px-4 py-2">
            <div className="h-2 w-2 rounded-full bg-[var(--f1-red)] mr-2"></div>
            <span className="text-sm font-medium text-white">2025 Season Predictions</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white">
            {raceName} <span className="text-[var(--f1-red)]">Grand Prix</span>
          </h1>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[var(--f1-black)] to-transparent"></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <RaceAnalytics raceName={raceName} />
      </div>
      
      {/* Footer with quick navigation */}
      <div className="mt-20 border-t border-white/10 py-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-gray-400">← Previous Race</span>
            </div>
            <div>
              <span className="text-[var(--f1-red)] hover:underline cursor-pointer">Back to All Races</span>
            </div>
            <div>
              <span className="text-gray-400">Next Race →</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
} 