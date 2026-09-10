'use client';

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { IMD_AWS_STATIONS, getStationProfile } from '@/lib/stationData';
import { nicWmoEngineInstance, TelemetryPacket, WorkOrderTicket, createWorkOrder, getInitialSeededDataset } from '@/lib/anomalyLogic';
import { fetchLiveStationObservation, fetchBatchLiveObservations, LiveObservation } from '@/lib/liveWeatherService';
import { GovHeader } from '@/components/GovHeader';
import { GovNetworkStrip } from '@/components/GovNetworkStrip';
import { GovNetworkMap } from '@/components/GovNetworkMap';
import { GovObservationConsole } from '@/components/GovObservationConsole';
import { GovAnomalyRegister } from '@/components/GovAnomalyRegister';
import { GovNWPGatingPanel } from '@/components/GovNWPGatingPanel';
import { GovTechnicianDrawer } from '@/components/GovTechnicianDrawer';
import { GovInfoModals, ActiveModalType } from '@/components/GovInfoModals';
import { GovDatasetReplayModal } from '@/components/GovDatasetReplayModal';
import { GovMobileQRModal } from '@/components/GovMobileQRModal';
import { GovLiveIndiaAutoTester } from '@/components/GovLiveIndiaAutoTester';
import { GovIndiaDistrictSearch } from '@/components/GovIndiaDistrictSearch';
import { GovPredictiveMaintenancePanel } from '@/components/GovPredictiveMaintenancePanel';
import { GovEmergencyAlertModal } from '@/components/GovEmergencyAlertModal';
import { GovJuryOrientationBanner } from '@/components/GovJuryOrientationBanner';
import { GovTimeLogicMatrix } from '@/components/GovTimeLogicMatrix';
import { VayuDistrictMap } from '@/components/VayuDistrictMap';
import { VayuDistrictPanel } from '@/components/VayuDistrictPanel';
import { VayuNationalDashboard } from '@/components/VayuNationalDashboard';
import { GovHeatwaveDSSPanel } from '@/components/GovHeatwaveDSSPanel';
import { startPoller, pausePoller } from '@/lib/vayuPoller';
import { IMDStationProfile } from '@/lib/stationData';


