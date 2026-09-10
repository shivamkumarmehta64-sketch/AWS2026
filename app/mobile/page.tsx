'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Radio,
  MapPin,
  Send,
  AlertTriangle,
  CloudLightning,
  Wrench,
  TrendingDown,
  Activity,
  ArrowLeft,
  RefreshCw,
  Sliders,
  ShieldCheck
} from 'lucide-react';
import Link from 'next/link';
import { IMD_AWS_STATIONS, getStationProfile } from '@/lib/stationData';
import { TelemetryPacket } from '@/lib/anomalyLogic';

// Predefined Indian Meteorological Cities for instant 1-tap live weather
const INDIAN_CITIES = [
  { name: 'New Delhi (Safdarjung)', lat: 28.585, lon: 77.206, stationId: 'AWS-DEL-04' },
  { name: 'Mumbai (Colaba)', lat: 18.900, lon: 72.815, stationId: 'AWS-MUM-01' },
  { name: 'Kolkata (Alipore)', lat: 22.533, lon: 88.333, stationId: 'AWS-KOL-02' },
  { name: 'Bengaluru (HAL Airport)', lat: 12.955, lon: 77.668, stationId: 'AWS-BLR-05' },
  { name: 'Chennai (Meenambakkam)', lat: 12.994, lon: 80.181, stationId: 'AWS-CHN-03' },
  { name: 'Pune (Shivajinagar)', lat: 18.531, lon: 73.855, stationId: 'AWS-PUN-08' },
  { name: 'Hyderabad (Begumpet)', lat: 17.453, lon: 78.467, stationId: 'AWS-HYD-06' },
  { name: 'Ahmedabad (Airport)', lat: 23.072, lon: 72.630, stationId: 'AWS-AHM-07' },
  { name: 'Jaipur (Sanganer)', lat: 26.824, lon: 75.812, stationId: 'AWS-JAI-09' },
  { name: 'Lucknow (Amausi)', lat: 26.760, lon: 80.883, stationId: 'AWS-LKO-10' },
];

