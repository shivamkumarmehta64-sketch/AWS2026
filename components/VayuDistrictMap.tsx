import React, { useState, useMemo } from 'react';
import { useAllDistricts, prioritizeStateDistricts, DistrictLiveState } from '@/lib/districtEngine';
import { DistrictHealthStatus } from '@/lib/sensorFaultEngine';
import { evaluateIMDHeatwave } from '@/lib/heatwaveEngine';
import {
  MapPin,
  Filter,
  Search,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Activity,
  Flame,
  ShieldCheck
} from 'lucide-react';


interface Props {
  selectedDistrictId: string | null;
  onSelectDistrict: (districtId: string) => void;
  language?: 'en' | 'hi';
}

// Health status color palette
const STATUS_COLORS: Record<DistrictHealthStatus, { fill: string; ring: string; label: string; text: string }> = {
  HEALTHY:  { fill: '#22c55e', ring: '#bbf7d0', label: 'Healthy', text: 'text-emerald-700' },
  DEGRADED: { fill: '#eab308', ring: '#fef08a', label: 'Degraded', text: 'text-amber-700' },
  CRITICAL: { fill: '#ef4444', ring: '#fecaca', label: 'Critical', text: 'text-red-700' },
  OFFLINE:  { fill: '#6b7280', ring: '#e5e7eb', label: 'Offline', text: 'text-slate-600' },
  LOADING:  { fill: '#3b82f6', ring: '#bfdbfe', label: 'Loading', text: 'text-blue-600' },
};

// Coordinate projection from Geo Lat/Lng to SVG Canvas
// Bounds: Lon 67.0°E -> 98.0°E (width 600), Lat 37.5°N -> 6.5°N (height 660)
const geoToCanvas = (lat: number, lng: number) => ({
  x: Math.round((lng - 67.0) * 19.355),
  y: Math.round((37.5 - lat) * 21.290),
});

// Mainland India Vector Boundary
const INDIA_BORDER =
  'M 160,5 L 205,8 L 225,32 L 235,55 L 210,72 L 220,95 L 238,102 ' +
  'L 255,130 L 275,145 L 305,160 L 335,178 L 375,190 ' +
  'L 415,188 L 460,172 L 525,162 L 570,148 L 595,160 ' +
  'L 580,185 L 560,215 L 540,240 L 525,270 L 515,310 ' +
  'L 495,335 L 485,310 L 465,300 L 460,270 L 440,265 ' +
  'L 420,290 L 395,300 L 385,320 L 375,340 ' +
  'L 355,360 L 335,390 L 310,420 L 285,460 L 265,500 ' +
  'L 245,550 L 225,600 L 205,645 ' +
  'L 195,640 L 180,600 L 170,550 L 155,500 L 140,450 ' +
  'L 130,400 L 115,360 L 105,320 L 75,325 L 45,330 ' +
  'L 30,305 L 18,290 L 25,270 L 45,260 L 60,275 ' +
  'L 70,250 L 85,225 L 115,200 L 125,160 L 140,120 L 145,70 Z';

const ANDAMAN_ISLANDS =
  'M 500,450 L 504,460 L 500,475 L 496,490 L 493,485 L 497,465 Z ' +
  'M 495,510 L 498,525 L 494,540 L 490,535 Z';

const LAKSHADWEEP_ISLANDS =
  'M 105,520 A 4,4 0 1,1 105,521 Z ' +
  'M 110,545 A 3,3 0 1,1 110,546 Z ' +
  'M 115,570 A 3,3 0 1,1 115,571 Z';

