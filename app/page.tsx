'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Activity, Cpu, ShieldCheck, Globe, Clock } from 'lucide-react';

export default function LandingPage() {
  const [fontSize, setFontSize] = useState('A');
  
  return (
    <div className={`min-h-screen bg-slate-50 text-slate-900 font-sans ${fontSize === 'A+' ? 'text-lg' : fontSize === 'A-' ? 'text-sm' : 'text-base'}`}>
      
      {/* Government Tricolor Top Band */}
      <div className="flex w-full h-1">
        <div className="flex-1 bg-[#FF9933]"></div>
        <div className="flex-1 bg-white"></div>
        <div className="flex-1 bg-[#138808]"></div>
      </div>

      {/* Accessibility & Government Header (NIC Standard) */}
      <div className="bg-[#002147] text-white py-1.5 px-4 text-xs font-semibold flex flex-wrap justify-between items-center border-b border-slate-700">
        <div className="flex items-center gap-4">
          <span className="hidden sm:inline">भारत सरकार | Government of India</span>
          <span className="text-slate-300">पृथ्वी विज्ञान मंत्रालय | Ministry of Earth Sciences</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 border-r border-slate-600 pr-3">
            <button onClick={() => setFontSize('A-')} className="hover:text-amber-400">A-</button>
            <button onClick={() => setFontSize('A')} className="hover:text-amber-400">A</button>
            <button onClick={() => setFontSize('A+')} className="hover:text-amber-400">A+</button>
          </div>
          <button className="hover:text-amber-400">High Contrast</button>
          <div className="border-l border-slate-600 pl-3">English | हिन्दी</div>
        </div>
      </div>

      {/* Main Navbar */}
      <nav className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-slate-100 border border-slate-200 flex items-center justify-center rounded-full overflow-hidden shrink-0">
              <Image src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg" alt="Emblem of India" width={32} height={32} className="h-8 w-auto" unoptimized />
            </div>
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-amber-500/40 shadow-sm shrink-0 bg-slate-950 flex items-center justify-center hidden sm:flex">
              <Image src="/jatayu-seal.jpg" alt="Project JATAYU Emblem" width={48} height={48} className="w-full h-full object-cover" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-xl text-[#002147] tracking-tight flex items-center gap-2">
                <span>PROJECT JATAYU</span>
                <span className="text-xs bg-amber-100 text-amber-900 font-mono px-2 py-0.5 rounded border border-amber-300">
                  JATAYU-QMS
                </span>
              </span>
              <span className="text-xs text-slate-600 font-medium tracking-wide">
                Joint Atmospheric Telemetry &amp; Anomaly Unification • MoES / IMD (SIH26073)
              </span>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <a href="https://mausam.imd.gov.in" target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-sky-800 hover:text-blue-900">IMD Mausam ↗</a>
            <a href="https://cloud.gov.in" target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-emerald-800 hover:text-emerald-950">NIC MeghRaj ↗</a>
            <a href="https://moes.gov.in" target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-slate-700 hover:text-[#002147]">MoES ↗</a>
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center px-5 py-2 text-sm font-bold text-white bg-[#002147] rounded hover:bg-blue-900 transition-colors gap-2"
            >
              Access JATAYU Portal <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            
            <div className="space-y-6">
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-amber-50 text-amber-900 text-xs font-bold border border-amber-200">
                  Problem SIH26073 • Ministry of Earth Sciences
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-blue-50 text-blue-800 text-xs font-bold border border-blue-200">
                  WMO Pub 8 • Zahumenský 2004 Compliant
                </span>
              </div>
              <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 leading-tight">
                Project JATAYU: Intelligent Weather Station Quality Management
              </h1>
              <p className="text-base md:text-lg text-slate-600 max-w-lg leading-relaxed">
                <strong>Joint Atmospheric Telemetry &amp; Anomaly Unification (JATAYU-QMS)</strong> delivers an autonomous edge QC layer for India&apos;s 1,350+ Automatic Weather Stations. Eliminates sensor contamination, detects convective storms in &lt;5ms, and gates clean data to NWP forecast models.
              </p>

              {/* JATAYU Acronym Card */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1.5">
                <div className="font-bold text-[#002147] uppercase tracking-wider text-[11px]">Acronym Breakdown</div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 font-mono text-[11px]">
                  <div><strong className="text-amber-600">J</strong>oint</div>
                  <div><strong className="text-amber-600">A</strong>tmospheric</div>
                  <div><strong className="text-amber-600">T</strong>elemetry &amp;</div>
                  <div><strong className="text-amber-600">A</strong>nomaly</div>
                  <div><strong className="text-amber-600">Y</strong>ield /</div>
                  <div><strong className="text-amber-600">U</strong>nification</div>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 pt-2">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center px-6 py-3 text-base font-bold text-white bg-[#002147] rounded hover:bg-blue-900 transition-colors gap-2"
                >
                  <Activity className="w-5 h-5" />
                  Launch JATAYU-QMS Console
                </Link>
                <Link
                  href="/dashboard?tab=analytics"
                  className="inline-flex items-center px-6 py-3 text-base font-semibold text-[#002147] bg-slate-100 border border-slate-300 rounded hover:bg-slate-200 transition-colors"
                >
                  View QC Analytics
                </Link>
              </div>
            </div>

            {/* Quick Metrics Panel */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 shadow-sm">
              <h3 className="font-bold text-slate-800 border-b border-slate-200 pb-3 mb-4 flex items-center gap-2">
                <Globe className="w-5 h-5 text-blue-700" /> Network Overview (Live)
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-4 border border-slate-200 rounded">
                  <div className="text-xs text-slate-500 font-semibold uppercase">Total Nodes</div>
                  <div className="text-2xl font-bold text-slate-900 mt-1">750+</div>
                </div>
                <div className="bg-white p-4 border border-slate-200 rounded">
                  <div className="text-xs text-slate-500 font-semibold uppercase">Operational</div>
                  <div className="text-2xl font-bold text-green-700 mt-1">98.4%</div>
                </div>
                <div className="bg-white p-4 border border-slate-200 rounded">
                  <div className="text-xs text-slate-500 font-semibold uppercase">QC Standards</div>
                  <div className="text-base font-bold text-[#002147] mt-1">WMO Compliant</div>
                </div>
                <div className="bg-white p-4 border border-slate-200 rounded">
                  <div className="text-xs text-slate-500 font-semibold uppercase">Telemetry Cadence</div>
                  <div className="text-2xl font-bold text-slate-900 mt-1">2.5s</div>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded text-xs text-blue-800 flex items-center gap-2">
                <Clock className="w-4 h-4" /> Data synced successfully 2 seconds ago.
              </div>
            </div>
            
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-[#002147]">System Capabilities</h2>
            <div className="w-16 h-1 bg-[#FF9933] mx-auto mt-4"></div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <ShieldCheck className="w-8 h-8 text-[#002147]" />,
                title: 'Data Validation Engine',
                desc: 'Applies automated plausibility bounds, persistence checks, and rate-of-change filters to flag erroneous telemetry.',
              },
              {
                icon: <Activity className="w-8 h-8 text-[#002147]" />,
                title: 'Meteorological Correlation',
                desc: 'Cross-validates atmospheric pressure drops with humidity spikes to accurately identify genuine severe weather events.',
              },
              {
                icon: <Cpu className="w-8 h-8 text-[#002147]" />,
                title: 'WMO-Imputation Models',
                desc: 'Synthesizes missing or quarantined data points using spatial-temporal algorithms to ensure NWP model integrity.',
              },
            ].map((feat, i) => (
              <div key={i} className="bg-white p-6 border border-slate-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="mb-4">{feat.icon}</div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{feat.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#002147] text-white py-8 border-t-4 border-[#FF9933]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm">
              <div className="font-bold mb-1 flex items-center gap-2">
                <span>PROJECT JATAYU (JATAYU-QMS)</span>
                <span className="text-[10px] bg-sky-900 text-sky-200 px-2 py-0.5 rounded font-mono">SIH26073</span>
              </div>
              <div className="text-slate-300 text-xs">
                Joint Atmospheric Telemetry &amp; Anomaly Unification • Ministry of Earth Sciences (MoES) &amp; IMD
              </div>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-300 flex-wrap">
              <a href="https://mausam.imd.gov.in" target="_blank" rel="noopener noreferrer" className="hover:text-amber-400">IMD Mausam ↗</a>
              <span>•</span>
              <a href="https://cloud.gov.in" target="_blank" rel="noopener noreferrer" className="hover:text-amber-400">NIC MeghRaj ↗</a>
              <span>•</span>
              <a href="https://moes.gov.in" target="_blank" rel="noopener noreferrer" className="hover:text-amber-400">MoES ↗</a>
              <span>•</span>
              <a href="https://oscar.wmo.int" target="_blank" rel="noopener noreferrer" className="hover:text-amber-400">WMO OSCAR ↗</a>
            </div>
            <div className="text-xs text-slate-400">
              © {new Date().getFullYear()} Innovation Prototype.
            </div>
          </div>
        </div>
      </footer>
      
    </div>
  );
}