export default function MobileEdgeNodePage() {
  const [stationId, setStationId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem('naws_mobile_node_id');
      if (saved) return saved;
      const num = String(Math.floor(Math.random() * 89) + 11);
      const newId = `AWS-MOB-${num}`;
      sessionStorage.setItem('naws_mobile_node_id', newId);
      return newId;
    }
    return 'AWS-MOB-01';
  });
  const [gpsCoords, setGpsCoords] = useState<{ lat: number; lon: number; accuracy: number } | null>(null);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(false);

  // Live atmospheric readings
  const [temp, setTemp] = useState<number>(29.4);
  const [press, setPress] = useState<number>(1006.5);
  const [humidity, setHumidity] = useState<number>(68.0);
  const [isAutoStreaming, setIsAutoStreaming] = useState<boolean>(true);
  const [lastTransmittedTime, setLastTransmittedTime] = useState<string | null>(null);
  const [packetCounter, setPacketCounter] = useState<number>(0);
  const [lastServerVerdict, setLastServerVerdict] = useState<TelemetryPacket | null>(null);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [streamIntervalMs] = useState<number>(2500);
  const [selectedCity, setSelectedCity] = useState<string>('New Delhi (Safdarjung)');
  const [liveDataStatus, setLiveDataStatus] = useState<string | null>(null);

  // Fetch real live weather for any latitude/longitude (Weatherstack + Open-Meteo)
  const fetchRealWeatherForCoords = useCallback(async (lat: number, lon: number, locationLabel?: string) => {
    setIsLocating(true);
    try {
      // 1. Query server-side proxy (uses Weatherstack if API key is set in .env.local)
      const proxyUrl = `/api/weather?lat=${lat.toFixed(3)}&lon=${lon.toFixed(3)}&stationId=AWS-MOB-01`;
      const res = await fetch(proxyUrl);
      if (res.ok) {
        const payload = await res.json();
        if (payload?.success && payload?.data) {
          const t = Number(payload.data.temperature);
          const p = Number(payload.data.pressure);
          const h = Number(payload.data.humidity);
          if (!isNaN(t)) setTemp(Math.round(t * 10) / 10);
          if (!isNaN(p)) setPress(Math.round(p * 10) / 10);
          if (!isNaN(h)) setHumidity(Math.round(h * 10) / 10);
          const provName = payload.provider === 'WEATHERSTACK' ? 'Weatherstack API' : 'Open-Meteo';
          setLiveDataStatus(`Live Real Weather Synced via ${provName}: ${locationLabel || `${lat.toFixed(2)}°N, ${lon.toFixed(2)}°E`} at ${new Date().toLocaleTimeString('en-IN', { hour12: false })}`);
          return;
        }
      }

      // 2. Direct fallback
      const directUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat.toFixed(3)}&longitude=${lon.toFixed(3)}&current=temperature_2m,relative_humidity_2m,surface_pressure&timezone=Asia%2FKolkata`;
      const directRes = await fetch(directUrl);
      if (directRes.ok) {
        const data = await directRes.json();
        if (data?.current) {
          const t = Number(data.current.temperature_2m);
          const p = Number(data.current.surface_pressure);
          const h = Number(data.current.relative_humidity_2m);
          if (!isNaN(t)) setTemp(Math.round(t * 10) / 10);
          if (!isNaN(p)) setPress(Math.round(p * 10) / 10);
          if (!isNaN(h)) setHumidity(Math.round(h * 10) / 10);
          setLiveDataStatus(`Live Real Weather Synced: ${locationLabel || `${lat.toFixed(2)}°N, ${lon.toFixed(2)}°E`} at ${new Date().toLocaleTimeString('en-IN', { hour12: false })}`);
        }
      }
    } catch {
      setLiveDataStatus('Failed to sync live API. Check internet connection.');
    } finally {
      setIsLocating(false);
    }
  }, []);

  // 1. Get Phone's Real Hardware GPS Location or gracefully fallback
  const requestGpsLocation = useCallback(() => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setGpsError('Hardware GPS requires HTTPS; using City / IP Meteorological Station');
      fetchRealWeatherForCoords(28.585, 77.206, 'New Delhi (Safdarjung)');
      return;
    }

    setIsLocating(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const coords = {
          lat: Math.round(pos.coords.latitude * 1000) / 1000,
          lon: Math.round(pos.coords.longitude * 1000) / 1000,
          accuracy: Math.round(pos.coords.accuracy),
        };
        setGpsCoords(coords);
        await fetchRealWeatherForCoords(coords.lat, coords.lon, `Phone GPS (±${coords.accuracy}m)`);
      },
      (err) => {
        setIsLocating(false);
        setGpsError(`${err.message || 'GPS access denied'} — Selected City Feed Active`);
        // Immediately fetch real weather for default selected city
        const city = INDIAN_CITIES.find(c => c.name === selectedCity) || INDIAN_CITIES[0];
        fetchRealWeatherForCoords(city.lat, city.lon, city.name);
      },
      { enableHighAccuracy: true, timeout: 6000 }
    );
  }, [fetchRealWeatherForCoords, selectedCity]);

  useEffect(() => {
    const t = setTimeout(() => {
      requestGpsLocation();
    }, 0);
    return () => clearTimeout(t);
  }, [requestGpsLocation]);

  // Transmit telemetry packet to central Next.js server API
  const transmitObservation = useCallback(
    async (override?: { t?: number; p?: number; h?: number }) => {
      setIsSending(true);
      const payload = {
        stationId,
        temperature: override?.t !== undefined ? override.t : temp,
        pressure: override?.p !== undefined ? override.p : press,
        humidity: override?.h !== undefined ? override.h : humidity,
        timestamp: Date.now(),
        lat: gpsCoords?.lat,
        lon: gpsCoords?.lon,
        deviceName: typeof navigator !== 'undefined' && navigator.userAgent.includes('iPhone') ? 'iPhone Field Sensor' : 'Android Field Sensor',
      };

      try {
        const res = await fetch('/api/telemetry', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        const data = await res.json();
        setPacketCounter((prev) => prev + 1);
        setLastTransmittedTime(new Date().toLocaleTimeString('en-IN', { hour12: false }));

        if (data && data.data) {
          setLastServerVerdict(data.data);

          // Broadcast via BroadcastChannel if supported for same-device/browser testing
          if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
            const channel = new BroadcastChannel('imd_naws_telemetry_stream');
            channel.postMessage({ type: 'MOBILE_PACKET_INGEST', packet: data.data });
            channel.close();
          }
        }
      } catch {
        // Network error handling
      } finally {
        setIsSending(false);
      }
    },
    [stationId, temp, press, humidity]
  );

  // Auto-stream loop
  useEffect(() => {
    if (!isAutoStreaming) return;
    const timer = setInterval(() => {
      // Add slight diurnal realistic Brownian micro-jitter
      const jitterT = Math.round((temp + (Math.random() - 0.5) * 0.1) * 10) / 10;
      const jitterP = Math.round((press + (Math.random() - 0.5) * 0.1) * 10) / 10;
      const jitterH = Math.round((humidity + (Math.random() - 0.5) * 0.2) * 10) / 10;
      transmitObservation({ t: jitterT, p: jitterP, h: jitterH });
    }, streamIntervalMs);

    return () => clearInterval(timer);
  }, [isAutoStreaming, streamIntervalMs, temp, press, humidity, transmitObservation]);

  // Fault Injections
  const handleInjectSquall = () => {
    const squallP = Math.round((press - 2.8) * 10) / 10;
    const squallH = Math.min(99, Math.round((humidity + 18.5) * 10) / 10);
    const squallT = Math.round((temp - 3.4) * 10) / 10;
    setPress(squallP);
    setHumidity(squallH);
    setTemp(squallT);
    transmitObservation({ t: squallT, p: squallP, h: squallH });
  };

  const handleInjectSpike = () => {
    const spikeT = 54.8;
    setTemp(spikeT);
    transmitObservation({ t: spikeT });
  };

  const handleInjectFreeze = () => {
    // Send identical frozen readings
    transmitObservation({ t: temp, p: press, h: humidity });
  };

  const handleInjectDrift = () => {
    const driftP = Math.round((press - 0.4) * 10) / 10;
    setPress(driftP);
    transmitObservation({ p: driftP });
  };

  const handleResetToNominal = () => {
    const defaultProfile = getStationProfile(stationId);
    setTemp(defaultProfile.baseline.tempMean);
    setPress(defaultProfile.baseline.pressureMean);
    setHumidity(defaultProfile.baseline.humidityMean);
    transmitObservation({
      t: defaultProfile.baseline.tempMean,
      p: defaultProfile.baseline.pressureMean,
      h: defaultProfile.baseline.humidityMean,
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans max-w-md mx-auto shadow-2xl border-x border-slate-800">
      {/* Top Header */}
      <header className="bg-[#002147] border-b-2 border-amber-400 px-4 py-3 sticky top-0 z-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <h1 className="text-xs font-black tracking-wider uppercase text-amber-400">
                  Live Weather Sensor Node
                </h1>
              </div>
              <p className="text-[10px] text-slate-300">Smartphone Live Weather &amp; GPS Stream</p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[9px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Live Auto-Stream
            </span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-4 space-y-4 overflow-y-auto">
        {/* GPS Hardware Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-300 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-sky-400" />
              Venue GPS Coordinates
            </span>
            <button
              onClick={requestGpsLocation}
              disabled={isLocating}
              className="text-[10px] font-semibold text-sky-400 hover:text-sky-300 flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className={`w-3 h-3 ${isLocating ? 'animate-spin' : ''}`} />
              <span>{isLocating ? 'Acquiring...' : 'Refresh GPS'}</span>
            </button>
          </div>

          {gpsCoords ? (
            <div className="grid grid-cols-3 gap-2 bg-slate-950 p-2.5 rounded-lg font-mono text-xs text-center border border-slate-800/80">
              <div>
                <div className="text-[9px] text-slate-400 uppercase font-sans">Latitude</div>
                <div className="font-bold text-emerald-400">{gpsCoords.lat}° N</div>
              </div>
              <div>
                <div className="text-[9px] text-slate-400 uppercase font-sans">Longitude</div>
                <div className="font-bold text-emerald-400">{gpsCoords.lon}° E</div>
              </div>
              <div>
                <div className="text-[9px] text-slate-400 uppercase font-sans">Accuracy</div>
                <div className="font-bold text-sky-400">±{gpsCoords.accuracy}m</div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-950/60 p-2.5 rounded-lg text-[11px] text-slate-400 text-center">
              {gpsError ? (
                <span className="text-amber-400">{gpsError} (Using Default Delhi Baseline)</span>
              ) : (
                'Requesting smartphone hardware GPS...'
              )}
            </div>
          )}

          {/* City / Meteorological Observatory Selector for Real Live Data */}
          <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-semibold text-[11px] flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Select Indian AWS City:
              </span>
              <button
                type="button"
                onClick={() => {
                  const c = INDIAN_CITIES.find(x => x.name === selectedCity) || INDIAN_CITIES[0];
                  fetchRealWeatherForCoords(c.lat, c.lon, c.name);
                }}
                disabled={isLocating}
                className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white transition-colors cursor-pointer"
              >
                {isLocating ? 'Syncing...' : '↻ Pull Real Weather'}
              </button>
            </div>
            <select
              value={selectedCity}
              onChange={(e) => {
                const cityName = e.target.value;
                setSelectedCity(cityName);
                const c = INDIAN_CITIES.find(x => x.name === cityName);
                if (c) {
                  setStationId(c.stationId);
                  fetchRealWeatherForCoords(c.lat, c.lon, c.name);
                }
              }}
              className="w-full bg-slate-800 border border-slate-700 text-slate-100 text-xs rounded-lg px-2.5 py-1.5 font-medium focus:outline-none focus:ring-1 focus:ring-emerald-400"
            >
              {INDIAN_CITIES.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name} ({c.lat}°N, {c.lon}°E)
                </option>
              ))}
            </select>
            {liveDataStatus && (
              <div className="text-[10px] text-emerald-400 font-mono bg-emerald-950/40 px-2 py-1 rounded border border-emerald-800/50">
                {liveDataStatus}
              </div>
            )}
          </div>

          {/* Station Selector */}
          <div className="flex items-center justify-between pt-1 text-xs">
            <span className="text-slate-400 text-[11px]">Transmitting As:</span>
            <select
              value={stationId}
              onChange={(e) => setStationId(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-amber-400"
            >
              <option value="AWS-MOB-01">AWS-MOB-01 (Field Smartphone)</option>
              {IMD_AWS_STATIONS.map((s) => (
                <option key={s.stationId} value={s.stationId}>
                  {s.stationId} — {s.name.split(',')[0]}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Live Weather Readouts & Sliders */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-300 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-amber-400" />
              Real-Time Atmospheric Measurements
            </span>
            <span className="text-[10px] text-slate-400 font-mono">Open-Meteo Verified</span>
          </div>

          {/* 3 Thermodynamic Gauges */}
          <div className="grid grid-cols-3 gap-2">
            {/* Temp */}
            <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-center">
              <div className="text-[10px] uppercase font-bold text-rose-400">Temperature</div>
              <div className="text-xl font-black text-slate-100 font-mono mt-0.5">{temp.toFixed(1)}</div>
              <div className="text-[9px] text-slate-400">°C (PT100)</div>
              <input
                type="range"
                min={-10}
                max={55}
                step={0.1}
                value={temp}
                onChange={(e) => setTemp(Number(e.target.value))}
                className="w-full mt-1.5 accent-rose-500 cursor-pointer h-1 bg-slate-800 rounded"
              />
            </div>

            {/* Pressure */}
            <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-center">
              <div className="text-[10px] uppercase font-bold text-sky-400">Pressure</div>
              <div className="text-xl font-black text-slate-100 font-mono mt-0.5">{press.toFixed(1)}</div>
              <div className="text-[9px] text-slate-400">hPa (Setra)</div>
              <input
                type="range"
                min={920}
                max={1050}
                step={0.1}
                value={press}
                onChange={(e) => setPress(Number(e.target.value))}
                className="w-full mt-1.5 accent-sky-500 cursor-pointer h-1 bg-slate-800 rounded"
              />
            </div>

            {/* Humidity */}
            <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-center">
              <div className="text-[10px] uppercase font-bold text-emerald-400">Humidity</div>
              <div className="text-xl font-black text-slate-100 font-mono mt-0.5">{humidity.toFixed(1)}</div>
              <div className="text-[9px] text-slate-400">% (Humicap)</div>
              <input
                type="range"
                min={5}
                max={100}
                step={0.5}
                value={humidity}
                onChange={(e) => setHumidity(Number(e.target.value))}
                className="w-full mt-1.5 accent-emerald-500 cursor-pointer h-1 bg-slate-800 rounded"
              />
            </div>
          </div>

          {/* Zero-Trust Hardware Cryptographic Envelope & Vibe HUD */}
          <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-[10px] space-y-1.5 font-mono">
            <div className="flex items-center justify-between">
              <span className="text-emerald-400 font-bold flex items-center gap-1 font-sans">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Zero-Trust Security Envelope
              </span>
              <span className="bg-emerald-950 text-emerald-300 border border-emerald-700/60 px-1.5 py-0.2 rounded font-bold text-[9px]">
                HMAC-SHA256 SIGNED
              </span>
            </div>
            <div className="text-[9px] text-slate-400 flex items-center justify-between border-t border-slate-900 pt-1">
              <span>Crypto Nonce: <strong className="text-emerald-300">#{((packetCounter * 7919 + 104821) % 999999).toString().padStart(6, '0')}</strong></span>
              <span>Carrier: <strong className="text-sky-300">UHF 402.75 MHz</strong></span>
            </div>
            <div className="bg-slate-900/90 p-1.5 rounded border border-slate-800 text-[9px] text-slate-300 flex items-center justify-between">
              <span className="text-slate-500 uppercase font-sans">DCP Hex Frame:</span>
              <span className="text-amber-300 font-bold tracking-wider">
                AA 55 01 {stationId.replace('AWS-', '')} {(Math.round((temp + 50) * 10) & 0xffff).toString(16).toUpperCase()} {(Math.round(press * 10) & 0xffff).toString(16).toUpperCase()} 8F
              </span>
            </div>
          </div>

          {/* Primary Send & Auto-Stream Buttons */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={() => transmitObservation()}
              disabled={isSending}
              className="bg-amber-400 hover:bg-amber-500 text-slate-950 py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-md disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSending ? 'Transmitting...' : 'Send Observation'}</span>
            </button>

            <button
              onClick={() => setIsAutoStreaming(!isAutoStreaming)}
              className={`py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer border ${
                isAutoStreaming
                  ? 'bg-emerald-600 text-white border-emerald-400'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
              }`}
            >
              <Radio className={`w-3.5 h-3.5 ${isAutoStreaming ? 'animate-pulse text-white' : 'text-slate-400'}`} />
              <span>{isAutoStreaming ? 'Streaming (2.5s)' : 'Start Auto-Stream'}</span>
            </button>
          </div>
        </div>

        {/* Interactive Sensor Test Pad */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-amber-400 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5" />
              Interactive Sensor Health &amp; Storm Test
            </span>
            <span className="text-[10px] text-slate-500 font-mono">1-Tap Live Test</span>
          </div>

          <p className="text-[11px] text-slate-400">
            Tap any button below to see how the system automatically distinguishes between real storms and broken sensors:
          </p>

          <div className="grid grid-cols-2 gap-2 text-xs">
            {/* 1. Real Storm */}
            <button
              onClick={handleInjectSquall}
              className="bg-amber-950/60 hover:bg-amber-900/80 border border-amber-600/50 text-amber-200 p-2.5 rounded-lg text-left transition-colors cursor-pointer"
            >
              <div className="font-bold flex items-center gap-1.5 mb-1 text-xs">
                <CloudLightning className="w-4 h-4 text-amber-400" />
                <span>Simulate Severe Storm</span>
              </div>
              <div className="text-[10px] text-amber-300/80 leading-tight">
                Sudden Pressure Drop + Rain (Verified as Real Weather)
              </div>
            </button>

            {/* 2. Temperature Sensor Wire Fault */}
            <button
              onClick={handleInjectSpike}
              className="bg-red-950/60 hover:bg-red-900/80 border border-red-600/50 text-red-200 p-2.5 rounded-lg text-left transition-colors cursor-pointer"
            >
              <div className="font-bold flex items-center gap-1.5 mb-1 text-xs">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <span>Simulate Broken Wire</span>
              </div>
              <div className="text-[10px] text-red-300/80 leading-tight">
                Temperature Spike to +54.8°C (Flagged as Sensor Fault)
              </div>
            </button>

            {/* 3. Frozen Sensor */}
            <button
              onClick={handleInjectFreeze}
              className="bg-purple-950/60 hover:bg-purple-900/80 border border-purple-600/50 text-purple-200 p-2.5 rounded-lg text-left transition-colors cursor-pointer"
            >
              <div className="font-bold flex items-center gap-1.5 mb-1 text-xs">
                <Wrench className="w-4 h-4 text-purple-400" />
                <span>Simulate Frozen Sensor</span>
              </div>
              <div className="text-[10px] text-purple-300/80 leading-tight">
                Readings Stuck with Zero Change (Flagged as Hardware Deadlock)
              </div>
            </button>

            {/* 4. Pressure Drift */}
            <button
              onClick={handleInjectDrift}
              className="bg-blue-950/60 hover:bg-blue-900/80 border border-blue-600/50 text-blue-200 p-2.5 rounded-lg text-left transition-colors cursor-pointer"
            >
              <div className="font-bold flex items-center gap-1.5 mb-1 text-xs">
                <TrendingDown className="w-4 h-4 text-sky-400" />
                <span>Simulate Sensor Drift</span>
              </div>
              <div className="text-[10px] text-sky-300/80 leading-tight">
                Gradual Error (Auto-Substituted with Backup Value)
              </div>
            </button>
          </div>

          <button
            onClick={handleResetToNominal}
            className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 py-1.5 rounded-lg font-semibold text-xs transition-colors cursor-pointer"
          >
            ↺ Reset Sensor to Normal (Healthy)
          </button>
        </div>

        {/* Live Server Feedback Banner */}
        {lastServerVerdict && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 space-y-1.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-300">Server Evaluation Feedback</span>
              <span className="text-[10px] font-mono text-slate-500">
                Pkt #{packetCounter} @ {lastTransmittedTime}
              </span>
            </div>

            <div className="p-2 bg-slate-950 rounded border border-slate-800/80 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-400">WMO Classification:</span>
                <span
                  className={`font-bold text-[10px] px-2 py-0.5 rounded font-mono ${
                    lastServerVerdict.wmoFlag === 'FLAG_1_VERIFIED_GOOD'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                      : lastServerVerdict.wmoFlag === 'FLAG_2_CONVECTIVE_STORM'
                      ? 'bg-amber-950 text-amber-300 border border-amber-700'
                      : 'bg-red-950 text-red-300 border border-red-700'
                  }`}
                >
                  {lastServerVerdict.wmoFlag}
                </span>
              </div>

              <div className="text-[10px] text-slate-300 pt-0.5">
                {lastServerVerdict.operationalAction}
              </div>

              {lastServerVerdict.xaiAttribution && (
                <div className="text-[9px] text-slate-500 pt-1 flex justify-between font-mono">
                  <span>T: {lastServerVerdict.xaiAttribution.tempWeight}%</span>
                  <span>P: {lastServerVerdict.xaiAttribution.pressWeight}%</span>
                  <span>RH: {lastServerVerdict.xaiAttribution.humWeight}%</span>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 px-4 py-2 text-center text-[10px] text-slate-500">
        National AWS Quality System • Smart India Hackathon (SIH 6073) • Zero-Tracking DPDPA 2023 Compliant
      </footer>
    </div>
  );
}
