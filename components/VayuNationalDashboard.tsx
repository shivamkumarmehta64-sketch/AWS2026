'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useAllDistricts } from '@/lib/districtEngine';
import { getVayuEvents, VayuEventLogEntry, subscribeToVayuEvents } from '@/lib/vayuEventLog';
import { ShieldAlert, BarChart3, Activity, Pause, Play, Layers, ChevronRight, CheckCircle2 } from 'lucide-react';

interface Props {
  onSelectDistrict: (districtId: string) => void;
  onSelectState?: (stateName: string) => void;
  language?: 'en' | 'hi';
}

export const VayuNationalDashboard: React.FC<Props> = ({ onSelectDistrict, onSelectState }) => {
  const allDistricts = useAllDistricts();
  const [isFeedPaused, setIsFeedPaused] = useState(false);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string | null>(null);
  const [events, setEvents] = useState<VayuEventLogEntry[]>(() => getVayuEvents());

  useEffect(() => {
    const unsub = subscribeToVayuEvents(() => {
      if (!isFeedPaused) {
        setEvents(getVayuEvents());
      }
    });
    return unsub;
  }, [isFeedPaused]);

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

    return { total, healthy, activeFaults: degraded + critical, critical, offline, coverage };
  }, [allDistricts]);

  const leaderboard = useMemo(() => {
    const faulted = allDistricts.filter(d => d.qcReport && d.qcReport.faults.length > 0);
    faulted.sort((a, b) => (b.qcReport?.faults.length || 0) - (a.qcReport?.faults.length || 0));
    return faulted.slice(0, 10);
  }, [allDistricts]);

  const categoryBreakdown = useMemo(() => {
    const counts: Record<string, number> = {
      'Gross Limit': 0, 'Soft Limit': 0, 'Step Check': 0,
      'Internal Consistency': 0, 'Persistence': 0, 'Missing Data / Comms': 0,
      'Statistical Anomaly': 0, 'India-Specific Context': 0
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
    <div className="space-y-6 text-slate-800">
      
      {/* Top Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: 'Districts Monitored', value: stats.total, desc: 'All 28 States & 8 UTs', color: 'bg-blue-50 border-blue-200 text-blue-900', dot: 'bg-blue-600' },
          { label: 'Live & Healthy', value: stats.healthy, desc: 'WMO Flag 1 Verified', color: 'bg-green-50 border-green-200 text-green-900', dot: 'bg-green-600' },
          { label: 'Active Faults', value: stats.activeFaults, desc: 'Under Diagnostic Isolation', color: 'bg-amber-50 border-amber-200 text-amber-900', dot: 'bg-amber-500' },
          { label: 'Critical Alerts', value: stats.critical, desc: 'Immediate Work Order', color: 'bg-red-50 border-red-200 text-red-900', dot: 'bg-red-600' },
          { label: 'Offline Stations', value: stats.offline, desc: 'Comms link loss (>15m)', color: 'bg-slate-100 border-slate-300 text-slate-800', dot: 'bg-slate-500' },
          { label: 'Data Coverage %', value: stats.coverage + '%', desc: 'Open-Meteo Pipeline', color: 'bg-blue-50 border-blue-200 text-blue-900', dot: 'bg-blue-500' },
        ].map((stat, i) => (
          <div key={i} className={`p-4 rounded border shadow-sm ${stat.color}`}>
            <div className="text-[10px] font-bold uppercase tracking-wider flex items-center justify-between opacity-80">
              <span>{stat.label}</span>
              <span className={`w-2 h-2 rounded-full ${stat.dot}`} />
            </div>
            <div className="text-2xl font-extrabold font-mono mt-2">{stat.value}</div>
            <div className="text-[10px] opacity-70 mt-1 font-medium">{stat.desc}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Fault Leaderboard */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded shadow-sm overflow-hidden">
          <div className="bg-slate-100 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-red-700" />
              <h3 className="font-bold text-sm uppercase text-slate-800">Active Fault Register (Top 10)</h3>
            </div>
          </div>
          <div className="overflow-x-auto p-4">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold uppercase text-[11px]">
                  <th className="py-3 px-3">District</th>
                  <th className="py-3 px-3">State</th>
                  <th className="py-3 px-3 text-center">Fault Count</th>
                  <th className="py-3 px-3">Worst Fault Code</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {leaderboard.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-slate-500">
                      <CheckCircle2 className="w-6 h-6 text-green-500 mx-auto mb-2" />
                      All monitored stations currently healthy. No active anomalies registered.
                    </td>
                  </tr>
                ) : (
                  leaderboard.map(item => (
                    <tr key={item.district.id} onClick={() => onSelectDistrict(item.district.id)} className="hover:bg-slate-50 cursor-pointer transition-colors">
                      <td className="py-3 px-3 font-semibold text-slate-800">{item.district.name}</td>
                      <td className="py-3 px-3 text-slate-600">{item.district.state}</td>
                      <td className="py-3 px-3 text-center">
                        <span className="px-2.5 py-1 rounded-full bg-red-100 text-red-800 font-bold text-xs">{item.qcReport?.faults.length || 0}</span>
                      </td>
                      <td className="py-3 px-3 text-red-700 font-bold truncate max-w-[180px]">
                        {item.qcReport?.faults[0]?.code || 'NOMINAL'}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button className="text-blue-700 hover:text-blue-900 font-bold text-xs flex items-center justify-end gap-1 ml-auto">
                          Inspect <ChevronRight className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Fault Category Breakdown */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded shadow-sm overflow-hidden">
          <div className="bg-slate-100 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-700" />
              <h3 className="font-bold text-sm uppercase text-slate-800">Faults by WMO Category</h3>
            </div>
            {selectedCategoryFilter && (
              <button onClick={() => setSelectedCategoryFilter(null)} className="text-xs text-blue-700 hover:underline">
                Clear Filter
              </button>
            )}
          </div>
          <div className="p-4 space-y-3">
            {Object.entries(categoryBreakdown).map(([cat, count]) => {
              const total = Object.values(categoryBreakdown).reduce((a, b) => a + b, 0);
              const pct = total > 0 ? ((count / total) * 100).toFixed(0) : 0;
              const isSelected = selectedCategoryFilter === cat;

              return (
                <div key={cat} onClick={() => setSelectedCategoryFilter(isSelected ? null : cat)} className={`p-3 rounded border cursor-pointer transition-all ${isSelected ? 'bg-blue-50 border-blue-400' : 'bg-white border-slate-200 hover:bg-slate-50'}`}>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="font-semibold text-slate-800">{cat}</span>
                    <span className="text-slate-600 font-mono">{count} ({pct}%)</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div style={{ width: `${pct}%` }} className="bg-blue-600 h-2 rounded-full transition-all duration-500" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Real-Time Event Stream */}
      <div className="bg-white border border-slate-200 rounded shadow-sm overflow-hidden">
        <div className="bg-slate-100 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-green-700" />
            <h3 className="font-bold text-sm uppercase text-slate-800">Live Observation Event Log</h3>
          </div>
          <button onClick={() => setIsFeedPaused(p => !p)} className="flex items-center gap-1 text-xs text-slate-600 hover:text-slate-900 bg-white border border-slate-300 px-3 py-1.5 rounded">
            {isFeedPaused ? <Play className="w-4 h-4 text-green-700" /> : <Pause className="w-4 h-4 text-amber-600" />}
            <span>{isFeedPaused ? 'Resume Feed' : 'Pause Feed'}</span>
          </button>
        </div>
        <div className="p-4 space-y-2 max-h-64 overflow-y-auto font-mono text-sm">
          {events.length === 0 ? (
            <div className="py-6 text-center text-slate-500 font-sans">Awaiting incoming telemetry packets...</div>
          ) : (
            events.slice(0, 10).map(evt => (
              <div key={evt.id} onClick={() => onSelectDistrict(evt.districtId)} className="p-3 rounded bg-slate-50 border border-slate-200 hover:border-blue-400 cursor-pointer flex items-center justify-between transition-colors">
                <div className="flex items-center gap-3">
                  <span className="text-slate-500">{evt.timestamp}</span>
                  <span className="font-bold text-slate-900 font-sans">{evt.districtName}</span>
                  <span className="text-amber-700 font-bold bg-amber-100 px-2 py-0.5 rounded text-xs">{evt.faultCode}</span>
                  <span className="text-slate-600 hidden md:inline">{evt.message}</span>
                </div>
                <span className="text-blue-700 font-sans font-bold text-xs">Inspect &rarr;</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* India State Health Grid */}
      <div className="bg-white border border-slate-200 rounded shadow-sm overflow-hidden">
        <div className="bg-slate-100 px-4 py-3 border-b border-slate-200 flex items-center gap-2">
          <Layers className="w-5 h-5 text-indigo-700" />
          <h3 className="font-bold text-sm uppercase text-slate-800">State / UT Network Status (36 Units)</h3>
        </div>
        <div className="p-4 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {stateHealthGrid.map(st => {
            const isCrit = st.worstHealth === 'CRITICAL';
            const isDeg = st.worstHealth === 'DEGRADED';
            const isOff = st.worstHealth === 'OFFLINE';

            return (
              <button key={st.name} onClick={() => onSelectState?.(st.name)} className={`p-3 rounded border text-left transition-colors ${isCrit ? 'bg-red-50 border-red-300' : isDeg ? 'bg-amber-50 border-amber-300' : isOff ? 'bg-slate-100 border-slate-300' : 'bg-white border-slate-200 hover:border-green-400'}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-800 truncate pr-2">{st.name}</span>
                  <span className={`w-2 h-2 shrink-0 rounded-full ${isCrit ? 'bg-red-600' : isDeg ? 'bg-amber-500' : isOff ? 'bg-slate-500' : 'bg-green-500'}`} />
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-600">
                  <span>{st.total} Units</span>
                  <span className={`font-bold ${st.faults > 0 ? 'text-red-700' : 'text-green-700'}`}>{st.faults > 0 ? `${st.faults} Alerts` : 'Nominal'}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
