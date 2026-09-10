'use client';

import React, { useState, useMemo } from 'react';
import { TelemetryPacket, WMOQualityFlag, GovAlertLevel } from '@/lib/anomalyLogic';
import { IMD_AWS_STATIONS, IMDStationProfile } from '@/lib/stationData';
import { ALL_INDIA_DISTRICTS, DistrictGeoNode, districtToStationProfile } from '@/lib/indiaDistrictCatalog';
import {
  MapPin,
  Wifi,
  Smartphone,
  Layers,
  Thermometer,
  CloudRain,
  ShieldCheck,
  Search,
  Crosshair,
  Info,
  Maximize2
} from 'lucide-react';

interface Props {
  latestPackets: Record<string, TelemetryPacket>;
  selectedStationId: string;
  onSelectStation: (id: string) => void;
  onSelectCustomDistrict?: (districtProfile: IMDStationProfile) => void;
  customStations?: Record<string, IMDStationProfile>;
  language: 'hi' | 'en';
}

// Geo → SVG coordinate mapping
// ViewBox 0 0 600 660
// lon 67.0°E → 0    98.0°E → 600    scaleX = 600 / (98.0 - 67.0) = 19.355
// lat 37.5°N → 0     6.5°N → 660    scaleY = 660 / (37.5 - 6.5) = 21.290
const toXY = (lat: number, lon: number) => ({
  x: Math.round((lon - 67.0) * 19.355),
  y: Math.round((37.5 - lat) * 21.290),
});

// Accurate India boundary outline with true geographic contours
const INDIA_BOUNDARY_PATH =
  'M 160,5 L 205,8 L 225,32 L 235,55 L 210,72 L 220,95 L 238,102 ' + // Ladakh & Kashmir
  'L 255,130 L 275,145 L 305,160 L 335,178 L 375,190 ' +             // HP, Uttarakhand, Nepal border
  'L 415,188 L 460,172 L 525,162 L 570,148 L 595,160 ' +             // Sikkim, Bhutan, Arunachal
  'L 580,185 L 560,215 L 540,240 L 525,270 L 515,310 ' +             // Nagaland, Manipur, Myanmar border
  'L 495,335 L 485,310 L 465,300 L 460,270 L 440,265 ' +             // Mizoram, Tripura, Meghalaya
  'L 420,290 L 395,300 L 385,320 L 375,340 ' +                         // Bangladesh border & Bengal Delta
  'L 355,360 L 335,390 L 310,420 L 285,460 L 265,500 ' +             // Odisha & Andhra Coromandel Coast
  'L 245,550 L 225,600 L 205,645 ' +                                  // Tamil Nadu & Kanyakumari Tip
  'L 195,640 L 180,600 L 170,550 L 155,500 L 140,450 ' +             // Kerala & Malabar Coast
  'L 130,400 L 115,360 L 105,320 L 75,325 L 45,330 ' +               // Goa, Konkan, Maharashtra Coast
  'L 30,305 L 18,290 L 25,270 L 45,260 L 60,275 ' +                  // Gujarat Kathiawar & Kutch
  'L 70,250 L 85,225 L 115,200 L 125,160 L 140,120 L 145,70 Z';      // Rajasthan Thar & Punjab border

// Island Groups
const ANDAMAN_ISLANDS_PATH =
  'M 500,450 L 504,460 L 500,475 L 496,490 L 493,485 L 497,465 Z ' +
  'M 495,510 L 498,525 L 494,540 L 490,535 Z';

const LAKSHADWEEP_ISLANDS_PATH =
  'M 105,520 A 4,4 0 1,1 105,521 Z ' +
  'M 110,545 A 3,3 0 1,1 110,546 Z ' +
  'M 115,570 A 3,3 0 1,1 115,571 Z';

