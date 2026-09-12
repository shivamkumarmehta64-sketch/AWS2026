'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, CloudLightning, ShieldCheck, Activity, Smartphone, BellRing, Wrench } from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';

// Statically import lightweight components
import { GovNetworkStrip } from '@/components/GovNetworkStrip';
import { GovObservationConsole } from '@/components/GovObservationConsole';
import { GovEmergencyAlertModal } from '@/components/GovEmergencyAlertModal';
import { GovPredictiveMaintenancePanel } from '@/components/GovPredictiveMaintenancePanel';

// Dynamically import heavy map components to prevent SSR issues
const DynamicGovNetworkMap = dynamic(() => import('@/components/GovNetworkMap').then(mod => mod.GovNetworkMap), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[400px] flex items-center justify-center bg-slate-900 text-sky-400">
      Loading Live GIS Map...
    </div>
  )
});

const mockStation = {
  stationId: 'AWS-DEL-04',
  name: 'New Delhi (Safdarjung)',
  hindiName: 'नई दिल्ली (सफदरजंग)',
  latitude: 28.58,
  longitude: 77.20,
  elevation: 216,
  hardwareType: 'SUTRON-9210',
  firmwareVersion: 'v4.1.2',
  lastCalibration: '2025-11-12',
  baseline: {
    tempMean: 30.1,
    pressureMean: 1006.5,
    humidityMean: 68.0
  },
  sensorMetadata: {
    telemetryUplink: 'INSAT-3D DRT',
    powerSource: 'Solar 50W',
    batteryVoltage: '12.4V'
  }
};

