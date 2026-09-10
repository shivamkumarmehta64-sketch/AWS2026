'use client';

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';
import 'leaflet-defaulticon-compatibility';
import { DistrictLiveState } from '@/lib/districtEngine';
import { evaluateIMDHeatwave } from '@/lib/heatwaveEngine';
import { BasemapStyle, BASEMAP_TILES } from './LeafletMap';

interface Props {
  districts: DistrictLiveState[];
  selectedDistrictId: string | null;
  onSelectDistrict: (districtId: string) => void;
  activeLayer: 'QC' | 'HEATWAVE';
  basemap?: BasemapStyle;
  selectedState?: string;
}

// Helper to handle auto pan and zoom when state or district selection changes
function StateViewManager({
  selectedState,
  districts,
  selectedDistrictId
}: {
  selectedState?: string;
  districts: DistrictLiveState[];
  selectedDistrictId: string | null;
}) {
  const map = useMap();

  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 100);
    return () => clearTimeout(timer);
  }, [map]);

  useEffect(() => {
    if (selectedDistrictId) {
      const match = districts.find(d => d.district.id === selectedDistrictId);
      if (match) {
        map.setView([match.district.lat, match.district.lng], 8, { animate: true });
        return;
      }
    }

    if (selectedState && selectedState !== 'ALL') {
      const inState = districts.filter(d => d.district.state.toLowerCase() === selectedState.toLowerCase());
      if (inState.length > 0) {
        const avgLat = inState.reduce((sum, d) => sum + d.district.lat, 0) / inState.length;
        const avgLng = inState.reduce((sum, d) => sum + d.district.lng, 0) / inState.length;
        map.setView([avgLat, avgLng], 6.5, { animate: true });
        return;
      }
    }

    if (!selectedDistrictId && (!selectedState || selectedState === 'ALL')) {
      map.setView([22.5, 79.5], 4.5, { animate: true });
    }
  }, [selectedState, districts, selectedDistrictId, map]);

  return null;
}

export default function VayuLeafletMap({
  districts,
  selectedDistrictId,
  onSelectDistrict,
  activeLayer,
  basemap = 'DARK',
  selectedState = 'ALL'
}: Props) {
  const tileConfig = BASEMAP_TILES[basemap] || BASEMAP_TILES.DARK;

  return (
    <MapContainer
      center={[22.5, 79.5]}
      zoom={4.5}
      style={{ height: '100%', width: '100%', minHeight: '520px', zIndex: 0 }}
      zoomControl={true}
    >
      <TileLayer
        key={basemap}
        attribution={tileConfig.attribution}
        url={tileConfig.url}
        maxZoom={tileConfig.maxZoom}
        subdomains={tileConfig.subdomains ?? 'abc'}
      />

      <StateViewManager
        selectedState={selectedState}
        districts={districts}
        selectedDistrictId={selectedDistrictId}
      />

      {districts.map(entry => {
        const d = entry.district;
        const isSelected = selectedDistrictId === d.id;

        let fillColor = '#22c55e'; // default healthy
        let statusLabel = 'Healthy (Nominal)';

        if (activeLayer === 'HEATWAVE') {
          const hw = evaluateIMDHeatwave(d, entry.reading, entry.history);
          if (hw.warningLevel === 'WARNING_SEVERE') {
            fillColor = '#ef4444';
            statusLabel = 'Severe Heatwave Alert (Red)';
          } else if (hw.warningLevel === 'ALERT') {
            fillColor = '#f97316';
            statusLabel = 'Heatwave Alert (Orange)';
          } else if (hw.warningLevel === 'WATCH') {
            fillColor = '#eab308';
            statusLabel = 'Heatwave Watch (Yellow)';
          } else {
            fillColor = '#22c55e';
            statusLabel = 'Normal Thermal Index (Green)';
          }
        } else {
          // QC Layer
          if (entry.health === 'CRITICAL') {
            fillColor = '#ef4444';
            statusLabel = 'Critical Sensor Anomaly';
          } else if (entry.health === 'DEGRADED') {
            fillColor = '#eab308';
            statusLabel = 'Degraded Calibration Drift';
          } else if (entry.health === 'OFFLINE') {
            fillColor = '#64748b';
            statusLabel = 'Offline Station';
          } else if (entry.health === 'LOADING') {
            fillColor = '#3b82f6';
            statusLabel = 'Syncing Live Ingest';
          } else {
            fillColor = '#22c55e';
            statusLabel = 'WMO Flag 1 Verified Good';
          }
        }

        const radius = isSelected ? 9 : (activeLayer === 'HEATWAVE' ? 4 : 3.5);

        return (
          <CircleMarker
            key={d.id}
            center={[d.lat, d.lng]}
            radius={radius}
            pathOptions={{
              color: isSelected ? '#38bdf8' : '#ffffff',
              weight: isSelected ? 2.5 : 0.8,
              fillColor,
              fillOpacity: isSelected ? 1 : 0.85
            }}
            eventHandlers={{
              click: () => onSelectDistrict(d.id)
            }}
          >
            <Popup>
              <div className="text-xs space-y-1.5 p-1 min-w-[210px] font-sans">
                <div className="font-extrabold text-slate-900 border-b border-slate-200 pb-1 flex items-center justify-between gap-1">
                  <span>{d.name}</span>
                  <span className="text-[10px] font-mono text-slate-500">{d.id}</span>
                </div>
                <div className="text-[11px] text-slate-600">
                  <div><span className="font-semibold text-slate-700">State:</span> {d.state}</div>
                  <div><span className="font-semibold text-slate-700">Coordinates:</span> {d.lat.toFixed(2)}°N, {d.lng.toFixed(2)}°E</div>
                </div>

                {/* Telemetry preview */}
                {entry.reading && (
                  <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1.5 rounded text-[10px] font-mono text-slate-800">
                    <div>
                      <div className="text-[9px] text-slate-500 font-sans">TEMP</div>
                      <div className="font-bold text-slate-900">
                        {entry.reading.temperature_2m != null ? entry.reading.temperature_2m.toFixed(1) : '--'}°C
                      </div>
                    </div>
                    <div>
                      <div className="text-[9px] text-slate-500 font-sans">HUMID</div>
                      <div className="font-bold text-slate-900">
                        {entry.reading.relative_humidity_2m != null ? entry.reading.relative_humidity_2m.toFixed(0) : '--'}%
                      </div>
                    </div>
                    <div>
                      <div className="text-[9px] text-slate-500 font-sans">PRESS</div>
                      <div className="font-bold text-slate-900">
                        {entry.reading.surface_pressure != null
                          ? entry.reading.surface_pressure.toFixed(0)
                          : entry.reading.pressure_msl != null
                          ? entry.reading.pressure_msl.toFixed(0)
                          : '--'} hPa
                      </div>
                    </div>
                  </div>
                )}

                <div className="p-1 rounded text-[10px] font-bold text-white text-center shadow-xs" style={{ backgroundColor: fillColor }}>
                  {statusLabel}
                </div>

                <button
                  type="button"
                  onClick={() => onSelectDistrict(d.id)}
                  className="w-full mt-1 py-1 px-2 bg-[#002147] hover:bg-[#003366] text-white text-[11px] font-bold rounded text-center transition-colors shadow-xs"
                >
                  Select District for Deep Diagnostic →
                </button>
              </div>
            </Popup>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}
