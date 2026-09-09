'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { IMD_AWS_STATIONS, getStationProfile, IMDStationProfile } from '@/lib/stationData';
import { 
  nicWmoEngineInstance, 
  TelemetryPacket, 
  WorkOrderTicket 
} from '@/lib/anomalyLogic';

import { GovHeader } from '@/components/GovHeader';
import { GovNetworkStrip } from '@/components/GovNetworkStrip';
import { GovObservationConsole } from '@/components/GovObservationConsole';
import { GovAnomalyRegister } from '@/components/GovAnomalyRegister';
import { GovTechnicianDrawer } from '@/components/GovTechnicianDrawer';

export default function GovernmentAWSManagementPortal() {
  const [selectedStationId, setSelectedStationId] = useState<string>('AWS-DEL-04');
  const [fontSizeLevel, setFontSizeLevel] = useState<number>(0); // -1, 0, 1
  const [isHighContrast, setIsHighContrast] = useState<boolean>(false);
  const [language, setLanguage] = useState<'en' | 'hi'>('en');

  const [stationPackets, setStationPackets] = useState<Record<string, TelemetryPacket[]>>({});
  const [latestPackets, setLatestPackets] = useState<Record<string, TelemetryPacket>>({});
  const [workOrders, setWorkOrders] = useState<WorkOrderTicket[]>([]);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [tickCount, setTickCount] = useState<number>(0);

  // Initial Seed Load (Historical Context)
  useEffect(() => {
    const initialPackets: Record<string, TelemetryPacket[]> = {};
    const initialLatest: Record<string, TelemetryPacket> = {};
    const initialWorkOrders: WorkOrderTicket[] = [];

    const now = Date.now() - 20 * 2500;
    for (const station of IMD_AWS_STATIONS) {
      const history: TelemetryPacket[] = [];
      for (let i = 0; i < 16; i++) {
        const ts = now + i * 2500;
        const pkt = nicWmoEngineInstance.generatePacket(station.stationId, ts, i);
        history.push(pkt);
      }
      initialPackets[station.stationId] = history;
      if (history.length > 0) {
        initialLatest[station.stationId] = history[history.length - 1];
      }
    }

    setStationPackets(initialPackets);
    setLatestPackets(initialLatest);
  }, []);

  // Periodic Telemetry Ingest Loop (every 2.5 seconds)
  const processNextObservationTick = useCallback(() => {
    setTickCount((prev) => prev + 1);
    const now = Date.now();
    const updatedLatest: Record<string, TelemetryPacket> = {};
    const newTickets: WorkOrderTicket[] = [];

    setStationPackets((prevBuffers) => {
      const newBuffers: Record<string, TelemetryPacket[]> = { ...prevBuffers };

      for (const station of IMD_AWS_STATIONS) {
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

  // Accessibility handlers
  const handleFontSizeChange = (delta: number) => {
    if (delta === 0) setFontSizeLevel(0);
    else if (delta === -1 && fontSizeLevel > -1) setFontSizeLevel((prev) => prev - 1);
    else if (delta === 1 && fontSizeLevel < 2) setFontSizeLevel((prev) => prev + 1);
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

  // Font size multiplier class
  const getFontSizeClass = () => {
    if (fontSizeLevel === -1) return 'text-[92%]';
    if (fontSizeLevel === 1) return 'text-[106%]';
    if (fontSizeLevel === 2) return 'text-[112%]';
    return '';
  };

  // Network metrics calculations
  const totalCount = IMD_AWS_STATIONS.length;
  const latestList = Object.values(latestPackets);
  const criticalCount = latestList.filter((p) => p.alertLevel === 'LEVEL_4_RED').length;
  const stormCount = latestList.filter((p) => p.classification === 'GENUINE_CONVECTIVE_EVENT').length;
  const driftCount = latestList.filter((p) => p.classification === 'CALIBRATION_DRIFT').length;

  const activeSelectedStation = getStationProfile(selectedStationId);
  const activeStationHistory = stationPackets[selectedStationId] || [];

  return (
    <div className={`min-h-screen bg-[#F1F5F9] text-slate-900 flex flex-col font-sans ${getFontSizeClass()}`}>
      {/* 1. Official Government Header (NIC Guidelines) */}
      <GovHeader
        fontSizeLevel={fontSizeLevel}
        onFontSizeChange={handleFontSizeChange}
        isHighContrast={isHighContrast}
        onToggleContrast={handleToggleContrast}
        language={language}
        onToggleLanguage={handleToggleLanguage}
      />

      {/* 2. Executive Network Status Strip & Breadcrumb */}
      <GovNetworkStrip
        totalStations={totalCount}
        onlineStations={totalCount - 1} // 19 online, 1 in scheduled calibration
        qualityIndex={98.4}
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
        />
      </main>

      {/* Section 5: Stealth Field Diagnostic & Bench Test Tool (Authorized Personnel) */}
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

      {/* Official Government of India Footer (NIC / MoES Standards) */}
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
                <li>NABL Calibration Accreditation</li>
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
                {language === 'hi' ? 'एनआईसी सहायता' : 'NIC Support & Compliance'}
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Designed, Developed and Hosted by National Informatics Centre (NIC), Ministry of Electronics &amp; Information Technology, Government of India.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-400">
            <div>
              © 2026 India Meteorological Department (IMD), Ministry of Earth Sciences (MoES), Government of India.
            </div>
            <div className="flex items-center gap-4">
              <span className="hover:underline cursor-pointer">Website Policies</span>
              <span>•</span>
              <span className="hover:underline cursor-pointer">Terms of Use</span>
              <span>•</span>
              <span className="hover:underline cursor-pointer">Help &amp; Accessibility</span>
              <span>•</span>
              <span className="font-mono text-slate-300">NIC-SEC-AUDIT-2026-PASS</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
