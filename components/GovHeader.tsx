'use client';

import React, { useState, useEffect } from 'react';
import { Shield, Clock, Globe, Eye, Radio, BookOpen, Layers, Server, FileText, Smartphone } from 'lucide-react';
import { ActiveModalType } from './GovInfoModals';

interface GovHeaderProps {
  fontSizeLevel: number;
  onFontSizeChange: (delta: number) => void;
  isHighContrast: boolean;
  onToggleContrast: () => void;
  language: 'hi' | 'en';
  onToggleLanguage: () => void;
  onOpenModal: (type: ActiveModalType) => void;
  onOpenDatasetReplay?: () => void;
  onOpenMobileQR?: () => void;
  isLiveApiMode?: boolean;
}

export const GovHeader: React.FC<GovHeaderProps> = ({
  fontSizeLevel, onFontSizeChange, isHighContrast, onToggleContrast,
  language, onToggleLanguage, onOpenModal, onOpenDatasetReplay, onOpenMobileQR, isLiveApiMode = true,
}) => {
  const [istTime, setIstTime] = useState('');
  useEffect(() => {
    const tick = () => setIstTime(new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' IST');
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <header className="border-b border-slate-300 bg-white text-slate-900 shadow-sm sticky top-0 z-50">
      {/* Tricolor Bar */}
      <div className="h-[4px] w-full flex">
        <div className="h-full w-1/3 bg-[#FF9933]" /><div className="h-full w-1/3 bg-white" /><div className="h-full w-1/3 bg-[#138808]" />
      </div>

      {/* Utility Strip */}
      <div className="bg-[#F1F5F9] border-b border-slate-200 px-4 lg:px-8 py-1 text-[11px] text-slate-600 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="bg-amber-100 text-amber-900 px-2 py-0.5 rounded font-bold border border-amber-300 text-[10px] tracking-wider uppercase">CONCEPT PROTOTYPE</span>
          <span className="font-semibold text-slate-800">
            {language === 'hi' ? 'स्मार्ट इंडिया हैकाथॉन (SIH) | समस्या विवरण: SIH26073' : 'Smart India Hackathon (SIH) Prototype | Problem Statement: SIH26073'}
          </span>
          <span className="text-slate-400 hidden md:inline">|</span>
          <div className="hidden lg:flex items-center gap-2 text-[10px]">
            {([
              { modal: 'architecture' as const, icon: <Server className="w-3 h-3 text-sky-600" />, en: 'Architecture', hi: 'वास्तुकला' },
              { modal: 'methodology' as const, icon: <BookOpen className="w-3 h-3 text-amber-600" />, en: 'WMO QC Rules', hi: 'डब्ल्यूएमओ नियम' },
              { modal: 'security' as const, icon: <Shield className="w-3 h-3 text-emerald-600" />, en: 'Zero-Trust Security', hi: 'शून्य-विश्वास सुरक्षा' },
              { modal: 'provenance' as const, icon: <Layers className="w-3 h-3 text-purple-600" />, en: 'Data Provenance', hi: 'डेटा स्रोत' },
            ]).map((item, i) => (
              <React.Fragment key={item.modal}>
                {i > 0 && <span className="text-slate-300">•</span>}
                <button onClick={() => onOpenModal(item.modal)} className="hover:text-[#002147] hover:underline flex items-center gap-1 font-medium">
                  {item.icon}<span>{language === 'hi' ? item.hi : item.en}</span>
                </button>
              </React.Fragment>
            ))}
            <span className="text-slate-300">•</span>
            {onOpenDatasetReplay && (
              <button onClick={onOpenDatasetReplay} className="bg-[#002147] hover:bg-[#003366] text-white px-2 py-0.5 rounded font-bold flex items-center gap-1 text-[10px] shadow-2xs transition-colors">
                <FileText className="w-3 h-3 text-amber-400" /><span>{language === 'hi' ? 'वास्तविक IMD डेटासेट रिप्ले' : 'Real IMD Dataset Replay'}</span>
              </button>
            )}
            <span className="text-slate-300">•</span>
            {onOpenMobileQR && (
              <button onClick={onOpenMobileQR} className="bg-emerald-700 hover:bg-emerald-800 text-white px-2 py-0.5 rounded font-bold flex items-center gap-1 text-[10px] shadow-2xs transition-colors cursor-pointer">
                <Smartphone className="w-3 h-3 text-amber-300" /><span>{language === 'hi' ? 'फ़ोन नोड (QR)' : 'Phone AWS Node (QR)'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Accessibility Toolbar */}
        <div className="flex items-center gap-3 font-medium">
          <div className="flex items-center bg-white border border-slate-300 rounded px-1.5 py-0.5 space-x-1">
            <span className="text-[10px] text-slate-500 mr-1">अ / A:</span>
            {[-1, 0, 1].map(level => (
              <React.Fragment key={level}>
                {level > -1 && <span className="text-slate-300">|</span>}
                <button onClick={() => onFontSizeChange(level)} className={`px-1 rounded text-[${10 + level}px] font-bold ${fontSizeLevel === level ? 'bg-[#002147] text-white' : 'hover:bg-slate-100 text-slate-700'}`}>
                  {level === -1 ? 'A-' : level === 0 ? 'A' : 'A+'}
                </button>
              </React.Fragment>
            ))}
          </div>
          <button onClick={onToggleContrast} className={`flex items-center gap-1 px-2 py-0.5 rounded border text-[11px] transition-colors ${isHighContrast ? 'bg-black text-yellow-300 border-yellow-300 font-bold' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'}`}>
            <Eye className="w-3 h-3" /><span>{isHighContrast ? 'Contrast ON' : 'Contrast'}</span>
          </button>
          <button onClick={onToggleLanguage} className="flex items-center gap-1 px-2 py-0.5 rounded border border-slate-300 bg-white text-[#002147] font-bold hover:bg-slate-100">
            <Globe className="w-3 h-3 text-[#002147]" /><span>{language === 'hi' ? 'English' : 'हिन्दी'}</span>
          </button>
          <div className="hidden sm:flex items-center gap-1.5 font-mono text-[11px] bg-slate-800 text-slate-100 px-2.5 py-0.5 rounded shadow-2xs">
            <Clock className="w-3 h-3 text-emerald-400" /><span suppressHydrationWarning>{istTime || '20:30:00 IST'}</span>
          </div>
        </div>
      </div>

      {/* Project Identity Banner */}
      <div className="max-w-[1750px] mx-auto px-4 lg:px-8 py-3 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="shrink-0 flex items-center justify-center p-1.5 bg-blue-50 border border-blue-200 rounded-lg shadow-xs">
            <svg className="w-11 h-12 text-[#002147]" viewBox="0 0 80 88" fill="none">
              <circle cx="40" cy="44" r="36" stroke="#002147" strokeWidth="2" strokeDasharray="3 2" opacity="0.3" />
              <circle cx="40" cy="44" r="26" stroke="#0284C7" strokeWidth="2" opacity="0.5" />
              <circle cx="40" cy="44" r="16" stroke="#002147" strokeWidth="2.5" />
              <path d="M40 18 V64" stroke="#002147" strokeWidth="3" strokeLinecap="round" />
              <path d="M26 64 H54" stroke="#002147" strokeWidth="3" strokeLinecap="round" />
              <circle cx="28" cy="22" r="3.5" fill="#FF9933" /><circle cx="52" cy="22" r="3.5" fill="#138808" />
              <path d="M28 22 H52" stroke="#002147" strokeWidth="2" />
              <circle cx="40" cy="44" r="4.5" fill="#0284C7" />
              <path d="M40 8 Q56 24 40 40" stroke="#0284C7" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
              <path d="M40 4 Q62 24 40 44" stroke="#FF9933" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
            </svg>
          </div>
          <div className="border-l-2 border-slate-300 pl-4">
            <div className="text-xs text-slate-600 font-medium tracking-wide">
              {language === 'hi' ? 'संकल्पनात्मक प्रोटोटाइप • आईएमडी एडब्ल्यूएस नेटवर्क मानकों पर आधारित' : 'Conceptual Prototype • Inspired by IMD Surface AWS Network Standards'}
            </div>
            <h1 className="text-lg md:text-xl font-bold tracking-tight text-[#002147]">
              {language === 'hi' ? 'राष्ट्रीय स्वचालित मौसम स्टेशन गुणवत्ता प्रबंधन प्रणाली (NAWS-QMS)' : 'National Automatic Weather Station Quality Management System (NAWS-QMS)'}
            </h1>
            <div className="text-xs font-semibold text-slate-700 flex items-center gap-2 mt-0.5 flex-wrap">
              <span>Smart Anomaly Detection, Sensor Drift Isolation &amp; NWP Data Quality Gating</span>
              <span className="inline-block w-1 h-1 rounded-full bg-slate-400" />
              <span className="font-mono text-[11px] text-blue-800 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200">SIH26073 • Build 2026.09-EVAL</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden lg:flex flex-col items-end text-right">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#002147]">
              <Shield className="w-3.5 h-3.5 text-emerald-600" /><span>WMO Pub No. 8 &amp; 548 Rules Engine</span>
            </div>
            <span className="text-[10px] text-slate-500">Autonomous Statistical &amp; Explainable AI (XAI) Sensor QC</span>
          </div>
          <div className="px-3 py-1.5 bg-[#F8FAFC] border border-slate-300 rounded text-right">
            <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">{isLiveApiMode ? 'Live Atmospheric Feed' : 'Telemetry Feed'}</div>
            <div className={`text-xs font-bold flex items-center gap-1.5 justify-end ${isLiveApiMode ? 'text-sky-700' : 'text-emerald-700'}`}>
              <span className={`w-2 h-2 rounded-full inline-block animate-pulse ${isLiveApiMode ? 'bg-sky-500' : 'bg-emerald-600'}`} />
              <span>{isLiveApiMode ? 'Open-Meteo 20/20 Live Sync' : 'Simulated Real-Time Stream'}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