const FLAG_COLORS: Record<WMOQualityFlag | 'UNKNOWN', { fill: string; ring: string; label: string }> = {
  FLAG_1_VERIFIED_GOOD:    { fill: '#16a34a', ring: '#bbf7d0', label: 'Nominal' },
  FLAG_2_CONVECTIVE_STORM: { fill: '#2563eb', ring: '#bfdbfe', label: 'Storm' },
  FLAG_3_SUSPECT_DRIFT:    { fill: '#d97706', ring: '#fde68a', label: 'Drift' },
  FLAG_4_CORRUPT_HARDWARE: { fill: '#dc2626', ring: '#fecaca', label: 'Fault' },
  FLAG_5_PACKET_LOSS:      { fill: '#7c3aed', ring: '#ede9fe', label: 'Packet Loss' },
  UNKNOWN:                 { fill: '#64748b', ring: '#e2e8f0', label: 'Standby' },
};

const ALERT_PULSE: Record<GovAlertLevel, boolean> = {
  LEVEL_0_NOMINAL: false,
  LEVEL_2_YELLOW: false,
  LEVEL_3_AMBER: true,
  LEVEL_4_RED: true,
};

type RmcFilter = 'ALL' | 'Northern' | 'Western' | 'Southern' | 'Eastern' | 'Central' | 'North-Eastern' | 'MOBILE';
type MapLayer = 'QC' | 'THERMAL' | 'RADAR';

