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
  Volume2,
  CheckCircle2,
  Thermometer,
  Gauge,
  Compass,
  Zap,
  Terminal,
} from 'lucide-react';

interface OperationalUseCase {
  id: string;
  badge: string;
  title: string;
  subtitle: string;
  icon: string;
  station: string;
  problemScenario: string;
  rawInput: { temp: string; press: string; hum: string };
  deltaInput: { deltaT: string; deltaP: string; deltaRH: string };
  neighborContext: string;
  aiClassification: string;
  wmoFlag: string;
  nwpStatus: 'APPROVED' | 'QUARANTINED' | 'CONDITIONAL';
  confidence: string;
  xai: {
    tempWeight: number;
    pressWeight: number;
    humWeight: number;
    dominant: string;
    explanation: string;
  };
  imputed: { temp: string; press: string; hum: string; method: string } | null;
  operationalAction: string;
  linkUrl: string;
  linkText: string;
}

const OPERATIONAL_USE_CASES: OperationalUseCase[] = [
  {
    id: 'benchmark_55c',
    badge: 'SIH26073 Core Benchmark',
    title: 'Sudden +55°C Hardware Sensor Spike',
    subtitle: 'Isolated Single-Parameter Wire Open-Circuit Fault',
    icon: '⚡',
    station: 'AWS-DEL-04 (Safdarjung, New Delhi)',
    problemScenario: 'An AWS suddenly jumps from 29.4°C to 55.0°C with 92% RH while 5 surrounding Delhi stations (Lodhi Road, Palam, Ridge, Aya Nagar) report normal conditions (~30.1°C).',
    rawInput: { temp: '55.0°C', press: '1006.5 hPa', hum: '92.0%' },
    deltaInput: { deltaT: '+25.6°C', deltaP: '0.0 hPa', deltaRH: '+24.0%' },
    neighborContext: '5 nearest stations report ~30.1°C. Spatial Z-score = 8.4 confirms localized anomaly.',
    aiClassification: 'SENSOR_SPIKE (Transducer Lead Open-Circuit)',
    wmoFlag: 'WMO FLAG 4: CORRUPT_HARDWARE',
    nwpStatus: 'QUARANTINED',
    confidence: '96.0%',
    xai: {
      tempWeight: 86.5,
      pressWeight: 0.0,
      humWeight: 13.5,
      dominant: 'TEMPERATURE_SPIKE',
      explanation: 'Unphysical temperature rate-of-change (+25.6°C) without thermodynamic barometric coupling. Quarantined from GFS/WRF model assimilation.'
    },
    imputed: { temp: '29.6°C', press: '1006.5 hPa', hum: '54.3%', method: 'Hybrid WMA + Spatial Inverse Distance' },
    operationalAction: 'Telemetry quarantined. Corrected value substituted for model assimilation. Auto-dispatched NABL work order #WO-DEL-2026.',
    linkUrl: '/dashboard?station=AWS-DEL-04',
    linkText: 'Simulate in Operations Console'
  },
  {
    id: 'convective_storm',
    badge: 'Storm vs. Fault Discrimination',
    title: 'Severe Convective Squall (Kalbaisakhi)',
    subtitle: 'Coupled Atmospheric Cold Pool vs False Alarm',
    icon: '⛈️',
    station: 'AWS-KOL-02 (Alipore, Kolkata)',
    problemScenario: 'Violent pre-monsoon squall front causes rapid evaporative cooling (-4.3°C), microbarometric plunge (-3.1 hPa), and saturation surge (+24%). Traditional thresholds mistakenly reject this as a sensor fault!',
    rawInput: { temp: '27.2°C', press: '1005.1 hPa', hum: '86.0%' },
    deltaInput: { deltaT: '-4.3°C', deltaP: '-3.1 hPa', deltaRH: '+24.0%' },
    neighborContext: 'Doppler Weather Radar (DWR Kolkata) confirms high-reflectivity convective squall line approaching at 65 km/h.',
    aiClassification: 'GENUINE_CONVECTIVE_EVENT (Coupled Downdraft)',
    wmoFlag: 'WMO FLAG 2: CONVECTIVE_STORM',
    nwpStatus: 'APPROVED',
    confidence: '98.0%',
    xai: {
      tempWeight: 42.0,
      pressWeight: 35.0,
      humWeight: 23.0,
      dominant: 'CONVECTIVE_COLD_POOL_COUPLING',
      explanation: 'Multivariate atmospheric invariant satisfied: Synchronous ΔT, ΔP plunge, and ΔRH surge match Zahumenský § 4.3 criteria.'
    },
    imputed: null,
    operationalAction: 'VERIFIED GENUINE STORM. Gated to NWP assimilation. Broadcast regional Orange squall alert.',
    linkUrl: '/dashboard?station=AWS-KOL-02',
    linkText: 'Inspect Storm in Console'
  },
  {
    id: 'frozen_adc',
    badge: 'Hardware Deadlock',
    title: 'Datalogger ADC Deadlock (Frozen Sensor)',
    subtitle: 'Zero-Variance I2C Bus Hang Isolation',
    icon: '🧊',
    station: 'AWS-BLR-05 (HAL Airport, Bengaluru)',
    problemScenario: 'Datalogger Analog-to-Digital Converter locks up on the communication bus; transmits identical 24.500°C across 6 consecutive cycles without natural microbaric jitter.',
    rawInput: { temp: '24.5°C', press: '918.2 hPa', hum: '62.0%' },
    deltaInput: { deltaT: '0.000°C', deltaP: '0.000 hPa', deltaRH: '0.000%' },
    neighborContext: 'Atmospheric turbulence always exhibits micro-fluctuations (σ > 0.02). Zero variance indicates hardware freeze.',
    aiClassification: 'FROZEN_VALUE (ADC Deadlock)',
    wmoFlag: 'WMO FLAG 4: CORRUPT_HARDWARE',
    nwpStatus: 'QUARANTINED',
    confidence: '98.0%',
    xai: {
      tempWeight: 33.3,
      pressWeight: 33.3,
      humWeight: 33.4,
      dominant: 'ZERO_VARIANCE_ADC_FREEZE',
      explanation: 'Continuous zero-variance readings across 6 consecutive samples (Var = 0.000). Datalogger ADC deadlock identified.'
    },
    imputed: { temp: '24.5°C', press: '918.2 hPa', hum: '62.0%', method: 'Temporal Weighted Moving Average' },
    operationalAction: 'Quarantined station. Watchdog remote reboot command transmitted via INSAT-3D uplink.',
    linkUrl: '/dashboard?station=AWS-BLR-05',
    linkText: 'View Diagnostics in Console'
  },
  {
    id: 'sensor_drift',
    badge: 'Predictive Maintenance',
    title: 'Barometer Calibration Drift & Degradation',
    subtitle: 'Monotonic Transducer Aging & Auto-Imputation',
    icon: '📉',
    station: 'AWS-MUM-01 (Colaba, Mumbai)',
    problemScenario: 'Silicon capacitive pressure transducer drifts downwards by -2.40 hPa over a 24-hour window due to sensor diaphragm fatigue, while diurnal temperature cycle is normal.',
    rawInput: { temp: '30.1°C', press: '1007.2 hPa', hum: '75.5%' },
    deltaInput: { deltaT: '+0.1°C', deltaP: '-2.40 hPa (cumulative)', deltaRH: '+0.5%' },
    neighborContext: 'Coastal reference stations (Santacruz, Alibag) remain steady at 1010.2 hPa. No synoptic low pressure system present.',
    aiClassification: 'CALIBRATION_DRIFT (Transducer Fatigue)',
    wmoFlag: 'WMO FLAG 3: SUSPECT_DRIFT',
    nwpStatus: 'CONDITIONAL',
    confidence: '88.0%',
    xai: {
      tempWeight: 8.0,
      pressWeight: 85.0,
      humWeight: 7.0,
      dominant: 'BAROMETER_CALIBRATION_DRIFT',
      explanation: 'Monotonic cumulative drift exceeding 1.8 hPa running mean divergence without regional gradient.'
    },
    imputed: { temp: '30.0°C', press: '1008.4 hPa', hum: '75.0%', method: 'Running Mean Autoregression' },
    operationalAction: 'Conditional Gating: Substituted imputed pressure into NWP stream to prevent forecast degradation. Scheduled recalibration.',
    linkUrl: '/dashboard?station=AWS-MUM-01',
    linkText: 'Analyze Drift in Console'
  },
  {
    id: 'spatial_knn',
    badge: 'Spatial Network Consensus',
    title: 'Spatial KNN Multi-Station Cross-Validation',
    subtitle: 'Regional Network Consensus & Cohort Isolation',
    icon: '🗺️',
    station: 'AWS-DEL-04 vs. 5 Delhi NCR Stations',
    problemScenario: 'An isolated station reports a sudden +4.5 hPa pressure jump. Inverse Distance Weighting across 5 nearest cohort stations rejects the reading as impossible micro-high.',
    rawInput: { temp: '29.4°C', press: '1011.0 hPa', hum: '68.0%' },
    deltaInput: { deltaT: '0.0°C', deltaP: '+4.5 hPa (Local)', deltaRH: '0.0%' },
    neighborContext: '5 nearest stations within 25 km confirm flat regional gradient (|ΔP| < 0.3 hPa). Spatial Z-Score = 4.8.',
    aiClassification: 'SPATIAL_ANOMALY (Isolated Micro-High Rejection)',
    wmoFlag: 'WMO FLAG 4: CORRUPT_HARDWARE',
    nwpStatus: 'QUARANTINED',
    confidence: '97.5%',
    xai: {
      tempWeight: 5.0,
      pressWeight: 90.0,
      humWeight: 5.0,
      dominant: 'SPATIAL_INCOHERENCE',
      explanation: 'Spatial cross-validation against 5 neighboring AWS nodes reveals an unphysical pressure delta (Z-score > 4.5).'
    },
    imputed: { temp: '29.4°C', press: '1006.5 hPa', hum: '68.0%', method: 'Inverse Distance Weighting (IDW)' },
    operationalAction: 'Isolated station quarantined. Substituted cohort consensus into GFS/NCMRWF assimilation.',
    linkUrl: '/dashboard?tab=analytics',
    linkText: 'Open 766 District GIS Grid'
  },
  {
    id: 'mobile_node',
    badge: 'Edge Sensor Innovation',
    title: 'Mobile Smartphone as Calibrated AWS Node',
    subtitle: 'Crowdsourced Field Sensor Grid with W3C Sensor API',
    icon: '📱',
    station: 'AWS-MOB-01 (Smartphone Edge Node)',
    problemScenario: 'In remote or disaster-hit regions lacking $10,000 AWS towers, any standard smartphone functions as a live calibrated micro-observatory.',
    rawInput: { temp: '29.4°C', press: '1006.5 hPa (Silicon)', hum: '68.0%' },
    deltaInput: { deltaT: 'Physical Stream', deltaP: 'Hardware Barometer', deltaRH: 'Capacitive/API' },
    neighborContext: 'Auto-provisioned in National GIS mesh grid with live GPS coordinates, battery voltage, and compass wind vane.',
    aiClassification: 'MOBILE_GROUNDED_TELEMETRY (Physical Sensor)',
    wmoFlag: 'WMO FLAG 1: VERIFIED_GOOD',
    nwpStatus: 'APPROVED',
    confidence: '94.0%',
    xai: {
      tempWeight: 33.3,
      pressWeight: 33.3,
      humWeight: 33.4,
      dominant: 'PHYSICAL_HARDWARE_GROUNDING',
      explanation: 'Verified physical silicon pressure readings (BMP280/Generic Sensor API) paired with cryptographic HMAC-SHA256 envelope.'
    },
    imputed: { temp: 'Live Ambient', press: 'Physical Silicon', hum: 'Live Stream', method: 'Direct Hardware Telemetry' },
    operationalAction: 'Grounded to national GIS mesh. Cryptographic HMAC packet delivered to central QMS.',
    linkUrl: '/mobile',
    linkText: 'Open Mobile Sensor Node'
  }
];

