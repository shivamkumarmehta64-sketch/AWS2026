'use client';

import React, { useState } from 'react';
import { Target, ShieldCheck, Smartphone, Search, AlertCircle, ChevronDown, ChevronUp, Cpu, Award } from 'lucide-react';

interface Props {
  language: 'hi' | 'en';
  onOpenMobileQR: () => void;
  connectedMobileCount: number;
}

export const GovJuryOrientationBanner = React.memo<Props>(function GovJuryOrientationBanner({
  language,
  onOpenMobileQR,
  connectedMobileCount,
}) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <section aria-label="Jury and Citizen Orientation" className="bg-white border-2 border-[#002147] rounded-xl shadow-md overflow-hidden">
      {/* Top Banner Bar */}
      <div className="bg-gradient-to-r from-[#002147] via-[#0B3B60] to-[#002147] text-white px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-amber-400 text-slate-950 font-black">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="bg-amber-400 text-slate-950 text-[10px] font-black uppercase px-2 py-0.5 rounded tracking-wider">
                SIH 6073 GRAND FINALE
              </span>
              <span className="text-xs font-semibold text-sky-200">
                Ministry of Earth Sciences (MoES) &amp; IMD
              </span>
            </div>
            <h1 className="text-sm sm:text-base font-extrabold text-white tracking-tight mt-0.5">
              {language === 'hi'
                ? 'जूरी एवं दर्शक मार्गदर्शिका: NAWS-QMS प्रणाली क्या है और इसका परीक्षण कैसे करें'
                : 'Jury & Evaluator Quick Guide: What This Platform Does & How to Test It'}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {connectedMobileCount > 0 && (
            <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 animate-pulse">
              <Smartphone className="w-3.5 h-3.5" />
              <span>{connectedMobileCount} Live Mobile Sensor{connectedMobileCount > 1 ? 's' : ''} Connected</span>
            </span>
          )}

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs text-sky-200 hover:text-white flex items-center gap-1 font-semibold px-2 py-1 rounded bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
          >
            <span>{isExpanded ? 'Hide Guide' : 'Show Guide'}</span>
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expandable 3-Column Visual Guide */}
      {isExpanded && (
        <div className="p-4 sm:p-5 bg-gradient-to-b from-slate-50 to-white text-xs text-slate-700 divide-y sm:divide-y-0 sm:divide-x divide-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-0">
          {/* Step 1: The Problem */}
          <div className="sm:px-4 first:pl-0 space-y-1.5">
            <div className="flex items-center gap-2 text-rose-700 font-bold text-xs">
              <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-800 flex items-center justify-center text-[11px] font-black">1</span>
              <span>The National Crisis Solved</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              India has 1,350+ Automatic Weather Stations. Transducers in the field suffer wire cuts, drift, and ADC freezes.
              Naive systems mistake genuine severe storms for faults, or feed corrupted sensor noise into national weather prediction models.
            </p>
          </div>

          {/* Step 2: The Innovation */}
          <div className="sm:px-4 space-y-1.5 pt-3 sm:pt-0">
            <div className="flex items-center gap-2 text-[#002147] font-bold text-xs">
              <span className="w-5 h-5 rounded-full bg-blue-100 text-[#002147] flex items-center justify-center text-[11px] font-black">2</span>
              <span>Our AI Quality Control Engine</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              In <strong>&lt;5 milliseconds per packet</strong>, NAWS-QMS executes WMO Pub No. 8 step &amp; persistence checks,
              multivariate XAI attribution, spatial KNN neighborhood validation, and automated data reconstruction with zero API cost.
            </p>
          </div>

          {/* Step 3: Interactive Jury Test Actions */}
          <div className="sm:px-4 last:pr-0 space-y-2 pt-3 sm:pt-0">
            <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs">
              <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-[11px] font-black">3</span>
              <span>How You Can Test It Right Now</span>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between bg-white p-2 rounded border border-slate-200 text-[11px]">
                <span className="flex items-center gap-1.5 font-medium">
                  <Search className="w-3.5 h-3.5 text-sky-600" />
                  Search any of 700+ Indian districts
                </span>
                <span className="text-[10px] text-slate-400 font-mono">Live API</span>
              </div>
              <button
                onClick={onOpenMobileQR}
                className="w-full flex items-center justify-between bg-emerald-700 hover:bg-emerald-800 text-white p-2 rounded text-[11px] font-bold transition-colors cursor-pointer shadow-xs"
              >
                <span className="flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-amber-300" />
                  Connect your phone as a live sensor node (QR)
                </span>
                <span className="text-[10px] bg-emerald-900 px-1.5 py-0.2 rounded font-mono">SCAN</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
});