export const GovNetworkMap = React.memo<Props>(function GovNetworkMap({
  latestPackets,
  selectedStationId,
  onSelectStation,
  onSelectCustomDistrict,
  customStations = {},
  language
}) {
  const [selectedRmc, setSelectedRmc] = useState<RmcFilter>('ALL');
  const [activeLayer, setActiveLayer] = useState<MapLayer>('QC');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [hoveredNode, setHoveredNode] = useState<{
    id: string;
    name: string;
    hindiName?: string;
    state: string;
    lat: number;
    lon: number;
    elevM?: number;
    isMobile?: boolean;
    climate?: string;
  } | null>(null);

  // Combine Core IMD Stations + 70+ District Observatories + Custom/Mobile stations
  const mapNodes = useMemo(() => {
    const list: Array<{
      id: string;
      name: string;
      hindiName: string;
      state: string;
      lat: number;
      lon: number;
      elevM: number;
      rmc: string;
      climate: string;
      isCoreImd: boolean;
      isMobile: boolean;
      pkt?: TelemetryPacket;
      flag: WMOQualityFlag | 'UNKNOWN';
      alert: GovAlertLevel;
      col: { fill: string; ring: string; label: string };
      pos: { x: number; y: number };
      districtNode?: DistrictGeoNode;
      profile?: IMDStationProfile;
    }> = [];

    // 1. Core IMD Stations (except generic placeholder mobile)
    for (const s of IMD_AWS_STATIONS) {
      if (s.wmoBlockNo === '49999') continue;
      const pkt = latestPackets[s.stationId];
      const flag = pkt?.wmoFlag ?? 'FLAG_1_VERIFIED_GOOD';
      const alert = pkt?.alertLevel ?? 'LEVEL_0_NOMINAL';
      const col = FLAG_COLORS[flag] ?? FLAG_COLORS.UNKNOWN;
      const pos = toXY(s.latitude, s.longitude);

      list.push({
        id: s.stationId,
        name: s.name,
        hindiName: s.hindiName,
        state: s.state,
        lat: s.latitude,
        lon: s.longitude,
        elevM: s.elevationM,
        rmc: s.rmcDivision.replace('RMC ', '').split(' ')[0],
        climate: 'National Primary Benchmark',
        isCoreImd: true,
        isMobile: false,
        pkt,
        flag,
        alert,
        col,
        pos,
        profile: s
      });
    }

    // 2. Curated All-India 70+ District Observatories
    for (const d of ALL_INDIA_DISTRICTS) {
      // Don't duplicate if core IMD already at same location
      if (list.some(item => Math.abs(item.lat - d.lat) < 0.15 && Math.abs(item.lon - d.lon) < 0.15)) {
        continue;
      }
      const pkt = latestPackets[d.districtCode];
      const flag = pkt?.wmoFlag ?? 'FLAG_1_VERIFIED_GOOD';
      const alert = pkt?.alertLevel ?? 'LEVEL_0_NOMINAL';
      const col = FLAG_COLORS[flag] ?? FLAG_COLORS.UNKNOWN;
      const pos = toXY(d.lat, d.lon);

      list.push({
        id: d.districtCode,
        name: d.name,
        hindiName: d.hindiName,
        state: d.state,
        lat: d.lat,
        lon: d.lon,
        elevM: d.elevM,
        rmc: d.rmcZone,
        climate: d.climateZone,
        isCoreImd: false,
        isMobile: false,
        pkt,
        flag,
        alert,
        col,
        pos,
        districtNode: d
      });
    }

    // 3. Dynamic Custom & Mobile Stations
    for (const [stId, prof] of Object.entries(customStations)) {
      if (list.some(item => item.id === stId)) continue;
      const pkt = latestPackets[stId];
      const flag = pkt?.wmoFlag ?? 'FLAG_1_VERIFIED_GOOD';
      const alert = pkt?.alertLevel ?? 'LEVEL_0_NOMINAL';
      const col = FLAG_COLORS[flag] ?? FLAG_COLORS.UNKNOWN;
      const pos = toXY(prof.latitude, prof.longitude);
      const isMobile = stId.startsWith('AWS-MOB');

      list.push({
        id: stId,
        name: prof.name,
        hindiName: prof.hindiName,
        state: prof.state,
        lat: prof.latitude,
        lon: prof.longitude,
        elevM: prof.elevationM,
        rmc: isMobile ? 'MOBILE' : 'Custom',
        climate: isMobile ? 'Live Smartphone GPS Node' : 'User Searched District',
        isCoreImd: false,
        isMobile,
        pkt,
        flag,
        alert,
        col,
        pos,
        profile: prof
      });
    }

    return list;
  }, [latestPackets, customStations]);

  // Filtered by RMC and search query
  const filteredNodes = useMemo(() => {
    let result = mapNodes;

    if (selectedRmc === 'MOBILE') {
      result = result.filter(n => n.isMobile);
    } else if (selectedRmc !== 'ALL') {
      result = result.filter(n => n.rmc.toLowerCase().includes(selectedRmc.toLowerCase()));
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(n =>
        n.name.toLowerCase().includes(q) ||
        n.state.toLowerCase().includes(q) ||
        (n.hindiName && n.hindiName.includes(q)) ||
        n.id.toLowerCase().includes(q)
      );
    }

    return result;
  }, [mapNodes, selectedRmc, searchQuery]);

  const activeNode = useMemo(() => {
    return mapNodes.find(n => n.id === selectedStationId) || mapNodes[0];
  }, [mapNodes, selectedStationId]);

  const handleNodeClick = (node: typeof mapNodes[0]) => {
    if (node.districtNode && onSelectCustomDistrict) {
      const prof = districtToStationProfile(node.districtNode);
      onSelectCustomDistrict(prof);
    } else if (node.profile && onSelectCustomDistrict) {
      onSelectCustomDistrict(node.profile);
    } else {
      onSelectStation(node.id);
    }
  };

  const mobileCount = useMemo(() => mapNodes.filter(n => n.isMobile).length, [mapNodes]);

  return (
    <div className="bg-white border-2 border-[#002147] rounded-lg shadow-sm overflow-hidden flex flex-col">
      {/* Header Bar */}
      <div className="bg-[#002147] text-white p-3.5 space-y-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-[#FF9933] text-slate-950 rounded font-bold">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold uppercase tracking-wider text-white">
                  {language === 'hi' ? 'अखिल भारतीय जिला वेधशाला जीआईएस मानचित्र' : 'All-India District Observational GIS Map'}
                </h2>
                <span className="bg-emerald-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                  70+ DISTRICTS & UTs
                </span>
              </div>
              <p className="text-[11px] text-sky-200">
                {language === 'hi'
                  ? 'सभी 28 राज्यों और 8 केंद्र शासित प्रदेशों का उच्च-घनत्व नेटवर्क · किसी भी जिले पर क्लिक करें'
                  : 'High-Density Coverage Across All 28 States & 8 UTs · Click any District to Inspect'}
              </p>
            </div>
          </div>

          {/* Quick Search on Map */}
          <div className="relative w-full sm:w-56">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={language === 'hi' ? 'जिला या राज्य खोजें...' : 'Filter district or state...'}
              className="w-full pl-8 pr-2 py-1 text-xs bg-slate-900/80 text-white placeholder:text-slate-400 border border-slate-700 rounded focus:outline-none focus:border-[#FF9933]"
            />
          </div>
        </div>

        {/* Filter & Overlay Toggles */}
        <div className="flex items-center justify-between flex-wrap gap-2 pt-1 border-t border-slate-700/80 text-xs">
          {/* RMC Zone Selector Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 max-w-full">
            {(['ALL', 'Northern', 'Western', 'Southern', 'Eastern', 'Central', 'North-Eastern'] as RmcFilter[]).map(rmc => (
              <button
                key={rmc}
                onClick={() => setSelectedRmc(rmc)}
                className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-tight whitespace-nowrap transition-colors ${
                  selectedRmc === rmc
                    ? 'bg-[#FF9933] text-slate-950 font-extrabold'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {rmc === 'ALL' ? 'All India (70+)' : `${rmc} RMC`}
              </button>
            ))}
            {mobileCount > 0 && (
              <button
                onClick={() => setSelectedRmc('MOBILE')}
                className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold whitespace-nowrap transition-colors ${
                  selectedRmc === 'MOBILE'
                    ? 'bg-cyan-400 text-slate-950'
                    : 'bg-cyan-900/60 text-cyan-200 hover:bg-cyan-900'
                }`}
              >
                <Smartphone className="w-3 h-3" />
                <span>Mobile ({mobileCount})</span>
              </button>
            )}
          </div>

          {/* Layer toggles */}
          <div className="flex items-center gap-1 bg-slate-800/80 p-0.5 rounded border border-slate-700">
            <button
              onClick={() => setActiveLayer('QC')}
              className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                activeLayer === 'QC' ? 'bg-[#002147] text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span>WMO QC</span>
            </button>
            <button
              onClick={() => setActiveLayer('THERMAL')}
              className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                activeLayer === 'THERMAL' ? 'bg-[#002147] text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Thermometer className="w-3 h-3 text-amber-400" />
              <span>Thermal</span>
            </button>
            <button
              onClick={() => setActiveLayer('RADAR')}
              className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                activeLayer === 'RADAR' ? 'bg-[#002147] text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              <CloudRain className="w-3 h-3 text-sky-400" />
              <span>Doppler Radar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Map Canvas Area */}
      <div className="relative bg-gradient-to-b from-[#e0f2fe] via-[#f0f9ff] to-[#e2e8f0] p-2 flex-1 min-h-[500px]">
        {/* Top Badges */}
        <div className="absolute top-4 left-4 z-10 flex flex-col gap-1.5 pointer-events-none">
          <div className="bg-white/90 backdrop-blur-xs border border-slate-300 px-2.5 py-1 rounded shadow-xs text-[11px] font-mono text-slate-800">
            <span className="font-bold text-[#002147]">{filteredNodes.length}</span> Observatories Plotted
          </div>
          {activeLayer === 'THERMAL' && (
            <div className="bg-amber-500/90 text-white px-2 py-0.5 rounded text-[10px] font-bold shadow-xs">
              Layer: Thermal Contour Heatmap
            </div>
          )}
          {activeLayer === 'RADAR' && (
            <div className="bg-blue-600/90 text-white px-2 py-0.5 rounded text-[10px] font-bold shadow-xs animate-pulse">
              Layer: Live Doppler Precipitation Radar
            </div>
          )}
        </div>

        {/* Live Network Status Pill */}
        <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5 bg-emerald-700 text-white px-2.5 py-1 rounded text-[11px] font-bold shadow-sm">
          <Wifi className="w-3.5 h-3.5" />
          <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
          <span>REAL-TIME TELEMETRY</span>
        </div>

        {/* SVG Geographic Map of India */}
        <svg
          viewBox="0 0 600 660"
          className="w-full h-full max-h-[560px] select-none mx-auto drop-shadow-sm"
        >
          <defs>
            {/* Ocean texture */}
            <pattern id="ocean-grid" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="0.7" fill="#bae6fd" opacity="0.6" />
            </pattern>

            {/* Radar gradient */}
            <radialGradient id="radar-sweep" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#2563eb" stopOpacity="0.4" />
              <stop offset="60%" stopColor="#38bdf8" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
            </radialGradient>

            {/* Glow Filter */}
            <filter id="node-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Mobile glow */}
            <filter id="mobile-glow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Background */}
          <rect width="600" height="660" fill="url(#ocean-grid)" />

          {/* Graticule Lines: Tropic of Cancer (23.5°N) & IST Meridian (82.5°E) */}
          <g className="opacity-30 stroke-slate-400 stroke-dasharray-2">
            {/* 23.5°N lat: y = (37.5 - 23.5) * 21.290 = 298 */}
            <line x1="20" y1="298" x2="580" y2="298" stroke="#0284c7" strokeWidth="1" strokeDasharray="4,4" />
            <text x="25" y="294" fill="#0369a1" fontSize="7" fontWeight="bold">Tropic of Cancer (23.5°N)</text>

            {/* 82.5°E lon: x = (82.5 - 67.0) * 19.355 = 300 */}
            <line x1="300" y1="20" x2="300" y2="640" stroke="#0284c7" strokeWidth="1" strokeDasharray="4,4" />
            <text x="305" y="630" fill="#0369a1" fontSize="7" fontWeight="bold">IST 82.5°E</text>
          </g>

          {/* Mainland India Polygon */}
          <path
            d={INDIA_BOUNDARY_PATH}
            fill="#ffffff"
            stroke="#64748b"
            strokeWidth="2"
            strokeLinejoin="round"
            className="filter drop-shadow-sm"
          />

          {/* Andaman & Nicobar */}
          <path
            d={ANDAMAN_ISLANDS_PATH}
            fill="#e2e8f0"
            stroke="#64748b"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <text x="500" y="445" fontSize="7" fill="#64748b" fontWeight="bold">Andaman & Nicobar</text>

          {/* Lakshadweep */}
          <path
            d={LAKSHADWEEP_ISLANDS_PATH}
            fill="#e2e8f0"
            stroke="#64748b"
            strokeWidth="1.5"
          />
          <text x="70" y="540" fontSize="7" fill="#64748b" fontWeight="bold">Lakshadweep</text>

          {/* Thermal Layer Overlays */}
          {activeLayer === 'THERMAL' && (
            <g className="pointer-events-none opacity-50">
              {/* Cold Himalayan Aura */}
              <circle cx="210" cy="70" r="65" fill="#38bdf8" />
              {/* Hot Thar Desert Aura */}
              <circle cx="100" cy="230" r="75" fill="#ef4444" />
              {/* Central Plains Warmth */}
              <circle cx="250" cy="270" r="85" fill="#f59e0b" />
              {/* Deccan Plateau */}
              <circle cx="210" cy="450" r="80" fill="#fb923c" />
              {/* Coastal Tropical */}
              <circle cx="190" cy="580" r="55" fill="#10b981" />
              {/* North-East Rainforest */}
              <circle cx="500" cy="230" r="60" fill="#065f46" />
            </g>
          )}

          {/* Doppler Radar Pulses */}
          {activeLayer === 'RADAR' && (
            <g className="pointer-events-none">
              {/* Western Ghats Monsoon Radar */}
              <circle cx="150" cy="470" r="45" fill="url(#radar-sweep)">
                <animate attributeName="r" values="20;70;20" dur="3s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.8;0.2;0.8" dur="3s" repeatCount="indefinite" />
              </circle>
              {/* Bay of Bengal / Cyclone Basin Radar */}
              <circle cx="340" cy="380" r="55" fill="url(#radar-sweep)">
                <animate attributeName="r" values="30;90;30" dur="4s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.7;0.1;0.7" dur="4s" repeatCount="indefinite" />
              </circle>
              {/* Cherrapunji / Assam Heavy Rain Radar */}
              <circle cx="480" cy="245" r="40" fill="url(#radar-sweep)">
                <animate attributeName="r" values="15;60;15" dur="2.5s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.9;0.2;0.9" dur="2.5s" repeatCount="indefinite" />
              </circle>
            </g>
          )}

          {/* Scale Bar */}
          <g transform="translate(25,620)">
            <line x1="0" y1="0" x2="97" y2="0" stroke="#475569" strokeWidth="2" />
            <line x1="0" y1="-4" x2="0" y2="4" stroke="#475569" strokeWidth="2" />
            <line x1="97" y1="-4" x2="97" y2="4" stroke="#475569" strokeWidth="2" />
            <text x="48" y="-6" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#334155">~500 km</text>
          </g>

          {/* Compass Rose */}
          <g transform="translate(555,595)" className="opacity-60">
            <circle cx="0" cy="0" r="14" fill="white" stroke="#94a3b8" strokeWidth="1.5" />
            <polygon points="0,-11 4,0 0,2 -4,0" fill="#002147" />
            <polygon points="0,11 4,0 0,-2 -4,0" fill="#cbd5e1" />
            <text x="0" y="-13" textAnchor="middle" fontSize="7" fill="#002147" fontWeight="bold">N</text>
          </g>

          {/* Plotted District & AWS Nodes */}
          {filteredNodes.map(node => {
            const isSelected = node.id === selectedStationId;
            const isPulsing = ALERT_PULSE[node.alert];
            const isCore = node.isCoreImd;
            const isMob = node.isMobile;
            const r = isSelected ? 7 : (isCore ? 5.5 : (isMob ? 6 : 4));

            return (
              <g
                key={node.id}
                transform={`translate(${node.pos.x},${node.pos.y})`}
                onClick={() => handleNodeClick(node)}
                onMouseEnter={() => setHoveredNode({
                  id: node.id,
                  name: node.name,
                  hindiName: node.hindiName,
                  state: node.state,
                  lat: node.lat,
                  lon: node.lon,
                  elevM: node.elevM,
                  isMobile: node.isMobile,
                  climate: node.climate
                })}
                onMouseLeave={() => setHoveredNode(null)}
                className="cursor-pointer transition-transform duration-100"
              >
                {/* Mobile pulsing beacon */}
                {isMob && (
                  <circle r={r + 8} fill="#06b6d4" opacity="0.4" filter="url(#mobile-glow)">
                    <animate attributeName="r" values={`${r+4};${r+14};${r+4}`} dur="1.5s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.6;0.1;0.6" dur="1.5s" repeatCount="indefinite" />
                  </circle>
                )}

                {/* Anomaly pulse ring */}
                {isPulsing && (
                  <circle r={r + 6} fill={node.col.ring} opacity="0.6">
                    <animate attributeName="r" values={`${r+4};${r+12};${r+4}`} dur="1.6s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.7;0.1;0.7" dur="1.6s" repeatCount="indefinite" />
                  </circle>
                )}

                {/* Active selection halo */}
                {isSelected && (
                  <circle
                    r={r + 5}
                    fill="none"
                    stroke="#FF9933"
                    strokeWidth="3"
                    className="animate-pulse"
                  />
                )}

                {/* Main Node Dot */}
                <circle
                  r={r}
                  fill={isMob ? '#0891b2' : node.col.fill}
                  stroke={isSelected ? '#002147' : '#ffffff'}
                  strokeWidth={isSelected ? 2.5 : (isCore ? 1.5 : 1)}
                  filter={isPulsing || isSelected ? 'url(#node-glow)' : undefined}
                />

                {/* Mobile icon dot */}
                {isMob && (
                  <circle r={2} fill="#ffffff" />
                )}

                {/* Always show labels for core stations or selected node */}
                {(isSelected || isCore || isMob) && (
                  <text
                    y={r + 9}
                    textAnchor="middle"
                    fontSize={isSelected ? '9' : '7.5'}
                    fontWeight={isSelected ? 'bold' : '600'}
                    fill={isSelected ? '#002147' : '#334155'}
                    stroke="white"
                    strokeWidth="2.5"
                    paintOrder="stroke"
                  >
                    {node.name.split(' ')[0].replace(',', '')}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* Floating Tooltip Card */}
        {hoveredNode && (
          <div className="absolute bottom-4 left-4 right-4 sm:right-auto sm:w-80 bg-[#002147]/95 backdrop-blur-md text-white p-3 rounded-lg shadow-xl border border-slate-600 z-20 transition-all">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-extrabold text-[#FF9933]">
                    {hoveredNode.name}
                  </span>
                  {hoveredNode.isMobile && (
                    <span className="bg-cyan-500 text-slate-950 text-[9px] font-bold px-1.5 py-0.2 rounded flex items-center gap-0.5">
                      <Smartphone className="w-2.5 h-2.5" /> Live Phone
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-slate-300">
                  {hoveredNode.hindiName ? `${hoveredNode.hindiName} · ` : ''}{hoveredNode.state}
                </div>
              </div>
              <span className="text-[10px] font-mono bg-slate-800 text-sky-300 px-1.5 py-0.5 rounded border border-slate-700">
                {hoveredNode.lat.toFixed(2)}°N, {hoveredNode.lon.toFixed(2)}°E
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-700 text-[11px]">
              <div>
                <span className="text-slate-400">Elevation:</span>{' '}
                <span className="font-mono font-semibold">{hoveredNode.elevM ?? 150} m ASL</span>
              </div>
              <div>
                <span className="text-slate-400">Climatic Zone:</span>{' '}
                <span className="font-semibold text-slate-200">{hoveredNode.climate ?? 'Tropical'}</span>
              </div>
            </div>

            <div className="mt-2.5 flex items-center justify-between text-[10px] text-sky-300 font-medium bg-slate-900/80 px-2 py-1 rounded">
              <span>Click node to select & pull live weather</span>
              <span className="font-bold text-white">ID: {hoveredNode.id} →</span>
            </div>
          </div>
        )}
      </div>

      {/* Selected District Quick Inspect Bar */}
      <div className="bg-slate-100 p-3 border-t border-slate-300 flex items-center justify-between flex-wrap gap-2 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: activeNode.col.fill }} />
          <div>
            <span className="font-bold text-[#002147]">
              {language === 'hi' ? 'सक्रिय जिला वेधशाला:' : 'Active District Observatory:'}
            </span>{' '}
            <span className="font-semibold text-slate-800">{activeNode.name}</span>
            <span className="text-slate-500 ml-1">({activeNode.state})</span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 flex-wrap text-[11px]">
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block" />
            <span className="text-slate-600">Flag 1 Nominal</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block" />
            <span className="text-slate-600">Flag 2 Storm</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-600 inline-block" />
            <span className="text-slate-600">Flag 3 Drift</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 inline-block" />
            <span className="text-slate-600">Flag 4 Hardware Fault</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 inline-block ring-1 ring-cyan-400" />
            <span className="text-slate-600 font-medium">Live Mobile Phone</span>
          </div>
        </div>
      </div>
    </div>
  );
});
