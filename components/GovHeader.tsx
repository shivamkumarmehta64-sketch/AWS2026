'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Shield, Clock, Globe, Eye, BookOpen, Layers, Server, FileText, Smartphone, Menu, X, ExternalLink, Home, Activity, FileCheck } from 'lucide-react';
import { ActiveModalType } from './GovInfoModals';

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
  const pathname = usePathname();
  const [istTime, setIstTime] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const tick = () => setIstTime(new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' IST');
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <header className="border-b border-slate-200 bg-white shadow-xs sticky top-0 z-50">
      {/* Tricolor National Bar */}
      <div className="h-[3px] w-full flex">
        <div className="h-full w-1/3 bg-[#FF9933]" />
        <div className="h-full w-1/3 bg-white" />
        <div className="h-full w-1/3 bg-[#138808]" />
      </div>

      {/* Official Government Top Utility Bar */}
      <div className="bg-slate-100/90 border-b border-slate-200 text-slate-700">
        <div className="max-w-[1750px] mx-auto px-4 lg:px-8 py-1.5 flex items-center justify-between text-xs">
          {/* Official Government Identity */}
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="font-bold text-slate-800 text-[11px] sm:text-xs tracking-tight">
              भारत सरकार | GOVERNMENT OF INDIA
            </span>
            <span className="text-slate-400 hidden sm:inline">•</span>
            <span className="font-medium text-slate-600 truncate text-[11px] sm:text-xs">
              पृथ्वी विज्ञान मंत्रालय | Ministry of Earth Sciences
            </span>
            <span className="text-slate-400 hidden md:inline">•</span>
            <span className="text-[10px] font-bold text-sky-800 bg-sky-100 border border-sky-200 px-1.5 py-0.2 rounded hidden lg:inline">
              SIH Problem Statement 26073
            </span>
          </div>

          {/* Accessibility & Institutional Controls */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Font Size Adjusters */}
            <div className="hidden sm:flex items-center bg-white border border-slate-300 rounded px-1.5 py-0.5 space-x-1">
              <span className="text-[10px] text-slate-500 mr-1">Font:</span>
              {[-1, 0, 1].map(level => (
                <button
                  key={level}
                  onClick={() => onFontSizeChange(level)}
                  className={`px-1.5 py-0.2 rounded text-[10px] font-bold transition-all ${
                    fontSizeLevel === level ? 'bg-[#002147] text-white' : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Adjust Font Size"
                >
                  {level === -1 ? 'A-' : level === 0 ? 'A' : 'A+'}
                </button>
              ))}
            </div>

            {/* High Contrast */}
            <button
              onClick={onToggleContrast}
              title="Toggle High Contrast"
              className={`p-1 sm:px-2 sm:py-0.5 rounded border text-[10px] transition-all flex items-center gap-1 ${
                isHighContrast ? 'bg-yellow-400 text-slate-950 border-yellow-500 font-bold' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
            >
              <Eye className="w-3 h-3 text-slate-600" />
              <span className="hidden sm:inline">{isHighContrast ? 'High Contrast' : 'Contrast'}</span>
            </button>

            {/* Language Toggle */}
            <button
              onClick={onToggleLanguage}
              className="flex items-center gap-1 px-2 py-0.5 rounded border border-slate-300 bg-white text-[#002147] font-bold text-[10px] hover:bg-slate-50 transition-colors"
              title="Switch Language"
            >
              <Globe className="w-3 h-3 text-sky-700" />
              <span>{language === 'hi' ? 'English' : 'हिन्दी'}</span>
            </button>

            {/* Live IST Clock */}
            <div className="hidden md:flex items-center gap-1.5 font-mono text-[11px] bg-white text-slate-800 border border-slate-300 px-2 py-0.5 rounded font-semibold">
              <Clock className="w-3 h-3 text-emerald-600" />
              <span suppressHydrationWarning>{istTime || 'IST'}</span>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(prev => !prev)}
              className="xl:hidden p-1 rounded bg-white border border-slate-300 text-slate-700 hover:text-slate-900"
              aria-label="Toggle Navigation Menu"
            >
              {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Main Official Government Navy Masthead */}
      <div className="bg-[#002147] text-white">
        <div className="max-w-[1750px] mx-auto px-4 lg:px-8 py-3 flex items-center justify-between gap-4">
          {/* Identity & Seals */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-amber-400 shadow-md shrink-0 bg-white flex items-center justify-center">
              <Image src="/jatayu-seal.jpg" alt="Project JATAYU Emblem" width={48} height={48} className="w-full h-full object-cover" />
            </div>
            <div className="border-l border-white/20 pl-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-lg sm:text-xl font-black tracking-tight text-white flex items-center gap-1.5">
                  <span className="text-amber-400 font-extrabold">PROJECT JATAYU</span>
                  <span className="text-white text-sm font-normal">| JATAYU-QMS</span>
                </span>
                <span className="bg-amber-400/20 text-amber-300 text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-amber-400/40">
                  SIH26073
                </span>
                <span className="bg-sky-500/20 text-sky-200 text-[10px] font-mono font-bold px-1.5 py-0.2 rounded border border-sky-400/40 hidden sm:inline">
                  MoES • IMD
                </span>
                <span className="bg-emerald-500/20 text-emerald-200 text-[10px] font-mono font-bold px-1.5 py-0.2 rounded border border-emerald-400/40">
                  WMO-No. 8 Standard
                </span>
              </div>
              <p className="text-[11px] text-slate-200 hidden sm:block">
                {language === 'hi'
                  ? 'राष्ट्रीय स्वचालित मौसम स्टेशन गुणवत्ता प्रबंधन प्रणाली • भारत मौसम विज्ञान विभाग (MoES)'
                  : 'National Automated Weather Station Quality Management System • India Meteorological Department'}
              </p>
            </div>
          </div>

          {/* Desktop Government Quick Navigation & External Links */}
          <div className="hidden xl:flex items-center gap-3 text-xs">
            {([
              { modal: 'architecture' as const, icon: <Server className="w-3.5 h-3.5 text-sky-300" />, en: 'Architecture', hi: 'प्रणाली संरचना' },
              { modal: 'methodology' as const, icon: <BookOpen className="w-3.5 h-3.5 text-amber-300" />, en: 'WMO Standards', hi: 'गुणवत्ता मानक' },
              { modal: 'security' as const, icon: <Shield className="w-3.5 h-3.5 text-emerald-300" />, en: 'Zero-Trust', hi: 'सुरक्षा' },
              { modal: 'provenance' as const, icon: <Layers className="w-3.5 h-3.5 text-purple-300" />, en: 'Data Sources', hi: 'डेटा स्रोत' },
            ]).map((item) => (
              <button
                key={item.modal}
                onClick={() => onOpenModal(item.modal)}
                className="text-slate-200 hover:text-white flex items-center gap-1.5 px-2 py-1 rounded hover:bg-white/10 transition-colors cursor-pointer font-medium"
              >
                {item.icon}
                <span>{language === 'hi' ? item.hi : item.en}</span>
              </button>
            ))}
            <span className="text-white/30">|</span>
            {onOpenDatasetReplay && (
              <button
                onClick={onOpenDatasetReplay}
                className="bg-white/10 hover:bg-white/20 text-amber-300 border border-amber-300/40 px-2.5 py-1 rounded font-bold flex items-center gap-1.5 text-xs transition-colors cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5 text-amber-300" />
                <span>{language === 'hi' ? 'डेटा रिप्ले' : 'Replay Data'}</span>
              </button>
            )}
            {onOpenMobileQR && (
              <button
                onClick={onOpenMobileQR}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 rounded font-bold flex items-center gap-1.5 text-xs transition-colors cursor-pointer shadow-xs"
              >
                <Smartphone className="w-3.5 h-3.5 text-white" />
                <span>{language === 'hi' ? 'फ़ोन नोड (QR)' : 'Phone Node (QR)'}</span>
              </button>
            )}
          </div>

          {/* External Portals & Live Feed Indicator */}
          <div className="flex items-center gap-3">
            <div className="hidden lg:flex items-center gap-2 text-xs border-r border-white/20 pr-3">
              <a
                href="https://api.imd.gov.in/public/api_reference.html"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-emerald-200 border border-emerald-400/30 transition-colors font-medium text-xs"
                title="Official IMD API Reference (api.imd.gov.in)"
              >
                <span>IMD API</span>
                <ExternalLink className="w-3 h-3 text-emerald-300" />
              </a>
              <a
                href="https://mausam.imd.gov.in"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-sky-200 border border-white/10 transition-colors font-medium"
                title="India Meteorological Department Mausam Portal"
              >
                <span>IMD Mausam</span>
                <ExternalLink className="w-3 h-3 text-sky-300" />
              </a>
              <a
                href="https://cloud.gov.in"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-amber-200 border border-white/10 transition-colors font-medium"
                title="Government of India MeghRaj Sovereign Cloud"
              >
                <span>NIC MeghRaj</span>
                <ExternalLink className="w-3 h-3 text-amber-300" />
              </a>
            </div>

            <div className="px-3 py-1 bg-white/10 border border-white/20 rounded text-right">
              <div className="text-[9px] uppercase tracking-wider text-slate-300 font-semibold">
                {isLiveApiMode ? 'Live Atmospheric Feed' : 'Telemetry Mode'}
              </div>
              <div className="text-[11px] font-bold text-emerald-300 flex items-center gap-1.5 justify-end font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Edge Sync (0ms)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sovereign National Command Portal Links Strip */}
      <nav aria-label="Portal Navigation" className="bg-[#001733] border-b border-white/10 text-white">
        <div className="max-w-[1750px] mx-auto px-4 lg:px-8 flex items-center justify-between overflow-x-auto scrollbar-none py-1.5 text-xs font-semibold">
          <div className="flex items-center gap-1 sm:gap-2">
            <Link
              href="/"
              className={`px-3 py-1 rounded transition-colors flex items-center gap-1.5 text-xs ${
                pathname === '/'
                  ? 'bg-amber-400 text-slate-950 font-bold shadow-xs'
                  : 'text-slate-200 hover:text-white hover:bg-white/10'
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              <span>{language === 'hi' ? 'मुख्य पृष्ठ' : 'Portal Overview'}</span>
            </Link>
            <Link
              href="/dashboard"
              className={`px-3 py-1 rounded transition-colors flex items-center gap-1.5 text-xs ${
                pathname === '/dashboard'
                  ? 'bg-amber-400 text-slate-950 font-bold shadow-xs'
                  : 'text-slate-200 hover:text-white hover:bg-white/10'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>{language === 'hi' ? 'राष्ट्रीय संचालन केंद्र' : 'National Operations Console'}</span>
            </Link>
            <Link
              href="/mobile"
              className={`px-3 py-1 rounded transition-colors flex items-center gap-1.5 text-xs ${
                pathname === '/mobile'
                  ? 'bg-amber-400 text-slate-950 font-bold shadow-xs'
                  : 'text-slate-200 hover:text-white hover:bg-white/10'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>{language === 'hi' ? 'मोबाइल वेधशाला (PWA)' : 'Mobile Sensor Node'}</span>
            </Link>
            <Link
              href="/audit-report"
              className={`px-3 py-1 rounded transition-colors flex items-center gap-1.5 text-xs ${
                pathname === '/audit-report'
                  ? 'bg-amber-400 text-slate-950 font-bold shadow-xs'
                  : 'text-slate-200 hover:text-white hover:bg-white/10'
              }`}
            >
              <FileCheck className="w-3.5 h-3.5" />
              <span>{language === 'hi' ? 'तकनीकी ऑडिट डोजियर' : 'Technical Audit Dossier'}</span>
            </Link>
          </div>

          <div className="hidden lg:flex items-center gap-2 text-[11px] font-mono text-amber-300/90 pl-3">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>NWP Gating Engine: WMO-548 Active</span>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer Dropdown */}
      {isMobileMenuOpen && (
        <div className="xl:hidden bg-slate-50 border-b border-slate-200 p-4 space-y-3 animate-fadeIn">
          {/* Primary Mobile Navigation Links */}
          <div className="grid grid-cols-2 gap-2 text-xs font-bold pb-2 border-b border-slate-200">
            <Link
              href="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`p-2.5 rounded flex items-center gap-2 border ${
                pathname === '/' ? 'bg-[#002147] text-white border-[#002147]' : 'bg-white text-slate-800 border-slate-300'
              }`}
            >
              <Home className="w-3.5 h-3.5 text-amber-500" />
              <span>Overview</span>
            </Link>
            <Link
              href="/dashboard"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`p-2.5 rounded flex items-center gap-2 border ${
                pathname === '/dashboard' ? 'bg-[#002147] text-white border-[#002147]' : 'bg-white text-slate-800 border-slate-300'
              }`}
            >
              <Activity className="w-3.5 h-3.5 text-emerald-500" />
              <span>Ops Console</span>
            </Link>
            <Link
              href="/mobile"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`p-2.5 rounded flex items-center gap-2 border ${
                pathname === '/mobile' ? 'bg-[#002147] text-white border-[#002147]' : 'bg-white text-slate-800 border-slate-300'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5 text-sky-500" />
              <span>Mobile Node</span>
            </Link>
            <Link
              href="/audit-report"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`p-2.5 rounded flex items-center gap-2 border ${
                pathname === '/audit-report' ? 'bg-[#002147] text-white border-[#002147]' : 'bg-white text-slate-800 border-slate-300'
              }`}
            >
              <FileCheck className="w-3.5 h-3.5 text-purple-500" />
              <span>Audit Dossier</span>
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            {([
              { modal: 'architecture' as const, icon: <Server className="w-3.5 h-3.5 text-sky-700" />, label: 'Architecture' },
              { modal: 'methodology' as const, icon: <BookOpen className="w-3.5 h-3.5 text-amber-700" />, label: 'WMO Standards' },
              { modal: 'security' as const, icon: <Shield className="w-3.5 h-3.5 text-emerald-700" />, label: 'Zero-Trust' },
              { modal: 'provenance' as const, icon: <Layers className="w-3.5 h-3.5 text-purple-700" />, label: 'Data Sources' },
            ]).map((item) => (
              <button
                key={item.modal}
                onClick={() => { onOpenModal(item.modal); setIsMobileMenuOpen(false); }}
                className="flex items-center gap-2 p-2.5 bg-white rounded border border-slate-300 text-slate-800 font-medium hover:bg-slate-100 cursor-pointer"
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 pt-2 border-t border-slate-200">
            {onOpenDatasetReplay && (
              <button
                onClick={() => { onOpenDatasetReplay(); setIsMobileMenuOpen(false); }}
                className="flex-1 py-2 bg-white border border-slate-300 rounded text-xs font-semibold text-slate-800 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5 text-amber-600" />
                <span>Replay Data</span>
              </button>
            )}
            {onOpenMobileQR && (
              <button
                onClick={() => { onOpenMobileQR(); setIsMobileMenuOpen(false); }}
                className="flex-1 py-2 bg-emerald-600 text-white rounded text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Smartphone className="w-3.5 h-3.5 text-white" />
                <span>Phone QR</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
});
