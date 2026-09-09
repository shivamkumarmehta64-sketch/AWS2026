'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { IMD_AWS_STATIONS, getStationProfile, IMDStationProfile } from '@/lib/stationData';
import { 
  nicWmoEngineInstance, 
  TelemetryPacket, 
  WorkOrderTicket,
  getInitialSeededDataset
} from '@/lib/anomalyLogic';

import { GovHeader } from '@/components/GovHeader';
import { GovNetworkStrip } from '@/components/GovNetworkStrip';
import { GovObservationConsole } from '@/components/GovObservationConsole';
import { GovAnomalyRegister } from '@/components/GovAnomalyRegister';
import { GovTechnicianDrawer } from '@/components/GovTechnicianDrawer';
import { GovInfoModals, ActiveModalType } from '@/components/GovInfoModals';

export default function GovernmentAWSManagementPortal() {
  const [selectedStationId, setSelectedStationId] = useState<string>('AWS-DEL-04');
  const [fontSizeLevel, setFontSizeLevel] = useState<number>(0); // -1, 0, 1, 2
  const [isHighContrast, setIsHighContrast] = useState<boolean>(false);
  const [language, setLanguage] = useState<'en' | 'hi'>('en');
  const [activeModal, setActiveModal] = useState<ActiveModalType>(null);

  // Pre-seed synchronous initial data with active anomalies for demo resilience
  const [initialData] = useState(() => getInitialSeededDataset());
  const [stationPackets, setStationPackets] = useState<Record<string, TelemetryPacket[]>>(() => initialData.stationPackets);
  const [latestPackets, setLatestPackets] = useState<Record<string, TelemetryPacket>>(() => initialData.latestPackets);
  const [workOrders, setWorkOrders] = useState<WorkOrderTicket[]>(() => initialData.workOrders);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [tickCount, setTickCount] = useState<number>(14);

  // Periodic Telemetry Ingest Loop (every 2.5 seconds)
  const processNextObservationTick = useCallback(() => {
    setTickCount((prev) => prev + 1);
    const now = Date.now();
    const updatedLatest: Record<string, TelemetryPacket> = {};
    const newTickets: WorkOrderTicket[] = [];

    setStationPackets((prevBuffers) => {
      const newBuffers: Record<string, TelemetryPacket[]> = { ...prevBuffers };

      for (const station of IMD_AWS_STATIONS) {
        // Skip updating AWS-VAP-20 if in scheduled calibration
        if (station.status === 'SCHEDULED_CALIBRATION') continue;

        const pkt = nicWmoEngineInstance.generatePacket(station.stationId, now, tickCount);
        updatedLatest[station.stationId] = pkt;

        const currentBuf = newBuffers[station.stationId] || [];
        const nextBuf = [...currentBuf, pkt];
        if (nextBuf.length > 30) nextBuf.shift();
        newBuffers[station.stationId] = nextBuf;

        // If anomaly or convective event occurs, create formal work order
        if (pkt.classification !== 'NOMINAL_OPERATION') {
          const ticket: WorkOrderTicket = {
            ticketId: pkt.ticketId || `IMD-QMS-2026-${Date.now().toString().slice(-4)}`,
            stationId: station.stationId,
            stationName: station.name,
            state: station.state,
            timestamp: pkt.timeIST,
            parameterInvolved: pkt.xaiAttribution.primaryParameter,
            classification: pkt.classification,
            alertLevel: pkt.alertLevel,
            faultProbability: pkt.faultProbability,
            xaiBreakdown: `Temp: ${pkt.xaiAttribution.tempWeight}%, Press: ${pkt.xaiAttribution.pressWeight}%, Hum: ${pkt.xaiAttribution.humWeight}%`,
            observedVsImputed: `Obs: ${pkt.raw.temperature ?? 'NULL'}°C / ${pkt.raw.pressure ?? 'NULL'}hPa | Imp: ${pkt.imputed.temperature}°C / ${pkt.imputed.pressure}hPa`,
            operationalAction: pkt.operationalAction,
            status: pkt.classification === 'GENUINE_CONVECTIVE_EVENT' ? 'VALIDATED_NWP' : 'QUARANTINED',
          };
          newTickets.push(ticket);
        }
      }

      return newBuffers;
    });

    setLatestPackets((prev) => ({ ...prev, ...updatedLatest }));

    if (newTickets.length > 0) {
      setWorkOrders((prev) => [...newTickets, ...prev].slice(0, 50));
    }
  }, [tickCount]);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      processNextObservationTick();
    }, 2500);
    return () => clearInterval(timer);
  }, [isPaused, processNextObservationTick]);

  // Accessibility handlers with real HTML root font scaling
  const handleFontSizeChange = (delta: number) => {
    let nextLevel = fontSizeLevel;
    if (delta === 0) nextLevel = 0;
    else if (delta === -1 && fontSizeLevel > -1) nextLevel = fontSizeLevel - 1;
    else if (delta === 1 && fontSizeLevel < 2) nextLevel = fontSizeLevel + 1;
    setFontSizeLevel(nextLevel);

    if (typeof document !== 'undefined') {
      if (nextLevel === -1) document.documentElement.style.fontSize = '14px';
      else if (nextLevel === 1) document.documentElement.style.fontSize = '18px';
      else if (nextLevel === 2) document.documentElement.style.fontSize = '20px';
      else document.documentElement.style.fontSize = '16px';
    }
  };

  const handleToggleContrast = () => {
    setIsHighContrast((prev) => {
      const next = !prev;
      if (next) document.body.classList.add('high-contrast');
      else document.body.classList.remove('high-contrast');
      return next;
    });
  };

  const handleToggleLanguage = () => {
    setLanguage((prev) => (prev === 'en' ? 'hi' : 'en'));
  };

  // Network metrics calculations
  const totalCount = IMD_AWS_STATIONS.length;
  const operationalTotal = IMD_AWS_STATIONS.filter((s) => s.status !== 'SCHEDULED_CALIBRATION').length;
  const latestList = Object.values(latestPackets);
  const criticalCount = latestList.filter((p) => p.alertLevel === 'LEVEL_4_RED').length;
  const stormCount = latestList.filter((p) => p.classification === 'GENUINE_CONVECTIVE_EVENT').length;
  const driftCount = latestList.filter((p) => p.classification === 'CALIBRATION_DRIFT').length;

  // Mathematically consistent Quality Index based on active faults
  const calculatedQIndex = operationalTotal > 0
    ? Math.max(75, Math.min(100, Math.round(((operationalTotal - criticalCount) / operationalTotal) * 1000) / 10))
    : 95.0;

  const activeSelectedStation = getStationProfile(selectedStationId);
  const activeStationHistory = stationPackets[selectedStationId] || [];

  return (
    <div className="min-h-screen bg-[#F1F5F9] text-slate-900 flex flex-col font-sans transition-all duration-150">
      {/* 1. Official Header with Hackathon Prototype Identity */}
      <GovHeader
        fontSizeLevel={fontSizeLevel}
        onFontSizeChange={handleFontSizeChange}
        isHighContrast={isHighContrast}
        onToggleContrast={handleToggleContrast}
        language={language}
        onToggleLanguage={handleToggleLanguage}
        onOpenModal={(type) => setActiveModal(type)}
      />

      {/* 2. Executive Network Status Strip & Breadcrumb */}
      <GovNetworkStrip
        totalStations={totalCount}
        onlineStations={operationalTotal} // 19 online, 1 in scheduled calibration (AWS-VAP-20)
        qualityIndex={calculatedQIndex}
        ingestInterval="2.5s"
        anomalyTally={{
          critical: criticalCount,
          convective: stormCount,
          drift: driftCount,
        }}
        language={language}
      />

      {/* Main Workspace Layout */}
      <main className="flex-1 max-w-[1750px] w-full mx-auto px-4 lg:px-8 py-4 space-y-4">
        {/* Section 2: Primary Observation & Telemetry Console */}
        <GovObservationConsole
          selectedStation={activeSelectedStation}
          onSelectStation={(id) => setSelectedStationId(id)}
          packets={activeStationHistory}
          language={language}
        />

        {/* Section 3: Diagnostic Work-Order & Anomaly Register */}
        <GovAnomalyRegister
          workOrders={workOrders}
          language={language}
          onOpenMethodology={() => setActiveModal('methodology')}
        />
      </main>

      {/* Section 5: SIH Live Anomaly Injection & Testbench Tool */}
      <GovTechnicianDrawer
        selectedStationId={selectedStationId}
        onTriggerThermistorSpike={(id) => {
          nicWmoEngineInstance.triggerThermistorSpike(id);
          if (isPaused) processNextObservationTick();
        }}
        onTriggerWireDisconnectFreeze={(id) => {
          nicWmoEngineInstance.triggerWireDisconnectFreeze(id);
          if (isPaused) processNextObservationTick();
        }}
        onTriggerBarometerDrift={(id) => {
          nicWmoEngineInstance.triggerBarometerDrift(id);
          if (isPaused) processNextObservationTick();
        }}
        onTriggerConvectiveStorm={(id) => {
          nicWmoEngineInstance.triggerConvectiveStorm(id);
          if (isPaused) processNextObservationTick();
        }}
        onTriggerPacketLoss={(id) => {
          nicWmoEngineInstance.triggerPacketLoss(id);
          if (isPaused) processNextObservationTick();
        }}
        onResetToNominal={(id) => {
          nicWmoEngineInstance.resetToNominal(id);
          if (isPaused) processNextObservationTick();
        }}
        isPaused={isPaused}
        onTogglePause={() => setIsPaused(!isPaused)}
      />

      {/* Informational Modals */}
      <GovInfoModals
        activeModal={activeModal}
        onClose={() => setActiveModal(null)}
        language={language}
      />

      {/* Honest, High-Impact SIH Hackathon Project Footer with Interactive Modals */}
      <footer className="mt-8 bg-[#002147] text-slate-300 border-t-4 border-[#FF9933] text-xs">
        <div className="max-w-[1750px] mx-auto px-4 lg:px-8 py-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pb-6 border-b border-slate-700">
            <div>
              <div className="font-bold text-white mb-1.5 uppercase tracking-wider text-[11px]">
                {language === 'hi' ? 'मौसम सेवाएं' : 'Observational Network'}
              </div>
              <ul className="space-y-1 text-slate-400 text-[11px]">
                <li>Automatic Weather Stations (AWS)</li>
                <li>Agro-Meteorological Network</li>
                <li>INSAT-3D Meteorological DCP Link</li>
                <li>Doppler Weather Radar (DWR) Grid</li>
              </ul>
            </div>

            <div>
              <div className="font-bold text-white mb-1.5 uppercase tracking-wider text-[11px]">
                {language === 'hi' ? 'गुणवत्ता आश्वासन' : 'Quality Assurance & Standards'}
              </div>
              <ul className="space-y-1 text-slate-400 text-[11px]">
                <li>WMO Pub No. 8 Instrument Standards</li>
                <li>NABL Calibration Traceability</li>
                <li>ISO 9001:2015 QC Procedures</li>
                <li>NWP Numerical Assimilation Verification</li>
              </ul>
            </div>

            <div>
              <div className="font-bold text-white mb-1.5 uppercase tracking-wider text-[11px]">
                {language === 'hi' ? 'क्षेत्रीय मौसम विज्ञान केंद्र' : 'Regional Met Centres (RMC)'}
              </div>
              <ul className="space-y-1 text-slate-400 text-[11px]">
                <li>RMC New Delhi (Northern Region)</li>
                <li>RMC Mumbai (Western Region)</li>
                <li>RMC Kolkata (Eastern Region)</li>
                <li>RMC Chennai (Southern Region)</li>
              </ul>
            </div>

            <div>
              <div className="font-bold text-white mb-1.5 uppercase tracking-wider text-[11px]">
                {language === 'hi' ? 'परियोजना वास्तुकला' : 'SIH26073 Innovation Details'}
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Smart India Hackathon concept prototype for automated real-time quality control, explainable AI (XAI) fault isolation, and NWP data gating across India Meteorological Department (IMD) AWS networks.
              </p>
              <div className="mt-2">
                <button
                  onClick={() => setActiveModal('architecture')}
                  className="text-sky-300 hover:text-white underline text-[11px] font-semibold"
                >
                  {language === 'hi' ? 'पूर्ण प्रणाली वास्तुकला पढ़ें →' : 'Read Full Scalability Architecture →'}
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-400">
            <div>
              © 2026 NAWS-QMS Project | Smart India Hackathon Prototype (SIH26073) | Built for Evaluation
            </div>
            <div className="flex items-center gap-4 flex-wrap">
              <button
                onClick={() => setActiveModal('architecture')}
                className="hover:underline hover:text-white cursor-pointer"
              >
                Website Scope &amp; Architecture
              </button>
              <span>•</span>
              <button
                onClick={() => setActiveModal('methodology')}
                className="hover:underline hover:text-white cursor-pointer"
              >
                WMO QC Rules &amp; XAI
              </button>
              <span>•</span>
              <button
                onClick={() => setActiveModal('accessibility')}
                className="hover:underline hover:text-white cursor-pointer"
              >
                Accessibility Statement
              </button>
              <span>•</span>
              <button
                onClick={() => setActiveModal('provenance')}
                className="hover:underline hover:text-white cursor-pointer"
              >
                Data Provenance &amp; Disclosure
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

