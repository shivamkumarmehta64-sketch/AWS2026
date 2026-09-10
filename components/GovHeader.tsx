'use client';

import React, { useState, useEffect } from 'react';
import { Shield, Clock, Globe, Eye, BookOpen, Layers, Server, FileText, Smartphone, Menu, X, Activity } from 'lucide-react';
import { ActiveModalType } from './GovInfoModals';
import { VengeanceGlowBadge } from '@/components/ui/VengeanceUI';

interface GovHeaderProps {
  fontSizeLevel: number;
  onFontSizeChange: (delta: number) => void;
  isHighContrast: boolean;
  onToggleContrast: () => void;
  isMissionControl?: boolean;
  onToggleMissionControl?: () => void;
  language: 'hi' | 'en';
  onToggleLanguage: () => void;
  onOpenModal: (type: ActiveModalType) => void;
  onOpenDatasetReplay?: () => void;
  onOpenMobileQR?: () => void;
  isLiveApiMode?: boolean;
}

export const GovHeader = React.memo<GovHeaderProps>(function GovHeader({
  fontSizeLevel, onFontSizeChange, isHighContrast, onToggleContrast,
  language, onToggleLanguage, onOpenModal, onOpenDatasetReplay, onOpenMobileQR, isLiveApiMode = true,
}) {
  const [istTime, setIstTime] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const tick = () => setIstTime(new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' IST');
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <header className="border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-xl text-slate-100 shadow-xl sticky top-0 z-50">
      {/* Tricolor National Bar */}
      <div className="h-[3px] w-full flex">
        <div className="h-full w-1/3 bg-[#FF9933]" />
        <div className="h-full w-1/3 bg-white" />
        <div className="h-full w-1/3 bg-[#138808]" />
      </div>

      {/* Top Utility Strip */}
      <div className="bg-slate-900/60 border-b border-slate-800/60 px-3 sm:px-6 lg:px-8 py-1.5 text-xs text-slate-400 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <VengeanceGlowBadge label="LIVE GRID" variant="emerald" className="scale-90 sm:scale-100" />
          <span className="font-semibold text-slate-200 truncate text-[11px] sm:text-xs">
            {language === 'hi' ? 'राष्ट्रीय स्वचालित मौसम स्टेशन गुणवत्ता निगरानी प्रणाली' : 'National Automatic Weather Station Quality Management System'}
          </span>
          <span className="text-slate-600 hidden md:inline">•</span>
          <span className="text-[10px] text-sky-400 font-mono hidden lg:inline">MoES • IMD • SIH 6073</span>
        </div>

        {/* Quick Modal Triggers on Desktop */}
        <div className="hidden xl:flex items-center gap-3 text-[11px]">
          {([
            { modal: 'architecture' as const, icon: <Server className="w-3 h-3 text-sky-400" />, en: 'System Design', hi: 'प्रणाली संरचना' },
            { modal: 'methodology' as const, icon: <BookOpen className="w-3 h-3 text-amber-400" />, en: 'WMO Standards', hi: 'गुणवत्ता मानक' },
            { modal: 'security' as const, icon: <Shield className="w-3 h-3 text-emerald-400" />, en: 'Security', hi: 'सुरक्षा' },
            { modal: 'provenance' as const, icon: <Layers className="w-3 h-3 text-purple-400" />, en: 'Data Sources', hi: 'डेटा स्रोत' },
          ]).map((item) => (
            <button
              key={item.modal}
              onClick={() => onOpenModal(item.modal)}
              className="hover:text-white text-slate-400 flex items-center gap-1 transition-colors cursor-pointer"
            >
              {item.icon}
              <span>{language === 'hi' ? item.hi : item.en}</span>
            </button>
          ))}
          <span className="text-slate-700">|</span>
          {onOpenDatasetReplay && (
            <button
              onClick={onOpenDatasetReplay}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-2 py-0.5 rounded font-bold flex items-center gap-1 text-[10px] transition-colors cursor-pointer"
            >
              <FileText className="w-3 h-3 text-amber-400" />
              <span>{language === 'hi' ? 'डेटा रिप्ले' : 'Replay Data'}</span>
            </button>
          )}
          {onOpenMobileQR && (
            <button
              onClick={onOpenMobileQR}
              className="bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 px-2 py-0.5 rounded font-bold flex items-center gap-1 text-[10px] transition-colors cursor-pointer"
            >
              <Smartphone className="w-3 h-3 text-emerald-400" />
              <span>{language === 'hi' ? 'फ़ोन टेस्ट (QR)' : 'Phone Node (QR)'}</span>
            </button>
          )}
        </div>

        {/* Accessibility & Time Toolbar */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="hidden sm:flex items-center bg-slate-900 border border-slate-800 rounded px-1.5 py-0.5 space-x-1">
            <span className="text-[10px] text-slate-500 mr-1">A:</span>
            {[-1, 0, 1].map(level => (
              <button
                key={level}
                onClick={() => onFontSizeChange(level)}
                className={`px-1.5 py-0.2 rounded text-[10px] font-bold transition-all ${
                  fontSizeLevel === level ? 'bg-sky-500 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                {level === -1 ? 'A-' : level === 0 ? 'A' : 'A+'}
              </button>
            ))}
          </div>

          <button
            onClick={onToggleContrast}
            title="Toggle Contrast"
            className={`p-1 sm:px-2 sm:py-0.5 rounded border text-[10px] transition-all flex items-center gap-1 ${
              isHighContrast ? 'bg-yellow-400 text-slate-950 border-yellow-300 font-bold' : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
            }`}
          >
            <Eye className="w-3 h-3" />
            <span className="hidden sm:inline">{isHighContrast ? 'High' : 'Normal'}</span>
          </button>

          <button
            onClick={onToggleLanguage}
            className="flex items-center gap-1 px-2 py-0.5 rounded border border-slate-800 bg-slate-900 text-sky-300 font-bold text-[10px] hover:bg-slate-800 transition-colors"
          >
            <Globe className="w-3 h-3 text-sky-400" />
            <span>{language === 'hi' ? 'EN' : 'हिन्दी'}</span>
          </button>

          <div className="hidden md:flex items-center gap-1.5 font-mono text-[11px] bg-slate-900 text-slate-200 border border-slate-800 px-2 py-0.5 rounded">
            <Clock className="w-3 h-3 text-emerald-400" />
            <span suppressHydrationWarning>{istTime || 'IST'}</span>
          </div>

          {/* Mobile Drawer Button */}
          <button
            onClick={() => setIsMobileMenuOpen(prev => !prev)}
            className="xl:hidden p-1 rounded bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
            aria-label="Toggle Navigation Menu"
          >
            {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Brand Title & Telemetry Header */}
      <div className="max-w-[1750px] mx-auto px-4 lg:px-8 py-2.5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center shadow-lg shadow-sky-500/20 shrink-0">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <div className="border-l border-slate-800 pl-3">
            <div className="flex items-center gap-2">
              <span className="text-base sm:text-lg font-black tracking-tight text-white">
                NAWS-QMS
              </span>
              <span className="bg-sky-950 text-sky-400 text-[10px] font-mono font-bold px-1.5 py-0.2 rounded border border-sky-800/60 hidden sm:inline">
                MoES • IMD
              </span>
              <span className="bg-emerald-950 text-emerald-300 text-[10px] font-mono font-bold px-1.5 py-0.2 rounded border border-emerald-800/60">
                WMO Pub 8
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              {language === 'hi'
                ? 'भारत की 766 जिला वेधशालाओं हेतु वास्तविक समय डेटा गुणवत्ता व दोष निवारण पोर्टल'
                : 'Real-Time Edge Quality Assurance & Meteorological Anomaly Discrimination'}
            </p>
          </div>
        </div>

        {/* Live Feed Status Pill */}
        <div className="flex items-center gap-2">
          <div className="px-3 py-1 bg-slate-900/90 border border-slate-800 rounded-lg text-right">
            <div className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold">
              {isLiveApiMode ? 'Live Atmospheric Feed' : 'Telemetry Mode'}
            </div>
            <div className="text-[11px] font-bold text-sky-400 flex items-center gap-1.5 justify-end font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Open-Meteo &amp; Edge Sync</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Dropdown */}
      {isMobileMenuOpen && (
        <div className="xl:hidden bg-slate-950 border-b border-slate-800 p-4 space-y-3 animate-fadeIn">
          <div className="grid grid-cols-2 gap-2 text-xs">
            {([
              { modal: 'architecture' as const, icon: <Server className="w-3.5 h-3.5 text-sky-400" />, label: 'System Design' },
              { modal: 'methodology' as const, icon: <BookOpen className="w-3.5 h-3.5 text-amber-400" />, label: 'WMO Standards' },
              { modal: 'security' as const, icon: <Shield className="w-3.5 h-3.5 text-emerald-400" />, label: 'Security Specs' },
              { modal: 'provenance' as const, icon: <Layers className="w-3.5 h-3.5 text-purple-400" />, label: 'Data Sources' },
            ]).map((item) => (
              <button
                key={item.modal}
                onClick={() => { onOpenModal(item.modal); setIsMobileMenuOpen(false); }}
                className="flex items-center gap-2 p-2 bg-slate-900 rounded-lg border border-slate-800 text-slate-300 hover:text-white"
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
            {onOpenDatasetReplay && (
              <button
                onClick={() => { onOpenDatasetReplay(); setIsMobileMenuOpen(false); }}
                className="flex-1 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs font-semibold text-slate-300 flex items-center justify-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5 text-amber-400" />
                <span>Replay Data</span>
              </button>
            )}
            {onOpenMobileQR && (
              <button
                onClick={() => { onOpenMobileQR(); setIsMobileMenuOpen(false); }}
                className="flex-1 py-2 bg-emerald-950 border border-emerald-800 rounded-lg text-xs font-semibold text-emerald-300 flex items-center justify-center gap-1.5"
              >
                <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                <span>Phone QR</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
});