const slides = [
  {
    id: 'intro',
    title: 'Project JATAYU',
    subtitle: 'National Automated Weather Station QMS',
    content: 'An intelligent system that automatically checks weather data for errors before it reaches our national forecast models. Built for the Ministry of Earth Sciences.',
    icon: <ShieldCheck className="w-16 h-16 text-blue-500 mb-4" />,
    liveComponent: (
      <div className="h-full flex flex-col justify-center gap-6">
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-700 shadow-2xl">
          <h3 className="text-white font-bold mb-4 flex items-center gap-2">
            <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
            LIVE: National Telemetry Stream
          </h3>
          <GovNetworkStrip totalStations={1350} onlineStations={1342} qualityIndex={98.5} ingestInterval={"5"} anomalyTally={{ critical: 12, convective: 4, drift: 2 }} language="en" />
        </div>
      </div>
    )
  },
  {
    id: 'problem',
    title: 'Fake Weather vs. Extreme Weather',
    subtitle: 'Discriminating Anomalies in < 5ms',
    content: 'When a weather sensor breaks, it can send wild data. But sometimes, an extreme reading is a real storm! JATAYU uses AI to instantly know the difference.',
    icon: <CloudLightning className="w-16 h-16 text-amber-500 mb-4" />,
    liveComponent: (
      <div className="h-full w-full max-h-[500px] overflow-hidden rounded-2xl border border-slate-200 shadow-2xl bg-slate-950 scale-90 origin-center">
        <GovObservationConsole selectedStation={mockStation as any} onSelectStation={() => {}} packets={[]} language="en" />
      </div>
    )
  },
  {
    id: 'solution',
    title: 'Spatial Intelligence Matrix',
    subtitle: 'Cross-Validating Data Against Geography',
    content: 'We don\'t just look at one sensor. JATAYU cross-validates data against surrounding stations in real-time to build a mathematical consensus of the regional weather.',
    icon: <Activity className="w-16 h-16 text-emerald-500 mb-4" />,
    liveComponent: (
      <div className="h-full w-full rounded-2xl overflow-hidden border border-slate-200 shadow-2xl min-h-[400px]">
        <DynamicGovNetworkMap latestPackets={{}} selectedStationId="AWS-DEL-04" onSelectStation={() => {}} />
      </div>
    )
  },
  {
    id: 'mobile',
    title: 'Crowdsourcing the Grid',
    subtitle: 'Turn Any Phone Into a Sensor',
    content: 'Professional stations cost $10,000+. JATAYU allows anyone to use their smartphone as a secure, calibrated mobile weather node, expanding our grid instantly.',
    icon: <Smartphone className="w-16 h-16 text-purple-500 mb-4" />,
    liveComponent: (
      <div className="h-full flex items-center justify-center">
        <div className="w-[320px] h-[600px] bg-slate-900 rounded-[3rem] border-8 border-slate-800 shadow-2xl p-4 flex flex-col relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-800 rounded-b-2xl z-10"></div>
          <div className="flex-1 bg-slate-950 rounded-[2rem] p-6 text-white flex flex-col gap-4 mt-4">
            <h4 className="text-center font-bold text-amber-400">JATAYU Mobile Node</h4>
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
              <div className="text-xs text-slate-400">Barometric Pressure</div>
              <div className="text-2xl font-mono text-sky-400">1012.4 hPa</div>
            </div>
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
              <div className="text-xs text-slate-400">GPS Coordinates</div>
              <div className="text-sm font-mono text-emerald-400">28.58°N, 77.20°E</div>
            </div>
            <button className="mt-auto bg-amber-600 text-white font-bold py-3 rounded-xl hover:bg-amber-700 transition-colors">
              Transmit Encrypted Data
            </button>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'cap-alerts',
    title: 'NDMA CAP Integration',
    subtitle: 'Automated Disaster Early Warnings',
    content: 'When JATAYU confirms a genuine storm via XAI, it instantly generates an ITU-T X.1303 Common Alerting Protocol (CAP) payload. But if it identifies a broken sensor, it legally silences the public alarm to prevent panic.',
    icon: <BellRing className="w-16 h-16 text-rose-500 mb-4" />,
    liveComponent: (
      <div className="h-full w-full max-h-[600px] overflow-hidden rounded-2xl border border-slate-200 shadow-2xl bg-slate-900 scale-95 origin-center relative">
        <GovEmergencyAlertModal isOpen={true} onClose={() => {}} packet={null} stationName="New Delhi (Safdarjung)" state="Delhi" language="en" isInline={true} />
      </div>
    )
  },
  {
    id: 'predictive',
    title: 'Predictive Field Maintenance',
    subtitle: 'Fixing Sensors Before They Break',
    content: 'JATAYU doesn\'t just find broken sensors. It models the thermal decay and barometric drift to calculate the Remaining Useful Life (RUL) of every instrument on the national grid.',
    icon: <Wrench className="w-16 h-16 text-emerald-600 mb-4" />,
    liveComponent: (
      <div className="h-full w-full max-h-[600px] flex items-center justify-center p-6 bg-slate-100 rounded-2xl border border-slate-200 shadow-xl">
        <div className="w-full">
          <GovPredictiveMaintenancePanel packets={[]} stationName="New Delhi (Safdarjung)" language="en" />
        </div>
      </div>
    )
  }
];

export default function PitchDeck() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev < slides.length - 1 ? prev + 1 : prev));
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev > 0 ? prev - 1 : prev));
  }, []);

  // Keyboard navigation for USB Clickers / Presenters
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        nextSlide();
      } else if (e.key === 'ArrowLeft') {
        prevSlide();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextSlide, prevSlide]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center relative overflow-hidden text-slate-900 font-sans">
      
      {/* Presentation Header */}
      <div className="absolute top-0 w-full p-4 md:p-6 flex justify-between items-center bg-white shadow-sm border-b border-slate-200 z-50">
        <div className="font-bold text-xl md:text-2xl text-[#002147] flex items-center gap-2">
          <span>PROJECT JATAYU</span>
          <span className="text-xs md:text-sm bg-amber-100 text-amber-900 px-2 py-0.5 rounded-md border border-amber-300">Live Pitch Mode</span>
        </div>
        <Link href="/" className="text-xs md:text-sm font-semibold text-sky-700 hover:text-sky-900 bg-sky-50 px-4 py-2 rounded-lg border border-sky-200 transition-colors">
          Exit Presentation
        </Link>
      </div>

      {/* Main Slide Content - Split Layout */}
      <div className="flex-1 w-full max-w-7xl flex items-center justify-center p-4 md:p-8 relative mt-16 md:mt-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="w-full h-full max-h-[700px] grid lg:grid-cols-2 gap-8 items-center"
          >
            {/* Left Column: Text & Value Prop */}
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-200 p-8 md:p-16 text-left h-full flex flex-col justify-center">
              {slides[currentSlide].icon}
              <h1 className="text-4xl md:text-5xl font-extrabold text-[#002147] mb-4 tracking-tight leading-tight">
                {slides[currentSlide].title}
              </h1>
              <h2 className="text-xl md:text-2xl font-semibold text-amber-600 mb-6">
                {slides[currentSlide].subtitle}
              </h2>
              <p className="text-lg md:text-xl text-slate-600 leading-relaxed font-medium">
                {slides[currentSlide].content}
              </p>
            </div>

            {/* Right Column: Live Interactive Component */}
            <div className="h-[400px] lg:h-full w-full rounded-3xl relative overflow-hidden flex items-center justify-center">
              {slides[currentSlide].liveComponent}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Presentation Controls */}
      <div className="absolute bottom-6 md:bottom-10 flex items-center gap-6 md:gap-8 bg-white px-6 md:px-8 py-3 md:py-4 rounded-full shadow-xl border border-slate-200 z-50">
        <button 
          onClick={prevSlide} 
          disabled={currentSlide === 0}
          className="p-2 md:p-3 rounded-full hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-6 h-6 md:w-8 md:h-8 text-slate-700" />
        </button>
        
        <div className="flex gap-2 md:gap-3">
          {slides.map((_, idx) => (
            <div 
              key={idx} 
              onClick={() => setCurrentSlide(idx)}
              className={`w-2 h-2 md:w-3 md:h-3 rounded-full transition-all duration-300 cursor-pointer hover:bg-slate-500 ${idx === currentSlide ? 'bg-[#002147] scale-150' : 'bg-slate-300'}`}
            />
          ))}
        </div>

        <button 
          onClick={nextSlide} 
          disabled={currentSlide === slides.length - 1}
          className="p-2 md:p-3 rounded-full hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight className="w-6 h-6 md:w-8 md:h-8 text-slate-700" />
        </button>
      </div>
    </div>
  );
}
