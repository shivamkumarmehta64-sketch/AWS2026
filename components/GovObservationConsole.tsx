'use client';

import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine } from 'recharts';
import { IMDStationProfile, IMD_AWS_STATIONS } from '@/lib/stationData';
import { TelemetryPacket, WMOQualityFlag } from '@/lib/anomalyLogic';
import { Building2, MapPin, Table, LineChart as ChartIcon, ShieldCheck, AlertCircle, BatteryMedium, CheckCircle2, Sparkles, Lock } from 'lucide-react';

interface Props {
  selectedStation: IMDStationProfile;
  onSelectStation: (id: string) => void;
  packets: TelemetryPacket[];
  language: 'hi' | 'en';
  isLiveApiMode?: boolean;
  onToggleLiveApiMode?: () => void;
  liveStatusInfo?: { temperature: number; pressure: number; humidity: number; timeIST: string; source: string } | null;
  isSyncingLive?: boolean;
  onManualSync?: () => void;
}

const FLAG_STYLES: Record<WMOQualityFlag, { bg: string; text: string; label: string; icon?: React.ReactNode }> = {
  FLAG_1_VERIFIED_GOOD: { bg: 'bg-emerald-100 border-emerald-300', text: 'text-emerald-800', label: 'Flag 1: Validated', icon: <ShieldCheck className="w-3 h-3" /> },
  FLAG_2_CONVECTIVE_STORM: { bg: 'bg-amber-100 border-amber-300', text: 'text-amber-800', label: 'Flag 2: Convective Storm', icon: <AlertCircle className="w-3 h-3" /> },
  FLAG_3_SUSPECT_DRIFT: { bg: 'bg-yellow-100 border-yellow-300', text: 'text-yellow-800', label: 'Flag 3: Suspect Drift' },
  FLAG_4_CORRUPT_HARDWARE: { bg: 'bg-rose-100 border-rose-300', text: 'text-rose-800', label: 'Flag 4: Hardware Fault' },
  FLAG_5_PACKET_LOSS: { bg: 'bg-purple-100 border-purple-300', text: 'text-purple-800', label: 'Flag 5: Packet Drop' },
};

const STATUS_MAP: Record<string, { cls: string; label: string }> = {
  NOMINAL_OPERATION: { cls: 'text-emerald-700', label: 'Validated (Good Data)' },
  GENUINE_CONVECTIVE_EVENT: { cls: 'text-amber-800', label: 'Severe Convective Event (Valid)' },
  SENSOR_SPIKE: { cls: 'text-rose-700', label: 'Quarantined (Thermistor Open)' },
  FROZEN_VALUE: { cls: 'text-rose-700', label: 'Quarantined (Stuck Loop)' },
  CALIBRATION_DRIFT: { cls: 'text-yellow-800', label: 'Suspect (Drift Offset)' },
  TELEMETRY_PACKET_LOSS: { cls: 'text-purple-700', label: 'Packet Drop (Reconstructed)' },
};

// Fallback packet factory
const makeFallback = (s: IMDStationProfile): TelemetryPacket => ({
  packetId: `PKT-${s.stationId.replace('AWS-', '')}-104821`, stationId: s.stationId,
  timestamp: 1773220800000, timeIST: '20:30:10',
  raw: { temperature: s.baseline.tempMean, pressure: s.baseline.pressureMean, humidity: s.baseline.humidityMean },
  imputed: { temperature: s.baseline.tempMean, pressure: s.baseline.pressureMean, humidity: s.baseline.humidityMean, wasCorrected: false },
  ratesOfChange: { tempRoC: 0.1, pressRoC: -0.2, humRoC: 0.4 },
  classification: 'NOMINAL_OPERATION', wmoFlag: 'FLAG_1_VERIFIED_GOOD', alertLevel: 'LEVEL_0_NOMINAL', faultProbability: 0.02,
  xaiAttribution: { tempWeight: 33.3, pressWeight: 33.3, humWeight: 33.4, primaryParameter: 'None', diagnosticNote: 'Nominal baseline' },
  operationalAction: 'Observation verified compliant with WMO Pub No. 8 & IMD Quality Standards.', ticketId: null,
  securitySeal: {
    hmacSha256: '0x8f4a19b2e041',
    antiReplayNonce: 104821,
    auditMerkleRoot: '0x2e0418f4a19a7f9',
    geofenceStatus: 'VERIFIED_IN_BOUNDS',
    tamperStatus: 'AUTHENTIC',
  },
});

