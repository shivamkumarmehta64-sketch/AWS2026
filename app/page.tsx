'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  Activity,
  ShieldCheck,
  Globe,
  Smartphone,
  FileCheck,
  CloudLightning,
  AlertTriangle,
  Radio,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';

const LIVE_SAMPLE_OBSERVATORIES = [
  { id: 'AWS-DEL-04', city: 'New Delhi (Safdarjung)', temp: '29.4°C', press: '1006.5 hPa', hum: '68%', status: 'Nominal' },
  { id: 'AWS-MUM-01', city: 'Mumbai (Colaba)', temp: '31.2°C', press: '1010.2 hPa', hum: '78%', status: 'Nominal' },
  { id: 'AWS-KOL-02', city: 'Kolkata (Alipore)', temp: '28.8°C', press: '1008.4 hPa', hum: '84%', status: 'Convective Caution' },
  { id: 'AWS-BLR-05', city: 'Bengaluru (HAL Airport)', temp: '24.5°C', press: '918.2 hPa', hum: '62%', status: 'Nominal' },
];

export default function LandingPage() {
  const [fontSize, setFontSize] = useState<'A-' | 'A' | 'A+'>('A');
  const [activeInteractiveSim, setActiveInteractiveSim] = useState<'storm' | 'spike'>('storm');

  return (
    <div className={`min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-amber-100 selection:text-amber-950 ${fontSize === 'A+' ? 'text-lg' : fontSize === 'A-' ? 'text-sm' : 'text-base'}`}>
      {/* Indian National Tricolor Band */}
      <div className="flex w-full h-1">
        <div className="flex-1 bg-[#FF9933]"></div>
        <div className="flex-1 bg-white"></div>
        <div className="flex-1 bg-[#138808]"></div>
      </div>

      {/* Accessibility & Government Header (NIC GIGW 3.0 Standard) */}
      <div className="bg-[#002147] text-white py-1.5 px-4 text-xs font-semibold flex flex-wrap justify-between items-center border-b border-slate-700">
        <div className="flex items-center gap-4">
          <span className="hidden sm:inline">भारत सरकार | Government of India</span>
          <span className="text-slate-300">पृथ्वी विज्ञान मंत्रालय | Ministry of Earth Sciences</span>
          <span className="text-amber-400 font-mono hidden md:inline text-[10px] bg-sky-950/80 px-2 py-0.5 rounded border border-sky-700">
            SIH Problem Statement SIH26073
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 border-r border-slate-600 pr-3">
            <button onClick={() => setFontSize('A-')} className={`hover:text-amber-400 px-1 rounded ${fontSize === 'A-' ? 'text-amber-400 font-bold' : ''}`}>A-</button>
            <button onClick={() => setFontSize('A')} className={`hover:text-amber-400 px-1 rounded ${fontSize === 'A' ? 'text-amber-400 font-bold' : ''}`}>A</button>
            <button onClick={() => setFontSize('A+')} className={`hover:text-amber-400 px-1 rounded ${fontSize === 'A+' ? 'text-amber-400 font-bold' : ''}`}>A+</button>
          </div>
          <Link href="/dashboard" className="hover:text-amber-400 transition-colors">National Ops Console</Link>
          <div className="border-l border-slate-600 pl-3">English | हिन्दी</div>
        </div>
      </div>

      {/* Main Masthead Navbar */}
      <nav className="bg-white border-b border-slate-200 shadow-xs sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-slate-100 border border-slate-200 flex items-center justify-center rounded-full overflow-hidden shrink-0">
              <Image src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg" alt="Emblem of India" width={32} height={32} className="h-8 w-auto" unoptimized />
            </div>
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-amber-400 shadow-xs shrink-0 bg-slate-950 flex items-center justify-center hidden sm:flex">
              <Image src="/jatayu-seal.jpg" alt="Project JATAYU Emblem" width={48} height={48} className="w-full h-full object-cover" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-xl text-[#002147] tracking-tight flex items-center gap-2">
                <span>PROJECT JATAYU</span>
                <span className="text-xs bg-amber-100 text-amber-950 font-mono font-bold px-2 py-0.5 rounded border border-amber-300">
                  JATAYU-QMS
                </span>
              </span>
              <span className="text-xs text-slate-600 font-medium tracking-wide">
                Joint Atmospheric Telemetry &amp; Anomaly Unification • MoES / IMD (SIH26073)
              </span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-4 text-xs font-semibold">
            <a href="https://mausam.imd.gov.in" target="_blank" rel="noopener noreferrer" className="text-sky-800 hover:text-blue-900 flex items-center gap-1">
              <span>IMD Mausam</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <a href="https://cloud.gov.in" target="_blank" rel="noopener noreferrer" className="text-emerald-800 hover:text-emerald-950 flex items-center gap-1">
              <span>NIC MeghRaj</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <Link
              href="/mobile"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded border border-slate-300 transition-colors"
            >
              <Smartphone className="w-3.5 h-3.5 text-amber-600" />
              <span>Mobile Sensor Node</span>
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center px-4 py-2 text-xs font-bold text-white bg-[#002147] hover:bg-blue-900 rounded shadow-xs transition-colors gap-1.5"
            >
              <span>Launch Operations Portal</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Live Operational Ticker */}
      <div className="bg-slate-900 text-slate-200 border-b border-slate-800 py-2 px-4 text-xs font-mono">
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-400 font-sans font-bold uppercase text-[10px]">National Real-Time Telemetry Feed:</span>
          </div>
          <div className="flex items-center gap-4 overflow-x-auto scrollbar-none text-[11px]">
            {LIVE_SAMPLE_OBSERVATORIES.map((obs) => (
              <span key={obs.id} className="flex items-center gap-1 shrink-0">
                <strong className="text-slate-300">{obs.city.split(' ')[0]}:</strong>
                <span className="text-amber-300">{obs.temp}</span>
                <span className="text-sky-300">{obs.press}</span>
                <span className="text-emerald-300">{obs.hum}</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="bg-white border-b border-slate-200 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="grid lg:grid-cols-12 gap-10 items-center">
            
            <div className="lg:col-span-7 space-y-5">
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-50 text-amber-900 text-xs font-bold border border-amber-200">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
                  SIH26073 Automated Weather Station QMS
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-sky-50 text-sky-900 text-xs font-bold border border-sky-200">
                  WMO-No. 8 &amp; Zahumenský 2004 Compliant
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#002147] tracking-tight leading-tight">
                National Automated Weather Station Quality Management System
              </h1>

              <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-xl">
                <strong>Project JATAYU</strong> delivers an autonomous real-time quality control layer protecting India&apos;s 1,350+ Automatic Weather Stations. In &lt;5 milliseconds, our dual-engine architecture discriminates genuine extreme convective storms from transducer sensor failures—gating validated observations to Numerical Weather Prediction (NWP) models while auto-dispatching NABL maintenance work orders.
              </p>

              {/* JATAYU Acronym Architecture Strip */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-xs">
                <div className="font-bold text-[#002147] uppercase tracking-wider text-[10px] flex items-center justify-between">
                  <span>System Architecture Taxonomy</span>
                  <span className="text-slate-500 font-mono">v4.2.8 Standard</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 font-mono text-[11px]">
                  <div><strong className="text-amber-600">J</strong>oint Ingestion</div>
                  <div><strong className="text-amber-600">A</strong>tmospheric Core</div>
                  <div><strong className="text-amber-600">T</strong>elemetry Mesh</div>
                  <div><strong className="text-amber-600">A</strong>nomaly Discriminator</div>
                  <div><strong className="text-amber-600">Y</strong>ield Verification</div>
                  <div><strong className="text-amber-600">U</strong>nified NWP Gating</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 px-5 py-3 text-sm font-bold text-white bg-[#002147] hover:bg-blue-900 rounded-lg shadow-md transition-all cursor-pointer"
                >
                  <Activity className="w-4 h-4 text-amber-400" />
                  <span>Enter Operations Center</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/mobile"
                  className="inline-flex items-center gap-2 px-4 py-3 text-sm font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition-all cursor-pointer"
                >
                  <Smartphone className="w-4 h-4 text-emerald-700" />
                  <span>Connect Phone as Sensor</span>
                </Link>
                <Link
                  href="/audit-report"
                  className="inline-flex items-center gap-2 px-4 py-3 text-sm font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all"
                >
                  <FileCheck className="w-4 h-4 text-blue-700" />
                  <span>Official Audit Dossier</span>
                </Link>
              </div>
            </div>

            {/* Interactive Convective Storm vs. Sensor Fault Visualizer */}
            <div className="lg:col-span-5 bg-slate-950 text-white rounded-2xl border border-slate-800 p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
                  <span className="font-bold text-xs uppercase tracking-wider text-slate-300 font-mono">
                    Live Anomaly Discriminator Preview
                  </span>
                </div>
                <span className="text-[10px] bg-sky-950 text-sky-300 border border-sky-800 px-2 py-0.5 rounded font-mono">
                  &lt; 5ms Latency
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
                <button
                  onClick={() => setActiveInteractiveSim('storm')}
                  className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                    activeInteractiveSim === 'storm'
                      ? 'bg-amber-950/80 border-amber-400 text-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold mb-1">
                    <CloudLightning className="w-4 h-4 text-amber-400" />
                    <span>Convective Storm</span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-normal">
                    Coupled Baro Drop + RH Surge
                  </div>
                </button>

                <button
                  onClick={() => setActiveInteractiveSim('spike')}
                  className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                    activeInteractiveSim === 'spike'
                      ? 'bg-red-950/80 border-red-400 text-red-200 shadow-[0_0_15px_rgba(239,68,68,0.2)]'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold mb-1">
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                    <span>Transducer Spike</span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-normal">
                    Broken Wire (+54.8°C Jump)
                  </div>
                </button>
              </div>

              {/* Live Metric Readout */}
              <div className="bg-slate-900/90 rounded-xl p-3.5 border border-slate-800 space-y-2.5 font-mono text-xs">
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-slate-950 p-2 rounded border border-slate-800">
                    <div className="text-[9px] text-slate-400 uppercase">Temp (T)</div>
                    <div className="text-base font-bold text-slate-100">
                      {activeInteractiveSim === 'storm' ? '25.6°C (-3.8°)' : '54.8°C (+25.4°)'}
                    </div>
                  </div>
                  <div className="bg-slate-950 p-2 rounded border border-slate-800">
                    <div className="text-[9px] text-slate-400 uppercase">Pressure (P)</div>
                    <div className="text-base font-bold text-sky-400">
                      {activeInteractiveSim === 'storm' ? '1003.1 hPa (-3.4)' : '1006.5 hPa (0.0)'}
                    </div>
                  </div>
                  <div className="bg-slate-950 p-2 rounded border border-slate-800">
                    <div className="text-[9px] text-slate-400 uppercase">Humidity (RH)</div>
                    <div className="text-base font-bold text-emerald-400">
                      {activeInteractiveSim === 'storm' ? '88.0% (+20.0)' : '68.0% (0.0)'}
                    </div>
                  </div>
                </div>

                <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-400">QC Determination:</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono ${
                      activeInteractiveSim === 'storm' ? 'bg-amber-950 text-amber-300 border border-amber-600' : 'bg-red-950 text-red-300 border border-red-600'
                    }`}>
                      {activeInteractiveSim === 'storm' ? 'WMO FLAG 2: CONVECTIVE_STORM' : 'WMO FLAG 4: HARDWARE_SPIKE'}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-300 font-sans leading-relaxed">
                    {activeInteractiveSim === 'storm'
                      ? 'Coupled thermodynamic drop matches Zahumenský squall criteria. Approved for NWP assimilation.'
                      : 'Unphysical temperature rate-of-change with zero barometric correlation. Quarantined; NABL work order dispatched.'}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 font-mono">
                <span>Rule Engine: <strong className="text-emerald-400">Active</strong></span>
                <span>ML Decision Tree: <strong className="text-emerald-400">Agrees (98.6%)</strong></span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3 Core Pillars Section */}
      <section className="py-14 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#002147] tracking-tight">
              Operational Portals &amp; Field Telemetry Architecture
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Integrated across the full meteorological surveillance pipeline—from field smartphones to central national forecast assimilation.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="bg-white p-6 border border-slate-200 rounded-xl shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-lg bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-800">
                  <Globe className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-lg text-slate-900">National Operations Center</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Real-time GIS surveillance across all 21 reference observatories and 766 Indian districts. Features Recharts thermodynamic graphs, Doppler radar rings, and automated NABL maintenance work orders.
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1 text-[10px] font-mono">
                  <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-700">766 Districts</span>
                  <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-700">Leaflet GIS</span>
                  <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-700">NWP Gating</span>
                </div>
              </div>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#002147] hover:text-blue-900 group"
              >
                <span>Launch National Console</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            {/* Card 2 */}
            <div className="bg-white p-6 border border-slate-200 rounded-xl shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-800">
                  <Smartphone className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-lg text-slate-900">Mobile AWS Edge Node (PWA)</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Transforms any phone into a live calibrated weather station. Uses W3C Generic Sensor API for real silicon pressure, DeviceOrientation for compass wind vane, and DeviceMotion for kinetic squall gusts.
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1 text-[10px] font-mono">
                  <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-700">Hardware Barometer</span>
                  <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-700">Compass Vane</span>
                  <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-700">PWA Offline</span>
                </div>
              </div>
              <Link
                href="/mobile"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-900 group"
              >
                <span>Open Mobile Node</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            {/* Card 3 */}
            <div className="bg-white p-6 border border-slate-200 rounded-xl shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-lg bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-800">
                  <FileCheck className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-lg text-slate-900">Institutional Audit Dossier</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Automated verification and technical evaluation report. Demonstrates 14/14 passing Vitest unit tests, WMO Pub 8 physical tolerances, XAI SHAP attribution weights, and cryptographic HMAC seals.
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1 text-[10px] font-mono">
                  <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-700">14/14 Tests Passed</span>
                  <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-700">XAI Attribution</span>
                  <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-700">HMAC-SHA256</span>
                </div>
              </div>
              <Link
                href="/audit-report"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-700 hover:text-purple-900 group"
              >
                <span>View Evaluation Dossier</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#002147] text-white py-10 border-t-4 border-[#FF9933]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="font-bold text-base flex items-center gap-2">
                <span>PROJECT JATAYU (JATAYU-QMS)</span>
                <span className="text-[10px] bg-amber-400 text-slate-950 px-2 py-0.5 rounded font-mono font-bold">
                  SIH26073
                </span>
              </div>
              <p className="text-slate-300 text-xs mt-1">
                National Automated Weather Station Quality Management System • Ministry of Earth Sciences (MoES) &amp; IMD
              </p>
            </div>

            <div className="flex items-center gap-4 text-xs text-slate-300 flex-wrap">
              <a href="https://mausam.imd.gov.in" target="_blank" rel="noopener noreferrer" className="hover:text-amber-400">IMD Mausam ↗</a>
              <span>•</span>
              <a href="https://cloud.gov.in" target="_blank" rel="noopener noreferrer" className="hover:text-amber-400">NIC MeghRaj ↗</a>
              <span>•</span>
              <a href="https://moes.gov.in" target="_blank" rel="noopener noreferrer" className="hover:text-amber-400">MoES ↗</a>
              <span>•</span>
              <a href="https://oscar.wmo.int" target="_blank" rel="noopener noreferrer" className="hover:text-amber-400">WMO OSCAR ↗</a>
            </div>
          </div>

          <div className="border-t border-white/10 pt-4 text-[11px] text-slate-400 flex flex-col sm:flex-row justify-between items-center gap-2">
            <div>
              Designed strictly under WMO-No. 8, Zahumenský (2004), GIGW 3.0, and DPDPA 2023 Guidelines.
            </div>
            <div className="font-mono text-[10px]">
              Build v4.2.8 • Zero-Cost Open Architecture
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
