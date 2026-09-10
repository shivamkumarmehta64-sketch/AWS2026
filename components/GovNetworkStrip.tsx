'use client';

import React, { useState } from 'react';
import { Radio, ShieldCheck, AlertCircle, Brain, ChevronDown, ChevronUp, Sparkles, Activity, CheckCircle2 } from 'lucide-react';

interface Props {
  totalStations: number;
  onlineStations: number;
  qualityIndex: number;
  ingestInterval: string;
  anomalyTally: { critical: number; convective: number; drift: number };
  language: 'hi' | 'en';
}

export const GovNetworkStrip = React.memo<Props>(function GovNetworkStrip({
  totalStations,
  onlineStations,
  qualityIndex,
  ingestInterval,
  anomalyTally,
  language
}) {
  const [showMissionBrief, setShowMissionBrief] = useState(false);

  return (
    <div className="w-full bg-slate-950/90 backdrop-blur-xl border-y border-slate-800/80 shadow-inner transition-all duration-300">
      {/* Top Cyber Telemetry Status Stream */}
      <div className="max-w-[1750px] mx-auto px-3 sm:px-6 lg:px-8 py-2 flex items-center justify-between flex-wrap gap-2 text-xs">
        {/* Left: Live Stream Indicator & Network Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-2 bg-emerald-950/80 text-emerald-400 border border-emerald-800/80 px-2.5 py-1 rounded-full text-[11px] font-mono font-bold shadow-xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span>{language === 'hi' ? 'लाइव वायुमंडलीय फीड' : 'LIVE ATMOSPHERIC STREAM'}</span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-mono text-slate-300">
            <span className="bg-slate-900 border border-slate-800 px-2 py-0.5 rounded text-sky-300 flex items-center gap-1">
              <Radio className="w-3 h-3 text-sky-400 animate-pulse" />
              <span>{totalStations} Nodes ({onlineStations} Online)</span>
            </span>
            <span className="bg-slate-900 border border-slate-800 px-2 py-0.5 rounded text-emerald-300 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span>WMO Pub 8 QC ({qualityIndex.toFixed(1)}%)</span>
            </span>
            <span className="bg-slate-900 border border-slate-800 px-2 py-0.5 rounded text-amber-300 flex items-center gap-1">
              <Activity className="w-3 h-3 text-amber-400" />
              <span>{ingestInterval} Ingest</span>
            </span>
            {anomalyTally.critical > 0 ? (
              <span className="bg-red-950/80 border border-red-800/80 px-2 py-0.5 rounded text-red-300 font-bold">
                {anomalyTally.critical} Faults Quarantined
              </span>
            ) : (
              <span className="bg-slate-900 border border-slate-800 px-2 py-0.5 rounded text-slate-400">
                0 Active Faults
              </span>
            )}
          </div>
        </div>

        {/* Right: Operational Brief Toggle (SIH 6073 Problem Context) */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowMissionBrief(prev => !prev)}
            className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-sky-300 hover:text-white border border-slate-700/80 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>{language === 'hi' ? 'समस्या संदर्भ (SIH 6073)' : 'Operational Context (SIH 6073)'}</span>
            {showMissionBrief ? (
              <ChevronUp className="w-3 h-3 text-slate-400" />
            ) : (
              <ChevronDown className="w-3 h-3 text-slate-400" />
            )}
          </button>
        </div>
      </div>

      {/* Expandable Sovereign Mission Brief Drawer */}
      {showMissionBrief && (
        <div className="border-t border-slate-800/90 bg-slate-900/95 backdrop-blur-2xl px-3 sm:px-6 lg:px-8 py-3.5 transition-all duration-300">
          <div className="max-w-[1750px] mx-auto bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-slate-700/80 rounded-xl p-3.5 sm:p-4 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-amber-500/20 border border-amber-500/30 shrink-0 text-amber-400 mt-0.5">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-sm text-white">
                    {language === 'hi' ? 'वास्तविक समस्या जिसे NAWS-QMS हल करता है:' : 'The Real Crisis NAWS-QMS Solves:'}
                  </span>
                  <span className="text-[10px] bg-amber-400/20 text-amber-300 border border-amber-400/40 px-2 py-0.5 rounded-full font-mono font-bold uppercase tracking-wider">
                    MoES SIH 6073
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed max-w-4xl">
                  {language === 'hi'
                    ? 'मई 2025 में, IMD ने डेटा विश्वसनीयता चिंताओं के कारण अपने सार्वजनिक AWS/ARG पोर्टल को बंद कर दिया। NAWS-QMS WMO Pub 8 आधारित स्वचालित गुणवत्ता नियंत्रण परत प्रदान करता है जो वास्तविक समय डेटा को संख्यात्मक मौसम मॉडल (NWP) और जनता के लिए पूरी तरह से विश्वसनीय बनाता है।'
                    : 'In May 2025, IMD permanently shut down its public AWS/ARG real-time portal due to sensor data contamination. NAWS-QMS delivers an edge AI-powered WMO Pub 8 quality validation layer that isolates sensor faults, preserves genuine convective storm fronts, and restores high-integrity data streams for NWP models across India.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 flex-wrap">
              <div className="bg-emerald-950/70 border border-emerald-800 text-emerald-300 px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>NWP Model Ready</span>
              </div>
              <div className="bg-sky-950/70 border border-sky-800 text-sky-300 px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold flex items-center gap-1.5">
                <Brain className="w-3.5 h-3.5 text-sky-400" />
                <span>Line-Rate &lt;5ms</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});