export const VayuDistrictMap: React.FC<Props> = ({
  selectedDistrictId,
  onSelectDistrict,
  language = 'en'
}) => {
  const allDistrictEntries = useAllDistricts();
  const [selectedState, setSelectedState] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [hoveredDistrict, setHoveredDistrict] = useState<DistrictLiveState | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const [activeMapLayer, setActiveMapLayer] = useState<'QC' | 'HEATWAVE'>('QC');

  // Compute list of unique states
  const statesList = useMemo(() => {
    const set = new Set<string>();
    for (const d of allDistrictEntries) {
      if (d.district?.state) set.add(d.district.state);
    }
    return Array.from(set).sort();
  }, [allDistrictEntries]);

  // Handle state filter zoom
  const handleSelectState = (st: string) => {
    setSelectedState(st);
    if (st !== 'ALL') {
      prioritizeStateDistricts(st);
      // Auto pan/zoom closer to state centroid
      const inState = allDistrictEntries.filter(d => d.district.state.toLowerCase() === st.toLowerCase());
      if (inState.length > 0) {
        const avgLat = inState.reduce((sum, d) => sum + d.district.lat, 0) / inState.length;
        const avgLng = inState.reduce((sum, d) => sum + d.district.lng, 0) / inState.length;
        const pt = geoToCanvas(avgLat, avgLng);
        setZoomLevel(1.6);
        setPanOffset({ x: 300 - pt.x * 1.6, y: 330 - pt.y * 1.6 });
        return;
      }
    }
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  };

  // Status counts for top-right legend
  const statusCounts = useMemo(() => {
    const counts: Record<DistrictHealthStatus, number> = {
      HEALTHY: 0,
      DEGRADED: 0,
      CRITICAL: 0,
      OFFLINE: 0,
      LOADING: 0
    };
    for (const d of allDistrictEntries) {
      counts[d.health] = (counts[d.health] || 0) + 1;
    }
    return counts;
  }, [allDistrictEntries]);

  // Heatwave counts
  const heatwaveCounts = useMemo(() => {
    let red = 0, orange = 0, yellow = 0, green = 0;
    for (const d of allDistrictEntries) {
      const rep = evaluateIMDHeatwave(d.district, d.reading, d.history);
      if (rep.warningLevel === 'WARNING_SEVERE') red++;
      else if (rep.warningLevel === 'ALERT') orange++;
      else if (rep.warningLevel === 'WATCH') yellow++;
      else green++;
    }
    return { red, orange, yellow, green };
  }, [allDistrictEntries]);


  // Live ticker of districts reporting faults
  const faultTicker = useMemo(() => {
    const faultedByState: Record<string, number> = {};
    let totalFaulted = 0;

    for (const d of allDistrictEntries) {
      if (d.health === 'CRITICAL' || d.health === 'DEGRADED') {
        totalFaulted++;
        const st = d.district.state;
        faultedByState[st] = (faultedByState[st] || 0) + 1;
      }
    }

    const stateBreakdown = Object.entries(faultedByState)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([st, count]) => `${st} (${count})`)
      .join(', ');

    return {
      total: totalFaulted,
      text: stateBreakdown ? `${totalFaulted} districts reporting active sensor anomalies — ${stateBreakdown}` : 'All monitored districts reporting nominal observation data'
    };
  }, [allDistrictEntries]);

  // Filter districts based on state & search query
  const displayedDistricts = useMemo(() => {
    let list = allDistrictEntries;

    if (selectedState !== 'ALL') {
      list = list.filter(d => d.district.state.toLowerCase() === selectedState.toLowerCase());
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(d =>
        d.district.name.toLowerCase().includes(q) ||
        d.district.state.toLowerCase().includes(q) ||
        d.district.id.toLowerCase().includes(q)
      );
    }

    return list;
  }, [allDistrictEntries, selectedState, searchQuery]);

  return (
    <div className="bg-white border-2 border-[#002147] rounded-xl shadow-md overflow-hidden flex flex-col">
      {/* Top Map Header */}
      <div className="bg-[#002147] text-white p-3.5 space-y-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-[#FF9933] text-slate-950 rounded font-bold">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold uppercase tracking-wide text-white">
                  {language === 'hi' ? 'अखिल भारतीय 766 जिला वेधशाला मानचित्र' : 'National District Health GIS Map'}
                </h2>
                <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                  766 DISTRICTS
                </span>
              </div>
              <p className="text-[11px] text-sky-200">
                WMO-Standard Real-Time Quality Control Grid · All 28 States & 8 UTs
              </p>
            </div>
          </div>

          {/* Quick Search */}
          <div className="relative w-full sm:w-60">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search 766 districts (e.g. Pune, Leh)..."
              className="w-full pl-8 pr-2 py-1 text-xs bg-slate-900/80 text-white placeholder:text-slate-400 border border-slate-700 rounded focus:outline-none focus:border-[#FF9933]"
            />
          </div>
        </div>

        {/* Filters and Live Counters Bar */}
        <div className="flex items-center justify-between flex-wrap gap-2 pt-1 border-t border-slate-700/80 text-xs">
          {/* State Filter Dropdown & Layer Selector */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-[#FF9933]" />
              <span className="text-[11px] text-slate-300 font-medium">State Zoom:</span>
              <select
                value={selectedState}
                onChange={e => handleSelectState(e.target.value)}
                className="bg-slate-900 text-white text-xs border border-slate-700 rounded px-2 py-0.5 focus:outline-none focus:border-[#FF9933]"
              >
                <option value="ALL">All India (All 36 States & UTs)</option>
                {statesList.map(st => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            {/* Layer Switcher: WMO QC vs IMD Heatwave DSS */}
            <div className="flex items-center gap-1 bg-slate-900/90 p-0.5 rounded border border-slate-700">
              <button
                onClick={() => setActiveMapLayer('QC')}
                className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                  activeMapLayer === 'QC' ? 'bg-[#002147] text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                <span>WMO Sensor QC</span>
              </button>
              <button
                onClick={() => setActiveMapLayer('HEATWAVE')}
                className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                  activeMapLayer === 'HEATWAVE' ? 'bg-[#ea580c] text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Flame className="w-3 h-3 text-amber-400" />
                <span>IMD Heatwave DSS</span>
              </button>
            </div>
          </div>

          {/* Live Legend with Counts */}
          <div className="flex items-center gap-3 flex-wrap text-[10px]">
            {activeMapLayer === 'HEATWAVE' ? (
              <>
                <div className="flex items-center gap-1 font-mono">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#22c55e] inline-block" />
                  <span className="text-slate-200 font-bold">{heatwaveCounts.green}</span>
                  <span className="text-slate-400">Normal</span>
                </div>
                <div className="flex items-center gap-1 font-mono">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#eab308] inline-block" />
                  <span className="text-slate-200 font-bold">{heatwaveCounts.yellow}</span>
                  <span className="text-slate-400">Watch</span>
                </div>
                <div className="flex items-center gap-1 font-mono">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#f97316] inline-block" />
                  <span className="text-slate-200 font-bold">{heatwaveCounts.orange}</span>
                  <span className="text-slate-400">Alert</span>
                </div>
                <div className="flex items-center gap-1 font-mono">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444] inline-block animate-pulse" />
                  <span className="text-slate-200 font-bold">{heatwaveCounts.red}</span>
                  <span className="text-slate-400">Severe</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-1 font-mono">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#22c55e] inline-block" />
                  <span className="text-slate-200 font-bold">{statusCounts.HEALTHY}</span>
                  <span className="text-slate-400">Healthy</span>
                </div>
                <div className="flex items-center gap-1 font-mono">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#eab308] inline-block" />
                  <span className="text-slate-200 font-bold">{statusCounts.DEGRADED}</span>
                  <span className="text-slate-400">Degraded</span>
                </div>
                <div className="flex items-center gap-1 font-mono">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444] inline-block" />
                  <span className="text-slate-200 font-bold">{statusCounts.CRITICAL}</span>
                  <span className="text-slate-400">Critical</span>
                </div>
                <div className="flex items-center gap-1 font-mono">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#3b82f6] inline-block animate-pulse" />
                  <span className="text-slate-200 font-bold">{statusCounts.LOADING}</span>
                  <span className="text-slate-400">Loading</span>
                </div>
                <div className="flex items-center gap-1 font-mono">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#6b7280] inline-block" />
                  <span className="text-slate-200 font-bold">{statusCounts.OFFLINE}</span>
                  <span className="text-slate-400">Offline</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>


      {/* SVG Canvas Map Area */}
      <div className="relative bg-gradient-to-b from-[#e0f2fe] via-[#f0f9ff] to-[#e2e8f0] p-2 flex-1 min-h-[580px] overflow-hidden">
        {/* Map Controls (Zoom & Reset) */}
        <div className="absolute top-4 right-4 z-10 flex flex-col gap-1 bg-white/90 backdrop-blur-xs p-1 rounded-md shadow border border-slate-300">
          <button
            onClick={() => setZoomLevel(z => Math.min(3, z + 0.3))}
            className="p-1 hover:bg-slate-100 rounded text-slate-700"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoomLevel(z => Math.max(1, z - 0.3))}
            className="p-1 hover:bg-slate-100 rounded text-slate-700"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setZoomLevel(1);
              setPanOffset({ x: 0, y: 0 });
              setSelectedState('ALL');
            }}
            className="p-1 hover:bg-slate-100 rounded text-slate-700"
            title="Reset Map"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Selected State & Count Badge */}
        <div className="absolute top-4 left-4 z-10 flex flex-col gap-1 pointer-events-none">
          <div className="bg-white/90 backdrop-blur-xs border border-slate-300 px-3 py-1 rounded shadow-xs text-xs font-mono text-slate-800">
            <span className="font-bold text-[#002147]">{displayedDistricts.length}</span> Districts Displayed
          </div>
          {selectedState !== 'ALL' && (
            <div className="bg-[#002147] text-white px-2.5 py-0.5 rounded text-[10px] font-bold shadow-xs">
              Region: {selectedState}
            </div>
          )}
        </div>

        {/* SVG Map Container */}
        <svg
          viewBox="0 0 600 660"
          className="w-full h-full max-h-[600px] select-none mx-auto drop-shadow-sm"
        >
          <defs>
            <pattern id="vayu-ocean-dots" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="0.6" fill="#bae6fd" opacity="0.6" />
            </pattern>
            <filter id="node-shadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="1" stdDeviation="1" floodOpacity="0.25" />
            </filter>
          </defs>

          {/* Ocean */}
          <rect width="600" height="660" fill="url(#vayu-ocean-dots)" />

          {/* Graticule guidelines */}
          <g className="opacity-25 stroke-slate-400">
            <line x1="20" y1="298" x2="580" y2="298" stroke="#0284c7" strokeWidth="1" strokeDasharray="3,3" />
            <line x1="300" y1="20" x2="300" y2="640" stroke="#0284c7" strokeWidth="1" strokeDasharray="3,3" />
          </g>

          {/* Zoom & Pan Transform Group */}
          <g transform={`translate(${panOffset.x}, ${panOffset.y}) scale(${zoomLevel})`}>
            {/* India Mainland Polygon */}
            <path
              d={INDIA_BORDER}
              fill="#ffffff"
              stroke="#64748b"
              strokeWidth="1.8"
              strokeLinejoin="round"
              className="filter drop-shadow-sm"
            />

            {/* Andaman & Nicobar */}
            <path d={ANDAMAN_ISLANDS} fill="#ffffff" stroke="#64748b" strokeWidth="1.2" strokeLinejoin="round" />
            {/* Lakshadweep */}
            <path d={LAKSHADWEEP_ISLANDS} fill="#ffffff" stroke="#64748b" strokeWidth="1.2" />

            {/* 766 District Nodes */}
            {displayedDistricts.map(entry => {
              const d = entry.district;
              const pos = geoToCanvas(d.lat, d.lng);
              const isSelected = d.id === selectedDistrictId;
              const col = STATUS_COLORS[entry.health];
              const heatwave = evaluateIMDHeatwave(d, entry.reading, entry.history);
              const isHeatwaveLayer = activeMapLayer === 'HEATWAVE';
              const nodeFill = isHeatwaveLayer ? heatwave.warningColor : col.fill;
              const isLoading = entry.health === 'LOADING';
              const isCritical = isHeatwaveLayer ? heatwave.warningLevel === 'WARNING_SEVERE' : entry.health === 'CRITICAL';
              const r = isSelected ? 6.5 : (isCritical ? 4.8 : (isLoading ? 3.0 : 3.6));

              return (
                <g
                  key={d.id}
                  transform={`translate(${pos.x},${pos.y})`}
                  onClick={() => onSelectDistrict(d.id)}
                  onMouseEnter={() => setHoveredDistrict(entry)}
                  onMouseLeave={() => setHoveredDistrict(null)}
                  className="cursor-pointer transition-transform duration-100"
                >
                  {/* Selection Ring */}
                  {isSelected && (
                    <circle
                      r={r + 5}
                      fill="none"
                      stroke="#FF9933"
                      strokeWidth="2.5"
                      className="animate-pulse"
                    />
                  )}

                  {/* Critical alert pulse */}
                  {isCritical && (
                    <circle r={r + 4} fill={isHeatwaveLayer ? '#fecaca' : col.ring} opacity="0.6">
                      <animate attributeName="r" values={`${r+3};${r+9};${r+3}`} dur="1.5s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.6;0.1;0.6" dur="1.5s" repeatCount="indefinite" />
                    </circle>
                  )}

                  {/* Loading pulse */}
                  {isLoading && !isHeatwaveLayer && (
                    <circle r={r + 3} fill="#93c5fd" opacity="0.4">
                      <animate attributeName="r" values={`${r+2};${r+6};${r+2}`} dur="2s" repeatCount="indefinite" />
                    </circle>
                  )}

                  {/* Main Node Dot */}
                  <circle
                    r={r}
                    fill={nodeFill}
                    stroke={isSelected ? '#002147' : '#ffffff'}
                    strokeWidth={isSelected ? 2 : 0.8}
                    filter="url(#node-shadow)"
                  />


                  {/* Label for selected district */}
                  {isSelected && (
                    <text
                      y={r + 9}
                      textAnchor="middle"
                      fontSize="8.5"
                      fontWeight="bold"
                      fill="#002147"
                      stroke="white"
                      strokeWidth="2.5"
                      paintOrder="stroke"
                    >
                      {d.name}
                    </text>
                  )}
                </g>
              );
            })}
          </g>
        </svg>

        {/* Hover Tooltip Card */}
        {hoveredDistrict && (() => {
          const isHeatLayer = activeMapLayer === 'HEATWAVE';
          const heat = evaluateIMDHeatwave(hoveredDistrict.district, hoveredDistrict.reading, hoveredDistrict.history);

          return (
            <div className="absolute bottom-4 left-4 right-4 sm:right-auto sm:w-80 bg-[#002147]/95 backdrop-blur-md text-white p-3 rounded-lg shadow-xl border border-slate-600 z-20 transition-all pointer-events-none">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-xs font-extrabold text-[#FF9933]">
                    {hoveredDistrict.district.name}
                  </div>
                  <div className="text-[11px] text-slate-300">
                    {hoveredDistrict.district.state} · Pop: {(hoveredDistrict.district.population / 100000).toFixed(1)}L
                  </div>
                </div>
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded text-white shadow-xs"
                  style={{
                    backgroundColor: isHeatLayer
                      ? heat.warningColor
                      : hoveredDistrict.health === 'HEALTHY'
                      ? '#16a34a'
                      : hoveredDistrict.health === 'DEGRADED'
                      ? '#d97706'
                      : hoveredDistrict.health === 'CRITICAL'
                      ? '#dc2626'
                      : '#475569'
                  }}
                >
                  {isHeatLayer ? heat.warningLabelEn.split('—')[0].trim() : hoveredDistrict.health}
                </span>
              </div>

              {isHeatLayer ? (
                <div className="mt-2 pt-2 border-t border-slate-700 space-y-1.5">
                  <div className="grid grid-cols-3 gap-1.5 text-center font-mono">
                    <div className="bg-slate-900/70 p-1 rounded">
                      <div className="text-[8px] text-slate-400 font-sans">MAX TEMP</div>
                      <div className="text-xs font-bold text-amber-300">{heat.maxTemp}°C</div>
                    </div>
                    <div className="bg-slate-900/70 p-1 rounded">
                      <div className="text-[8px] text-slate-400 font-sans">DEPARTURE</div>
                      <div className={`text-xs font-bold ${heat.departure > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                        {heat.departure > 0 ? `+${heat.departure}` : heat.departure}°C
                      </div>
                    </div>
                    <div className="bg-slate-900/70 p-1 rounded">
                      <div className="text-[8px] text-slate-400 font-sans">HUMIDEX</div>
                      <div className="text-xs font-bold text-sky-300">{heat.humidex}</div>
                    </div>
                  </div>
                  <div className="text-[10px] text-amber-200 bg-amber-950/60 p-1.5 rounded border border-amber-800">
                    <strong>IMD Alert: </strong>{heat.warningLabelEn} ({heat.heatStressCategory})
                  </div>
                </div>
              ) : hoveredDistrict.reading ? (
                <div className="grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-slate-700 text-center">
                  <div className="bg-slate-900/60 p-1.5 rounded">
                    <div className="text-[9px] text-slate-400">Temp</div>
                    <div className="text-xs font-bold font-mono">
                      {hoveredDistrict.reading.temperature_2m != null ? `${hoveredDistrict.reading.temperature_2m}°C` : '—'}
                    </div>
                  </div>
                  <div className="bg-slate-900/60 p-1.5 rounded">
                    <div className="text-[9px] text-slate-400">Humidity</div>
                    <div className="text-xs font-bold font-mono">
                      {hoveredDistrict.reading.relative_humidity_2m != null ? `${hoveredDistrict.reading.relative_humidity_2m}%` : '—'}
                    </div>
                  </div>
                  <div className="bg-slate-900/60 p-1.5 rounded">
                    <div className="text-[9px] text-slate-400">Pressure</div>
                    <div className="text-xs font-bold font-mono">
                      {hoveredDistrict.reading.pressure_msl != null ? `${hoveredDistrict.reading.pressure_msl.toFixed(0)} hPa` : '—'}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-[11px] text-sky-200 mt-2 italic">
                  Telemetry fetching in background queue...
                </div>
              )}

              {hoveredDistrict.qcReport && hoveredDistrict.qcReport.faults.length > 0 && !isHeatLayer && (
                <div className="mt-2 text-[10px] bg-red-950/70 text-red-200 p-1.5 rounded border border-red-800">
                  <span className="font-bold">Active Fault: </span>
                  {hoveredDistrict.qcReport.faults[0].message}
                </div>
              )}

              <div className="mt-2 text-[10px] text-sky-300 flex justify-between font-mono">
                <span>Click to view 12-parameter console & timeline</span>
                <span>ID: {hoveredDistrict.district.id}</span>
              </div>
            </div>
          );
        })()}
      </div>


      {/* Bottom Live Ticker Bar */}
      <div className="bg-slate-900 text-white px-3 py-2 border-t border-slate-700 flex items-center justify-between text-xs flex-wrap gap-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Activity className="w-4 h-4 text-[#FF9933] shrink-0 animate-pulse" />
          <div className="truncate text-slate-300 font-mono text-[11px]">
            <strong className="text-white">LIVE TELEMETRY STREAM:</strong> {faultTicker.text}
          </div>
        </div>
        <div className="text-[10px] text-slate-400 font-mono shrink-0">
          Auto-Refreshing (30s)
        </div>
      </div>
    </div>
  );
};
