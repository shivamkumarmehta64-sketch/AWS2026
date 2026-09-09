'use client';

import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
  Legend,
} from 'recharts';
import { IMDStationProfile, IMD_AWS_STATIONS } from '@/lib/stationData';
import { TelemetryPacket, WMOQualityFlag } from '@/lib/anomalyLogic';
import { 
  Building2, 
  MapPin, 
  Cpu, 
  BatteryMedium, 
  Calendar, 
  FileCheck2, 
  Table, 
  LineChart as ChartIcon,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

interface GovObservationConsoleProps {
  selectedStation: IMDStationProfile;
  onSelectStation: (id: string) => void;
  packets: TelemetryPacket[];
  language: 'hi' | 'en';
}

export const GovObservationConsole: React.FC<GovObservationConsoleProps> = ({
  selectedStation,
  onSelectStation,
  packets,
  language,
}) => {
  const currentPacket = packets.length > 0 ? packets[packets.length - 1] : null;
  const recent10 = [...packets].slice(-10).reverse();

  // Chart data formatting
  const chartData = packets.map((p) => ({
    time: p.timeIST,
    temperature: p.raw.temperature,
    imputedTemperature: p.imputed.wasCorrected ? p.imputed.temperature : null,
    pressure: p.raw.pressure,
    imputedPressure: p.imputed.wasCorrected ? p.imputed.pressure : null,
    humidity: p.raw.humidity,
    classification: p.classification,
    isFault: p.classification !== 'NOMINAL_OPERATION' && p.classification !== 'GENUINE_CONVECTIVE_EVENT',
    isConvective: p.classification === 'GENUINE_CONVECTIVE_EVENT',
  }));

  const getWMOFlagBadge = (flag: WMOQualityFlag) => {
    switch (flag) {
      case 'FLAG_1_VERIFIED_GOOD':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <ShieldCheck className="w-3 h-3" /> Flag 1: Validated
          </span>
        );
      case 'FLAG_2_CONVECTIVE_STORM':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
            <AlertCircle className="w-3 h-3" /> Flag 2: Convective Storm
          </span>
        );
      case 'FLAG_3_SUSPECT_DRIFT':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-yellow-100 text-yellow-800 border border-yellow-300">
            Flag 3: Suspect Drift
          </span>
        );
      case 'FLAG_4_CORRUPT_HARDWARE':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
            Flag 4: Hardware Fault
          </span>
        );
      case 'FLAG_5_PACKET_LOSS':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-300">
            Flag 5: Packet Drop
          </span>
        );
    }
  };

  return (
    <div className="bg-white border border-slate-300 rounded shadow-xs p-4 space-y-4">
      {/* 1. Station Selector Bar & Heading */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-[#002147] text-white rounded">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wide text-[#002147]">
              {language === 'hi' ? 'प्राथमिक अवलोकन एवं टेलीमेट्री कंसोल' : 'Primary Observation & Telemetry Console'}
            </h2>
            <p className="text-xs text-slate-500">
              {language === 'hi'
                ? 'आईएमडी एडब्ल्यूएस स्टेशन डेटाशीट एवं वास्तविक समय डेटा पैकेट लॉग'
                : 'IMD AWS Station Datasheet & Real-time DCP Packet Register'}
            </p>
          </div>
        </div>

        {/* Station Select Dropdown */}
        <div className="flex items-center gap-2">
          <label htmlFor="station-selector" className="text-xs font-semibold text-slate-700 whitespace-nowrap">
            {language === 'hi' ? 'स्टेशन चुनें:' : 'Select AWS Node:'}
          </label>
          <select
            id="station-selector"
            value={selectedStation.stationId}
            onChange={(e) => onSelectStation(e.target.value)}
            className="text-xs font-semibold bg-[#F8FAFC] border border-slate-300 text-[#002147] rounded px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#002147]"
          >
            {IMD_AWS_STATIONS.map((st) => (
              <option key={st.stationId} value={st.stationId}>
                {st.stationId} - {st.name.split(',')[0]} ({st.state})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 2. Station Technical Datasheet (NIC / IMD Standard Format) */}
      <div className="bg-[#F8FAFC] border border-slate-200 rounded p-3 text-xs">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-200 mb-2.5">
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-sm bg-white border border-slate-300 px-2 py-0.5 rounded text-[#002147]">
              {selectedStation.stationId}
            </span>
            <span className="font-bold text-slate-800 text-sm">{selectedStation.name}</span>
            <span className="text-slate-500 text-xs">({selectedStation.hindiName})</span>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-slate-600 font-mono">
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3 text-red-600" />
              {selectedStation.latitude.toFixed(3)}°N, {selectedStation.longitude.toFixed(3)}°E
            </span>
            <span>Elev: {selectedStation.elevationM}m MSL</span>
            <span className="bg-slate-200 px-1.5 py-0.5 rounded font-bold text-slate-800">
              WMO: {selectedStation.wmoBlockNo}
            </span>
          </div>
        </div>

        {/* Technical Sensor Metadata Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-[11px]">
          <div className="bg-white border border-slate-200 p-2 rounded">
            <div className="text-slate-500 text-[10px] font-semibold uppercase">Temperature Sensor</div>
            <div className="font-medium text-slate-800 truncate" title={selectedStation.sensorMetadata.tempSensor}>
              {selectedStation.sensorMetadata.tempSensor}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Operating Limit: -10°C to 55°C</div>
          </div>

          <div className="bg-white border border-slate-200 p-2 rounded">
            <div className="text-slate-500 text-[10px] font-semibold uppercase">Barometer Transducer</div>
            <div className="font-medium text-slate-800 truncate" title={selectedStation.sensorMetadata.pressureSensor}>
              {selectedStation.sensorMetadata.pressureSensor}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Operating Limit: 920 to 1050 hPa</div>
          </div>

          <div className="bg-white border border-slate-200 p-2 rounded">
            <div className="text-slate-500 text-[10px] font-semibold uppercase">Humidity Hygrometer</div>
            <div className="font-medium text-slate-800 truncate" title={selectedStation.sensorMetadata.humiditySensor}>
              {selectedStation.sensorMetadata.humiditySensor}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Operating Limit: 5% to 100%</div>
          </div>

          <div className="bg-white border border-slate-200 p-2 rounded">
            <div className="text-slate-500 text-[10px] font-semibold uppercase">Calibration & Health</div>
            <div className="font-medium text-slate-800 flex items-center justify-between">
              <span>{selectedStation.sensorMetadata.lastCalibDate}</span>
              <span className="text-emerald-700 font-bold font-mono">{selectedStation.sensorMetadata.batteryVoltage.split(' ')[0]}</span>
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5 truncate" title={selectedStation.sensorMetadata.calibCertNo}>
              Cert: {selectedStation.sensorMetadata.calibCertNo.split('-').slice(-2).join('-')}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Official High-Density 10-Packet Log Table (IS Compliant) */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700">
            <Table className="w-3.5 h-3.5 text-[#002147]" />
            <span>Incoming DCP Telemetry Stream (Last 10 Packets)</span>
          </div>
          <span className="text-[11px] text-slate-500">
            Uplink Frequency: 402.75 MHz (INSAT-3D)
          </span>
        </div>

        <div className="overflow-x-auto border border-slate-300 rounded">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#002147] text-white font-semibold text-[11px]">
                <th className="py-1.5 px-2.5 border-r border-slate-600">Packet ID</th>
                <th className="py-1.5 px-2.5 border-r border-slate-600">Timestamp (IST)</th>
                <th className="py-1.5 px-2.5 border-r border-slate-600 text-right">Temp (°C)</th>
                <th className="py-1.5 px-2.5 border-r border-slate-600 text-right">Pressure (hPa)</th>
                <th className="py-1.5 px-2.5 border-r border-slate-600 text-right">Humidity (%)</th>
                <th className="py-1.5 px-2.5 border-r border-slate-600 text-right">RoC Step (T/P)</th>
                <th className="py-1.5 px-2.5 border-r border-slate-600">WMO QC Flag</th>
                <th className="py-1.5 px-2.5">Data Validation Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-mono text-[11px]">
              {recent10.map((pkt, idx) => (
                <tr
                  key={pkt.packetId}
                  className={idx % 2 === 0 ? 'bg-white hover:bg-slate-50' : 'bg-[#F8FAFC] hover:bg-slate-50'}
                >
                  <td className="py-1 px-2.5 font-bold text-slate-700 border-r border-slate-200">
                    {pkt.packetId}
                  </td>
                  <td className="py-1 px-2.5 text-slate-600 border-r border-slate-200">
                    {pkt.timeIST}
                  </td>
                  <td className="py-1 px-2.5 text-right font-bold text-slate-900 border-r border-slate-200">
                    {pkt.raw.temperature !== null ? `${pkt.raw.temperature.toFixed(2)}` : <span className="text-red-600">NULL</span>}
                  </td>
                  <td className="py-1 px-2.5 text-right font-bold text-slate-900 border-r border-slate-200">
                    {pkt.raw.pressure !== null ? `${pkt.raw.pressure.toFixed(1)}` : <span className="text-red-600">NULL</span>}
                  </td>
                  <td className="py-1 px-2.5 text-right font-bold text-slate-900 border-r border-slate-200">
                    {pkt.raw.humidity !== null ? `${pkt.raw.humidity.toFixed(1)}` : <span className="text-red-600">NULL</span>}
                  </td>
                  <td className="py-1 px-2.5 text-right text-slate-600 border-r border-slate-200">
                    {pkt.ratesOfChange.tempRoC > 0 ? `+${pkt.ratesOfChange.tempRoC}` : pkt.ratesOfChange.tempRoC}° / {pkt.ratesOfChange.pressRoC}hPa
                  </td>
                  <td className="py-1 px-2.5 border-r border-slate-200">
                    {getWMOFlagBadge(pkt.wmoFlag)}
                  </td>
                  <td className="py-1 px-2.5 font-sans">
                    {pkt.classification === 'NOMINAL_OPERATION' && (
                      <span className="text-emerald-700 font-bold text-[10px]">Validated (Good Data)</span>
                    )}
                    {pkt.classification === 'GENUINE_CONVECTIVE_EVENT' && (
                      <span className="text-amber-800 font-bold text-[10px]">Severe Convective Event (Valid)</span>
                    )}
                    {pkt.classification === 'SENSOR_SPIKE' && (
                      <span className="text-rose-700 font-bold text-[10px]">Quarantined (Thermistor Open)</span>
                    )}
                    {pkt.classification === 'FROZEN_VALUE' && (
                      <span className="text-rose-700 font-bold text-[10px]">Quarantined (Stuck Loop)</span>
                    )}
                    {pkt.classification === 'CALIBRATION_DRIFT' && (
                      <span className="text-yellow-800 font-bold text-[10px]">Suspect (Drift Offset)</span>
                    )}
                    {pkt.classification === 'TELEMETRY_PACKET_LOSS' && (
                      <span className="text-purple-700 font-bold text-[10px]">Packet Drop (Reconstructed)</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Interactive Recharts Time-Series Graph (Government Meteorological Standard) */}
      <div className="space-y-1.5 pt-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700">
            <ChartIcon className="w-3.5 h-3.5 text-[#002147]" />
            <span>Time-Series Station Curves (Temperature, Pressure &amp; Humidity)</span>
          </div>
          <div className="text-[10px] text-slate-500 flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-0.5 bg-[#B45309] inline-block" /> Temp (°C)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-0.5 bg-[#0369A1] inline-block" /> Pressure (hPa)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-0.5 bg-[#047857] inline-block" /> Humidity (%)
            </span>
            <span className="flex items-center gap-1 font-bold text-red-600">
              <span className="w-1.5 h-1.5 rounded-full bg-red-600 inline-block" /> Anomaly Flag
            </span>
          </div>
        </div>

        <div className="border border-slate-300 rounded bg-[#FAFAFA] p-2.5">
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="time" stroke="#64748B" tick={{ fontSize: 10 }} />
                <YAxis yAxisId="temp" domain={[15, 55]} stroke="#B45309" tick={{ fontSize: 10 }} />
                <YAxis yAxisId="press" orientation="right" domain={[995, 1025]} stroke="#0369A1" tick={{ fontSize: 10 }} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white border border-slate-400 p-2 rounded shadow text-xs font-mono">
                          <div className="font-bold text-slate-700 mb-1 border-b pb-0.5">{label} IST</div>
                          {payload.map((entry: any, index: number) => (
                            <div key={`entry-${index}`} className="flex items-center justify-between gap-3 text-[11px]">
                              <span style={{ color: entry.color }}>{entry.name}:</span>
                              <span className="font-bold text-slate-900">{entry.value ?? 'NULL'}</span>
                            </div>
                          ))}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <ReferenceLine yAxisId="temp" y={50} stroke="#EF4444" strokeDasharray="2 2" label={{ value: 'T-Max (50°C)', fill: '#EF4444', fontSize: 9 }} />
                <Line
                  yAxisId="temp"
                  type="monotone"
                  dataKey="temperature"
                  name="Temperature (°C)"
                  stroke="#B45309"
                  strokeWidth={2}
                  dot={(props: any) => {
                    const { cx, cy, payload } = props;
                    if (!payload.isFault) return null;
                    return <circle cx={cx} cy={cy} r={4.5} fill="#DC2626" stroke="#FFFFFF" strokeWidth={1.5} />;
                  }}
                  isAnimationActive={false}
                />
                <Line
                  yAxisId="press"
                  type="monotone"
                  dataKey="pressure"
                  name="Pressure (hPa)"
                  stroke="#0369A1"
                  strokeWidth={2}
                  dot={(props: any) => {
                    const { cx, cy, payload } = props;
                    if (!payload.isConvective) return null;
                    return <circle cx={cx} cy={cy} r={4.5} fill="#0284C7" stroke="#FFFFFF" strokeWidth={1.5} />;
                  }}
                  isAnimationActive={false}
                />
                <Line
                  yAxisId="temp"
                  type="monotone"
                  dataKey="humidity"
                  name="Humidity (%)"
                  stroke="#047857"
                  strokeWidth={1.5}
                  strokeDasharray="4 2"
                  dot={false}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
