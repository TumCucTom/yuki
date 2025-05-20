'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import DashboardMetrics from './components/DashboardMetrics';
import AboutSection from './components/AboutSection';

// Use dynamic import with ssr:false for components with Plotly
const ModelAnalysis = dynamic(
  () => import('./components/ModelAnalysis'),
  { ssr: false }
);

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
    <main className="min-h-screen pb-16">
      {/* Hero Section with F1-style header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent z-10"></div>
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-[url('/hero-background.jpg')] bg-cover bg-center opacity-50"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[var(--f1-black)]"></div>
        </div>
        <div className="relative z-20 max-w-7xl mx-auto pt-20 pb-16 px-6">
          <div className="flex flex-col items-center text-center">
            <div className="inline-flex items-center mb-6 bg-[var(--f1-red)]/10 border border-[var(--f1-red)]/20 rounded-full px-4 py-2">
              <div className="h-2 w-2 rounded-full bg-[var(--f1-red)] mr-2"></div>
              <span className="text-sm font-medium text-white">2025 Season Predictions</span>
            </div>
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold mb-6 tracking-tight">
              <span className="f1-gradient-text">Yuki ML</span>
              <span className="block text-white">F1 Predictions</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-300 max-w-2xl">
              Advanced machine learning predictions for the 2025 Formula 1 season, powered by historical data and real-time analytics.
            </p>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[var(--f1-black)] to-transparent"></div>
      </div>

      <div className="max-w-7xl mx-auto px-6">
        {/* About Section */}
        <div className="mb-16">
          <AboutSection />
        </div>

        {/* Dashboard Metrics */}
        <div className="mb-16">
          <div className="flex items-center mb-8">
            <div className="h-8 w-2 bg-[var(--f1-red)] mr-4"></div>
            <h2 className="text-3xl font-bold text-white">Performance Metrics</h2>
          </div>
          <DashboardMetrics />
        </div>

        {/* Race Selection */}
        <div className="mb-16">
          <div className="flex items-center mb-8">
            <div className="h-8 w-2 bg-[var(--f1-red)] mr-4"></div>
            <h2 className="text-3xl font-bold text-white">Circuit Predictions</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {TRACKS.map((track) => {
              const raceSlug = track.name.toLowerCase().replace(/\s+/g, '-');
              return (
                <Link
                  key={raceSlug}
                  href={`/race/${raceSlug}`}
                  className="group bg-f1-card rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className="aspect-video relative">
                    <Image
                      src={track.image}
                      alt={`${track.name} Grand Prix Track`}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="text-xl font-bold text-white">
                        {track.name}
                      </h3>
                      <div className="flex items-center mt-2">
                        <div className="bg-[var(--f1-red)]/20 rounded-full px-3 py-1 text-sm text-white/80">
                          View Predictions
                        </div>
                      </div>
                    </div>
                    <div className="absolute top-0 right-0 w-4 h-full bg-gradient-to-b from-[var(--f1-red)] to-[var(--f1-red)]/50"></div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Model Analysis */}
        <div className="mb-16">
          <div className="flex items-center mb-8">
            <div className="h-8 w-2 bg-[var(--f1-red)] mr-4"></div>
            <h2 className="text-3xl font-bold text-white">Model Analysis</h2>
          </div>
          <ModelAnalysis />
        </div>
      </div>
      
      {/* Footer */}
      <footer className="mt-24 border-t border-white/10 py-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <div className="flex items-center">
                <div className="h-8 w-1 bg-[var(--f1-red)] mr-3"></div>
                <span className="text-xl font-bold text-white">Yuki ML</span>
              </div>
              <p className="text-gray-400 mt-2">2025 Thomas Bale</p>
            </div>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-400 hover:text-[var(--f1-red)] transition">About</a>
              <a href="#" className="text-gray-400 hover:text-[var(--f1-red)] transition">Data</a>
              <a href="https://github.com/theOehrly/Fast-F1" className="text-gray-400 hover:text-[var(--f1-red)] transition">API</a>
              <a href="https://github.com/tumcuctom/yuki" className="text-gray-400 hover:text-[var(--f1-red)] transition">Github</a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
