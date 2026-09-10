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

    return counts;
  }, [allDistricts]);

  // 4. STATE-BY-STATE HEALTH (for all 36 States/UTs)
  const stateHealthGrid = useMemo(() => {
    const stateMap = new Map<string, { total: number; faults: number; worstHealth: string }>();

    for (const d of allDistricts) {
      const st = d.district.state;
      if (!stateMap.has(st)) {
        stateMap.set(st, { total: 0, faults: 0, worstHealth: 'HEALTHY' });
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
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3">
        <div className="bg-slate-900/80 backdrop-blur-xl p-3.5 rounded-xl border border-slate-800 shadow-lg hover:border-sky-500/40 transition-all">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Districts Monitored</span>
            <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
          </div>
          <div className="text-2xl font-extrabold text-white font-mono mt-1">{stats.total}</div>
          <div className="text-[10px] text-slate-400 mt-0.5 font-medium">All 28 States &amp; 8 UTs</div>
        </div>

        <div className="bg-slate-900/80 backdrop-blur-xl p-3.5 rounded-xl border border-slate-800 shadow-lg hover:border-emerald-500/40 transition-all">
          <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center justify-between">
            <span>Live &amp; Healthy</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-400 font-mono mt-1">{stats.healthy}</div>
          <div className="text-[10px] text-emerald-400/80 mt-0.5 font-medium">WMO Flag 1 Verified</div>
        </div>

        <div className="bg-slate-900/80 backdrop-blur-xl p-3.5 rounded-xl border border-slate-800 shadow-lg hover:border-amber-500/40 transition-all">
          <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center justify-between">
            <span>Active Faults</span>
            <span className="w-2 h-2 rounded-full bg-amber-400" />
          </div>
          <div className="text-2xl font-extrabold text-amber-400 font-mono mt-1">{stats.activeFaults}</div>
          <div className="text-[10px] text-amber-400/80 mt-0.5 font-medium">Under Diagnostic Isolation</div>
        </div>

        <div className="bg-slate-900/80 backdrop-blur-xl p-3.5 rounded-xl border border-slate-800 shadow-lg hover:border-red-500/40 transition-all">
          <div className="text-[11px] font-bold text-red-400 uppercase tracking-wider flex items-center justify-between">
            <span>Critical Alerts</span>
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          </div>
          <div className="text-2xl font-extrabold text-red-400 font-mono mt-1">{stats.critical}</div>
          <div className="text-[10px] text-red-400/80 mt-0.5 font-medium">Immediate Work Order</div>
        </div>

        <div className="bg-slate-900/80 backdrop-blur-xl p-3.5 rounded-xl border border-slate-800 shadow-lg hover:border-slate-700 transition-all">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Offline Stations</span>
            <span className="w-2 h-2 rounded-full bg-slate-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-300 font-mono mt-1">{stats.offline}</div>
          <div className="text-[10px] text-slate-500 mt-0.5 font-medium">Comms link loss (&gt;15m)</div>
        </div>

        <div className="bg-slate-900/80 backdrop-blur-xl p-3.5 rounded-xl border border-slate-800 shadow-lg hover:border-blue-500/40 transition-all">
          <div className="text-[11px] font-bold text-sky-400 uppercase tracking-wider flex items-center justify-between">
            <span>Data Coverage %</span>
            <span className="w-2 h-2 rounded-full bg-sky-400" />
          </div>
          <div className="text-2xl font-extrabold text-sky-300 font-mono mt-1">{stats.coverage}%</div>
          <div className="text-[10px] text-sky-400/80 mt-0.5 font-medium">Open-Meteo Pipeline</div>
        </div>
      </div>

      {/* 2 & 3: Two-Column Row: Leaderboard Left, Category Breakdown Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: Fault Leaderboard (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-xl p-4 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-red-400" />
              <h3 className="font-extrabold text-sm uppercase text-white">
                Active Fault Leaderboard (Top 10 Districts)
              </h3>
            </div>
            <span className="text-xs text-slate-400 font-mono">Live QC Gating</span>
          </div>

          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-slate-950/80 text-slate-400 border-b border-slate-800 uppercase font-bold text-[10px]">
                  <th className="py-2.5 px-3">District</th>
                  <th className="py-2.5 px-3">State</th>
                  <th className="py-2.5 px-3 text-center">Faults</th>
                  <th className="py-2.5 px-3">Worst Fault Code</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 font-mono">
                {leaderboard.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-slate-500 font-sans">
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
                        className="hover:bg-slate-800/60 cursor-pointer transition-colors"
                      >
                        <td className="py-2.5 px-3 font-sans font-bold text-white">
                          {item.district.name}
                        </td>
                        <td className="py-2.5 px-3 font-sans text-slate-400">{item.district.state}</td>
                        <td className="py-2.5 px-3 text-center font-bold">
                          <span className="px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-800">
                            {item.qcReport?.faults.length || 0}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-red-400 font-bold truncate max-w-[180px]">
                          {worst?.code || 'NOMINAL'}
                        </td>
                        <td className="py-2.5 px-3 text-right font-sans">
                          <button className="text-sky-400 hover:text-sky-300 font-bold text-[11px] flex items-center justify-end gap-0.5 ml-auto">
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
        <div className="lg:col-span-5 bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-xl p-4 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-sky-400" />
              <h3 className="font-extrabold text-sm uppercase text-white">
                Faults by WMO Category
              </h3>
            </div>
            {selectedCategoryFilter && (
              <button
                onClick={() => setSelectedCategoryFilter(null)}
                className="text-[10px] text-sky-400 hover:text-sky-300 font-mono"
              >
                Clear Filter
              </button>
            )}
          </div>

          <div className="mt-3 space-y-2">
            {Object.entries(categoryBreakdown).map(([cat, count]) => {
              const total = Object.values(categoryBreakdown).reduce((a, b) => a + b, 0);
              const pct = total > 0 ? ((count / total) * 100).toFixed(0) : 0;
              const isSelected = selectedCategoryFilter === cat;

              return (
                <div
                  key={cat}
                  onClick={() => setSelectedCategoryFilter(isSelected ? null : cat)}
                  className={`p-2 rounded-lg cursor-pointer transition-all border ${
                    isSelected
                      ? 'bg-slate-800 border-sky-400 shadow-xs'
                      : 'hover:bg-slate-800/50 border-slate-800/80'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-slate-200">{cat}</span>
                    <span className="font-mono text-slate-400">
                      {count} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-sky-500 to-blue-600 h-1.5 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 4. REAL-TIME EVENT STREAM (Live Tick Log) */}
      <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-xl p-4 shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-400 animate-pulse" />
            <h3 className="font-extrabold text-sm uppercase text-white">
              Real-Time Observation QC Event Feed
            </h3>
          </div>
          <button
            onClick={() => setIsFeedPaused(p => !p)}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-white bg-slate-800 border border-slate-700 px-2.5 py-1 rounded"
          >
            {isFeedPaused ? <Play className="w-3.5 h-3.5 text-emerald-400" /> : <Pause className="w-3.5 h-3.5 text-amber-400" />}
            <span>{isFeedPaused ? 'Resume' : 'Pause'}</span>
          </button>
        </div>

        <div className="space-y-1.5 max-h-48 overflow-y-auto font-mono text-xs pr-1">
          {events.length === 0 ? (
            <div className="py-4 text-center text-slate-500 font-sans">
              Listening for automated ingest telemetry packets...
            </div>
          ) : (
            events.slice(0, 8).map(evt => (
              <div
                key={evt.id}
                onClick={() => onSelectDistrict(evt.districtId)}
                className="p-2 rounded bg-slate-950/70 border border-slate-800/80 hover:border-sky-500/50 cursor-pointer flex items-center justify-between text-[11px] transition-colors"
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="text-slate-400">{evt.timestamp}</span>
                  <span className="font-bold text-white font-sans">{evt.districtName}</span>
                  <span className="text-amber-400 font-bold">{evt.faultCode}</span>
                  <span className="text-slate-400 truncate hidden sm:inline">{evt.message}</span>
                </div>
                <span className="text-[10px] text-sky-400 font-sans ml-2 shrink-0">Inspect →</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 5. INDIA STATE HEALTH GRID (36 States & UTs) */}
      <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-xl p-4 shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-400" />
            <h3 className="font-extrabold text-sm uppercase text-white">
              All-India State &amp; UT Health Grid (36 Administrative Units)
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">Worst District Severity</span>
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
                className={`p-2.5 rounded-lg border text-left transition-all ${
                  isCrit
                    ? 'bg-red-950/40 border-red-800/80 hover:border-red-500'
                    : isDeg
                    ? 'bg-amber-950/40 border-amber-800/80 hover:border-amber-500'
                    : isOff
                    ? 'bg-slate-950/60 border-slate-800 hover:border-slate-600'
                    : 'bg-slate-950/70 border-slate-800 hover:border-emerald-500/60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold truncate text-slate-200">{st.name}</span>
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isCrit ? 'bg-red-500 animate-pulse' : isDeg ? 'bg-amber-400' : isOff ? 'bg-slate-500' : 'bg-emerald-400'
                    }`}
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1 font-mono">
                  <span>{st.total} Dists</span>
                  <span className={st.faults > 0 ? 'text-red-400 font-bold' : 'text-emerald-400'}>
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