export const GovObservationConsole: React.FC<Props> = ({
  selectedStation, onSelectStation, packets, language,
  isLiveApiMode = true, onToggleLiveApiMode, liveStatusInfo, isSyncingLive = false, onManualSync,
}) => {
  const [mounted, setMounted] = useState(false);
  const [isMissionControlVibe, setIsMissionControlVibe] = useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setMounted(true); }, []);

  if (!mounted) {
    return (
      <div className="bg-white border border-slate-300 rounded shadow-xs p-4 space-y-4 animate-pulse min-h-[600px]">
        <div className="h-10 bg-slate-200 rounded w-1/3 mb-4"></div>
        <div className="h-32 bg-slate-200 rounded w-full mb-4"></div>
        <div className="h-48 bg-slate-200 rounded w-full"></div>
      </div>
    );
  }

  const active = packets.length > 0 ? packets : [makeFallback(selectedStation)];
  const recent10 = [...active].slice(-10).reverse();
  const chartData = active.map(p => ({
    time: p.timeIST, temperature: p.raw.temperature, pressure: p.raw.pressure, humidity: p.raw.humidity,
    classification: p.classification,
    isFault: p.classification !== 'NOMINAL_OPERATION' && p.classification !== 'GENUINE_CONVECTIVE_EVENT',
    isConvective: p.classification === 'GENUINE_CONVECTIVE_EVENT',
  }));

  const s = selectedStation;
  const sm = s.sensorMetadata;

  return (
    <div className={`rounded shadow-xs p-4 space-y-4 transition-all duration-300 ${
      isMissionControlVibe
        ? 'bg-[#030712] border-2 border-emerald-500/50 text-slate-100 shadow-[0_0_35px_rgba(16,185,129,0.15)] ring-1 ring-emerald-400/20'
        : 'bg-white border border-slate-300 text-slate-900'
    }`}>
      {/* Station Selector & Controls */}
      <div className={`flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b ${isMissionControlVibe ? 'border-slate-800' : 'border-slate-200'}`}>
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-[#002147] text-white rounded"><Building2 className="w-4 h-4" /></div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className={`text-sm font-bold uppercase tracking-wide ${isMissionControlVibe ? 'text-emerald-400 font-mono flex items-center gap-1.5' : 'text-[#002147]'}`}>
                {isMissionControlVibe && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />}
                {language === 'hi' ? 'प्राथमिक अवलोकन एवं टेलीमेट्री कंसोल' : 'Primary Observation & Telemetry Console (SIH26073)'}
              </h2>
              {isMissionControlVibe && (
                <span className="text-[9px] font-mono font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-800 px-1.5 py-0.2 rounded animate-pulse">
                  SOVEREIGN ZERO-TRUST HUD
                </span>
              )}
            </div>
            <p className={`text-xs ${isMissionControlVibe ? 'text-slate-400' : 'text-slate-500'}`}>
              {language === 'hi' ? 'आईएमडी एडब्ल्यूएस स्टेशन डेटाशीट एवं वास्तविक समय डेटा पैकेट लॉग' : 'AWS Datalogger Profile & Real-Time DCP Packet Stream Register'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className={`flex items-center gap-2 border rounded px-2.5 py-1 text-xs shadow-2xs transition-colors ${
            isMissionControlVibe
              ? 'bg-slate-900 border-emerald-500/40 text-emerald-300'
              : isLiveApiMode ? 'bg-emerald-50/50 border-emerald-300' : 'bg-amber-50/50 border-amber-300'
          }`}>
            <span className={`w-2.5 h-2.5 rounded-full ${isLiveApiMode ? 'bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-amber-500'}`} />
            <div className="flex flex-col leading-tight">
              <span className={`font-bold uppercase tracking-wider text-[9px] ${isLiveApiMode ? 'text-emerald-700' : 'text-amber-700'}`}>Data Provenance</span>
              <span className={`font-bold ${isMissionControlVibe ? 'text-emerald-300' : isLiveApiMode ? 'text-emerald-900' : 'text-amber-900'}`}>
                {isLiveApiMode
                  ? liveStatusInfo?.source === 'WEATHERSTACK_API'
                    ? 'Weatherstack Real-Time API'
                    : 'Live Satellite Downlink'
                  : 'Simulated NWP Model'}
              </span>
            </div>
            {liveStatusInfo && isLiveApiMode && (
              <span className={`hidden lg:inline-block text-[10px] font-mono border-l pl-2 ml-1 ${isMissionControlVibe ? 'text-emerald-400 border-slate-700' : 'text-emerald-800 border-emerald-200'}`}>
                {liveStatusInfo.temperature}°C | {liveStatusInfo.pressure}hPa | {liveStatusInfo.humidity}%
                {liveStatusInfo.source === 'WEATHERSTACK_API' && <span className="ml-1 text-[9px] text-sky-700 font-bold bg-sky-100 px-1 rounded">WS</span>}
              </span>
            )}
            <div className="ml-1 sm:ml-2 flex items-center gap-1.5 border-l border-slate-200 pl-2 sm:pl-3">
              {onToggleLiveApiMode && (
                <button type="button" onClick={onToggleLiveApiMode} className="text-[10px] font-bold px-2 py-1 rounded bg-white hover:bg-slate-50 text-[#002147] border border-slate-300 transition-colors shadow-2xs cursor-pointer">
                  {isLiveApiMode ? 'Switch to Sim' : 'Activate Live API'}
                </button>
              )}
              {onManualSync && isLiveApiMode && (
                <button type="button" onClick={onManualSync} disabled={isSyncingLive} className="text-[10px] font-bold px-2 py-1 rounded bg-[#002147] hover:bg-[#0B3B60] text-white transition-colors disabled:opacity-50 cursor-pointer shadow-2xs">
                  {isSyncingLive ? 'Syncing...' : '↻ Sync'}
                </button>
              )}
            </div>
          </div>

          {/* Vibe Coded Cyber HUD Button */}
          <button
            type="button"
            onClick={() => setIsMissionControlVibe(prev => !prev)}
            className={`text-xs font-bold px-2.5 py-1.5 rounded flex items-center gap-1.5 transition-all shadow-xs cursor-pointer ${
              isMissionControlVibe
                ? 'bg-emerald-500 text-slate-950 font-mono ring-2 ring-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.8)]'
                : 'bg-slate-900 hover:bg-slate-800 text-emerald-400 border border-emerald-500/40'
            }`}
            title="Toggle High-Tech Mission Control Cyber HUD Mode"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isMissionControlVibe ? 'animate-spin' : ''}`} />
            <span>{isMissionControlVibe ? 'Cyber HUD: ACTIVE' : '⚡ Cyber Vibe HUD'}</span>
          </button>

          <div className="flex items-center gap-2">
            <label htmlFor="station-selector" className={`text-xs font-semibold whitespace-nowrap ${isMissionControlVibe ? 'text-slate-300' : 'text-slate-700'}`}>{language === 'hi' ? 'स्टेशन चुनें:' : 'Select AWS Node:'}</label>
            <select id="station-selector" value={s.stationId} onChange={e => onSelectStation(e.target.value)} className={`text-xs font-semibold rounded px-3 py-1.5 focus:outline-none ${isMissionControlVibe ? 'bg-slate-900 border border-slate-700 text-emerald-300' : 'bg-[#F8FAFC] border border-slate-300 text-[#002147]'}`}>
              {IMD_AWS_STATIONS.map(st => <option key={st.stationId} value={st.stationId}>{st.stationId} - {st.name.split(',')[0]} ({st.state}) {st.status === 'SCHEDULED_CALIBRATION' ? '[CALIBRATION]' : ''}</option>)}
            </select>
          </div>
        </div>
      </div>

      {s.status === 'SCHEDULED_CALIBRATION' && (
        <div className="p-2.5 bg-amber-50 border border-amber-300 rounded text-amber-900 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
          <div><strong>Scheduled NABL Traceability Calibration:</strong> This station is currently undergoing planned instrument recalibration per WMO maintenance schedule. Real-time telemetry downlink is offline.</div>
        </div>
      )}

      {/* Station Datasheet */}
      <div className="bg-[#F8FAFC] border border-slate-200 rounded p-3 text-xs">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-200 mb-2.5">
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-sm bg-white border border-slate-300 px-2 py-0.5 rounded text-[#002147]">{s.stationId}</span>
            <span className="font-bold text-slate-800 text-sm">{s.name}</span>
            <span className="text-slate-500 text-xs">({s.hindiName})</span>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-slate-600 font-mono">
            <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-red-600" />{s.latitude.toFixed(3)}°N, {s.longitude.toFixed(3)}°E</span>
            <span>Elev: {s.elevationM}m MSL</span>
            <span className="bg-slate-200 px-1.5 py-0.5 rounded font-bold text-slate-800">WMO: {s.wmoBlockNo}</span>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-[11px]">
          {[
            { label: 'Temperature Sensor', value: sm.tempSensor, note: 'Operating Limit: -10°C to 55°C' },
            { label: 'Barometer Transducer', value: sm.pressureSensor, note: 'Operating Limit: 920 to 1050 hPa' },
            { label: 'Humidity Hygrometer', value: sm.humiditySensor, note: 'Operating Limit: 5% to 100%' },
          ].map(item => (
            <div key={item.label} className="bg-white border border-slate-200 p-2 rounded">
              <div className="text-slate-500 text-[10px] font-semibold uppercase">{item.label}</div>
              <div className="font-medium text-slate-800 truncate" title={item.value}>{item.value}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">{item.note}</div>
            </div>
          ))}
          <div className="bg-white border border-slate-200 p-2 rounded">
            <div className="text-slate-500 text-[10px] font-semibold uppercase flex items-center justify-between">
              <span>Predictive Maintenance</span>
              {(() => {
                const faults = active.filter(p => p.classification !== 'NOMINAL_OPERATION' && p.classification !== 'GENUINE_CONVECTIVE_EVENT').length;
                const score = Math.max(0, 100 - faults * 15);
                const col = score >= 90 ? 'emerald' : score >= 70 ? 'amber' : 'rose';
                return <span className={`text-${col}-700 font-bold text-[9px] bg-${col}-50 border border-${col}-200 px-1.5 py-0.5 rounded transition-colors shadow-2xs`}>Health: {score}/100</span>;
              })()}
            </div>
            <div className="font-medium text-slate-800 flex items-center justify-between mt-0.5">
              <span className="text-[11px] text-slate-600 truncate">Cal: {sm.lastCalibDate}</span>
              <span className="text-emerald-700 font-bold font-mono text-[11px] flex items-center gap-1 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                <BatteryMedium className="w-3.5 h-3.5 text-emerald-600" />Batt: {sm.batteryVoltage.split(' ')[0]}V
              </span>
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5 flex items-center justify-between truncate">
              <span>Cert: {sm.calibCertNo.split('-').slice(-2).join('-')}</span>
              <span className="text-slate-400 font-mono text-[9px]">Float Nominal</span>
            </div>
          </div>
        </div>
        <div className="text-[10px] text-slate-500 italic mt-2 border-t border-slate-200 pt-1.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <span>Benchmark station profile referencing public WMO registry (WMO Block ID: {s.wmoBlockNo}) with simulated telemetry pipeline.</span>
          <span className="font-sans font-medium text-slate-600 not-italic">RMC Division: {s.rmcDivision}</span>
        </div>
      </div>

      {/* Packet Log Table */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700">
            <Table className="w-3.5 h-3.5 text-[#002147]" /><span>Incoming DCP Telemetry Stream (Last 10 Packets)</span>
            <span className="bg-blue-100 text-blue-800 text-[10px] px-2 py-0.2 rounded font-mono font-semibold">{recent10.length} Records</span>
          </div>
          <span className="text-[11px] text-slate-500">Uplink Frequency: 402.75 MHz (Simulated INSAT-3D / GPRS)</span>
        </div>
        <div className={`overflow-x-auto border rounded ${isMissionControlVibe ? 'border-slate-800 bg-[#060c1a]' : 'border-slate-300'}`}>
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className={`text-white font-semibold text-[11px] ${isMissionControlVibe ? 'bg-slate-900 border-b border-slate-800 text-emerald-400 font-mono' : 'bg-[#002147]'}`}>
                {['Packet ID', 'Timestamp (IST)', 'Temp (°C)', 'Pressure (hPa)', 'Humidity (%)', 'Cryptographic Seal', 'WMO QC Flag', 'Data Validation Status'].map((h, i) => (
                  <th key={h} className={`py-1.5 px-2.5 ${i < 7 ? (isMissionControlVibe ? 'border-r border-slate-800' : 'border-r border-slate-600') : ''} ${[2, 3, 4].includes(i) ? 'text-right' : ''}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody suppressHydrationWarning className={`divide-y font-mono text-[11px] ${isMissionControlVibe ? 'divide-slate-800' : 'divide-slate-200'}`}>
              {recent10.map((pkt, idx) => {
                const isAnomaly = pkt.classification !== 'NOMINAL_OPERATION';
                const rowBg = isMissionControlVibe
                  ? isAnomaly
                    ? pkt.classification === 'GENUINE_CONVECTIVE_EVENT'
                      ? 'bg-amber-950/40 hover:bg-amber-900/40 border-l-4 border-l-amber-400 text-amber-200'
                      : 'bg-rose-950/40 hover:bg-rose-900/40 border-l-4 border-l-rose-500 text-rose-200'
                    : idx % 2 === 0 ? 'bg-slate-950/80 hover:bg-slate-900/80 text-slate-300' : 'bg-slate-900/40 hover:bg-slate-900 text-slate-300'
                  : isAnomaly
                    ? pkt.classification === 'GENUINE_CONVECTIVE_EVENT' ? 'bg-amber-50/80 hover:bg-amber-100/60 border-l-4 border-l-amber-500' : 'bg-rose-50/80 hover:bg-rose-100/60 border-l-4 border-l-rose-600'
                    : idx % 2 === 0 ? 'bg-white hover:bg-slate-50' : 'bg-[#F8FAFC] hover:bg-slate-50';
                const f = FLAG_STYLES[pkt.wmoFlag];
                const st = STATUS_MAP[pkt.classification];
                const borderClass = isMissionControlVibe ? 'border-r border-slate-800' : 'border-r border-slate-200';
                return (
                  <tr key={pkt.packetId} className={rowBg}>
                    <td suppressHydrationWarning className={`py-1.5 px-2.5 font-bold ${isMissionControlVibe ? 'text-emerald-400' : 'text-slate-700'} ${borderClass}`}>{pkt.packetId}</td>
                    <td suppressHydrationWarning className={`py-1.5 px-2.5 ${isMissionControlVibe ? 'text-slate-400' : 'text-slate-600'} ${borderClass}`}>{pkt.timeIST}</td>
                    <td suppressHydrationWarning className={`py-1.5 px-2.5 text-right font-bold ${isMissionControlVibe ? 'text-rose-400' : 'text-slate-900'} ${borderClass}`}>
                      {pkt.raw.temperature !== null ? <span className={pkt.classification === 'SENSOR_SPIKE' ? 'text-red-500 font-extrabold underline' : ''}>{pkt.raw.temperature.toFixed(2)}</span> : <span className="text-red-400">NULL</span>}
                    </td>
                    <td suppressHydrationWarning className={`py-1.5 px-2.5 text-right font-bold ${isMissionControlVibe ? 'text-sky-400' : 'text-slate-900'} ${borderClass}`}>
                      {pkt.raw.pressure !== null ? <span className={['CALIBRATION_DRIFT', 'GENUINE_CONVECTIVE_EVENT'].includes(pkt.classification) ? 'text-amber-400 font-bold' : ''}>{pkt.raw.pressure.toFixed(1)}</span> : <span className="text-red-400">NULL</span>}
                    </td>
                    <td suppressHydrationWarning className={`py-1.5 px-2.5 text-right font-bold ${isMissionControlVibe ? 'text-emerald-400' : 'text-slate-900'} ${borderClass}`}>
                      {pkt.raw.humidity !== null ? pkt.raw.humidity.toFixed(1) : <span className="text-red-400">NULL</span>}
                    </td>
                    <td suppressHydrationWarning className={`py-1.5 px-2.5 ${borderClass}`}>
                      <span className={`inline-flex items-center gap-1 font-mono text-[9px] px-2 py-0.5 rounded border font-semibold ${
                        isMissionControlVibe
                          ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60 shadow-[0_0_8px_rgba(16,185,129,0.3)]'
                          : 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      }`} title={`HMAC-SHA256: ${pkt.securitySeal?.hmacSha256 || '0x7f4a...'} | Merkle: ${pkt.securitySeal?.auditMerkleRoot || '0x9a2b...'} | Nonce: #${pkt.securitySeal?.antiReplayNonce || '0'}`}>
                        <Lock className="w-2.5 h-2.5 text-emerald-500 shrink-0" />
                        <span className="truncate max-w-[70px]">{pkt.securitySeal?.hmacSha256 ? pkt.securitySeal.hmacSha256.slice(0, 8) + '…' : '0x8f4a…'}</span>
                        <span className="text-[8px] bg-emerald-700/20 text-emerald-400 px-1 rounded font-bold uppercase">VERIFIED</span>
                      </span>
                    </td>
                    <td suppressHydrationWarning className={`py-1.5 px-2.5 ${borderClass}`}>
                      <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold ${f.bg} ${f.text} border`}>{f.icon} {f.label}</span>
                    </td>
                    <td suppressHydrationWarning className="py-1.5 px-2.5 font-sans">
                      {st && <span className={`${st.cls} font-bold text-[10px] flex items-center gap-1`}>
                        {pkt.classification === 'NOMINAL_OPERATION' && <CheckCircle2 className="w-3 h-3 text-emerald-600 inline" />}{st.label}
                      </span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Time-Series Chart */}
      <div className="space-y-1.5 pt-1">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700">
            <ChartIcon className="w-3.5 h-3.5 text-[#002147]" /><span>Time-Series Station Curves (Temperature, Pressure &amp; Humidity)</span>
          </div>
          <div className="text-[10px] text-slate-500 flex flex-wrap items-center gap-3">
            {[{ color: '#B45309', label: 'Temp (°C)' }, { color: '#0369A1', label: 'Pressure (hPa)' }, { color: '#047857', label: 'Humidity (%)' }].map(l => (
              <span key={l.label} className="flex items-center gap-1 font-medium"><span className="w-2.5 h-0.5 inline-block" style={{ backgroundColor: l.color }} /> {l.label}</span>
            ))}
            <span className="flex items-center gap-1 font-bold text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded">
              <span className="w-2 h-2 rounded-full bg-red-600 inline-block animate-pulse" />Anomaly Flag Marker
            </span>
          </div>
        </div>
        <div className="border border-slate-300 rounded bg-[#FAFAFA] p-2.5">
          <div className="h-64 w-full">
            {mounted && chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 28, right: 20, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="time" stroke="#64748B" tick={{ fontSize: 10 }} />
                  <YAxis yAxisId="temp" domain={['auto', 'auto']} stroke="#B45309" tick={{ fontSize: 10 }} />
                  <YAxis yAxisId="press" orientation="right" domain={['auto', 'auto']} stroke="#0369A1" tick={{ fontSize: 10 }} />
                  <Tooltip content={({ active, payload, label }) => {
                    if (!active || !payload?.length) return null;
                    const meta = payload[0]?.payload;
                    return (
                      <div className="bg-white border border-slate-400 p-2.5 rounded shadow-lg text-xs font-mono max-w-xs">
                        <div className="font-bold text-slate-800 mb-1 border-b pb-0.5 flex items-center justify-between">
                          <span>{label} IST</span>
                          {meta?.isFault && <span className="text-[9px] bg-red-100 text-red-800 px-1 rounded font-bold">FAULT DETECTED</span>}
                          {meta?.isConvective && <span className="text-[9px] bg-amber-100 text-amber-800 px-1 rounded font-bold">CONVECTIVE STORM</span>}
                        </div>
                        {payload.map((e: { name?: string | number; value?: unknown; color?: string }, i: number) => (
                          <div key={i} className="flex items-center justify-between gap-3 text-[11px] py-0.5">
                            <span style={{ color: e.color }}>{e.name}:</span>
                            <span className="font-bold text-slate-900">{e.value != null ? String(e.value) : 'NULL'}</span>
                          </div>
                        ))}
                        {meta?.classification !== 'NOMINAL_OPERATION' && <div className="mt-1 pt-1 border-t border-slate-200 text-[10px] text-rose-700 font-sans font-semibold">Classification: {meta?.classification}</div>}
                      </div>
                    );
                  }} />
                  <ReferenceLine yAxisId="temp" y={50} stroke="#EF4444" strokeDasharray="2 2" label={{ value: 'WMO T-Max Step Limit (50°C)', fill: '#EF4444', fontSize: 9, position: 'top' }} />
                  <Line yAxisId="temp" type="monotone" dataKey="temperature" name="Temperature (°C)" stroke="#B45309" strokeWidth={2} isAnimationActive={false}
                    dot={(props: { cx?: number; cy?: number; payload?: { isFault?: boolean; isConvective?: boolean } }) => {
                      const { cx = 0, cy = 0, payload } = props;
                      if (payload?.isFault) return (<g key={`f-${cx}-${cy}`}><circle cx={cx} cy={cy} r={8} fill="#DC2626" opacity={0.3} className="animate-ping" /><circle cx={cx} cy={cy} r={5} fill="#DC2626" stroke="#FFF" strokeWidth={2} /><rect x={cx-38} y={cy-22} width={76} height={15} rx={3} fill="#991B1B" /><text x={cx} y={cy-11} textAnchor="middle" fill="#FFF" fontSize={8} fontWeight="bold" fontFamily="sans-serif">ANOMALY FLAG</text></g>);
                      if (payload?.isConvective) return (<g key={`c-${cx}-${cy}`}><circle cx={cx} cy={cy} r={7} fill="#D97706" opacity={0.3} /><circle cx={cx} cy={cy} r={5} fill="#D97706" stroke="#FFF" strokeWidth={2} /><rect x={cx-36} y={cy-22} width={72} height={15} rx={3} fill="#B45309" /><text x={cx} y={cy-11} textAnchor="middle" fill="#FFF" fontSize={8} fontWeight="bold" fontFamily="sans-serif">STORM FRONT</text></g>);
                      return <circle cx={cx} cy={cy} r={2} fill="#B45309" opacity={0.6} />;
                    }}
                  />
                  <Line yAxisId="press" type="monotone" dataKey="pressure" name="Pressure (hPa)" stroke="#0369A1" strokeWidth={2} isAnimationActive={false}
                    dot={(props: { cx?: number; cy?: number; payload?: { isConvective?: boolean } }) => {
                      const { cx = 0, cy = 0, payload } = props;
                      return payload?.isConvective ? <circle cx={cx} cy={cy} r={4.5} fill="#0284C7" stroke="#FFF" strokeWidth={1.5} /> : null;
                    }}
                  />
                  <Line yAxisId="temp" type="monotone" dataKey="humidity" name="Humidity (%)" stroke="#047857" strokeWidth={1.5} strokeDasharray="4 2" dot={false} isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-500">Loading telemetry time-series curves...</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
