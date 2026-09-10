'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ShieldCheck, Activity, Cpu, CheckCircle, Sparkles, Zap, Radio, Globe } from 'lucide-react';
import { AnimMasterCanvas } from '@/components/ui/AnimMasterCanvas';
import { SkiperSpotlightCard, SkiperAnimatedCounter, SkiperBorderBeam } from '@/components/ui/SkiperUI';
import { VengeanceDisplacementCard, VengeanceGlowBadge, VengeanceInteractiveGrid, VengeanceRadarPulse } from '@/components/ui/VengeanceUI';

export default function LandingPage() {
  const [isMobile, setIsMobile] = useState(false);

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-sky-500/30 overflow-x-hidden relative">
      {/* Interactive Canvas Mesh from AnimMaster Lib Engine */}
      <AnimMasterCanvas colorScheme="sky" spacing={isMobile ? 50 : 36} interactiveRadius={isMobile ? 90 : 160} />


      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center shadow-lg shadow-sky-500/30">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-sky-300">
                NAWS-QMS
              </span>
              <span className="text-[10px] text-sky-400 font-semibold tracking-wider uppercase -mt-1">
                MoES • IMD Grid
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <VengeanceGlowBadge label="WMO Pub 8 Compliant" variant="emerald" className="hidden sm:inline-flex" />

            <Link
              href="/dashboard"
              className="group relative inline-flex items-center justify-center px-5 py-2 text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-sky-500 to-blue-600 rounded-full hover:from-sky-400 hover:to-blue-500 transition-all duration-300 shadow-lg shadow-sky-500/25 gap-2"
            >
              Launch QMS Portal <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section with Vengeance & Skiper UI Component Deck */}
      <section className="relative overflow-hidden pt-20 pb-28">
        <VengeanceInteractiveGrid />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            {/* Hero Left Content */}
            <div className="lg:col-span-7 text-left space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-950/80 border border-sky-500/30 text-sky-300 text-xs font-semibold backdrop-blur-md">
                <VengeanceRadarPulse size={16} />
                Smart India Hackathon 2026 • SIH 6073 Solution
              </div>
              <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-[1.1]">
                Next-Gen Real-Time <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-blue-400 to-indigo-300">
                  Weather Quality Management
                </span>
              </h1>
              <p className="text-lg text-slate-300 max-w-xl leading-relaxed">
                An enterprise-grade, zero-cost, real-time quality control and anomaly discrimination platform for India&apos;s 750+ Automatic Weather Stations grid.
              </p>

              {/* Primary CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center justify-center px-8 py-4 text-base font-extrabold text-white bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 rounded-full hover:from-sky-400 hover:to-indigo-500 transition-all shadow-xl shadow-sky-500/25 gap-2.5 cursor-pointer group"
                >
                  <Zap className="w-5 h-5 fill-current text-white group-hover:scale-110 transition-transform" />
                  <span>Launch QMS Command Portal</span>
                </Link>

                <a
                  href="#architecture"
                  className="inline-flex items-center justify-center px-6 py-4 text-sm font-semibold text-slate-300 bg-slate-900/90 border border-slate-700/80 rounded-full hover:bg-slate-800 hover:text-white transition-colors"
                >
                  Explore System Architecture
                </a>
              </div>

              {/* Real-time Metric Highlights Powered by Skiper Animated Counters */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-800/80">
                <div className="space-y-1">
                  <div className="text-2xl font-bold text-sky-400">
                    <SkiperAnimatedCounter value={766} decimals={0} suffix="+" />
                  </div>
                  <div className="text-xs text-slate-400 font-medium">Districts Covered</div>
                </div>
                <div className="space-y-1">
                  <div className="text-2xl font-bold text-emerald-400">
                    <SkiperAnimatedCounter value={99.8} decimals={1} suffix="%" />
                  </div>
                  <div className="text-xs text-slate-400 font-medium">QC Reliability</div>
                </div>
                <div className="space-y-1">
                  <div className="text-2xl font-bold text-amber-400">
                    <SkiperAnimatedCounter value={2.5} decimals={1} suffix="s" />
                  </div>
                  <div className="text-xs text-slate-400 font-medium">Telemetry Rate</div>
                </div>
              </div>
            </div>

            {/* Hero Right: Interactive 3D Displacement Card Deck (Vengeance UI) */}
            <div className="lg:col-span-5">
              <VengeanceDisplacementCard glowColor="rgba(56, 189, 248, 0.25)" className="p-6">
                <SkiperBorderBeam size={220} duration={6} colorFrom="#38bdf8" colorTo="#818cf8" />
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Radio className="w-5 h-5 text-sky-400 animate-pulse" />
                    <span className="font-bold text-white text-sm">AWS-DEL-04 (Safdarjung)</span>
                  </div>
                  <VengeanceGlowBadge label="NOMINAL (QC 1)" variant="emerald" />
                </div>

                <div className="grid grid-cols-2 gap-4 py-6">
                  <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800">
                    <span className="text-xs text-slate-400">Temperature</span>
                    <div className="text-xl font-bold text-white mt-1">
                      <SkiperAnimatedCounter value={32.4} suffix=" °C" />
                    </div>
                  </div>
                  <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800">
                    <span className="text-xs text-slate-400">Atm. Pressure</span>
                    <div className="text-xl font-bold text-sky-300 mt-1">
                      <SkiperAnimatedCounter value={1008.2} suffix=" hPa" />
                    </div>
                  </div>
                  <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800">
                    <span className="text-xs text-slate-400">Rel. Humidity</span>
                    <div className="text-xl font-bold text-emerald-300 mt-1">
                      <SkiperAnimatedCounter value={68.5} suffix=" %" />
                    </div>
                  </div>
                  <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800">
                    <span className="text-xs text-slate-400">Wind Speed</span>
                    <div className="text-xl font-bold text-amber-300 mt-1">
                      <SkiperAnimatedCounter value={14.2} suffix=" km/h" />
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-sky-950/40 rounded-xl border border-sky-500/20 text-xs text-sky-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-sky-400" />
                    <span>Convective Storm Discrimination</span>
                  </div>
                  <span className="font-bold text-sky-400">PASS (No Fault)</span>
                </div>
              </VengeanceDisplacementCard>
            </div>
          </div>
        </div>
      </section>

      {/* Problem & Solution with Skiper UI Spotlight Cards */}
      <section className="py-24 bg-slate-900/60 border-y border-slate-800/80 relative z-10 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-stretch">
            {/* Challenge */}
            <SkiperSpotlightCard className="p-8 bg-slate-950/80 border-slate-800" spotlightColor="rgba(244, 63, 94, 0.12)" borderColor="rgba(244, 63, 94, 0.3)">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 text-rose-400 text-xs font-bold mb-6 border border-rose-500/20">
                The Challenge • SIH 6073
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">Met Data Anomaly Dilemma</h2>
              <p className="text-slate-300 leading-relaxed mb-6 text-sm">
                Automatic Weather Stations (AWS) occasionally transmit erroneous data due to thermistor spikes, barometer drift, or frozen sensors. Distinguishing genuine severe storms from sensor glitches is extremely challenging.
              </p>
              <ul className="space-y-3">
                {[
                  'Wasted technician dispatches due to false alarms.',
                  'Corrupted observations poison NWP forecast models.',
                  'Need for zero-latency WMO validation at the edge.',
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-300 text-sm">
                    <div className="p-1 rounded-full bg-rose-500/20 text-rose-400">
                      <Activity className="w-3.5 h-3.5" />
                    </div>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </SkiperSpotlightCard>

            {/* Solution */}
            <SkiperSpotlightCard className="p-8 bg-slate-950/80 border-slate-800" spotlightColor="rgba(16, 185, 129, 0.12)" borderColor="rgba(16, 185, 129, 0.3)">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold mb-6 border border-emerald-500/20">
                Our Solution • NAWS-QMS
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">Autonomous Edge Verification</h2>
              <p className="text-slate-300 leading-relaxed mb-6 text-sm">
                A zero-cost, edge-compatible pipeline running WMO-compliant physical bounds, rate-of-change, temporal persistence, and spatial cross-validation logic.
              </p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  'WMO Flags 1-5',
                  'Convective Logic',
                  'Explainable AI',
                  'NWP Reconstruction',
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 bg-slate-900/90 p-2.5 rounded-lg border border-slate-800">
                    <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span className="font-semibold text-slate-200 text-xs">{item}</span>
                  </div>
                ))}
              </div>
            </SkiperSpotlightCard>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="architecture" className="py-24 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <VengeanceGlowBadge label="Built for MoES / IMD Grid" variant="blue" />
            <h2 className="text-3xl font-extrabold text-white">Core Architectural Innovations</h2>
            <p className="text-slate-400 text-sm">
              Strictly compliant with World Meteorological Organization (WMO Pub No. 8) standards.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Cpu className="w-6 h-6 text-sky-400" />,
                title: 'Edge-Side Processing',
                desc: 'Runs autonomously with zero external API costs, providing edge telemetry validation instantly.',
              },
              {
                icon: <Activity className="w-6 h-6 text-amber-400" />,
                title: 'Convective Discrimination',
                desc: 'Couples pressure drops, humidity spikes, and temperature dips to isolate true severe weather.',
              },
              {
                icon: <ShieldCheck className="w-6 h-6 text-emerald-400" />,
                title: 'WMO Data Reconstruction',
                desc: 'Imputes corrupt sensor slots using weighted moving averages to feed clean data into NWP models.',
              },
            ].map((feat, i) => (
              <SkiperSpotlightCard key={i} className="p-8 bg-slate-900/80 border-slate-800">
                <div className="w-12 h-12 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-center mb-6 shadow-inner">
                  {feat.icon}
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{feat.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{feat.desc}</p>
              </SkiperSpotlightCard>
            ))}
          </div>
        </div>
      </section>



      {/* Footer */}
      <footer className="bg-slate-950 text-slate-400 py-12 border-t border-slate-800/80 relative z-10 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="w-10 h-10 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-center mx-auto shadow-md">
            <Globe className="w-5 h-5 text-sky-400" />
          </div>
          <p className="text-slate-200 font-semibold text-sm">NAWS-QMS • SIH 6073 Submission</p>
          <p className="text-slate-400 max-w-xl mx-auto">
            National Automatic Weather Station Quality Management System • Ministry of Earth Sciences (MoES) / IMD
          </p>
        </div>
      </footer>
    </div>
  );
}
