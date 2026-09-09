'use client';

import React from 'react';
import { Radio, Server, CheckCircle, Activity, ChevronRight } from 'lucide-react';

interface Props {
  totalStations: number; onlineStations: number; qualityIndex: number;
  ingestInterval: string; anomalyTally: { critical: number; convective: number; drift: number };
  language: 'hi' | 'en';
}

export const GovNetworkStrip: React.FC<Props> = ({ totalStations, onlineStations, qualityIndex, ingestInterval, anomalyTally, language }) => {
  const crumbs = language === 'hi'
    ? ['गृह', 'मौसम सेवाएं', 'स्वचालित मौसम स्टेशन (AWS) नेटवर्क', 'वास्तविक समय गुणवत्ता नियंत्रण एवं विसंगति विश्लेषण (NAWS-QMS v4.2.8)']
    : ['Home', 'Meteorological Services', 'Surface Observational Network (AWS)', 'Real-Time Quality Control & Anomaly Surveillance (NAWS-QMS v4.2.8)'];

  const metrics = [
    { icon: <Server className="w-5 h-5" />, iconBg: 'bg-blue-50 border-blue-200 text-[#002147]', label: language === 'hi' ? 'कुल मॉनिटर किए गए नोड्स' : 'Monitored AWS Nodes', value: <>{totalStations} <span className="text-xs font-normal text-slate-600">{language === 'hi' ? 'स्टेशन' : 'Stations'}</span></>, sub: 'Across 6 Regional Meteorological Centres (RMCs)' },
    { icon: <CheckCircle className="w-5 h-5" />, iconBg: 'bg-emerald-50 border-emerald-200 text-emerald-700', label: language === 'hi' ? 'सक्रिय / चालू स्टेशन' : 'Operational Status', value: <>{onlineStations} / {totalStations} <span className="text-xs font-semibold text-emerald-600">({((onlineStations / totalStations) * 100).toFixed(0)}% Up)</span></>, sub: '1 Station in Scheduled NABL Calibration', valueColor: 'text-emerald-700' },
    { icon: <Radio className="w-5 h-5 animate-pulse" />, iconBg: 'bg-indigo-50 border-indigo-200 text-indigo-700', label: language === 'hi' ? 'डेटा अंतर्ग्रहण दर' : 'Ingestion Cadence', value: <>{ingestInterval} <span className="text-xs font-normal text-slate-600">Cycle</span></>, sub: 'INSAT-3D DCP Link & GPRS Fallback VPN', valueColor: 'text-indigo-900' },
    { icon: <Activity className="w-5 h-5" />, iconBg: 'bg-amber-50 border-amber-200 text-amber-800', label: language === 'hi' ? 'नेटवर्क गुणवत्ता सूचकांक (QMS)' : 'Network Quality Index', value: <>{qualityIndex.toFixed(1)}% <span className="text-xs font-bold text-emerald-700">Valid</span></>, sub: `Active: ${anomalyTally.critical} Fault | ${anomalyTally.convective} Storm | ${anomalyTally.drift} Drift` },
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
};