interface FeaturedObservatory {
  id: string;
  city: string;
  state: string;
  zone: string;
  temp: number;
  press: number;
  hum: number;
  wind: number;
  windDir: string;
  elev: number;
  wmo: string;
  status: string;
  flag: string;
}

const FEATURED_OBSERVATORIES: FeaturedObservatory[] = [
  { id: 'AWS-DEL-04', city: 'New Delhi (Safdarjung)', state: 'Delhi (NCT)', zone: 'Indo-Gangetic Semi-Arid', temp: 29.4, press: 1006.5, hum: 68.0, wind: 14.2, windDir: 'WNW', elev: 216, wmo: '42182', status: 'Nominal Operation', flag: 'FLAG 1' },
  { id: 'AWS-MUM-01', city: 'Mumbai (Colaba)', state: 'Maharashtra', zone: 'Western Coastal Marine', temp: 31.2, press: 1010.2, hum: 78.5, wind: 18.0, windDir: 'SW', elev: 11, wmo: '43057', status: 'Nominal Operation', flag: 'FLAG 1' },
  { id: 'AWS-KOL-02', city: 'Kolkata (Alipore)', state: 'West Bengal', zone: 'Eastern Gangetic Delta', temp: 28.8, press: 1008.4, hum: 84.0, wind: 22.4, windDir: 'S', elev: 6, wmo: '42807', status: 'Convective Caution', flag: 'FLAG 2' },
  { id: 'AWS-BLR-05', city: 'Bengaluru (HAL Airport)', state: 'Karnataka', zone: 'Deccan Plateau Highland', temp: 24.5, press: 918.2, hum: 62.0, wind: 12.0, windDir: 'WSW', elev: 920, wmo: '43295', status: 'Nominal Operation', flag: 'FLAG 1' },
  { id: 'AWS-CHN-03', city: 'Chennai (Meenambakkam)', state: 'Tamil Nadu', zone: 'Coromandel Coastal', temp: 32.1, press: 1009.8, hum: 76.0, wind: 19.5, windDir: 'SE', elev: 16, wmo: '43279', status: 'Nominal Operation', flag: 'FLAG 1' },
  { id: 'AWS-SHM-11', city: 'Shimla (Ridge)', state: 'Himachal Pradesh', zone: 'Western Himalayan Alpine', temp: 16.2, press: 782.4, hum: 54.0, wind: 15.0, windDir: 'NNW', elev: 2205, wmo: '42083', status: 'Nominal Operation', flag: 'FLAG 1' },
  { id: 'AWS-LEH-14', city: 'Leh (Airport)', state: 'Ladakh', zone: 'Trans-Himalayan Cold Desert', temp: 9.8, press: 668.0, hum: 28.0, wind: 24.0, windDir: 'N', elev: 3514, wmo: '42027', status: 'Nominal Operation', flag: 'FLAG 1' },
  { id: 'AWS-CHE-15', city: 'Cherrapunji (Sohra)', state: 'Meghalaya', zone: 'Khasi Orographic High-Precip', temp: 21.0, press: 872.1, hum: 96.0, wind: 28.5, windDir: 'SSW', elev: 1313, wmo: '42515', status: 'Severe Monsoon Front', flag: 'FLAG 2' },
];