export default function GovernmentAWSManagementPortal() {
  const [selectedStationId, setSelectedStationId] = useState('AWS-DEL-04');
  const [selectedVayuDistrictId, setSelectedVayuDistrictId] = useState<string | null>(null);
  const [customStations, setCustomStations] = useState<Record<string, IMDStationProfile>>({});
  const [isEmergencyAlertOpen, setIsEmergencyAlertOpen] = useState(false);
  const [fontSizeLevel, setFontSizeLevel] = useState(0);
  const [isHighContrast, setIsHighContrast] = useState(false);
  const [language, setLanguage] = useState<'en' | 'hi'>('en');
  const [activeModal, setActiveModal] = useState<ActiveModalType>(null);
  const [isDatasetReplayOpen, setIsDatasetReplayOpen] = useState(false);
  const [isMobileQROpen, setIsMobileQROpen] = useState(false);

  // Initialize Vayu background poller
  useEffect(() => {
    startPoller();
    return () => {
      pausePoller();
    };
  }, []);


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
  const [, setTickCount] = useState(14);

  // Stable references to prevent interval churn
  const tickCountRef = useRef(14);
  const liveObservationRef = useRef<LiveObservation | null>(liveObservation);
  useEffect(() => { liveObservationRef.current = liveObservation; }, [liveObservation]);
  const selectedStationIdRef = useRef(selectedStationId);
  useEffect(() => { selectedStationIdRef.current = selectedStationId; }, [selectedStationId]);
  const isLiveApiModeRef = useRef(isLiveApiMode);
  useEffect(() => { isLiveApiModeRef.current = isLiveApiMode; }, [isLiveApiMode]);

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

  useEffect(() => {
    if (!isLiveApiMode) return;
    const t = setTimeout(() => {
      syncLiveWeather(selectedStationId);
    }, 0);
    return () => clearTimeout(t);
  }, [selectedStationId, isLiveApiMode, syncLiveWeather]);

  useEffect(() => {
    if (!isLiveApiMode) return;
    const t = setInterval(() => syncLiveWeather(selectedStationId), 30000);
    return () => clearInterval(t);
  }, [isLiveApiMode, selectedStationId, syncLiveWeather]);

  // Telemetry ingest loop (every 2.5s) — optimized with stable callback & spatial cross-validation
  const processNextTick = useCallback(() => {
    tickCountRef.current += 1;
    const currentTick = tickCountRef.current;
    setTickCount(currentTick);
    const now = Date.now();
    const updatedLatest: Record<string, TelemetryPacket> = {};
    const newTickets: WorkOrderTicket[] = [];

    // Phase 1: Ingest next observations
    for (const station of IMD_AWS_STATIONS) {
      if (station.status === 'SCHEDULED_CALIBRATION') continue;
      const baseline = isLiveApiModeRef.current
        ? (liveCacheRef.current[station.stationId] || (station.stationId === selectedStationIdRef.current ? liveObservationRef.current : null))
        : undefined;
      const pkt = nicWmoEngineInstance.generatePacket(station.stationId, now, currentTick, baseline || undefined);
      updatedLatest[station.stationId] = pkt;
    }

    // Phase 2: Spatial KNN cross-validation against national cohort for any flagged observation
    for (const station of IMD_AWS_STATIONS) {
      const pkt = updatedLatest[station.stationId];
      if (!pkt) continue;
      if (pkt.classification !== 'NOMINAL_OPERATION') {
        pkt.spatialValidation = nicWmoEngineInstance.spatialCrossValidate(station.stationId, pkt.classification, updatedLatest);
        newTickets.push(createWorkOrder(pkt));
      }
    }

    setStationPackets(prev => {
      const next = { ...prev };
      for (const [stId, pkt] of Object.entries(updatedLatest)) {
        const buf = [...(next[stId] || []), pkt];
        if (buf.length > 30) buf.shift();
        next[stId] = buf;
      }
      return next;
    });

    setLatestPackets(prev => ({ ...prev, ...updatedLatest }));
    if (newTickets.length > 0) setWorkOrders(prev => [...newTickets, ...prev].slice(0, 50));
  }, []);

  useEffect(() => {
    if (isPaused) return;
    const t = setInterval(processNextTick, 2500);
    return () => clearInterval(t);
  }, [isPaused, processNextTick]);

  // Mobile node packet sync
  const lastMobileSyncRef = useRef<number>(0);

  const ingestExternalPacket = useCallback((pkt: TelemetryPacket) => {
    // If packet is from a connected mobile phone, auto-provision profile in customStations
    if (pkt.stationId.startsWith('AWS-MOB')) {
      const meta = (pkt as unknown as { mobileMetadata?: { lat?: number; lon?: number; deviceName?: string } }).mobileMetadata;
      setCustomStations(prev => {
        if (!prev[pkt.stationId]) {
          const lat = meta?.lat || 28.6139;
          const lon = meta?.lon || 77.2090;
          const devName = meta?.deviceName || 'Smartphone Field Sensor';
          const newProfile: IMDStationProfile = {
            stationId: pkt.stationId,
            name: `${devName} (${pkt.stationId})`,
            hindiName: `मोबाइल वेधशाला (${pkt.stationId})`,
            state: 'Connected Live Mobile Sensor',
            latitude: lat,
            longitude: lon,
            elevationM: 216,
            rmcDivision: 'Field Mobile Mesh Grid',
            wmoBlockNo: '49999',
            sensorMetadata: {
              tempSensor: 'Smartphone Battery/Ambient Thermistor & Open-Meteo',
              pressureSensor: 'Hardware Silicon Barometer (BMP280 / W3C Ambient)',
              humiditySensor: 'High-Res Polymer Capacitive / Open-Meteo',
              dataloggerModel: 'Mobile PWA Telemetry Edge Transmitter',
              telemetryUplink: '4G/5G HTTPS DCP Telemetry / WebSocket',
              batteryVoltage: '3.85 V (Li-ion Internal)',
              lastCalibDate: 'Auto-Calibrated Real-Time',
              calibCertNo: `CC-IMD-MOB-${pkt.stationId}`,
            },
            baseline: { tempMean: 29.5, pressureMean: 1008.0, humidityMean: 65.0, windMean: 12.0, windDirMean: 220 },
            status: 'OPERATIONAL',
          };
          return { ...prev, [pkt.stationId]: newProfile };
        }
        return prev;
      });
    }

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
    if (lastMobileSyncRef.current === 0) lastMobileSyncRef.current = Date.now();
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

  // Memoized network metrics & station selections
  const { opTotal, critCount, stormCount, driftCount, qIndex } = useMemo(() => {
    const total = IMD_AWS_STATIONS.filter(s => s.status !== 'SCHEDULED_CALIBRATION').length;
    const latestList = Object.values(latestPackets);
    const crit = latestList.filter(p => p.alertLevel === 'LEVEL_4_RED').length;
    const storm = latestList.filter(p => p.classification === 'GENUINE_CONVECTIVE_EVENT').length;
    const drift = latestList.filter(p => p.classification === 'CALIBRATION_DRIFT').length;
    const q = total > 0 ? Math.max(75, Math.min(100, Math.round(((total - crit) / total) * 1000) / 10)) : 95.0;
    return { opTotal: total, critCount: crit, stormCount: storm, driftCount: drift, qIndex: q };
  }, [latestPackets]);

  const connectedMobileCount = useMemo(() => {
    return Object.keys(latestPackets).filter(id => id.startsWith('AWS-MOB')).length;
  }, [latestPackets]);

  const activeStation = useMemo(() => customStations[selectedStationId] || getStationProfile(selectedStationId), [customStations, selectedStationId]);
  const activeHistory = useMemo(() => stationPackets[selectedStationId] || [], [stationPackets, selectedStationId]);

  const handleSelectCustomProfile = useCallback((profile: IMDStationProfile) => {
    setCustomStations(prev => ({ ...prev, [profile.stationId]: profile }));
    setSelectedStationId(profile.stationId);
  }, []);

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
        totalStations={IMD_AWS_STATIONS.length + Object.keys(customStations).length} onlineStations={opTotal + Object.keys(customStations).length} qualityIndex={qIndex}
        ingestInterval="2.5s" anomalyTally={{ critical: critCount, convective: stormCount, drift: driftCount }}
        language={language}
      />

      <main className="flex-1 max-w-[1750px] w-full mx-auto px-4 lg:px-8 py-4 space-y-4">
        {/* Jury & Public Orientation Guide (Why this platform exists & how to test) */}
        <GovJuryOrientationBanner
          language={language}
          onOpenMobileQR={() => setIsMobileQROpen(true)}
          connectedMobileCount={connectedMobileCount}
        />

        {/* Automated Live India Citizen & Sensor Test (Instant Auto-Check for anyone in India) */}
        <GovLiveIndiaAutoTester
          language={language}
          onOpenMobileQR={() => setIsMobileQROpen(true)}
          onSelectStation={setSelectedStationId}
        />

        {/* Universal All-India District & City Search (700+ Indian Districts) */}
        <GovIndiaDistrictSearch
          onSelectStationProfile={handleSelectCustomProfile}
          selectedStationId={selectedStationId}
          language={language}
        />

        {/* PROJECT VAYU — NATIONAL 766 DISTRICT OBSERVATIONAL & FAULT PLATFORM (SIH26073) */}
        <div className="space-y-4 pt-2">
          {/* Vayu Command Center & National Anomaly Dashboard */}
          <VayuNationalDashboard
            onSelectDistrict={(distId) => setSelectedVayuDistrictId(distId)}
            language={language}
          />

          {/* Vayu All-India 766 District GIS Health Map */}
          <VayuDistrictMap
            selectedDistrictId={selectedVayuDistrictId}
            onSelectDistrict={(distId) => setSelectedVayuDistrictId(distId)}
            language={language}
          />

          {/* Vayu Detailed 12-Parameter District Diagnostic Panel */}
          {selectedVayuDistrictId && (
            <VayuDistrictPanel
              districtId={selectedVayuDistrictId}
              onClose={() => setSelectedVayuDistrictId(null)}
              onSelectDistrict={(distId) => setSelectedVayuDistrictId(distId)}
              language={language}
            />
          )}

          {/* IMD Official Heatwave Decision Support System (DSS) & Climatological Departure Engine */}
          <GovHeatwaveDSSPanel
            selectedDistrictId={selectedVayuDistrictId}
            onSelectDistrict={(distId) => setSelectedVayuDistrictId(distId)}
            language={language}
          />
        </div>

        {/* Two-column layout: map left, console right on wide screens */}
        <div className="grid grid-cols-1 xl:grid-cols-[540px_1fr] gap-4">

          <GovNetworkMap
            latestPackets={latestPackets}
            selectedStationId={selectedStationId}
            onSelectStation={setSelectedStationId}
            onSelectCustomDistrict={handleSelectCustomProfile}
            customStations={customStations}
            language={language}
          />
          <GovObservationConsole
            selectedStation={activeStation} onSelectStation={setSelectedStationId}
            packets={activeHistory} language={language}
            isLiveApiMode={isLiveApiMode} onToggleLiveApiMode={() => setIsLiveApiMode(p => !p)}
            liveStatusInfo={liveObservation} isSyncingLive={isSyncingLive}
            onManualSync={() => syncLiveWeather(selectedStationId)}
          />
        </div>

        {/* Multi-Horizon Temporal Logic Engine (SIH 6073 Core Innovation) */}
        <GovTimeLogicMatrix
          language={language}
          onSimulateCase={(caseId) => {
            switch (caseId) {
              case 'case_roc_spike':
                triggerAndTick(nicWmoEngineInstance.triggerThermistorSpike.bind(nicWmoEngineInstance), selectedStationId);
                break;
              case 'case_convective_storm':
                triggerAndTick(nicWmoEngineInstance.triggerConvectiveStorm.bind(nicWmoEngineInstance), selectedStationId);
                break;
              case 'case_frozen_sensor':
                triggerAndTick(nicWmoEngineInstance.triggerWireDisconnectFreeze.bind(nicWmoEngineInstance), selectedStationId);
                break;
              case 'case_calibration_drift':
                triggerAndTick(nicWmoEngineInstance.triggerBarometerDrift.bind(nicWmoEngineInstance), selectedStationId);
                break;
              case 'case_packet_slot_loss':
                triggerAndTick(nicWmoEngineInstance.triggerPacketLoss.bind(nicWmoEngineInstance), selectedStationId);
                break;
              case 'case_solar_diurnal':
                triggerAndTick(nicWmoEngineInstance.triggerThermistorSpike.bind(nicWmoEngineInstance), selectedStationId);
                break;
              default:
                break;
            }
          }}
        />

        {/* Predictive Sensor Maintenance & RUL Degradation Panel */}

        <GovPredictiveMaintenancePanel
          packets={activeHistory}
          stationName={activeStation.name}
          language={language}
        />

        <GovNWPGatingPanel latestPackets={latestPackets} language={language} />

        <GovAnomalyRegister
          workOrders={workOrders}
          language={language}
          onOpenMethodology={() => setActiveModal('methodology')}
          onOpenEmergencyAlert={() => setIsEmergencyAlertOpen(true)}
        />
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
      <GovEmergencyAlertModal
        isOpen={isEmergencyAlertOpen}
        onClose={() => setIsEmergencyAlertOpen(false)}
        packet={latestPackets[selectedStationId] || null}
        stationName={activeStation.name}
        state={activeStation.state}
        language={language}
      />

      <footer className="mt-8 bg-[#002147] text-slate-300 border-t-4 border-[#FF9933] text-xs">
        <div className="max-w-[1750px] mx-auto px-4 lg:px-8 py-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pb-6 border-b border-slate-700">
            {[
              { title: language === 'hi' ? 'मौसम सेवाएं' : 'Observational Network', items: ['Automatic Weather Stations (AWS)', 'Agro-Meteorological Network', 'INSAT-3D Meteorological DCP Link', 'Doppler Weather Radar (DWR) Grid'] },
              { title: language === 'hi' ? 'गुणवत्ता आश्वासन' : 'Quality Assurance & Standards', items: ['WMO-No. 8 Weather Instrument Standards', 'NABL Calibration Traceability', 'ISO 9001:2015 QC Procedures', 'Real-Time Automated Data Verification'] },
              { title: language === 'hi' ? 'क्षेत्रीय मौसम विज्ञान केंद्र' : 'Regional Met Centres (RMC)', items: ['RMC New Delhi (Northern Region)', 'RMC Mumbai (Western Region)', 'RMC Kolkata (Eastern Region)', 'RMC Chennai (Southern Region)'] },
            ].map(col => (
              <div key={col.title}>
                <div className="font-bold text-white mb-1.5 uppercase tracking-wider text-[11px]">{col.title}</div>
                <ul className="space-y-1 text-slate-400 text-[11px]">{col.items.map(i => <li key={i}>{i}</li>)}</ul>
              </div>
            ))}
            <div>
              <div className="font-bold text-white mb-1.5 uppercase tracking-wider text-[11px]">
                {language === 'hi' ? 'प्रणाली वास्तुकला' : 'System Architecture & Innovation'}
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                National Automatic Weather Station Quality Management System — Real-time automated quality control, AI-powered sensor fault isolation, and reliable weather feeds for India.
              </p>
              <button onClick={() => setActiveModal('architecture')} className="mt-2 text-sky-300 hover:text-white underline text-[11px] font-semibold">
                {language === 'hi' ? 'पूर्ण प्रणाली वास्तुकला पढ़ें →' : 'Read Full Scalability Architecture →'}
              </button>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-400">
            <div>© 2026 National Automatic Weather Station Quality Management System (NAWS-QMS) • Innovation Prototype</div>
            <div className="flex items-center gap-4 flex-wrap">
              {([
                ['legal', 'Legal & Privacy (DPDPA 2023)'],
                ['architecture', 'System Design & Scalability'],
                ['methodology', 'Quality Control Rules'],
                ['accessibility', 'Accessibility Statement'],
                ['provenance', 'Data Sources & Disclosure'],
              ] as const).map(([key, label], i) => (
                <React.Fragment key={key}>
                  {i > 0 && <span>•</span>}
                  <button onClick={() => setActiveModal(key)} className="hover:underline hover:text-white cursor-pointer">{label}</button>
                </React.Fragment>
              ))}
            </div>
          </div>
          <div className="text-[10px] text-slate-400 border-t border-slate-700/80 pt-2 text-center">
            Statutory Notice: NAWS-QMS is an academic innovation prototype for Smart India Hackathon (Problem Statement SIH26073). It is not an official portal of the India Meteorological Department (IMD) or Ministry of Earth Sciences. For official life-safety warnings, visit <a href="https://mausam.imd.gov.in" target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:underline">mausam.imd.gov.in</a>.
          </div>
        </div>
      </footer>
    </div>
  );
}
