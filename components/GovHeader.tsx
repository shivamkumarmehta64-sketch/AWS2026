'use client';

import React, { useState, useEffect } from 'react';
import { Shield, Clock, Globe, Eye, Radio, Sparkles, BookOpen, Layers, Server } from 'lucide-react';
import { ActiveModalType } from './GovInfoModals';

interface GovHeaderProps {
  fontSizeLevel: number;
  onFontSizeChange: (delta: number) => void;
  isHighContrast: boolean;
  onToggleContrast: () => void;
  language: 'hi' | 'en';
  onToggleLanguage: () => void;
  onOpenModal: (type: ActiveModalType) => void;
}

export const GovHeader: React.FC<GovHeaderProps> = ({
  fontSizeLevel,
  onFontSizeChange,
  isHighContrast,
  onToggleContrast,
  language,
  onToggleLanguage,
  onOpenModal,
}) => {
  const [istTime, setIstTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('en-IN', {
        timeZone: 'Asia/Kolkata',
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
      setIstTime(`${timeStr} IST`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="border-b border-slate-300 bg-white text-slate-900 shadow-sm sticky top-0 z-50">
      {/* 1. National Tricolor Accent Bar */}
      <div className="h-[4px] w-full flex">
        <div className="h-full w-1/3 bg-[#FF9933]" title="Saffron (केसरिया)" />
        <div className="h-full w-1/3 bg-white" title="White (सफेद)" />
        <div className="h-full w-1/3 bg-[#138808]" title="Green (हरा)" />
      </div>

      {/* 2. Top Hackathon Prototype Utility & Accessibility Strip */}
      <div className="bg-[#F1F5F9] border-b border-slate-200 px-4 lg:px-8 py-1 text-[11px] text-slate-600 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="bg-amber-100 text-amber-900 px-2 py-0.5 rounded font-bold border border-amber-300 text-[10px] tracking-wider uppercase">
            CONCEPT PROTOTYPE
          </span>
          <span className="font-semibold text-slate-800">
            {language === 'hi'
              ? 'स्मार्ट इंडिया हैकाथॉन (SIH) | समस्या विवरण: SIH26073'
              : 'Smart India Hackathon (SIH) Prototype | Problem Statement: SIH26073'}
          </span>
          <span className="text-slate-400 hidden md:inline">|</span>
          {/* Quick Technical Docs Modals */}
          <div className="hidden lg:flex items-center gap-2 text-[10px]">
            <button
              onClick={() => onOpenModal('architecture')}
              className="hover:text-[#002147] hover:underline flex items-center gap-1 font-medium"
            >
              <Server className="w-3 h-3 text-sky-600" />
              <span>{language === 'hi' ? 'वास्तुकला' : 'Architecture'}</span>
            </button>
            <span className="text-slate-300">•</span>
            <button
              onClick={() => onOpenModal('methodology')}
              className="hover:text-[#002147] hover:underline flex items-center gap-1 font-medium"
            >
              <BookOpen className="w-3 h-3 text-amber-600" />
              <span>{language === 'hi' ? 'डब्ल्यूएमओ नियम' : 'WMO QC Rules'}</span>
            </button>
            <span className="text-slate-300">•</span>
            <button
              onClick={() => onOpenModal('provenance')}
              className="hover:text-[#002147] hover:underline flex items-center gap-1 font-medium"
            >
              <Layers className="w-3 h-3 text-purple-600" />
              <span>{language === 'hi' ? 'डेटा स्रोत' : 'Data Provenance'}</span>
            </button>
          </div>
        </div>

        {/* Accessibility Toolbar */}
        <div className="flex items-center gap-3 font-medium">
          {/* Font Resizing */}
          <div className="flex items-center bg-white border border-slate-300 rounded px-1.5 py-0.5 space-x-1">
            <span className="text-[10px] text-slate-500 mr-1">अ / A:</span>
            <button
              onClick={() => onFontSizeChange(-1)}
              className={`px-1 rounded text-[10px] font-bold ${fontSizeLevel === -1 ? 'bg-[#002147] text-white' : 'hover:bg-slate-100 text-slate-700'}`}
              title="Decrease Font Size (A-)"
            >
              A-
            </button>
            <span className="text-slate-300">|</span>
            <button
              onClick={() => onFontSizeChange(0)}
              className={`px-1 rounded text-[11px] font-bold ${fontSizeLevel === 0 ? 'bg-[#002147] text-white' : 'hover:bg-slate-100 text-slate-800'}`}
              title="Standard Font Size (A)"
            >
              A
            </button>
            <span className="text-slate-300">|</span>
            <button
              onClick={() => onFontSizeChange(1)}
              className={`px-1 rounded text-[12px] font-bold ${fontSizeLevel >= 1 ? 'bg-[#002147] text-white' : 'hover:bg-slate-100 text-slate-900'}`}
              title="Increase Font Size (A+)"
            >
              A+
            </button>
          </div>

          {/* High Contrast Mode Toggle */}
          <button
            onClick={onToggleContrast}
            className={`flex items-center gap-1 px-2 py-0.5 rounded border text-[11px] transition-colors ${
              isHighContrast
                ? 'bg-black text-yellow-300 border-yellow-300 font-bold'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
            }`}
            title="Toggle High Contrast Mode"
          >
            <Eye className="w-3 h-3" />
            <span>{isHighContrast ? 'Contrast ON' : 'Contrast'}</span>
          </button>

          {/* Language Switcher */}
          <button
            onClick={onToggleLanguage}
            className="flex items-center gap-1 px-2 py-0.5 rounded border border-slate-300 bg-white text-[#002147] font-bold hover:bg-slate-100"
            title="Switch Language"
          >
            <Globe className="w-3 h-3 text-[#002147]" />
            <span>{language === 'hi' ? 'English' : 'हिन्दी'}</span>
          </button>

          {/* Live Government IST Clock */}
          <div className="hidden sm:flex items-center gap-1.5 font-mono text-[11px] bg-slate-800 text-slate-100 px-2.5 py-0.5 rounded shadow-2xs">
            <Clock className="w-3 h-3 text-emerald-400" />
            <span suppressHydrationWarning>{istTime || '20:30:00 IST'}</span>
          </div>
        </div>
      </div>


      {/* 3. Modern Project Identity & Architecture Banner */}
      <div className="max-w-[1750px] mx-auto px-4 lg:px-8 py-3 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {/* Meteorological Radar & Sensor Network Project Emblem SVG */}
          <div className="shrink-0 flex items-center justify-center p-1.5 bg-blue-50 border border-blue-200 rounded-lg shadow-xs" title="NAWS-QMS Telemetry Radar & Sensor Architecture">
            <svg
              className="w-11 h-12 text-[#002147]"
              viewBox="0 0 80 88"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Concentric Radar Sweeps */}
              <circle cx="40" cy="44" r="36" stroke="#002147" strokeWidth="2" strokeDasharray="3 2" opacity="0.3" />
              <circle cx="40" cy="44" r="26" stroke="#0284C7" strokeWidth="2" opacity="0.5" />
              <circle cx="40" cy="44" r="16" stroke="#002147" strokeWidth="2.5" />
              {/* Central Weather Sensor Mast */}
              <path d="M40 18 V64" stroke="#002147" strokeWidth="3" strokeLinecap="round" />
              <path d="M26 64 H54" stroke="#002147" strokeWidth="3" strokeLinecap="round" />
              {/* Anemometer Cups */}
              <circle cx="28" cy="22" r="3.5" fill="#FF9933" />
              <circle cx="52" cy="22" r="3.5" fill="#138808" />
              <path d="M28 22 H52" stroke="#002147" strokeWidth="2" />
              {/* Central Core Pulse */}
              <circle cx="40" cy="44" r="4.5" fill="#0284C7" />
              {/* Radio Wave Radiance */}
              <path d="M40 8 Q56 24 40 40" stroke="#0284C7" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
              <path d="M40 4 Q62 24 40 44" stroke="#FF9933" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
            </svg>
          </div>

          {/* Project & Departmental Titles */}
          <div className="border-l-2 border-slate-300 pl-4">
            <div className="text-xs text-slate-600 font-medium tracking-wide flex items-center gap-1.5">
              <span>{language === 'hi' ? 'संकल्पनात्मक प्रोटोटाइप • आईएमडी एडब्ल्यूएस नेटवर्क मानकों पर आधारित' : 'Conceptual Prototype • Inspired by IMD Surface AWS Network Standards'}</span>
            </div>
            <h1 className="text-lg md:text-xl font-bold tracking-tight text-[#002147]">
              {language === 'hi'
                ? 'राष्ट्रीय स्वचालित मौसम स्टेशन गुणवत्ता प्रबंधन प्रणाली (NAWS-QMS)'
                : 'National Automatic Weather Station Quality Management System (NAWS-QMS)'}
            </h1>
            <div className="text-xs font-semibold text-slate-700 flex items-center gap-2 mt-0.5 flex-wrap">
              <span>Smart Anomaly Detection, Sensor Drift Isolation &amp; NWP Data Quality Gating</span>
              <span className="inline-block w-1 h-1 rounded-full bg-slate-400" />
              <span className="font-mono text-[11px] text-blue-800 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200">
                SIH26073 • Build 2026.09-EVAL
              </span>
            </div>
          </div>
        </div>

        {/* Evaluation Badges */}
        <div className="flex items-center gap-3">
          <div className="hidden lg:flex flex-col items-end text-right">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#002147]">
              <Shield className="w-3.5 h-3.5 text-emerald-600" />
              <span>WMO Pub No. 8 &amp; 548 Rules Engine</span>
            </div>
            <span className="text-[10px] text-slate-500">
              Autonomous Statistical &amp; Explainable AI (XAI) Sensor QC
            </span>
          </div>

          <div className="px-3 py-1.5 bg-[#F8FAFC] border border-slate-300 rounded text-right">
            <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Telemetry Feed</div>
            <div className="text-xs font-bold text-emerald-700 flex items-center gap-1.5 justify-end">
              <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block animate-pulse" />
              <span>Simulated Real-Time Stream</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
