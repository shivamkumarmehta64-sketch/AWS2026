'use client';

import React from 'react';
import { Radio, Server, CheckCircle, Activity, ChevronRight, AlertCircle, Brain, TrendingUp, Users } from 'lucide-react';

interface Props {
  totalStations: number; onlineStations: number; qualityIndex: number;
  ingestInterval: string; anomalyTally: { critical: number; convective: number; drift: number };
  language: 'hi' | 'en';
}

export const GovNetworkStrip = React.memo<Props>(function GovNetworkStrip({ totalStations, onlineStations, qualityIndex, ingestInterval, anomalyTally, language }) {
  const crumbs = language === 'hi'
    ? ['गृह', 'मौसम सेवाएं', 'स्वचालित मौसम स्टेशन (AWS) नेटवर्क', 'वास्तविक समय गुणवत्ता नियंत्रण एवं विसंगति विश्लेषण (NAWS-QMS v4.2.8)']
    : ['Home', 'Meteorological Services', 'Surface Observational Network (AWS)', 'Real-Time Quality Control & Anomaly Surveillance (NAWS-QMS v4.2.8)'];

  const metrics = [
    { icon: <Server className="w-5 h-5" />, iconBg: 'bg-blue-50 border-blue-200 text-[#002147]', label: language === 'hi' ? 'कुल मौसम स्टेशन' : 'Weather Stations Monitored', value: <>{totalStations} <span className="text-xs font-normal text-slate-600">{language === 'hi' ? 'स्टेशन' : 'Stations'}</span></>, sub: 'All India Network (Delhi, Mumbai, Kolkata, etc.)' },
    { icon: <CheckCircle className="w-5 h-5" />, iconBg: 'bg-emerald-50 border-emerald-200 text-emerald-700', label: language === 'hi' ? 'चालू स्टेशन' : 'Stations Online Now', value: <>{onlineStations} / {totalStations} <span className="text-xs font-semibold text-emerald-600">({((onlineStations / totalStations) * 100).toFixed(0)}% Healthy)</span></>, sub: '1 Station in Scheduled Routine Maintenance', valueColor: 'text-emerald-700' },
    { icon: <Radio className="w-5 h-5 animate-pulse" />, iconBg: 'bg-indigo-50 border-indigo-200 text-indigo-700', label: language === 'hi' ? 'लाइव अपडेट दर' : 'Live Update Frequency', value: <>{ingestInterval} <span className="text-xs font-normal text-slate-600">Continuous</span></>, sub: 'Real-Time Auto Sensor Feed', valueColor: 'text-indigo-900' },
    { icon: <Activity className="w-5 h-5" />, iconBg: 'bg-amber-50 border-amber-200 text-amber-800', label: language === 'hi' ? 'डेटा विश्वसनीयता स्कोर' : 'Data Reliability Score', value: <>{qualityIndex.toFixed(1)}% <span className="text-xs font-bold text-emerald-700">Accurate</span></>, sub: `Verified: ${anomalyTally.critical} Faults Isolated | ${anomalyTally.convective} Storms Checked` },
  ];

  const impactStats = [
    { icon: <Server className="w-3.5 h-3.5" />, value: '1,350+', label: 'IMD AWS Nodes Nationally', color: 'text-[#002147]' },
    { icon: <Users className="w-3.5 h-3.5" />, value: '900M+', label: 'Indians Protected', color: 'text-emerald-700' },
    { icon: <Brain className="w-3.5 h-3.5" />, value: 'XAI', label: 'Explainable AI Attribution', color: 'text-sky-700' },
    { icon: <TrendingUp className="w-3.5 h-3.5" />, value: '5', label: 'WMO QC Flag Tiers', color: 'text-amber-700' },
    { icon: <CheckCircle className="w-3.5 h-3.5" />, value: '<5ms', label: 'Line-Rate Edge QC Latency', color: 'text-purple-700' },
  ];

  return (
    <div className="space-y-2.5">
      <nav aria-label="Breadcrumb" className="bg-[#F8FAFC] border-y border-slate-200 px-4 lg:px-8 py-1.5 text-xs text-slate-600 flex items-center gap-1.5 overflow-x-auto">
        {crumbs.map((c, i) => (
          <React.Fragment key={i}>
            {i > 0 && <ChevronRight className="w-3 h-3 text-slate-400" />}
            <span className={i === crumbs.length - 1 ? 'text-slate-800 font-bold' : 'text-[#002147] font-semibold hover:underline cursor-pointer'}>{c}</span>
          </React.Fragment>
        ))}
      </nav>

      {/* Problem Context Banner — Real-world pain point (IMD portal shutdown May 2025) */}
      <div className="px-4 lg:px-8">
        <div className="bg-gradient-to-r from-[#002147] to-[#0B3B60] text-white rounded-lg px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm border border-[#0369A1]/30">
          <div className="flex items-start gap-3">
            <div className="p-1.5 rounded bg-amber-400/20 border border-amber-400/30 shrink-0 mt-0.5">
              <AlertCircle className="w-4 h-4 text-amber-300" />
            </div>
            <div>
              <div className="font-bold text-sm text-amber-300 flex items-center gap-2">
                {language === 'hi' ? 'वास्तविक समस्या जिसे हम हल कर रहे हैं:' : 'The Real Crisis NAWS-QMS Solves:'}
                <span className="text-[10px] bg-amber-400/20 text-amber-200 border border-amber-400/30 px-1.5 py-0.2 rounded font-mono font-semibold uppercase tracking-wider">SIH26073</span>
              </div>
              <p className="text-[11px] text-slate-200 mt-0.5 leading-relaxed max-w-2xl">
                {language === 'hi'
                  ? 'मई 2025 में, IMD ने अपना सार्वजनिक AWS/ARG डेटा पोर्टल स्थायी रूप से बंद कर दिया — हजारों स्वतंत्र मौसम पूर्वानुमानकर्ताओं की रीयल-टाइम स्टेशन डेटा तक पहुंच समाप्त हो गई। NAWS-QMS वह गुणवत्ता परत है जो उस डेटा को फिर से भरोसेमंद बनाती है।'
                  : 'In May 2025, IMD permanently shut its public AWS/ARG data portal — cutting off thousands of independent forecasters from real-time station feeds. NAWS-QMS is the AI-powered quality layer that makes that data trustworthy enough to share again, protecting NWP model integrity for the entire nation.'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-1 rounded font-bold font-mono flex items-center gap-1">
              <Brain className="w-3 h-3" /> AI/ML Powered
            </span>
            <span className="text-[10px] bg-sky-500/20 text-sky-200 border border-sky-400/30 px-2 py-1 rounded font-bold font-mono">WMO-No. 8</span>
          </div>
        </div>
      </div>

      {/* Impact Stats Row */}
      <div className="px-4 lg:px-8">
        <div className="bg-white border border-slate-200 rounded-lg px-4 py-2 flex flex-wrap items-center justify-between gap-y-2 gap-x-4 shadow-xs">
          {impactStats.map((s, i) => (
            <React.Fragment key={s.label}>
              {i > 0 && <div className="hidden sm:block w-px h-6 bg-slate-200" />}
              <div className="flex items-center gap-2">
                <div className={`${s.color} opacity-70`}>{s.icon}</div>
                <div>
                  <div className={`text-sm font-extrabold font-mono ${s.color}`}>{s.value}</div>
                  <div className="text-[10px] text-slate-500 font-medium">{s.label}</div>
                </div>
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="px-4 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {metrics.map(m => (
            <div key={m.label} className="bg-white border border-slate-300 rounded p-3 shadow-xs flex items-center gap-3">
              <div className={`p-2.5 rounded border ${m.iconBg}`}>{m.icon}</div>
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-600">{m.label}</div>
                <div className={`text-xl font-bold font-mono ${m.valueColor || 'text-[#002147]'}`}>{m.value}</div>
                <div className="text-[10px] text-slate-500">{m.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

