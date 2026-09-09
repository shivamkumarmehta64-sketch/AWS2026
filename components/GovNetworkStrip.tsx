'use client';

import React from 'react';
import { Radio, Server, CheckCircle, AlertTriangle, Activity, ChevronRight } from 'lucide-react';

interface GovNetworkStripProps {
  totalStations: number;
  onlineStations: number;
  qualityIndex: number;
  ingestInterval: string;
  anomalyTally: {
    critical: number;
    convective: number;
    drift: number;
  };
  language: 'hi' | 'en';
}

export const GovNetworkStrip: React.FC<GovNetworkStripProps> = ({
  totalStations,
  onlineStations,
  qualityIndex,
  ingestInterval,
  anomalyTally,
  language,
}) => {
  return (
    <div className="space-y-2.5">
      {/* 1. Official Government Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="bg-[#F8FAFC] border-y border-slate-200 px-4 lg:px-8 py-1.5 text-xs text-slate-600 flex items-center gap-1.5 overflow-x-auto">
        <span className="text-[#002147] font-semibold hover:underline cursor-pointer">
          {language === 'hi' ? 'गृह' : 'Home'}
        </span>
        <ChevronRight className="w-3 h-3 text-slate-400" />
        <span className="text-[#002147] font-semibold hover:underline cursor-pointer">
          {language === 'hi' ? 'मौसम सेवाएं' : 'Meteorological Services'}
        </span>
        <ChevronRight className="w-3 h-3 text-slate-400" />
        <span className="text-[#002147] font-semibold hover:underline cursor-pointer">
          {language === 'hi' ? 'स्वचालित मौसम स्टेशन (AWS) नेटवर्क' : 'Surface Observational Network (AWS)'}
        </span>
        <ChevronRight className="w-3 h-3 text-slate-400" />
        <span className="text-slate-800 font-bold">
          {language === 'hi'
            ? 'वास्तविक समय गुणवत्ता नियंत्रण एवं विसंगति विश्लेषण (NAWS-QMS v4.2.8)'
            : 'Real-Time Quality Control & Anomaly Surveillance (NAWS-QMS v4.2.8)'}
        </span>
      </nav>

      {/* 2. Executive Network Status Strip */}
      <div className="px-4 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {/* Metric 1: Total Monitored AWS Nodes */}
          <div className="bg-white border border-slate-300 rounded p-3 shadow-xs flex items-center gap-3">
            <div className="p-2.5 rounded bg-blue-50 border border-blue-200 text-[#002147]">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-600">
                {language === 'hi' ? 'कुल मॉनिटर किए गए नोड्स' : 'Monitored AWS Nodes'}
              </div>
              <div className="text-xl font-bold font-mono text-[#002147]">
                {totalStations}{' '}
                <span className="text-xs font-normal text-slate-600">
                  {language === 'hi' ? 'स्टेशन' : 'Stations'}
                </span>
              </div>
              <div className="text-[10px] text-slate-500">
                Across 6 Regional Meteorological Centres (RMCs)
              </div>
            </div>
          </div>

          {/* Metric 2: Stations Online / Operational */}
          <div className="bg-white border border-slate-300 rounded p-3 shadow-xs flex items-center gap-3">
            <div className="p-2.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-700">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-600">
                {language === 'hi' ? 'सक्रिय / चालू स्टेशन' : 'Operational Status'}
              </div>
              <div className="text-xl font-bold font-mono text-emerald-700">
                {onlineStations} / {totalStations}{' '}
                <span className="text-xs font-semibold text-emerald-600">
                  ({((onlineStations / totalStations) * 100).toFixed(0)}% Up)
                </span>
              </div>
              <div className="text-[10px] text-slate-500">
                1 Station in Scheduled NABL Calibration
              </div>
            </div>
          </div>

          {/* Metric 3: Active Data Ingestion Rate */}
          <div className="bg-white border border-slate-300 rounded p-3 shadow-xs flex items-center gap-3">
            <div className="p-2.5 rounded bg-indigo-50 border border-indigo-200 text-indigo-700">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-600">
                {language === 'hi' ? 'डेटा अंतर्ग्रहण दर' : 'Ingestion Cadence'}
              </div>
              <div className="text-xl font-bold font-mono text-indigo-900">
                {ingestInterval}{' '}
                <span className="text-xs font-normal text-slate-600">Cycle</span>
              </div>
              <div className="text-[10px] text-slate-500">
                INSAT-3D DCP Link &amp; GPRS Fallback VPN
              </div>
            </div>
          </div>

          {/* Metric 4: Network Quality Index (WMO Compliant) */}
          <div className="bg-white border border-slate-300 rounded p-3 shadow-xs flex items-center gap-3">
            <div className="p-2.5 rounded bg-amber-50 border border-amber-200 text-amber-800">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-600">
                {language === 'hi' ? 'नेटवर्क गुणवत्ता सूचकांक (QMS)' : 'Network Quality Index'}
              </div>
              <div className="text-xl font-bold font-mono text-[#002147]">
                {qualityIndex.toFixed(1)}%{' '}
                <span className="text-xs font-bold text-emerald-700">Valid</span>
              </div>
              <div className="text-[10px] text-slate-600 font-mono">
                Active: {anomalyTally.critical} Fault | {anomalyTally.convective} Storm | {anomalyTally.drift} Drift
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
