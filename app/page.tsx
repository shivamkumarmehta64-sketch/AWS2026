'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { IMD_AWS_STATIONS, getStationProfile } from '@/lib/stationData';
import { nicWmoEngineInstance, TelemetryPacket, WorkOrderTicket, createWorkOrder, getInitialSeededDataset } from '@/lib/anomalyLogic';
import { fetchLiveStationObservation, fetchBatchLiveObservations, LiveObservation } from '@/lib/liveWeatherService';
import { GovHeader } from '@/components/GovHeader';
import { GovNetworkStrip } from '@/components/GovNetworkStrip';
import { GovObservationConsole } from '@/components/GovObservationConsole';
import { GovAnomalyRegister } from '@/components/GovAnomalyRegister';
import { GovTechnicianDrawer } from '@/components/GovTechnicianDrawer';
import { GovInfoModals, ActiveModalType } from '@/components/GovInfoModals';
import { GovDatasetReplayModal } from '@/components/GovDatasetReplayModal';
import { GovMobileQRModal } from '@/components/GovMobileQRModal';

export default function GovernmentAWSManagementPortal() {
  const [selectedStationId, setSelectedStationId] = useState('AWS-DEL-04');
  const [fontSizeLevel, setFontSizeLevel] = useState(0);
  const [isHighContrast, setIsHighContrast] = useState(false);
  const [language, setLanguage] = useState<'en' | 'hi'>('en');
  const [activeModal, setActiveModal] = useState<ActiveModalType>(null);
  const [isDatasetReplayOpen, setIsDatasetReplayOpen] = useState(false);
  const [isMobileQROpen, setIsMobileQROpen] = useState(false);

  // Live Open-Meteo state
  const [isLiveApiMode, setIsLiveApiMode] = useState(true);
  const [liveObservation, setLiveObservation] = useState<LiveObservation | null>(null);
  const [isSyncingLive, setIsSyncingLive] = useState(false);
  const liveCacheRef = useRef<Record<string, LiveObservation>>({});

  // Telemetry state — pre-seeded with deterministic initial data
  const [initialData] = useState(() => getInitialSeededDataset());
  const [stationPackets, setStationPackets] = useState<Record<string, TelemetryPacket[]>>(() => initialData.stationPackets);
  const [latestPackets, setLatestPackets] = useState<Record<string, TelemetryPacket>>(() => initialData.latestPackets);
  const [workOrders, setWorkOrders] = useState<WorkOrderTicket[]>(() => initialData.workOrders);
  const [isPaused, setIsPaused] = useState(false);
  const [tickCount, setTickCount] = useState(14);

  // Live Open-Meteo batch sync
  const syncLiveWeather = useCallback(async (stationId: string) => {
    setIsSyncingLive(true);
    try {
      const profile = getStationProfile(stationId);
      const obs = await fetchLiveStationObservation(profile);
      if (obs) { setLiveObservation(obs); liveCacheRef.current[stationId] = obs; }

      const batch = await fetchBatchLiveObservations(IMD_AWS_STATIONS);
      if (batch && Object.keys(batch).length > 0) {
        liveCacheRef.current = { ...liveCacheRef.current, ...batch };
        if (batch[stationId]) setLiveObservation(batch[stationId]);
      }
    } catch { /* Graceful fallback */ } finally { setIsSyncingLive(false); }
  }, []);

  useEffect(() => { if (isLiveApiMode) syncLiveWeather(selectedStationId); }, [selectedStationId, isLiveApiMode, syncLiveWeather]);
  useEffect(() => {
    if (!isLiveApiMode) return;
    const t = setInterval(() => syncLiveWeather(selectedStationId), 30000);
    return () => clearInterval(t);
  }, [isLiveApiMode, selectedStationId, syncLiveWeather]);

  // Telemetry ingest loop (every 2.5s)
  const processNextTick = useCallback(() => {
    setTickCount(prev => prev + 1);
    const now = Date.now();
    const updatedLatest: Record<string, TelemetryPacket> = {};
    const newTickets: WorkOrderTicket[] = [];

    setStationPackets(prev => {
      const next = { ...prev };
      for (const station of IMD_AWS_STATIONS) {
        if (station.status === 'SCHEDULED_CALIBRATION') continue;
        const baseline = isLiveApiMode
          ? (liveCacheRef.current[station.stationId] || (station.stationId === selectedStationId ? liveObservation : null))
          : undefined;
        const pkt = nicWmoEngineInstance.generatePacket(station.stationId, now, tickCount, baseline || undefined);
        updatedLatest[station.stationId] = pkt;
        const buf = [...(next[station.stationId] || []), pkt];
        if (buf.length > 30) buf.shift();
        next[station.stationId] = buf;
        if (pkt.classification !== 'NOMINAL_OPERATION') newTickets.push(createWorkOrder(pkt));
      }
      return next;
    });

    setLatestPackets(prev => ({ ...prev, ...updatedLatest }));
    if (newTickets.length > 0) setWorkOrders(prev => [...newTickets, ...prev].slice(0, 50));
  }, [tickCount, isLiveApiMode, liveObservation, selectedStationId]);

  useEffect(() => {
    if (isPaused) return;
    const t = setInterval(processNextTick, 2500);
    return () => clearInterval(t);
  }, [isPaused, processNextTick]);

  // Mobile node packet sync
  const lastMobileSyncRef = useRef(Date.now());

  const ingestExternalPacket = useCallback((pkt: TelemetryPacket) => {
    setLatestPackets(prev => ({ ...prev, [pkt.stationId]: pkt }));
    setStationPackets(prev => {
      const buf = [...(prev[pkt.stationId] || []), pkt];
      if (buf.length > 30) buf.shift();
      return { ...prev, [pkt.stationId]: buf };
    });
    if (pkt.classification !== 'NOMINAL_OPERATION') {
      setWorkOrders(prev => [createWorkOrder(pkt, 'IMD-MOB-2026'), ...prev].slice(0, 50));
    }
  }, []);

  // BroadcastChannel listener
  useEffect(() => {
    if (typeof window === 'undefined' || !('BroadcastChannel' in window)) return;
    const ch = new BroadcastChannel('imd_naws_telemetry_stream');
    ch.onmessage = (e) => { if (e.data?.type === 'MOBILE_PACKET_INGEST' && e.data?.packet) ingestExternalPacket(e.data.packet); };
    return () => ch.close();
  }, [ingestExternalPacket]);

  // Cross-device poll
  useEffect(() => {
    const t = setInterval(async () => {
      try {
        const res = await fetch(`/api/telemetry?latest=true&since=${lastMobileSyncRef.current}`);
        if (res.ok) {
          const json = await res.json();
          json.packets?.forEach((p: TelemetryPacket) => {
            ingestExternalPacket(p);
            if (p.timestamp > lastMobileSyncRef.current) lastMobileSyncRef.current = p.timestamp;
          });
        }
      } catch { /* Silent */ }
    }, 2000);
    return () => clearInterval(t);
  }, [ingestExternalPacket]);

  // Accessibility
  const handleFontSize = (delta: number) => {
    const next = delta === 0 ? 0 : Math.max(-1, Math.min(2, fontSizeLevel + delta));
    setFontSizeLevel(next);
    if (typeof document !== 'undefined') {
      document.documentElement.style.fontSize = ({ [-1]: '14px', 0: '16px', 1: '18px', 2: '20px' } as Record<number, string>)[next] || '16px';
    }
  };

  // Network metrics
  const opTotal = IMD_AWS_STATIONS.filter(s => s.status !== 'SCHEDULED_CALIBRATION').length;
  const latestList = Object.values(latestPackets);
  const critCount = latestList.filter(p => p.alertLevel === 'LEVEL_4_RED').length;
  const stormCount = latestList.filter(p => p.classification === 'GENUINE_CONVECTIVE_EVENT').length;
  const driftCount = latestList.filter(p => p.classification === 'CALIBRATION_DRIFT').length;
  const qIndex = opTotal > 0 ? Math.max(75, Math.min(100, Math.round(((opTotal - critCount) / opTotal) * 1000) / 10)) : 95.0;

  const activeStation = getStationProfile(selectedStationId);
  const activeHistory = stationPackets[selectedStationId] || [];

  const triggerAndTick = (fn: (id: string) => void, id: string) => { fn(id); if (isPaused) processNextTick(); };

  return (
    <div className="min-h-screen bg-[#F1F5F9] text-slate-900 flex flex-col font-sans transition-all duration-150">
      <GovHeader
        fontSizeLevel={fontSizeLevel} onFontSizeChange={handleFontSize}
        isHighContrast={isHighContrast}
        onToggleContrast={() => setIsHighContrast(prev => { const n = !prev; if (n) document.body.classList.add('high-contrast'); else document.body.classList.remove('high-contrast'); return n; })}
        language={language} onToggleLanguage={() => setLanguage(prev => prev === 'en' ? 'hi' : 'en')}
        onOpenModal={setActiveModal}
        onOpenDatasetReplay={() => setIsDatasetReplayOpen(true)}
        onOpenMobileQR={() => setIsMobileQROpen(true)}
        isLiveApiMode={isLiveApiMode}
      />

      <GovNetworkStrip
        totalStations={IMD_AWS_STATIONS.length} onlineStations={opTotal} qualityIndex={qIndex}
        ingestInterval="2.5s" anomalyTally={{ critical: critCount, convective: stormCount, drift: driftCount }}
        language={language}
      />

      <main className="flex-1 max-w-[1750px] w-full mx-auto px-4 lg:px-8 py-4 space-y-4">
        <GovObservationConsole
          selectedStation={activeStation} onSelectStation={setSelectedStationId}
          packets={activeHistory} language={language}
          isLiveApiMode={isLiveApiMode} onToggleLiveApiMode={() => setIsLiveApiMode(p => !p)}
          liveStatusInfo={liveObservation} isSyncingLive={isSyncingLive}
          onManualSync={() => syncLiveWeather(selectedStationId)}
        />
        <GovAnomalyRegister workOrders={workOrders} language={language} onOpenMethodology={() => setActiveModal('methodology')} />
      </main>

      <GovTechnicianDrawer
        selectedStationId={selectedStationId}
        onTriggerThermistorSpike={id => triggerAndTick(nicWmoEngineInstance.triggerThermistorSpike.bind(nicWmoEngineInstance), id)}
        onTriggerWireDisconnectFreeze={id => triggerAndTick(nicWmoEngineInstance.triggerWireDisconnectFreeze.bind(nicWmoEngineInstance), id)}
        onTriggerBarometerDrift={id => triggerAndTick(nicWmoEngineInstance.triggerBarometerDrift.bind(nicWmoEngineInstance), id)}
        onTriggerConvectiveStorm={id => triggerAndTick(nicWmoEngineInstance.triggerConvectiveStorm.bind(nicWmoEngineInstance), id)}
        onTriggerPacketLoss={id => triggerAndTick(nicWmoEngineInstance.triggerPacketLoss.bind(nicWmoEngineInstance), id)}
        onResetToNominal={id => triggerAndTick(() => nicWmoEngineInstance.resetToNominal(id), id || selectedStationId)}
        isPaused={isPaused} onTogglePause={() => setIsPaused(!isPaused)}
      />

      <GovInfoModals activeModal={activeModal} onClose={() => setActiveModal(null)} language={language} />
      <GovDatasetReplayModal isOpen={isDatasetReplayOpen} onClose={() => setIsDatasetReplayOpen(false)} language={language} />
      <GovMobileQRModal isOpen={isMobileQROpen} onClose={() => setIsMobileQROpen(false)} language={language} />

      <footer className="mt-8 bg-[#002147] text-slate-300 border-t-4 border-[#FF9933] text-xs">
        <div className="max-w-[1750px] mx-auto px-4 lg:px-8 py-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pb-6 border-b border-slate-700">
            {[
              { title: language === 'hi' ? 'मौसम सेवाएं' : 'Observational Network', items: ['Automatic Weather Stations (AWS)', 'Agro-Meteorological Network', 'INSAT-3D Meteorological DCP Link', 'Doppler Weather Radar (DWR) Grid'] },
              { title: language === 'hi' ? 'गुणवत्ता आश्वासन' : 'Quality Assurance & Standards', items: ['WMO Pub No. 8 Instrument Standards', 'NABL Calibration Traceability', 'ISO 9001:2015 QC Procedures', 'NWP Numerical Assimilation Verification'] },
              { title: language === 'hi' ? 'क्षेत्रीय मौसम विज्ञान केंद्र' : 'Regional Met Centres (RMC)', items: ['RMC New Delhi (Northern Region)', 'RMC Mumbai (Western Region)', 'RMC Kolkata (Eastern Region)', 'RMC Chennai (Southern Region)'] },
            ].map(col => (
              <div key={col.title}>
                <div className="font-bold text-white mb-1.5 uppercase tracking-wider text-[11px]">{col.title}</div>
                <ul className="space-y-1 text-slate-400 text-[11px]">{col.items.map(i => <li key={i}>{i}</li>)}</ul>
              </div>
            ))}
            <div>
              <div className="font-bold text-white mb-1.5 uppercase tracking-wider text-[11px]">
                {language === 'hi' ? 'परियोजना वास्तुकला' : 'SIH26073 Innovation Details'}
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Smart India Hackathon concept prototype for automated real-time quality control, explainable AI (XAI) fault isolation, and NWP data gating across India Meteorological Department (IMD) AWS networks.
              </p>
              <button onClick={() => setActiveModal('architecture')} className="mt-2 text-sky-300 hover:text-white underline text-[11px] font-semibold">
                {language === 'hi' ? 'पूर्ण प्रणाली वास्तुकला पढ़ें →' : 'Read Full Scalability Architecture →'}
              </button>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-400">
            <div>© 2026 NAWS-QMS Project | Smart India Hackathon Prototype (SIH26073) | Built for Evaluation</div>
            <div className="flex items-center gap-4 flex-wrap">
              {([['architecture', 'Website Scope & Architecture'], ['methodology', 'WMO QC Rules & XAI'], ['accessibility', 'Accessibility Statement'], ['provenance', 'Data Provenance & Disclosure']] as const).map(([key, label], i) => (
                <React.Fragment key={key}>
                  {i > 0 && <span>•</span>}
                  <button onClick={() => setActiveModal(key)} className="hover:underline hover:text-white cursor-pointer">{label}</button>
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
