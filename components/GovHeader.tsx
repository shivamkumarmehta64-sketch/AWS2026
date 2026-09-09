'use client';

import React, { useState, useEffect } from 'react';
import { Shield, Clock, Globe, Eye, Volume2 } from 'lucide-react';

interface GovHeaderProps {
  fontSizeLevel: number;
  onFontSizeChange: (delta: number) => void;
  isHighContrast: boolean;
  onToggleContrast: () => void;
  language: 'hi' | 'en';
  onToggleLanguage: () => void;
}

export const GovHeader: React.FC<GovHeaderProps> = ({
  fontSizeLevel,
  onFontSizeChange,
  isHighContrast,
  onToggleContrast,
  language,
  onToggleLanguage,
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
      const ms = Math.floor(now.getMilliseconds() / 10).toString().padStart(2, '0');
      setIstTime(`${timeStr}.${ms} IST`);
    };

    updateTime();
    const interval = setInterval(updateTime, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="border-b border-slate-300 bg-white text-slate-900 shadow-sm sticky top-0 z-50">
      {/* 1. National Tricolor Stripe */}
      <div className="h-[4px] w-full flex">
        <div className="h-full w-1/3 bg-[#FF9933]" title="Saffron (केसरिया)" />
        <div className="h-full w-1/3 bg-white" title="White (सफेद)" />
        <div className="h-full w-1/3 bg-[#138808]" title="Green (हरा)" />
      </div>

      {/* 2. Top Accessibility & National Portal Utility Strip */}
      <div className="bg-[#F1F5F9] border-b border-slate-200 px-4 lg:px-8 py-1 text-[11px] text-slate-600 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-800">
            {language === 'hi' ? 'भारत सरकार | पृथ्वी विज्ञान मंत्रालय' : 'Government of India | Ministry of Earth Sciences'}
          </span>
          <span className="text-slate-400">|</span>
          <span className="text-slate-600">
            {language === 'hi' ? 'भारत मौसम विज्ञान विभाग' : 'India Meteorological Department (IMD)'}
          </span>
        </div>

        {/* Accessibility Toolbar */}
        <div className="flex items-center gap-3 font-medium">
          {/* Font Resizing */}
          <div className="flex items-center bg-white border border-slate-300 rounded px-1.5 py-0.5 space-x-1">
            <span className="text-[10px] text-slate-500 mr-1">अ / A:</span>
            <button
              onClick={() => onFontSizeChange(-1)}
              className="px-1 hover:bg-slate-100 rounded text-[10px] font-bold text-slate-700"
              title="Decrease Font Size (A-)"
            >
              A-
            </button>
            <span className="text-slate-300">|</span>
            <button
              onClick={() => onFontSizeChange(0)}
              className="px-1 hover:bg-slate-100 rounded text-[11px] font-bold text-slate-800"
              title="Standard Font Size (A)"
            >
              A
            </button>
            <span className="text-slate-300">|</span>
            <button
              onClick={() => onFontSizeChange(1)}
              className="px-1 hover:bg-slate-100 rounded text-[12px] font-bold text-slate-900"
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
                ? 'bg-black text-yellow-300 border-black font-bold'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
            }`}
            title="Toggle High Contrast Mode"
          >
            <Eye className="w-3 h-3" />
            <span>{isHighContrast ? 'Standard' : 'Contrast'}</span>
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

          {/* Live Government IST Microsecond Clock */}
          <div className="hidden sm:flex items-center gap-1.5 font-mono text-[11px] bg-slate-800 text-slate-100 px-2.5 py-0.5 rounded">
            <Clock className="w-3 h-3 text-emerald-400" />
            <span>{istTime || '00:00:00.00 IST'}</span>
          </div>
        </div>
      </div>

      {/* 3. Official Government Main Identity Banner */}
      <div className="max-w-[1750px] mx-auto px-4 lg:px-8 py-3 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {/* State Emblem of India SVG */}
          <div className="shrink-0 flex items-center justify-center p-1" title="भारत का राजचिह्न | State Emblem of India">
            <svg
              className="w-12 h-14 text-[#002147]"
              viewBox="0 0 100 120"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Lion Capital Pillar Representation */}
              <circle cx="50" cy="22" r="16" fill="currentColor" opacity="0.9" />
              <path d="M30 38 Q50 32 70 38 L68 56 Q50 52 32 56 Z" fill="currentColor" />
              {/* Central Dharma Chakra */}
              <circle cx="50" cy="74" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
              <circle cx="50" cy="74" r="2.5" fill="currentColor" />
              <line x1="50" y1="64" x2="50" y2="84" stroke="currentColor" strokeWidth="1.5" />
              <line x1="40" y1="74" x2="60" y2="74" stroke="currentColor" strokeWidth="1.5" />
              <line x1="43" y1="67" x2="57" y2="81" stroke="currentColor" strokeWidth="1" />
              <line x1="57" y1="67" x2="43" y2="81" stroke="currentColor" strokeWidth="1" />
              {/* Base Pedestal */}
              <rect x="25" y="88" width="50" height="6" rx="1" fill="currentColor" />
              <rect x="20" y="96" width="60" height="8" rx="2" fill="currentColor" />
              {/* Satyameva Jayate Banner Text Outline */}
              <text x="50" y="116" fontSize="9" fontWeight="bold" textAnchor="middle" fill="#002147" fontFamily="sans-serif">
                सत्यमेव जयते
              </text>
            </svg>
          </div>

          {/* Departmental Titles */}
          <div className="border-l-2 border-slate-300 pl-4">
            <div className="text-xs text-slate-600 font-medium tracking-wide">
              {language === 'hi' ? 'भारत सरकार • पृथ्वी विज्ञान मंत्रालय' : 'Government of India • Ministry of Earth Sciences'}
            </div>
            <h1 className="text-lg md:text-xl font-bold tracking-tight text-[#002147]">
              {language === 'hi'
                ? 'राष्ट्रीय स्वचालित मौसम स्टेशन नेटवर्क प्रबंधन प्रणाली (NAWS-QMS)'
                : 'National Automatic Weather Station Quality Management System (NAWS-QMS)'}
            </h1>
            <div className="text-xs font-semibold text-slate-700 flex items-center gap-2 mt-0.5">
              <span>India Meteorological Department (IMD) • Data Quality Control Division</span>
              <span className="inline-block w-1 h-1 rounded-full bg-slate-400" />
              <span className="font-mono text-[11px] text-slate-500">Release v4.2.8 (Build 2026.09-IS)</span>
            </div>
          </div>
        </div>

        {/* Portal Badges / Verification */}
        <div className="flex items-center gap-3">
          <div className="hidden lg:flex flex-col items-end text-right">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#002147]">
              <Shield className="w-3.5 h-3.5 text-emerald-600" />
              <span>GIGW & WMO Pub No. 8 Certified</span>
            </div>
            <span className="text-[10px] text-slate-500">
              National Informatics Centre (NIC) Central Data Ingest
            </span>
          </div>

          <div className="px-3 py-1.5 bg-[#F8FAFC] border border-slate-300 rounded text-right">
            <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Operational Status</div>
            <div className="text-xs font-bold text-emerald-700 flex items-center gap-1.5 justify-end">
              <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block animate-pulse" />
              <span>Uplink Active (INSAT-3D)</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
