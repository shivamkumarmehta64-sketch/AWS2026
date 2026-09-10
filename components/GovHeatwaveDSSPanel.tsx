'use client';

import React, { useState, useMemo } from 'react';
import { useAllDistricts } from '@/lib/districtEngine';
import { evaluateIMDHeatwave } from '@/lib/heatwaveEngine';
import {
  Flame,
  Sun,
  Calendar,
  ExternalLink,
  Droplets,
  HeartPulse,
  Info
} from 'lucide-react';

interface Props {
  selectedDistrictId: string | null;
  onSelectDistrict: (id: string) => void;
  language?: 'en' | 'hi';
}

export const GovHeatwaveDSSPanel: React.FC<Props> = ({
  selectedDistrictId,
  onSelectDistrict,
  language = 'en'
}) => {
  const allDistricts = useAllDistricts();
  const [activeDayForecast, setActiveDayForecast] = useState<number>(1); // Day 1 to Day 5

  // Evaluate heatwave reports for all districts
  const heatwaveReports = useMemo(() => {
    return allDistricts.map(entry => {
      return evaluateIMDHeatwave(entry.district, entry.reading, entry.history);
    });
  }, [allDistricts]);

  // Aggregate stats across India
  const nationalHeatwaveStats = useMemo(() => {
    let redCount = 0;
    let orangeCount = 0;
    let yellowCount = 0;
    let greenCount = 0;

    for (const rep of heatwaveReports) {
      if (rep.warningLevel === 'WARNING_SEVERE') redCount++;
      else if (rep.warningLevel === 'ALERT') orangeCount++;
      else if (rep.warningLevel === 'WATCH') yellowCount++;
      else greenCount++;
    }

    return {
      red: redCount,
      orange: orangeCount,
      yellow: yellowCount,
      green: greenCount,
      totalAlerts: redCount + orangeCount + yellowCount
    };
  }, [heatwaveReports]);

  // Active district heatwave report
  const activeReport = useMemo(() => {
    if (selectedDistrictId) {
      const found = heatwaveReports.find(r => r.districtId === selectedDistrictId);
      if (found) return found;
    }
    // Find the district with highest max temp or highest departure as default
    const sorted = [...heatwaveReports].sort((a, b) => b.departure - a.departure);
    return sorted[0] || null;
  }, [heatwaveReports, selectedDistrictId]);

  // Top 6 districts experiencing highest heat departure
  const topHeatDistricts = useMemo(() => {
    const list = [...heatwaveReports].sort((a, b) => b.departure - a.departure);
    return list.slice(0, 6);
  }, [heatwaveReports]);

  return (
    <div className="bg-slate-900/95 border border-slate-800 rounded-xl shadow-2xl overflow-hidden space-y-0 text-white backdrop-blur-2xl">
      {/* Header with IMD Source Link */}
      <div className="bg-gradient-to-r from-[#7c2d12] via-[#ea580c] to-[#c2410c] text-white p-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-400 text-slate-950 rounded font-black">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base tracking-wide uppercase">
                  {language === 'hi'
                    ? 'आईएमडी हीटवेव डिसीजन सपोर्ट सिस्टम (DSS)'
                    : 'IMD Decision Support System — National Heatwave Portal'}
                </h3>
                <span className="bg-white text-[#ea580c] text-[10px] font-extrabold px-2 py-0.5 rounded">
                  OFFICIAL IMD DSS MODEL
                </span>
              </div>
              <p className="text-xs text-amber-100 mt-0.5">
                Modeled directly on IMD GeoServer Heatwave DSS · WMO Climatological Departure Guidelines
              </p>
            </div>
          </div>

          <a
            href="https://dss.imd.gov.in/dwr_img/GIS/heatwave.html"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-black/30 hover:bg-black/50 text-white rounded text-xs font-mono font-bold border border-white/20 transition-colors"
          >
            <span>Source: dss.imd.gov.in</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* 5-Day Outlook Selector & National Alert Summary Row */}
      <div className="bg-amber-50/80 p-3.5 border-b border-amber-200 flex items-center justify-between flex-wrap gap-3">
        {/* Day 1 - Day 5 Forecast Tabs */}
        <div className="flex items-center gap-1.5">
          <Calendar className="w-4 h-4 text-[#ea580c]" />
          <span className="text-xs font-bold text-slate-800">Forecast Horizon:</span>
          <div className="flex items-center gap-1 bg-white p-0.5 rounded border border-amber-300">
            {[1, 2, 3, 4, 5].map(day => (
              <button
                key={day}
                onClick={() => setActiveDayForecast(day)}
                className={`px-2.5 py-0.5 rounded text-xs font-bold transition-all ${
                  activeDayForecast === day
                    ? 'bg-[#ea580c] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Day {day} {day === 1 ? '(Today)' : ''}
              </button>
            ))}
          </div>
        </div>

        {/* 4-Color Coded Alert Counters */}
        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded border border-red-200">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444] animate-pulse" />
            <span className="font-bold text-red-700">{nationalHeatwaveStats.red}</span>
            <span className="text-slate-600 text-[11px] font-sans">Red (Severe)</span>
          </div>

          <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded border border-orange-200">
            <span className="w-2.5 h-2.5 rounded-full bg-[#f97316]" />
            <span className="font-bold text-orange-700">{nationalHeatwaveStats.orange}</span>
            <span className="text-slate-600 text-[11px] font-sans">Orange (Alert)</span>
          </div>

          <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded border border-amber-200">
            <span className="w-2.5 h-2.5 rounded-full bg-[#eab308]" />
            <span className="font-bold text-amber-700">{nationalHeatwaveStats.yellow}</span>
            <span className="text-slate-600 text-[11px] font-sans">Yellow (Watch)</span>
          </div>

          <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded border border-emerald-200">
            <span className="w-2.5 h-2.5 rounded-full bg-[#22c55e]" />
            <span className="font-bold text-emerald-700">{nationalHeatwaveStats.green}</span>
            <span className="text-slate-600 text-[11px] font-sans">Green (Normal)</span>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="p-4 space-y-4">
        {/* Active District Heatwave & Departure Deep-Dive */}
        {activeReport && (
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3">
            <div className="flex items-start justify-between flex-wrap gap-2 pb-2 border-b border-slate-200">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-base font-extrabold text-[#002147]">
                    {activeReport.districtName}, {activeReport.state}
                  </h4>
                  <span className="bg-slate-200 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded">
                    Terrain: {activeReport.terrainType}
                  </span>
                  <span
                    className="text-xs font-bold px-2.5 py-0.5 rounded text-white shadow-2xs"
                    style={{ backgroundColor: activeReport.warningColor }}
                  >
                    {activeReport.warningLabelEn.split('—')[0].trim()}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5">
                  {language === 'hi' ? activeReport.warningLabelHi : activeReport.warningLabelEn}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-mono bg-white px-2 py-1 rounded border border-slate-300">
                  Normal Max: <strong>{activeReport.climatologicalNormal}°C</strong>
                </span>
                <span className="text-xs font-mono bg-white px-2 py-1 rounded border border-slate-300">
                  Observed Max: <strong>{activeReport.maxTemp}°C</strong>
                </span>
                <span
                  className={`text-xs font-mono px-2.5 py-1 rounded font-extrabold ${
                    activeReport.departure > 0
                      ? 'bg-red-100 text-red-800 border border-red-300'
                      : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  }`}
                >
                  Departure: {activeReport.departure > 0 ? `+${activeReport.departure}` : activeReport.departure}°C
                </span>
              </div>
            </div>

            {/* 3 Metric Cards: Thermal Departure, Humidex Stress, Warm Night */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Departure Status */}
              <div className="bg-white p-3 rounded border border-slate-200 space-y-1">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="font-bold">IMD Heatwave Classification</span>
                  <Flame className="w-4 h-4 text-[#ea580c]" />
                </div>
                <div className="text-lg font-extrabold text-[#002147] font-mono">
                  {activeReport.heatwaveStatus.replace(/_/g, ' ')}
                </div>
                <div className="text-[11px] text-slate-600">
                  {activeReport.departure >= 6.4
                    ? 'Departure > 6.4°C (Severe Heat Wave Condition)'
                    : activeReport.departure >= 4.5
                    ? 'Departure +4.5°C to +6.4°C (Heat Wave Condition)'
                    : 'Within normal climatological range'}
                </div>
              </div>

              {/* Humidex / Thermal Stress */}
              <div className="bg-white p-3 rounded border border-slate-200 space-y-1">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="font-bold">Humidex Thermal Stress Index</span>
                  <Droplets className="w-4 h-4 text-sky-500" />
                </div>
                <div className="text-lg font-extrabold text-[#002147] font-mono">
                  {activeReport.humidex} —{' '}
                  <span className="text-amber-700">{activeReport.heatStressCategory}</span>
                </div>
                <div className="text-[11px] text-slate-600">
                  Combines temperature & relative humidity into felt bioclimatic stress.
                </div>
              </div>

              {/* Warm Night Alert */}
              <div className="bg-white p-3 rounded border border-slate-200 space-y-1">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="font-bold">Warm Night Criteria</span>
                  <Sun className="w-4 h-4 text-amber-500" />
                </div>
                <div className="text-lg font-extrabold font-mono text-[#002147]">
                  {activeReport.isWarmNight ? (
                    <span className="text-red-600">ACTIVE WARM NIGHT</span>
                  ) : (
                    <span className="text-emerald-700">NORMAL NIGHT COOLING</span>
                  )}
                </div>
                <div className="text-[11px] text-slate-600">
                  {activeReport.isWarmNight
                    ? 'Night minimum failed to cool below 28°C; increases cardiac heat stress'
                    : 'Adequate nocturnal thermal dissipation observed'}
                </div>
              </div>
            </div>

            {/* 5-Day Outlook Progression Bars */}
            <div className="bg-white p-3 rounded border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                  5-Day Heatwave Trajectory Outlook (Days 1–5)
                </span>
                <span className="text-[10px] font-mono text-slate-400">IMD Numerical Model Ensemble</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center">
                {activeReport.dayForecast.map(f => (
                  <div
                    key={f.day}
                    className={`p-2 rounded border transition-all ${
                      f.day === activeDayForecast ? 'ring-2 ring-[#ea580c] bg-amber-50/50' : 'bg-slate-50'
                    }`}
                  >
                    <div className="text-[10px] font-bold text-slate-500">{f.dateStr}</div>
                    <div className="text-base font-extrabold font-mono text-[#002147] mt-0.5">
                      {f.forecastMaxTemp}°C
                    </div>
                    <div className="text-[10px] font-mono text-slate-600">
                      Dep: {f.forecastDeparture > 0 ? `+${f.forecastDeparture}` : f.forecastDeparture}°C
                    </div>
                    <div
                      className="mt-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: f.warningColor }}
                      title={f.warningLevel}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Health Action Plan (HAP) & NDMA Advisories */}
            <div className="bg-red-50/70 border border-red-200 rounded p-3 space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-red-900">
                <HeartPulse className="w-4 h-4 text-red-600" />
                <span>NDMA & MoES District Heat Action Plan (HAP) Emergency Advisory</span>
              </div>
              <ul className="space-y-1 text-xs text-red-950 pl-4 list-disc">
                {activeReport.healthAdvisory.map((adv, i) => (
                  <li key={i}>{adv}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Highest Heat Departures across India (Top 6 Leaderboard) */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
              Districts with Highest Climatological Departures Today
            </span>
            <span className="text-[10px] text-slate-400 font-mono">Real-Time Open-Meteo Ingest</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {topHeatDistricts.map(d => (
              <button
                key={d.districtId}
                onClick={() => onSelectDistrict(d.districtId)}
                className="bg-white p-2.5 rounded border border-slate-200 hover:border-[#ea580c] text-left transition-all shadow-2xs hover:shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-[#002147] truncate">{d.districtName}</span>
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: d.warningColor }}
                  />
                </div>
                <div className="text-[10px] text-slate-500 truncate">{d.state}</div>
                <div className="flex items-baseline justify-between mt-1 pt-1 border-t border-slate-100 font-mono text-xs">
                  <span className="font-extrabold text-slate-800">{d.maxTemp}°C</span>
                  <span className="text-red-600 font-bold text-[11px]">
                    +{d.departure}°C
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Official IMD Criteria Reference Note */}
        <div className="bg-slate-100 p-2.5 rounded flex items-start gap-2 text-xs text-slate-600">
          <Info className="w-4 h-4 text-[#ea580c] shrink-0 mt-0.5" />
          <div className="space-y-0.5 leading-relaxed text-[11px]">
            <strong>Official IMD Heat Wave Definition:</strong> Heat Wave is considered if maximum temperature of a station reaches at least <strong>40°C</strong> for Plains, <strong>37°C</strong> for Coastal, and <strong>30°C</strong> for Hilly regions. Departure from normal is <strong>+4.5°C to +6.4°C</strong> for Heat Wave, and <strong>&gt; +6.4°C</strong> for Severe Heat Wave.
          </div>
        </div>
      </div>
    </div>
  );
};
