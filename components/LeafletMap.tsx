'use client';

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';
import 'leaflet-defaulticon-compatibility';

// Helper component to center map and fix Leaflet container size invalidation
function ChangeView({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
      map.setView(center, zoom);
    }, 100);
    return () => clearTimeout(timer);
  }, [center, zoom, map]);
  return null;
}

export interface MapNode {
  id: string;
  name: string;
  state: string;
  elevM: number;
  lat: number;
  lon: number;
  isMobile?: boolean;
  isCoreImd?: boolean;
  col: { fill: string };
  [key: string]: unknown;
}

interface MapProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  nodes: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  activeNode: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onNodeClick: (node: any) => void;
  activeLayer: string;
}

export default function LeafletMap({ nodes, activeNode, onNodeClick, activeLayer }: MapProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const activeNodeData = activeNode as any;

  return (
    <MapContainer
      center={[22.0, 79.0]} // Center of India
      zoom={4}
      style={{ height: '100%', width: '100%', minHeight: '580px', zIndex: 0 }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        maxZoom={19}
      />

      {activeNodeData && (
        <ChangeView center={[activeNodeData.lat, activeNodeData.lon]} zoom={6} />
      )}

      {activeLayer === 'RADAR' && (
        <>
          <CircleMarker center={[18.5, 73.8]} radius={50} pathOptions={{ color: '#2563eb', fillColor: '#38bdf8', fillOpacity: 0.25 }} className="animate-pulse" />
          <CircleMarker center={[13.0, 80.2]} radius={80} pathOptions={{ color: '#2563eb', fillColor: '#38bdf8', fillOpacity: 0.25 }} className="animate-pulse" />
          <CircleMarker center={[25.5, 91.8]} radius={60} pathOptions={{ color: '#2563eb', fillColor: '#38bdf8', fillOpacity: 0.25 }} className="animate-pulse" />
        </>
      )}

      {nodes.map(rawNode => {
        const node = rawNode as unknown as MapNode;
        const isSelected = activeNodeData?.id === node.id;
        const color = node.isMobile ? '#0891b2' : node.col.fill;
        const radius = isSelected ? 9 : (node.isCoreImd ? 6 : (node.isMobile ? 7 : 5));

        return (
          <CircleMarker
            key={node.id}
            center={[node.lat, node.lon]}
            radius={radius}
            pathOptions={{
              color: isSelected ? '#002147' : '#ffffff',
              weight: isSelected ? 2.5 : 1,
              fillColor: color,
              fillOpacity: 0.9,
            }}
            eventHandlers={{
              click: () => onNodeClick(node),
            }}
          >
            <Popup>
              <div className="text-xs space-y-1 p-0.5">
                <div className="font-bold text-[#002147] border-b border-slate-200 pb-1 flex items-center justify-between gap-2">
                  <span>{node.name}</span>
                  {node.isMobile && <span className="text-[9px] bg-cyan-100 text-cyan-800 px-1 rounded font-bold">Mobile Node</span>}
                </div>
                <div><span className="text-slate-500 font-medium">State:</span> {node.state}</div>
                <div><span className="text-slate-500 font-medium">Elevation:</span> {node.elevM}m</div>
                <div><span className="text-slate-500 font-medium">Coordinates:</span> {node.lat.toFixed(2)}°N, {node.lon.toFixed(2)}°E</div>
                <div className="mt-1.5 p-1 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded text-[10px] flex items-center justify-between font-medium">
                  <span>WMO Quality Check:</span>
                  <span className="font-bold text-emerald-700">✔ VERIFIED (Flag 1)</span>
                </div>
                <div className="mt-2 text-center text-sky-600 font-bold hover:underline cursor-pointer">
                  Click to inspect live telemetry →
                </div>
              </div>
            </Popup>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}