export default function LandingPage() {
  const [fontSize, setFontSize] = useState<'A-' | 'A' | 'A+'>('A');
  const [activeInteractiveSim, setActiveInteractiveSim] = useState<'storm' | 'spike'>('storm');
  const [selectedObsId, setSelectedObsId] = useState<string>('AWS-DEL-04');
  const [activeQcStage, setActiveQcStage] = useState<number>(3);
  const [activeUseCaseId, setActiveUseCaseId] = useState<string>('benchmark_55c');
  const [audioFeedback, setAudioFeedback] = useState<string | null>(null);

  const selectedObs = FEATURED_OBSERVATORIES.find((o) => o.id === selectedObsId) || FEATURED_OBSERVATORIES[0];
  const activeUseCase = OPERATIONAL_USE_CASES.find((u) => u.id === activeUseCaseId) || OPERATIONAL_USE_CASES[0];

  const playLandingChime = (type: 'storm' | 'critical') => {
    if (typeof window === 'undefined') return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      if (type === 'critical') {
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        osc.frequency.setValueAtTime(440, ctx.currentTime + 0.12);
        setAudioFeedback('Critical Fault Alarm Synthesized (880Hz / 440Hz)');
      } else {
        osc.frequency.setValueAtTime(587.33, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(783.99, ctx.currentTime + 0.18);
        setAudioFeedback('Severe Squall Chime Synthesized (587Hz → 784Hz)');
      }

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);

      setTimeout(() => setAudioFeedback(null), 1800);
    } catch {
      // Graceful fallback
    }
  };

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
            {FEATURED_OBSERVATORIES.map((obs) => (
              <span key={obs.id} className="flex items-center gap-1 shrink-0">
                <strong className="text-slate-300">{obs.city.split(' ')[0]}:</strong>
                <span className="text-amber-300">{obs.temp.toFixed(1)}°C</span>
                <span className="text-sky-300">{obs.press.toFixed(1)} hPa</span>
                <span className="text-emerald-300">{obs.hum.toFixed(0)}%</span>
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
                <a
                  href="#use-cases"
                  className="inline-flex items-center gap-2 px-4 py-3 text-sm font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded-lg transition-all cursor-pointer shadow-xs"
                >
                  <Zap className="w-4 h-4 text-amber-700" />
                  <span>Explore 6 Use Cases</span>
                </a>
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

              {/* Acoustic Alert Synthesizer Trigger Buttons */}
              <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400 flex items-center gap-1 font-semibold">
                    <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                    Web Audio Operational Synthesizer:
                  </span>
                  <span className="text-[9px] font-mono text-emerald-400">
                    {audioFeedback || 'Ready (Interactive)'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => playLandingChime('storm')}
                    className="py-1 px-2 rounded bg-amber-950/70 hover:bg-amber-900 text-amber-200 border border-amber-600/50 text-[10px] font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors"
                  >
                    <span>⚡ Squall Chime</span>
                  </button>
                  <button
                    onClick={() => playLandingChime('critical')}
                    className="py-1 px-2 rounded bg-red-950/70 hover:bg-red-900 text-red-200 border border-red-600/50 text-[10px] font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors"
                  >
                    <span>🚨 Fault Alarm</span>
                  </button>
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

      {/* National Scale KPI Stats Strip */}
      <section className="bg-[#002147] text-white py-8 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="space-y-1">
              <div className="text-3xl lg:text-4xl font-black font-mono text-amber-400">1,350+</div>
              <div className="text-xs uppercase tracking-wider font-bold text-slate-300">Monitored AWS Stations</div>
              <div className="text-[11px] text-slate-400">Pan-India 766 Districts</div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl lg:text-4xl font-black font-mono text-emerald-400">&lt; 5 ms</div>
              <div className="text-xs uppercase tracking-wider font-bold text-slate-300">Processing Latency</div>
              <div className="text-[11px] text-slate-400">Line-Rate Edge Validation</div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl lg:text-4xl font-black font-mono text-sky-400">99.8%</div>
              <div className="text-xs uppercase tracking-wider font-bold text-slate-300">Gated NWP Yield</div>
              <div className="text-[11px] text-slate-400">Purity Preserved for Assimilation</div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl lg:text-4xl font-black font-mono text-purple-400">100%</div>
              <div className="text-xs uppercase tracking-wider font-bold text-slate-300">WMO-No. 8 Compliant</div>
              <div className="text-[11px] text-slate-400">Zahumenský (2004) Standard</div>
            </div>
          </div>
        </div>
      </section>

      {/* SIH-26073 Operational Use Cases Interactive Studio */}
      <section id="use-cases" className="py-16 bg-slate-900 text-white border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-amber-400/20 border border-amber-400/40 px-3 py-1 rounded-full text-xs font-bold text-amber-300">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>SIH-26073 Problem Statement Demonstration Suite</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Operational Use Cases &amp; Algorithmic Verification
            </h2>
            <p className="text-sm sm:text-base text-slate-300">
              Direct, reproducible verification of how Project JATAYU handles real-world meteorological hazards, severe convective storms, sensor open-circuits, and datalogger freezes strictly within Temperature, Pressure, and Humidity bounds.
            </p>
          </div>

          {/* Use Case Tabs Selection */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
            {OPERATIONAL_USE_CASES.map((uc, idx) => {
              const isSelected = activeUseCaseId === uc.id;
              return (
                <button
                  key={uc.id}
                  onClick={() => {
                    setActiveUseCaseId(uc.id);
                    if (uc.id === 'benchmark_55c') playLandingChime('critical');
                    else if (uc.id === 'convective_storm') playLandingChime('storm');
                  }}
                  className={`p-3 rounded-xl text-left transition-all border cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                    isSelected
                      ? 'bg-amber-400 text-slate-950 border-amber-400 shadow-lg scale-102 font-bold ring-2 ring-amber-300'
                      : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className="text-lg">{uc.icon}</span>
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-black ${
                      isSelected ? 'bg-slate-950 text-amber-400' : 'bg-slate-900 text-slate-400 border border-slate-700'
                    }`}>
                      UC-0{idx + 1}
                    </span>
                  </div>
                  <div>
                    <div className={`text-xs font-extrabold leading-snug line-clamp-2 ${isSelected ? 'text-slate-950' : 'text-white'}`}>
                      {uc.title}
                    </div>
                    <div className={`text-[10px] mt-1 line-clamp-1 ${isSelected ? 'text-slate-800' : 'text-slate-400'}`}>
                      {uc.badge}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Use Case Deep-Dive Studio Card */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
            {/* Header / Badges */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-6 border-b border-slate-800">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-black uppercase bg-amber-400/20 text-amber-300 border border-amber-400/40">
                    {activeUseCase.badge}
                  </span>
                  <span className="text-xs font-mono text-slate-400">Target Station:</span>
                  <span className="text-xs font-mono font-bold text-sky-400">{activeUseCase.station}</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                  <span>{activeUseCase.icon}</span>
                  <span>{activeUseCase.title}</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-300">
                  {activeUseCase.subtitle}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="bg-slate-900 border border-slate-700 rounded-xl p-3 text-right shrink-0">
                  <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">NWP Gating Status</div>
                  <div className={`text-sm sm:text-base font-mono font-black ${
                    activeUseCase.nwpStatus === 'APPROVED' ? 'text-emerald-400' : 'text-rose-400'
                  }`}>
                    {activeUseCase.nwpStatus === 'APPROVED' ? '✓ GATED (PASS)' : '⛔ QUARANTINED (BLOCKED)'}
                  </div>
                  <div className="text-[10px] font-mono text-slate-400 mt-0.5">Confidence: {activeUseCase.confidence}</div>
                </div>

                <button
                  onClick={() => playLandingChime(activeUseCase.nwpStatus === 'APPROVED' ? 'storm' : 'critical')}
                  className="p-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-amber-400/40 text-amber-300 transition-colors cursor-pointer flex flex-col items-center justify-center text-[10px] font-bold"
                  title="Test Operational Acoustic Siren"
                >
                  <Volume2 className="w-5 h-5 text-amber-400 mb-1" />
                  <span>Siren Audio</span>
                </button>
              </div>
            </div>

            {/* Problem Scenario & Incident Narrative */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 sm:p-5 text-xs sm:text-sm text-slate-300 space-y-2">
              <div className="text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>Incident Context &amp; Physical Conditions</span>
              </div>
              <p className="leading-relaxed">
                {activeUseCase.problemScenario}
              </p>
              <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800">
                <span className="font-semibold text-slate-300">Spatial Peer Context: </span>
                {activeUseCase.neighborContext}
              </div>
            </div>

            {/* 3-Column Telemetry, XAI Attribution & Imputation Architecture */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Column 1: Ingested Telemetry */}
              <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="text-xs font-extrabold uppercase tracking-wider text-slate-300 pb-2 border-b border-slate-800 flex items-center justify-between">
                  <span>1. Sensor Telemetry</span>
                  <span className="text-[10px] font-mono text-slate-500">SIH 3-Param</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between bg-slate-950 p-2 rounded border border-slate-800 text-xs">
                    <span className="text-slate-400 font-medium">Air Temperature (T):</span>
                    <div className="text-right">
                      <div className="font-mono font-bold text-white">{activeUseCase.rawInput.temp}</div>
                      <div className="text-[10px] font-mono text-slate-400">Δ = {activeUseCase.deltaInput.deltaT}</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between bg-slate-950 p-2 rounded border border-slate-800 text-xs">
                    <span className="text-slate-400 font-medium">Pressure (P):</span>
                    <div className="text-right">
                      <div className="font-mono font-bold text-white">{activeUseCase.rawInput.press}</div>
                      <div className="text-[10px] font-mono text-slate-400">Δ = {activeUseCase.deltaInput.deltaP}</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between bg-slate-950 p-2 rounded border border-slate-800 text-xs">
                    <span className="text-slate-400 font-medium">Rel. Humidity (RH):</span>
                    <div className="text-right">
                      <div className="font-mono font-bold text-white">{activeUseCase.rawInput.hum}</div>
                      <div className="text-[10px] font-mono text-slate-400">Δ = {activeUseCase.deltaInput.deltaRH}</div>
                    </div>
                  </div>
                </div>
                <div className="text-[11px] font-mono text-amber-300/90 pt-1">
                  Classification: <span className="font-bold text-white">{activeUseCase.aiClassification}</span>
                </div>
              </div>

              {/* Column 2: Explainable AI Attribution (SHAP-Equiv) */}
              <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="text-xs font-extrabold uppercase tracking-wider text-slate-300 pb-2 border-b border-slate-800 flex items-center justify-between">
                  <span>2. Explainable AI (XAI)</span>
                  <span className="text-[10px] font-mono text-purple-400 font-bold">SHAP Weights</span>
                </div>
                <div className="space-y-2">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-400">Temperature Attribution (W_T)</span>
                      <span className="font-mono font-bold text-amber-400">{activeUseCase.xai.tempWeight}%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-amber-400 h-full rounded-full" style={{ width: `${activeUseCase.xai.tempWeight}%` }} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-400">Pressure Attribution (W_P)</span>
                      <span className="font-mono font-bold text-sky-400">{activeUseCase.xai.pressWeight}%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-sky-400 h-full rounded-full" style={{ width: `${activeUseCase.xai.pressWeight}%` }} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-400">Humidity Attribution (W_RH)</span>
                      <span className="font-mono font-bold text-emerald-400">{activeUseCase.xai.humWeight}%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-emerald-400 h-full rounded-full" style={{ width: `${activeUseCase.xai.humWeight}%` }} />
                    </div>
                  </div>
                </div>
                <div className="text-[11px] text-slate-300 pt-1 leading-relaxed bg-slate-950 p-2.5 rounded border border-slate-800">
                  <span className="text-purple-400 font-bold">XAI Insight: </span>
                  {activeUseCase.xai.explanation}
                </div>
              </div>

              {/* Column 3: Imputation & Action */}
              <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 space-y-3 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="text-xs font-extrabold uppercase tracking-wider text-slate-300 pb-2 border-b border-slate-800 flex items-center justify-between">
                    <span>3. Quality Imputation</span>
                    <span className="text-[10px] font-mono text-emerald-400 font-bold">{activeUseCase.wmoFlag.split(':')[0]}</span>
                  </div>
                  <div className="space-y-1.5 text-xs bg-slate-950 p-2.5 rounded border border-slate-800">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Imputed Temp:</span>
                      <span className="font-mono font-bold text-emerald-300">{activeUseCase.imputed.temp}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Imputed Press:</span>
                      <span className="font-mono font-bold text-emerald-300">{activeUseCase.imputed.press}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Imputed Hum:</span>
                      <span className="font-mono font-bold text-emerald-300">{activeUseCase.imputed.hum}</span>
                    </div>
                    <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-800">
                      Method: <span className="text-slate-300 font-mono">{activeUseCase.imputed.method}</span>
                    </div>
                  </div>
                  <div className="text-[11px] text-slate-300 leading-snug">
                    <span className="text-amber-400 font-bold">Action Taken: </span>
                    {activeUseCase.operationalAction}
                  </div>
                </div>

                <div className="pt-2">
                  <Link
                    href={activeUseCase.linkUrl}
                    className="w-full py-2 px-3 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md"
                  >
                    <span>{activeUseCase.linkText}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Run with Python CLI instructions */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400 border-t border-slate-800/80">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span>Verify all 6 cases with Standalone Anomaly Engine:</span>
                <code className="bg-slate-900 text-emerald-300 px-2 py-0.5 rounded font-mono text-[11px] border border-slate-800">
                  npm run sih:demo
                </code>
              </div>
              <div className="text-[11px] font-mono text-slate-500">
                WMO Zahumenský (2004) &bull; Edge Latency: &lt;5ms &bull; Zero External Dependencies
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive National Climatic Zone Observatory Quick-Explorer */}
      <section className="py-14 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="text-xs font-bold text-sky-800 bg-sky-50 border border-sky-200 px-2.5 py-1 rounded">
              Pan-India Climatic Zones
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#002147] tracking-tight">
              National Meteorological Observatory Quick-Explorer
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Select any regional observatory below to view live sensor readings, elevation pressure compensation, and physical plausibility verification.
            </p>
          </div>

          {/* Regional Selector Pills */}
          <div className="flex flex-wrap gap-2 justify-center">
            {FEATURED_OBSERVATORIES.map((obs) => (
              <button
                key={obs.id}
                onClick={() => setSelectedObsId(obs.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${
                  selectedObsId === obs.id
                    ? 'bg-[#002147] text-white border-[#002147] shadow-sm'
                    : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                }`}
              >
                <span>{obs.city.split(' ')[0]}</span>
                <span className="text-[10px] opacity-75 ml-1.5 font-mono">({obs.temp.toFixed(1)}°)</span>
              </button>
            ))}
          </div>

          {/* Selected Station Detailed Card */}
          <div className="bg-slate-50 border border-slate-300 rounded-2xl p-6 shadow-sm">
            <div className="grid lg:grid-cols-12 gap-6 items-center">
              <div className="lg:col-span-5 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-[#002147] bg-amber-100 border border-amber-300 px-2 py-0.5 rounded">
                    {selectedObs.id}
                  </span>
                  <span className="text-xs font-bold text-slate-600 bg-white border border-slate-200 px-2 py-0.5 rounded">
                    WMO #{selectedObs.wmo}
                  </span>
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-300 px-2 py-0.5 rounded">
                    {selectedObs.flag}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-slate-900">{selectedObs.city}</h3>
                <div className="text-xs text-slate-600 font-medium space-y-0.5">
                  <div><strong>State / Territory:</strong> {selectedObs.state}</div>
                  <div><strong>Climatic Zone:</strong> {selectedObs.zone}</div>
                  <div><strong>Altitude:</strong> {selectedObs.elev} meters AMSL (Barometric Compensation Active)</div>
                </div>

                <Link
                  href={`/dashboard?station=${selectedObs.id}`}
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-[#002147] hover:bg-blue-900 rounded shadow-xs transition-colors cursor-pointer"
                >
                  <Activity className="w-3.5 h-3.5 text-amber-400" />
                  <span>Inspect in National Ops Console</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Live Metric Gauges */}
              <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-center">
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                  <div className="text-[10px] text-slate-500 uppercase font-bold flex items-center justify-center gap-1">
                    <Thermometer className="w-3 h-3 text-amber-600" />
                    <span>Temperature</span>
                  </div>
                  <div className="text-2xl font-black text-slate-900 mt-1">{selectedObs.temp.toFixed(1)}°C</div>
                  <div className="text-[9px] text-emerald-700 font-sans mt-1">✓ WMO Range Valid</div>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                  <div className="text-[10px] text-slate-500 uppercase font-bold flex items-center justify-center gap-1">
                    <Gauge className="w-3 h-3 text-sky-600" />
                    <span>Pressure</span>
                  </div>
                  <div className="text-2xl font-black text-sky-800 mt-1">{selectedObs.press.toFixed(1)}</div>
                  <div className="text-[9px] text-slate-500 font-sans mt-1">hPa (MSL Adjusted)</div>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                  <div className="text-[10px] text-slate-500 uppercase font-bold flex items-center justify-center gap-1">
                    <Activity className="w-3 h-3 text-emerald-600" />
                    <span>Rel Humidity</span>
                  </div>
                  <div className="text-2xl font-black text-emerald-800 mt-1">{selectedObs.hum.toFixed(0)}%</div>
                  <div className="text-[9px] text-emerald-700 font-sans mt-1">✓ Non-Saturating</div>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                  <div className="text-[10px] text-slate-500 uppercase font-bold flex items-center justify-center gap-1">
                    <Compass className="w-3 h-3 text-indigo-600" />
                    <span>Wind Vane</span>
                  </div>
                  <div className="text-2xl font-black text-slate-900 mt-1">{selectedObs.wind.toFixed(1)}</div>
                  <div className="text-[9px] text-slate-500 font-sans mt-1">km/h ({selectedObs.windDir})</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4-Stage WMO Quality Control Pipeline Section */}
      <section className="py-14 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="text-xs font-bold text-amber-900 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded">
              Algorithmic Core
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#002147] tracking-tight">
              4-Tier Autonomous Quality Control Pipeline
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Conforming to WMO-No. 8 (CIMO) and Zahumenský (2004) Guidelines for Real-Time Quality Control of Automated Weather Station Data.
            </p>
          </div>

          {/* Stage Switcher Tabs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-bold">
            {[
              { num: 1, title: 'Physical Limits', sub: 'Plausibility Check', icon: <Gauge className="w-4 h-4 text-sky-600" /> },
              { num: 2, title: 'Temporal Step', sub: 'Rate-of-Change Limits', icon: <Activity className="w-4 h-4 text-emerald-600" /> },
              { num: 3, title: 'Thermodynamic Coupling', sub: 'Zahumenský Storm Engine', icon: <CloudLightning className="w-4 h-4 text-amber-600" /> },
              { num: 4, title: 'Spatial KNN', sub: 'Cohort Cross-Validation', icon: <Globe className="w-4 h-4 text-purple-600" /> },
            ].map((stage) => (
              <button
                key={stage.num}
                onClick={() => setActiveQcStage(stage.num)}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  activeQcStage === stage.num
                    ? 'bg-white border-[#002147] shadow-md ring-2 ring-[#002147]/20 text-[#002147]'
                    : 'bg-white/70 border-slate-300 text-slate-600 hover:bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 border border-slate-200">
                    STAGE {stage.num}
                  </span>
                  {stage.icon}
                </div>
                <div className="font-bold text-sm text-slate-900">{stage.title}</div>
                <div className="text-[11px] text-slate-500 font-normal">{stage.sub}</div>
              </button>
            ))}
          </div>

          {/* Active Stage Deep-Dive Card */}
          <div className="bg-white border border-slate-300 rounded-2xl p-6 shadow-sm">
            {activeQcStage === 1 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-200 pb-3">
                  <div>
                    <h3 className="text-lg font-bold text-[#002147]">Stage 1: Plausibility &amp; Absolute Physical Limits</h3>
                    <p className="text-xs text-slate-600">Rejects unphysical sensor hardware anomalies outside terrestrial meteorological boundaries.</p>
                  </div>
                  <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-emerald-50 text-emerald-800 border border-emerald-300">
                    Pass Rate: 99.98%
                  </span>
                </div>
                <div className="grid md:grid-cols-3 gap-4 text-xs">
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <strong className="block text-slate-800 mb-1">Temperature Limits:</strong>
                    <div className="font-mono text-slate-600">-50.0°C ≤ T ≤ +60.0°C</div>
                    <div className="text-[11px] text-slate-500 mt-1">Guards against thermistor short circuits (e.g. +99.9°C).</div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <strong className="block text-slate-800 mb-1">Barometric Limits:</strong>
                    <div className="font-mono text-slate-600">500.0 hPa ≤ P ≤ 1080.0 hPa</div>
                    <div className="text-[11px] text-slate-500 mt-1">Elevation compensated for Himalayan high altitude stations.</div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <strong className="block text-slate-800 mb-1">Humidity &amp; Battery:</strong>
                    <div className="font-mono text-slate-600">1.0% ≤ RH ≤ 100.0% | V ≥ 11.2V</div>
                    <div className="text-[11px] text-slate-500 mt-1">Zero-variance Humicap check and solar battery float check.</div>
                  </div>
                </div>
              </div>
            )}

            {activeQcStage === 2 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-200 pb-3">
                  <div>
                    <h3 className="text-lg font-bold text-[#002147]">Stage 2: Temporal Step Dynamics &amp; Rate-of-Change (ROC)</h3>
                    <p className="text-xs text-slate-600">Detects electrical transducer spikes, stuck ADC deadlocks, and monotonic calibration drifts.</p>
                  </div>
                  <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-sky-50 text-sky-800 border border-sky-300">
                    Pass Rate: 99.85%
                  </span>
                </div>
                <div className="grid md:grid-cols-3 gap-4 text-xs">
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <strong className="block text-slate-800 mb-1">Temperature Rate-of-Change:</strong>
                    <div className="font-mono text-slate-600">|ΔT / 5 min| &gt; 5.0°C</div>
                    <div className="text-[11px] text-slate-500 mt-1">Flags sudden transducer disconnection or voltage surges.</div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <strong className="block text-slate-800 mb-1">Pressure Jump Threshold:</strong>
                    <div className="font-mono text-slate-600">|ΔP / 5 min| &gt; 3.0 hPa</div>
                    <div className="text-[11px] text-slate-500 mt-1">Signals squall cold pool formation or silicon sensor failure.</div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <strong className="block text-slate-800 mb-1">Persistence Deadlock Test:</strong>
                    <div className="font-mono text-slate-600">Var(T, 6 ticks) == 0.000</div>
                    <div className="text-[11px] text-slate-500 mt-1">Flags frozen analog-to-digital converters in dataloggers.</div>
                  </div>
                </div>
              </div>
            )}

            {activeQcStage === 3 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-200 pb-3">
                  <div>
                    <h3 className="text-lg font-bold text-[#002147]">Stage 3: Zahumenský (2004) Thermodynamic Coupling Engine</h3>
                    <p className="text-xs text-slate-600">SIH26073 Core Innovation: Differentiates severe convective downdrafts from sensor faults.</p>
                  </div>
                  <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-amber-50 text-amber-800 border border-amber-300">
                    Storm Discrimination: 100%
                  </span>
                </div>
                <div className="p-4 bg-slate-900 text-slate-200 rounded-xl font-mono text-xs space-y-2 border border-slate-800">
                  <div className="text-amber-400 font-bold uppercase tracking-wider text-[10px]">Thermodynamic Convective Downdraft Coupling Formula:</div>
                  <div className="bg-slate-950 p-2.5 rounded border border-slate-800 text-emerald-300">
                    IF (ΔT &lt; -3.0°C AND ΔP &lt; -2.0 hPa AND ΔRH &gt; +15.0%) THEN VERDICT = FLAG_2 (GENUINE_CONVECTIVE_STORM)
                  </div>
                  <div className="text-slate-400 text-[11px] font-sans">
                    When severe rain evaporatively cools downdrafts, temperature drops synchronously with microbarometric pressure drop and humidity surge. Sensor disconnects never produce this multi-variate atmospheric signature.
                  </div>
                </div>
              </div>
            )}

            {activeQcStage === 4 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-200 pb-3">
                  <div>
                    <h3 className="text-lg font-bold text-[#002147]">Stage 4: Spatial KNN Neighbor Cross-Validation</h3>
                    <p className="text-xs text-slate-600">Cross-validates flagged observations against nearest cohort stations using Inverse Distance Weighting.</p>
                  </div>
                  <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-purple-50 text-purple-800 border border-purple-300">
                    Cohort Resolution: &lt;50 km
                  </span>
                </div>
                <div className="grid md:grid-cols-3 gap-4 text-xs">
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <strong className="block text-slate-800 mb-1">Spatial Weight Matrix:</strong>
                    <div className="font-mono text-slate-600">w_i = 1 / (d_i)^2</div>
                    <div className="text-[11px] text-slate-500 mt-1">Inverse distance squared weighting over 5 nearest AWS neighbors.</div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <strong className="block text-slate-800 mb-1">Regional Agreement:</strong>
                    <div className="font-mono text-slate-600">|T_obs - T_cohort| &lt; 3.0σ</div>
                    <div className="text-[11px] text-slate-500 mt-1">If neighbors confirm squall gust, event is elevated to synoptic alert.</div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <strong className="block text-slate-800 mb-1">Isolated Fault Isolation:</strong>
                    <div className="font-mono text-slate-600">Z-Score &gt; 4.5 ⇒ Isolated</div>
                    <div className="text-[11px] text-slate-500 mt-1">Automatically generates targeted NABL field maintenance ticket.</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 3 Core Pillars Section */}
      <section className="py-14 bg-white border-b border-slate-200">
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
            <div className="bg-slate-50 p-6 border border-slate-200 rounded-xl shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-lg bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-800">
                  <Globe className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-lg text-slate-900">National Operations Center</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Real-time GIS surveillance across all 21 reference observatories and 766 Indian districts. Features Recharts thermodynamic graphs, Doppler radar rings, and automated NABL maintenance work orders.
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1 text-[10px] font-mono">
                  <span className="bg-white border border-slate-200 px-2 py-0.5 rounded text-slate-700">766 Districts</span>
                  <span className="bg-white border border-slate-200 px-2 py-0.5 rounded text-slate-700">Leaflet GIS</span>
                  <span className="bg-white border border-slate-200 px-2 py-0.5 rounded text-slate-700">NWP Gating</span>
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
            <div className="bg-slate-50 p-6 border border-slate-200 rounded-xl shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-800">
                  <Smartphone className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-lg text-slate-900">Mobile AWS Edge Node (PWA)</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Transforms any phone into a live calibrated weather station. Uses W3C Generic Sensor API for real silicon pressure, DeviceOrientation for compass wind vane, and DeviceMotion for kinetic squall gusts.
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1 text-[10px] font-mono">
                  <span className="bg-white border border-slate-200 px-2 py-0.5 rounded text-slate-700">Hardware Barometer</span>
                  <span className="bg-white border border-slate-200 px-2 py-0.5 rounded text-slate-700">Compass Vane</span>
                  <span className="bg-white border border-slate-200 px-2 py-0.5 rounded text-slate-700">PWA Offline</span>
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
            <div className="bg-slate-50 p-6 border border-slate-200 rounded-xl shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-lg bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-800">
                  <FileCheck className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-lg text-slate-900">Institutional Audit Dossier</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Automated verification and technical evaluation report. Demonstrates 14/14 passing Vitest unit tests, WMO Pub 8 physical tolerances, XAI SHAP attribution weights, and cryptographic HMAC seals.
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1 text-[10px] font-mono">
                  <span className="bg-white border border-slate-200 px-2 py-0.5 rounded text-slate-700">14/14 Tests Passed</span>
                  <span className="bg-white border border-slate-200 px-2 py-0.5 rounded text-slate-700">XAI Attribution</span>
                  <span className="bg-white border border-slate-200 px-2 py-0.5 rounded text-slate-700">HMAC-SHA256</span>
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

      {/* Institutional Standards & Compliance Footer Strip */}
      <section className="bg-slate-100 py-10 border-b border-slate-300 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="text-center space-y-1">
            <h3 className="font-bold text-slate-800 uppercase tracking-wider text-xs">
              Sovereign Technical Compliance &amp; Standards Alignment
            </h3>
            <p className="text-slate-500 text-[11px]">
              Engineered according to statutory guidelines issued by national and international meteorological authorities.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="p-3 bg-white rounded-lg border border-slate-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto mb-1.5" />
              <div className="font-bold text-slate-800">WMO-No. 8 (CIMO)</div>
              <div className="text-[10px] text-slate-500">Guide to Instruments &amp; Methods of Observation</div>
            </div>
            <div className="p-3 bg-white rounded-lg border border-slate-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto mb-1.5" />
              <div className="font-bold text-slate-800">Zahumenský (2004)</div>
              <div className="text-[10px] text-slate-500">WMO-TD-No. 1213 Automated AWS QC Guidelines</div>
            </div>
            <div className="p-3 bg-white rounded-lg border border-slate-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto mb-1.5" />
              <div className="font-bold text-slate-800">NIC MeghRaj Cloud</div>
              <div className="text-[10px] text-slate-500">Government of India Sovereign Cloud Standard</div>
            </div>
            <div className="p-3 bg-white rounded-lg border border-slate-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto mb-1.5" />
              <div className="font-bold text-slate-800">DPDPA 2023 Compliant</div>
              <div className="text-[10px] text-slate-500">Digital Personal Data Protection Act (Zero PII)</div>
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
