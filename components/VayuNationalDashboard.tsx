'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useAllDistricts } from '@/lib/districtEngine';
import { getVayuEvents, VayuEventLogEntry, subscribeToVayuEvents } from '@/lib/vayuEventLog';
import {
  ShieldAlert,
  BarChart3,
  Activity,
  Pause,
  Play,
  Layers,
  ChevronRight
} from 'lucide-react';

interface Props {
  onSelectDistrict: (districtId: string) => void;
  onSelectState?: (stateName: string) => void;
  language?: 'en' | 'hi';
}

export const VayuNationalDashboard: React.FC<Props> = ({
  onSelectDistrict,
  onSelectState
}) => {
  const allDistricts = useAllDistricts();
  const [isFeedPaused, setIsFeedPaused] = useState(false);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string | null>(null);
  const [events, setEvents] = useState<VayuEventLogEntry[]>(() => getVayuEvents());

  // Subscribe to real-time events from vayuEventLog
  useEffect(() => {
    const unsub = subscribeToVayuEvents(() => {
      if (!isFeedPaused) {
        setEvents(getVayuEvents());
      }
    });
    return unsub;
  }, [isFeedPaused]);

  // 1. TOP STATS ROW
  const stats = useMemo(() => {
    const total = allDistricts.length;
    let healthy = 0;
    let degraded = 0;
    let critical = 0;
    let offline = 0;

    for (const d of allDistricts) {
      if (d.health === 'HEALTHY') healthy++;
      else if (d.health === 'DEGRADED') degraded++;
      else if (d.health === 'CRITICAL') critical++;
      else if (d.health === 'OFFLINE') offline++;
    }

    const live = healthy + degraded + critical;
    const coverage = total > 0 ? ((live / total) * 100).toFixed(1) : '0.0';

    return {
      total,
      healthy,
      activeFaults: degraded + critical,
      critical,
      offline,
      coverage
    };
  }, [allDistricts]);

  // 2. FAULT LEADERBOARD (Top 10 most-faulted districts)
  const leaderboard = useMemo(() => {
    const faulted = allDistricts.filter(d => d.qcReport && d.qcReport.faults.length > 0);
    faulted.sort((a, b) => (b.qcReport?.faults.length || 0) - (a.qcReport?.faults.length || 0));
    return faulted.slice(0, 10);
  }, [allDistricts]);

  // 3. FAULT TYPE BREAKDOWN
  const categoryBreakdown = useMemo(() => {
    const counts: Record<string, number> = {
      'Gross Limit': 0,
      'Soft Limit': 0,
      'Step Check': 0,
      'Internal Consistency': 0,
      'Persistence': 0,
      'Missing Data / Comms': 0,
      'Statistical Anomaly': 0,
      'India-Specific Context': 0
    };

    for (const d of allDistricts) {
      if (!d.qcReport) continue;
      for (const f of d.qcReport.faults) {
        for (const cat of Object.keys(counts)) {
          if (f.category.toLowerCase().includes(cat.toLowerCase())) {
            counts[cat]++;
            break;
          }
        }
      }
    }

    const maxCount = Math.max(1, ...Object.values(counts));
    return Object.entries(counts).map(([cat, count]) => ({
      name: cat,
      count,
      percent: Math.round((count / maxCount) * 100)
    }));
  }, [allDistricts]);

  // 4. INDIA STATE HEALTH GRID (28 states + 8 UTs)
  const stateHealthGrid = useMemo(() => {
    const stateMap = new Map<string, { total: number; worstHealth: 'HEALTHY' | 'DEGRADED' | 'CRITICAL' | 'OFFLINE'; faults: number }>();

    for (const d of allDistricts) {
      const st = d.district.state;
      if (!stateMap.has(st)) {
        stateMap.set(st, { total: 0, worstHealth: 'HEALTHY', faults: 0 });
      }
      const entry = stateMap.get(st)!;
      entry.total++;
      if (d.health === 'CRITICAL') {
        entry.worstHealth = 'CRITICAL';
        entry.faults++;
      } else if (d.health === 'DEGRADED') {
        if (entry.worstHealth !== 'CRITICAL') entry.worstHealth = 'DEGRADED';
        entry.faults++;
      } else if (d.health === 'OFFLINE' && entry.worstHealth === 'HEALTHY') {
        entry.worstHealth = 'OFFLINE';
      }
    }

    return Array.from(stateMap.entries())
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.faults - a.faults || a.name.localeCompare(b.name));
  }, [allDistricts]);

  return (
    <div className="space-y-4">
      {/* 1. TOP STATS ROW */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs hover-lift transition-all">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
            <span>Districts Monitored</span>
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          </div>
          <div className="text-2xl font-extrabold text-[#002147] font-mono mt-1">{stats.total}</div>
          <div className="text-[10px] text-slate-500 mt-0.5 font-medium">All 28 States &amp; 8 UTs</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-emerald-200 shadow-xs hover-lift transition-all">
          <div className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider flex items-center justify-between">
            <span>Live &amp; Healthy</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 glow-emerald" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-600 font-mono mt-1">{stats.healthy}</div>
          <div className="text-[10px] text-emerald-700 mt-0.5 font-medium">WMO Flag 1 Verified</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-amber-200 shadow-xs hover-lift transition-all">
          <div className="text-[11px] font-bold text-amber-700 uppercase tracking-wider flex items-center justify-between">
            <span>Active Faults</span>
            <span className="w-2 h-2 rounded-full bg-amber-500 glow-amber" />
          </div>
          <div className="text-2xl font-extrabold text-amber-600 font-mono mt-1">{stats.activeFaults}</div>
          <div className="text-[10px] text-amber-700 mt-0.5 font-medium">Under Diagnostic Isolation</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-red-200 shadow-xs hover-lift transition-all">
          <div className="text-[11px] font-bold text-red-700 uppercase tracking-wider flex items-center justify-between">
            <span>Critical Alerts</span>
            <span className="w-2 h-2 rounded-full bg-red-600 glow-rose animate-pulse" />
          </div>
          <div className="text-2xl font-extrabold text-red-600 font-mono mt-1">{stats.critical}</div>
          <div className="text-[10px] text-red-700 mt-0.5 font-medium">Immediate Field Work Order</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-300 shadow-xs hover-lift transition-all">
          <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center justify-between">
            <span>Offline Stations</span>
            <span className="w-2 h-2 rounded-full bg-slate-400" />
          </div>
          <div className="text-2xl font-extrabold text-slate-700 font-mono mt-1">{stats.offline}</div>
          <div className="text-[10px] text-slate-500 mt-0.5 font-medium">Comms link loss (&gt;15m)</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-blue-200 shadow-xs hover-lift transition-all">
          <div className="text-[11px] font-bold text-blue-700 uppercase tracking-wider flex items-center justify-between">
            <span>Data Coverage %</span>
            <span className="w-2 h-2 rounded-full bg-sky-500 glow-sky" />
          </div>
          <div className="text-2xl font-extrabold text-blue-600 font-mono mt-1">{stats.coverage}%</div>
          <div className="text-[10px] text-blue-700 mt-0.5 font-medium">Open-Meteo Ingest Pipeline</div>
        </div>
      </div>

      {/* 2 & 3: Two-Column Row: Leaderboard Left, Category Breakdown Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: Fault Leaderboard (7 cols) */}
        <div className="lg:col-span-7 bg-white border-2 border-slate-200 rounded-lg p-4 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-red-600" />
              <h3 className="font-extrabold text-sm uppercase text-[#002147]">
                Active Fault Leaderboard (Top 10 Districts)
              </h3>
            </div>
            <span className="text-xs text-slate-500 font-mono">Live QC Gating</span>
          </div>

          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase font-bold text-[10px]">
                  <th className="py-2 px-2.5">District</th>
                  <th className="py-2 px-2.5">State</th>
                  <th className="py-2 px-2.5 text-center">Faults</th>
                  <th className="py-2 px-2.5">Worst Fault Code</th>
                  <th className="py-2 px-2.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {leaderboard.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-slate-400 font-sans">
                      All monitored stations currently healthy. No active anomalies registered.
                    </td>
                  </tr>
                ) : (
                  leaderboard.map(item => {
                    const worst = item.qcReport?.faults[0];
                    return (
                      <tr
                        key={item.district.id}
                        onClick={() => onSelectDistrict(item.district.id)}
                        className="hover:bg-slate-50 cursor-pointer transition-colors"
                      >
                        <td className="py-2 px-2.5 font-sans font-bold text-[#002147]">
                          {item.district.name}
                        </td>
                        <td className="py-2 px-2.5 font-sans text-slate-600">{item.district.state}</td>
                        <td className="py-2 px-2.5 text-center font-bold">
                          <span className="px-2 py-0.5 rounded bg-red-100 text-red-700">
                            {item.qcReport?.faults.length || 0}
                          </span>
                        </td>
                        <td className="py-2 px-2.5 text-red-600 font-bold truncate max-w-[180px]">
                          {worst?.code || 'NOMINAL'}
                        </td>
                        <td className="py-2 px-2.5 text-right font-sans">
                          <button className="text-sky-600 hover:text-sky-800 font-bold text-[11px] flex items-center justify-end gap-0.5 ml-auto">
                            Inspect <ChevronRight className="w-3 h-3" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Fault Category Breakdown (5 cols) */}
        <div className="lg:col-span-5 bg-white border-2 border-slate-200 rounded-lg p-4 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-[#002147]" />
              <h3 className="font-extrabold text-sm uppercase text-[#002147]">
                Faults by WMO Category
              </h3>
            </div>
            <span className="text-xs text-slate-500 font-mono">8 WMO Classes</span>
          </div>

          <div className="mt-3 space-y-2.5">
            {categoryBreakdown.map(cat => (
              <div
                key={cat.name}
                onClick={() => setSelectedCategoryFilter(cat.name === selectedCategoryFilter ? null : cat.name)}
                className={`p-2 rounded cursor-pointer transition-colors ${
                  selectedCategoryFilter === cat.name ? 'bg-sky-50 border border-sky-300' : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold text-slate-700">{cat.name}</span>
                  <span className="font-mono font-bold text-slate-900">{cat.count}</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-[#FF9933] transition-all duration-300"
                    style={{ width: `${Math.max(5, cat.percent)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. ACTIVE ALERTS FEED (Real-Time Scrolling) */}
      <div className="bg-slate-900 text-white rounded-lg p-3.5 shadow-sm border border-slate-800">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span className="font-bold text-xs uppercase tracking-wider">
              Real-Time Sensor Anomaly Telemetry Feed
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsFeedPaused(p => !p)}
              className="flex items-center gap-1 text-[11px] bg-slate-800 hover:bg-slate-700 px-2 py-0.5 rounded text-slate-300 font-mono"
            >
              {isFeedPaused ? <Play className="w-3 h-3 text-emerald-400" /> : <Pause className="w-3 h-3 text-amber-400" />}
              <span>{isFeedPaused ? 'Resume Feed' : 'Pause Feed'}</span>
            </button>
            <span className="text-[10px] text-slate-500 font-mono">Max 100 entries</span>
          </div>
        </div>

        <div className="mt-2.5 max-h-40 overflow-y-auto space-y-1.5 font-mono text-xs pr-1">
          {events.length === 0 ? (
            <div className="text-slate-500 text-[11px] py-3 text-center">
              Awaiting incoming telemetry anomaly events from background poller...
            </div>
          ) : (
            events.slice(0, 50).map(evt => (
              <div
                key={evt.id}
                onClick={() => onSelectDistrict(evt.districtId)}
                className="flex items-center justify-between p-1.5 rounded bg-slate-800/60 hover:bg-slate-800 cursor-pointer transition-colors text-[11px]"
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="text-slate-400 text-[10px]">{evt.timeFormatted}</span>
                  <span
                    className={`w-2 h-2 rounded-full ${
                      evt.severity === 'CRITICAL'
                        ? 'bg-red-500'
                        : evt.severity === 'WARNING'
                        ? 'bg-amber-500'
                        : evt.severity === 'RESOLVED'
                        ? 'bg-emerald-500'
                        : 'bg-blue-400'
                    }`}
                  />
                  <span className="font-bold text-white">
                    {evt.districtName}, {evt.state}
                  </span>
                  <span className="text-slate-400">—</span>
                  <span className="text-[#FF9933] font-bold">{evt.faultCode}</span>
                  <span className="text-slate-300 truncate hidden sm:inline">{evt.message}</span>
                </div>
                <span className="text-[10px] text-sky-400 font-sans ml-2 shrink-0">Inspect →</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 5. INDIA STATE HEALTH GRID (36 States & UTs) */}
      <div className="bg-white border-2 border-slate-200 rounded-lg p-4 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#002147]" />
            <h3 className="font-extrabold text-sm uppercase text-[#002147]">
              All-India State & UT Health Grid (36 Administrative Units)
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-mono">Worst District Severity</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
          {stateHealthGrid.map(st => {
            const isCrit = st.worstHealth === 'CRITICAL';
            const isDeg = st.worstHealth === 'DEGRADED';
            const isOff = st.worstHealth === 'OFFLINE';

            return (
              <button
                key={st.name}
                onClick={() => onSelectState?.(st.name)}
                className={`p-2.5 rounded-lg border text-left hover-lift transition-all ${
                  isCrit
                    ? 'bg-red-50 border-red-200 hover:border-red-400 hover:shadow-red-100'
                    : isDeg
                    ? 'bg-amber-50 border-amber-200 hover:border-amber-400 hover:shadow-amber-100'
                    : isOff
                    ? 'bg-slate-100 border-slate-300'
                    : 'bg-emerald-50 border-emerald-200 hover:border-emerald-400 hover:shadow-emerald-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold truncate text-[#002147]">{st.name}</span>
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isCrit ? 'bg-red-600' : isDeg ? 'bg-amber-500' : isOff ? 'bg-slate-500' : 'bg-emerald-600'
                    }`}
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1 font-mono">
                  <span>{st.total} Dists</span>
                  <span className={st.faults > 0 ? 'text-red-700 font-bold' : 'text-emerald-700'}>
                    {st.faults > 0 ? `${st.faults} Faults` : 'Nominal'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
