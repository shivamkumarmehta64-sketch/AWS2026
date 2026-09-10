'use client';

import React, { useState, useMemo } from 'react';
import { useDistrictData, useAllDistricts } from '@/lib/districtEngine';
import { exportEventLogToCSV, getVayuEvents } from '@/lib/vayuEventLog';
import {
  X,
  RefreshCw,
  Clock,
  Thermometer,
  Droplets,
  Gauge,
  Wind,
  CloudRain,
  Eye,
  ShieldAlert,
  Download,
  GitCompare,
  Compass,
  Activity,
  Flame
} from 'lucide-react';
import { evaluateIMDHeatwave } from '@/lib/heatwaveEngine';


interface Props {
  districtId: string;
  onClose: () => void;
  onSelectDistrictForCompare?: (districtId: string) => void;
  language?: 'en' | 'hi';
}

export const VayuDistrictPanel: React.FC<Props> = ({
  districtId,
  onClose,
  onSelectDistrictForCompare
}) => {
  const { district, reading, history, qcReport, health, refresh, lastUpdated } = useDistrictData(districtId);
  const allDistricts = useAllDistricts();

  const [timeFilter, setTimeFilter] = useState<'1h' | '6h' | '24h'>('24h');
  const [logFilter, setLogFilter] = useState<string>('ALL');
  const [isCompareOpen, setIsCompareOpen] = useState(false);

  // Compute official IMD Heatwave classification
  const heatwave = useMemo(() => {
    return district ? evaluateIMDHeatwave(district, reading, history) : null;
  }, [district, reading, history]);


  // Countdown timer simulation
  const [countdown, setCountdown] = useState<number>(30);
  React.useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(c => (c > 1 ? c - 1 : 30));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Filter history based on time tab
  const filteredHistory = useMemo(() => {
    if (!history || history.length === 0) return [];
    const count = timeFilter === '1h' ? 2 : timeFilter === '6h' ? 6 : 24;
    return history.slice(-count);
  }, [history, timeFilter]);

  // Find 3 nearest districts for spatial comparison
  const nearbyDistricts = useMemo(() => {
    if (!district || allDistricts.length === 0) return [];
    const others = allDistricts.filter(d => d.district.id !== district.id);

    // Sort by euclidean distance in lat/lng
    others.sort((a, b) => {
      const distA = Math.hypot(a.district.lat - district.lat, a.district.lng - district.lng);
      const distB = Math.hypot(b.district.lat - district.lat, b.district.lng - district.lng);
      return distA - distB;
    });

    return others.slice(0, 3);
  }, [district, allDistricts]);

  // Specific event log for this district
  const districtEvents = useMemo(() => {
    return getVayuEvents(districtId, logFilter);
  }, [districtId, logFilter]);

  if (!district) return null;

  // Mini sparkline SVG generator
  const renderSparkline = (values: (number | null | undefined)[], strokeColor = '#3b82f6') => {
    const valid = values.filter((v): v is number => typeof v === 'number');
    if (valid.length < 2) return <div className="h-6 text-[9px] text-slate-400 flex items-center">N/A</div>;

    const min = Math.min(...valid);
    const max = Math.max(...valid);
    const range = max - min || 1;
    const width = 80;
    const height = 24;

    const points = valid.map((v, i) => {
      const x = (i / (valid.length - 1)) * width;
      const y = height - ((v - min) / range) * (height - 4) - 2;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ');

    return (
      <svg width={width} height={height} className="overflow-visible">
        <polyline fill="none" stroke={strokeColor} strokeWidth="1.8" points={points} strokeLinecap="round" />
      </svg>
    );
  };

  const handleExportCSV = () => {
    const csv = exportEventLogToCSV(districtId);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `vayu_health_log_${district.name}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white border-2 border-[#002147] rounded-xl shadow-xl overflow-hidden flex flex-col my-4">
      {/* 1. HEADER */}
      <div className="bg-gradient-to-r from-[#002147] via-[#0B3B60] to-[#002147] text-white p-4">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-xl font-extrabold tracking-wide">
                {district.name} District Observatory
              </h2>
              <span
                className={`text-xs font-extrabold px-2.5 py-0.5 rounded shadow-xs ${
                  health === 'HEALTHY'
                    ? 'bg-emerald-600 text-white'
                    : health === 'DEGRADED'
                    ? 'bg-amber-500 text-slate-950'
                    : health === 'CRITICAL'
                    ? 'bg-red-600 text-white animate-pulse'
                    : 'bg-slate-600 text-white'
                }`}
              >
                {health}
              </span>

              {heatwave && (
                <span
                  className="text-xs font-extrabold px-2.5 py-0.5 rounded shadow-xs text-white flex items-center gap-1"
                  style={{ backgroundColor: heatwave.warningColor }}
                >
                  <Flame className="w-3.5 h-3.5" />
                  <span>IMD: {heatwave.warningLabelEn.split('—')[0].trim()}</span>
                  <span className="font-mono text-[10px] ml-1 bg-black/20 px-1.5 py-0.2 rounded">
                    {heatwave.departure > 0 ? `+${heatwave.departure}` : heatwave.departure}°C Dep
                  </span>
                </span>
              )}
            </div>

            <div className="text-xs text-sky-200 mt-1 flex items-center gap-3 flex-wrap">
              <span>{district.state}</span>
              <span>•</span>
              <span className="font-mono">
                {district.lat.toFixed(4)}°N, {district.lng.toFixed(4)}°E
              </span>
              <span>•</span>
              <span>Population: {(district.population / 100000).toFixed(1)} Lakh</span>
              <span>•</span>
              <span className="font-mono text-[#FF9933]">ID: {district.id}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="text-right text-xs font-mono mr-2 hidden sm:block">
              <div className="text-slate-300">
                Updated: {lastUpdated ? new Date(lastUpdated).toLocaleTimeString() : 'Syncing...'}
              </div>
              <div className="text-[10px] text-sky-300">Next auto-refresh in {countdown}s</div>
            </div>

            <button
              onClick={() => refresh()}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded text-slate-200"
              title="Force Refresh Data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsCompareOpen(p => !p)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold transition-colors ${
                isCompareOpen ? 'bg-[#FF9933] text-slate-950' : 'bg-slate-800 text-white hover:bg-slate-700'
              }`}
            >
              <GitCompare className="w-3.5 h-3.5" />
              <span>Compare (3)</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 bg-slate-800 hover:bg-red-700 rounded text-slate-200 transition-colors"
              title="Close Panel"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Side-by-side Nearby District Comparison Drawer */}
      {isCompareOpen && (
        <div className="bg-sky-50 p-3.5 border-b border-sky-200">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#002147]">
              <GitCompare className="w-4 h-4 text-[#FF9933]" />
              <span>SPATIAL COHORT DIAGNOSTICS — Nearest 3 District Observatories</span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">Differentiates Local Sensor Glitches vs Regional Storms</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {nearbyDistricts.map(nb => (
              <div
                key={nb.district.id}
                onClick={() => onSelectDistrictForCompare?.(nb.district.id)}
                className="bg-white p-2.5 rounded border border-sky-200 hover:border-[#FF9933] cursor-pointer shadow-2xs"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#002147]">{nb.district.name}</span>
                  <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                    nb.health === 'HEALTHY' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {nb.health}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1 mt-2 text-center text-[10px] font-mono">
                  <div className="bg-slate-50 p-1 rounded">
                    <span className="text-slate-400 block text-[8px]">TEMP</span>
                    <span className="font-bold text-slate-800">{nb.reading?.temperature_2m ?? '—'}°C</span>
                  </div>
                  <div className="bg-slate-50 p-1 rounded">
                    <span className="text-slate-400 block text-[8px]">HUMID</span>
                    <span className="font-bold text-slate-800">{nb.reading?.relative_humidity_2m ?? '—'}%</span>
                  </div>
                  <div className="bg-slate-50 p-1 rounded">
                    <span className="text-slate-400 block text-[8px]">PRES</span>
                    <span className="font-bold text-slate-800">{nb.reading?.pressure_msl?.toFixed(0) ?? '—'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Content Sections */}
      <div className="p-4 space-y-5">
        {/* 2. LIVE READINGS GRID (12 Parameter Cards) */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold uppercase text-slate-500 tracking-wider">
              Live Meteorological Telemetry Grid (12 Channels)
            </h3>
            <span className="text-[10px] font-mono text-slate-400">WMO Resolution & Sparklines</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {[
              {
                title: 'Temperature',
                val: reading?.temperature_2m != null ? `${reading.temperature_2m.toFixed(1)}` : '—',
                unit: '°C',
                icon: Thermometer,
                spark: history.map(h => h.temperature),
                color: '#ef4444'
              },
              {
                title: 'Feels Like',
                val: reading?.apparent_temperature != null ? `${reading.apparent_temperature.toFixed(1)}` : '—',
                unit: '°C',
                icon: Activity,
                spark: history.map(h => h.temperature),
                color: '#f97316'
              },
              {
                title: 'Relative Humidity',
                val: reading?.relative_humidity_2m != null ? `${reading.relative_humidity_2m.toFixed(1)}` : '—',
                unit: '%',
                icon: Droplets,
                spark: history.map(h => h.humidity),
                color: '#06b6d4'
              },
              {
                title: 'Dew Point',
                val: reading?.dew_point_2m != null ? `${reading.dew_point_2m.toFixed(1)}` : '—',
                unit: '°C',
                icon: Droplets,
                spark: history.map(h => h.dew_point),
                color: '#0284c7'
              },
              {
                title: 'Pressure (MSL)',
                val: reading?.pressure_msl != null ? `${reading.pressure_msl.toFixed(1)}` : '—',
                unit: 'hPa',
                icon: Gauge,
                spark: history.map(h => h.pressure),
                color: '#8b5cf6'
              },
              {
                title: 'Surface Pressure',
                val: reading?.surface_pressure != null ? `${reading.surface_pressure.toFixed(1)}` : '—',
                unit: 'hPa',
                icon: Gauge,
                spark: history.map(h => h.pressure),
                color: '#6366f1'
              },
              {
                title: 'Wind Speed (10m)',
                val: reading?.wind_speed_10m != null ? `${reading.wind_speed_10m.toFixed(1)}` : '—',
                unit: 'km/h',
                icon: Wind,
                spark: history.map(h => h.wind_speed),
                color: '#10b981'
              },
              {
                title: 'Wind Direction',
                val: reading?.wind_direction_10m != null ? `${reading.wind_direction_10m}` : '—',
                unit: '° Azimuth',
                icon: Compass,
                spark: history.map(h => h.wind_direction),
                color: '#14b8a6'
              },
              {
                title: 'Wind Gusts (10m)',
                val: reading?.wind_gusts_10m != null ? `${reading.wind_gusts_10m.toFixed(1)}` : '—',
                unit: 'km/h',
                icon: Wind,
                spark: history.map(h => h.wind_speed),
                color: '#f59e0b'
              },
              {
                title: 'Precipitation',
                val: reading?.precipitation != null ? `${reading.precipitation.toFixed(1)}` : '0.0',
                unit: 'mm/hr',
                icon: CloudRain,
                spark: history.map(h => h.precipitation),
                color: '#2563eb'
              },
              {
                title: 'Cloud Cover',
                val: reading?.cloud_cover != null ? `${reading.cloud_cover}` : '—',
                unit: '%',
                icon: Eye,
                spark: history.map(h => h.visibility),
                color: '#64748b'
              },
              {
                title: 'Visibility',
                val: reading?.visibility != null ? `${(reading.visibility / 1000).toFixed(1)}` : '—',
                unit: 'km',
                icon: Eye,
                spark: history.map(h => h.visibility),
                color: '#0d9488'
              },
            ].map(card => {
              const Icon = card.icon;
              return (
                <div key={card.title} className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex flex-col justify-between">
                  <div className="flex items-center justify-between text-slate-500 mb-1">
                    <span className="text-[11px] font-bold text-slate-700">{card.title}</span>
                    <Icon className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                  <div className="flex items-baseline justify-between mt-1">
                    <div className="text-xl font-extrabold font-mono text-[#002147]">
                      {card.val} <span className="text-xs font-normal text-slate-500">{card.unit}</span>
                    </div>
                    <div>{renderSparkline(card.spark, card.color)}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. ACTIVE FAULTS LIST */}
        {qcReport && qcReport.faults.length > 0 && (
          <div className="bg-red-50/70 border-2 border-red-300 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-red-600" />
                <h4 className="text-sm font-extrabold text-red-900 uppercase">
                  Active Sensor Faults Detected ({qcReport.faults.length})
                </h4>
              </div>
              <span className="text-xs font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded">
                Action Required
              </span>
            </div>

            <div className="space-y-2">
              {qcReport.faults.map((f, idx) => (
                <div key={idx} className="bg-white p-3 rounded-md border border-red-200 shadow-2xs space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-extrabold text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                        {f.code}
                      </span>
                      <span className="text-xs font-semibold text-slate-700">{f.category}</span>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        f.severity === 'CRITICAL' ? 'bg-red-600 text-white' : 'bg-amber-500 text-slate-950'
                      }`}
                    >
                      {f.severity}
                    </span>
                  </div>

                  <p className="text-xs text-red-900 font-medium">{f.message}</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1 text-slate-600">
                    <div>
                      <span className="font-bold text-slate-700">WMO Threshold: </span>
                      <span className="font-mono">{f.threshold || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="font-bold text-slate-700">Recommended Action: </span>
                      <span className="text-emerald-800 font-medium">{f.recommendedAction}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. TIMELINE CHART (Multi-Line Temp, Humidity, Pressure over 24 Hours) */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-2">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h4 className="text-xs font-bold uppercase text-[#002147] tracking-wider">
                Multi-Parameter Sensor Time-Series Analysis
              </h4>
              <p className="text-[10px] text-slate-500">
                Temperature (°C, Red) · Humidity (%, Cyan) · Pressure (hPa, Purple)
              </p>
            </div>

            <div className="flex items-center gap-1 bg-white p-0.5 rounded border border-slate-300 text-xs">
              {(['1h', '6h', '24h'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setTimeFilter(tab)}
                  className={`px-2 py-0.5 rounded font-bold transition-colors ${
                    timeFilter === tab ? 'bg-[#002147] text-white' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* SVG Multi-Line Chart Canvas */}
          <div className="w-full h-44 bg-slate-900 rounded p-2 relative overflow-hidden">
            <svg viewBox="0 0 500 140" className="w-full h-full">
              {/* Gridlines */}
              <line x1="0" y1="35" x2="500" y2="35" stroke="#334155" strokeWidth="1" strokeDasharray="3,3" />
              <line x1="0" y1="70" x2="500" y2="70" stroke="#334155" strokeWidth="1" strokeDasharray="3,3" />
              <line x1="0" y1="105" x2="500" y2="105" stroke="#334155" strokeWidth="1" strokeDasharray="3,3" />

              {filteredHistory.length > 1 ? (
                <>
                  {/* Temperature line */}
                  <polyline
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="2.2"
                    points={filteredHistory.map((h, i) => {
                      const x = (i / (filteredHistory.length - 1)) * 480 + 10;
                      const t = h.temperature ?? 25;
                      const y = 120 - ((t - 10) / 40) * 100;
                      return `${x},${y}`;
                    }).join(' ')}
                  />

                  {/* Humidity line */}
                  <polyline
                    fill="none"
                    stroke="#06b6d4"
                    strokeWidth="2"
                    strokeDasharray="2,2"
                    points={filteredHistory.map((h, i) => {
                      const x = (i / (filteredHistory.length - 1)) * 480 + 10;
                      const rh = h.humidity ?? 60;
                      const y = 130 - (rh / 100) * 110;
                      return `${x},${y}`;
                    }).join(' ')}
                  />

                  {/* Pressure line */}
                  <polyline
                    fill="none"
                    stroke="#a855f7"
                    strokeWidth="2"
                    points={filteredHistory.map((h, i) => {
                      const x = (i / (filteredHistory.length - 1)) * 480 + 10;
                      const p = h.pressure ?? 1010;
                      const y = 125 - ((p - 980) / 40) * 100;
                      return `${x},${y}`;
                    }).join(' ')}
                  />
                </>
              ) : (
                <text x="250" y="70" textAnchor="middle" fill="#64748b" fontSize="12">
                  Awaiting multi-hour observation buffer...
                </text>
              )}
            </svg>
          </div>
        </div>

        {/* 5. STATION HEALTH LOG (Chronological Events with CSV Export) */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-2">
          <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#002147]" />
              <h4 className="text-xs font-bold uppercase text-[#002147] tracking-wider">
                Station Diagnostic & Health Audit Log
              </h4>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={logFilter}
                onChange={e => setLogFilter(e.target.value)}
                className="text-xs bg-slate-100 border border-slate-300 rounded px-2 py-0.5"
              >
                <option value="ALL">All Severities</option>
                <option value="CRITICAL">Critical Only</option>
                <option value="WARNING">Warnings Only</option>
                <option value="RESOLVED">Resolved Only</option>
              </select>

              <button
                onClick={handleExportCSV}
                className="flex items-center gap-1 text-xs font-bold bg-[#002147] hover:bg-[#003366] text-white px-2.5 py-1 rounded shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          <div className="max-h-40 overflow-y-auto divide-y divide-slate-100 text-xs font-mono">
            {districtEvents.length === 0 ? (
              <div className="py-4 text-center text-slate-400 font-sans">
                No historical anomalies logged for {district.name} in current session.
              </div>
            ) : (
              districtEvents.map(e => (
                <div key={e.id} className="py-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 text-[10px]">{e.timeFormatted}</span>
                    <span
                      className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                        e.severity === 'CRITICAL'
                          ? 'bg-red-100 text-red-800'
                          : e.severity === 'WARNING'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {e.severity}
                    </span>
                    <span className="font-bold text-slate-800">{e.faultCode}</span>
                    <span className="text-slate-600 font-sans hidden sm:inline">{e.message}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
