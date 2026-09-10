'use client';

import React, { useState, useMemo } from 'react';
import { TelemetryPacket, WMOQualityFlag, GovAlertLevel } from '@/lib/anomalyLogic';
import { IMD_AWS_STATIONS, IMDStationProfile } from '@/lib/stationData';
import { ALL_INDIA_DISTRICTS, DistrictGeoNode, districtToStationProfile } from '@/lib/indiaDistrictCatalog';
import {
  MapPin,
  Wifi,
  Smartphone,
  Thermometer,
  CloudRain,
  ShieldCheck,
  Search
} from 'lucide-react';
import dynamic from 'next/dynamic';

const DynamicLeafletMap = dynamic(() => import('./LeafletMap'), {
  ssr: false,
  loading: () => <div className="w-full h-full min-h-[500px] flex items-center justify-center bg-slate-100 text-slate-500">Loading Interactive Map...</div>
});

interface Props {
  latestPackets: Record<string, TelemetryPacket>;
  selectedStationId: string;
  onSelectStation: (id: string) => void;
  onSelectCustomDistrict?: (districtProfile: IMDStationProfile) => void;
  customStations?: Record<string, IMDStationProfile>;
  language?: 'en' | 'hi';
}

const toXY = (lat: number, lon: number) => ({
  x: Math.round((lon - 67.0) * 19.355),
  y: Math.round((37.5 - lat) * 21.290),
});

const FLAG_COLORS: Record<WMOQualityFlag | 'UNKNOWN', { fill: string; ring: string; label: string }> = {
  FLAG_1_VERIFIED_GOOD:    { fill: '#16a34a', ring: '#bbf7d0', label: 'Nominal' },
  FLAG_2_CONVECTIVE_STORM: { fill: '#2563eb', ring: '#bfdbfe', label: 'Storm' },
  FLAG_3_SUSPECT_DRIFT:    { fill: '#d97706', ring: '#fde68a', label: 'Drift' },
  FLAG_4_CORRUPT_HARDWARE: { fill: '#dc2626', ring: '#fecaca', label: 'Fault' },
  FLAG_5_PACKET_LOSS:      { fill: '#7c3aed', ring: '#ede9fe', label: 'Packet Loss' },
  UNKNOWN:                 { fill: '#64748b', ring: '#e2e8f0', label: 'Standby' },
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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
      <div className="relative bg-gradient-to-b from-[#e0f2fe] via-[#f0f9ff] to-[#e2e8f0] p-2 flex-1 min-h-[620px] lg:h-[720px]">
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

        {/* Dynamic Leaflet Map of India */}
        <div className="w-full h-full min-h-[620px] lg:h-[720px] rounded-lg overflow-hidden border border-slate-300 drop-shadow-sm">
          <DynamicLeafletMap 
            nodes={filteredNodes}
            activeNode={activeNode}
            onNodeClick={handleNodeClick}
            activeLayer={activeLayer}
          />
        </div>


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
