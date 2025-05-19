'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import ModelAnalysis from './components/ModelAnalysis';
import DashboardMetrics from './components/DashboardMetrics';
import AboutSection from './components/AboutSection';

const TRACKS = [
  { name: 'Bahrain', image: '/tracks/bahrain.jpg' },
  { name: 'Saudi Arabia', image: '/tracks/saudi-arabia.jpg' },
  { name: 'Australia', image: '/tracks/australia.jpg' },
  { name: 'Japan', image: '/tracks/japan.jpg' },
  { name: 'China', image: '/tracks/china.jpg' },
  { name: 'Miami', image: '/tracks/miami.jpg' },
  { name: 'Emilia Romagna', image: '/tracks/emilia-romagna.jpg' },
  { name: 'Monaco', image: '/tracks/monaco.jpg' },
  { name: 'Canada', image: '/tracks/canada.jpg' },
  { name: 'Spain', image: '/tracks/spain.jpg' },
  { name: 'Austria', image: '/tracks/austria.jpg' },
  { name: 'Great Britain', image: '/tracks/great-britain.jpg' },
  { name: 'Hungary', image: '/tracks/hungary.jpg' },
  { name: 'Belgium', image: '/tracks/belgium.jpg' },
  { name: 'Netherlands', image: '/tracks/netherlands.jpg' },
  { name: 'Italy', image: '/tracks/italy.jpg' },
  { name: 'Azerbaijan', image: '/tracks/azerbaijan.jpg' },
  { name: 'Singapore', image: '/tracks/singapore.jpg' },
  { name: 'United States', image: '/tracks/united-states.jpg' },
  { name: 'Mexico', image: '/tracks/mexico.jpg' },
  { name: 'Brazil', image: '/tracks/brazil.jpg' },
  { name: 'Las Vegas', image: '/tracks/las-vegas.jpg' },
  { name: 'Qatar', image: '/tracks/qatar.jpg' },
  { name: 'Abu Dhabi', image: '/tracks/abu-dhabi.jpg' },
];

export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <h1 className="text-4xl font-bold text-center mb-8">
        Yuki ML - F1 2025 Predictions
      </h1>

      {/* About Section */}
      <div className="max-w-7xl mx-auto mb-12">
        <AboutSection />
      </div>

      {/* Dashboard Metrics */}
      <div className="max-w-7xl mx-auto mb-12">
        <DashboardMetrics />
      </div>

      {/* Race Selection */}
      <div className="max-w-6xl mx-auto mb-12">
        <h2 className="text-2xl font-bold mb-4">Available Races</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {TRACKS.map((track) => {
            const raceSlug = track.name.toLowerCase().replace(/\s+/g, '-');
            return (
              <Link
                key={raceSlug}
                href={`/race/${raceSlug}`}
                className="group relative overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div className="aspect-video relative">
                  <Image
                    src={track.image}
                    alt={`${track.name} Grand Prix Track`}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-xl font-bold text-white">
                      {track.name} Grand Prix
                    </h3>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      <ModelAnalysis />
    </main>
  );
}
