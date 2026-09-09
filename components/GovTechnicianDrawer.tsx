'use client';

import React, { useState } from 'react';
import { 
  Wrench, 
  ChevronUp, 
  ChevronDown, 
  RotateCcw, 
  Play, 
  Pause, 
  ShieldAlert, 
  FileTerminal,
  Radio,
  Check
} from 'lucide-react';
import { IMD_AWS_STATIONS } from '@/lib/stationData';

interface GovTechnicianDrawerProps {
  selectedStationId: string;
  onTriggerThermistorSpike: (id: string) => void;
  onTriggerWireDisconnectFreeze: (id: string) => void;
  onTriggerBarometerDrift: (id: string) => void;
  onTriggerConvectiveStorm: (id: string) => void;
  onTriggerPacketLoss: (id: string) => void;
  onResetToNominal: (id?: string) => void;
  isPaused: boolean;
  onTogglePause: () => void;
}

export const GovTechnicianDrawer: React.FC<GovTechnicianDrawerProps> = ({
  selectedStationId,
  onTriggerThermistorSpike,
  onTriggerWireDisconnectFreeze,
  onTriggerBarometerDrift,
  onTriggerConvectiveStorm,
  onTriggerPacketLoss,
  onResetToNominal,
  isPaused,
  onTogglePause,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [targetId, setTargetId] = useState(selectedStationId);
  const [auditLogText, setAuditLogText] = useState(
    'Operator: Tech_ID_4102 | Field Hub: Northern Region Regional Meteorological Centre (RMC New Delhi) | Authorization: SEC-IMD-QMS-LEVEL4\nObservation cycle running nominal bench test verification.'
  );
  const [statusNotice, setStatusNotice] = useState<string | null>(null);

  const logAction = (msg: string, callback: () => void) => {
    callback();
    const time = new Date().toLocaleTimeString('en-IN', { hour12: false });
    setAuditLogText((prev) => `[${time} IST] ${msg}\n${prev}`);
    setStatusNotice(msg);
    setTimeout(() => setStatusNotice(null), 4000);
  };

  return (
    <div className="fixed bottom-3 right-4 z-50 w-full max-w-md shadow-2xl">
      <div className="bg-[#002147] text-white border-2 border-slate-400 rounded-t-md overflow-hidden">
        {/* Accordion Toggle Header */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-3.5 py-2 flex items-center justify-between text-left hover:bg-[#0B3B60] transition-colors"
          title="Field Diagnostic & Bench Test Tool"
        >
          <div className="flex items-center gap-2">
            <Wrench className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold tracking-wide">
              NIC-MoES Field Diagnostic &amp; Bench Test Tool (Authorized Personnel Only)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded border border-amber-500/30 font-mono font-semibold">
              RESTRICTED
            </span>
            {isOpen ? <ChevronDown className="w-4 h-4 text-slate-300" /> : <ChevronUp className="w-4 h-4 text-slate-300" />}
          </div>
        </button>

        {/* Collapsible Utility Body */}
        {isOpen && (
          <div className="bg-[#F8FAFC] text-slate-800 border-t border-slate-300 p-3.5 text-xs space-y-3 max-h-[480px] overflow-y-auto">
            <div className="p-2 bg-blue-50 border border-blue-200 rounded text-[11px] text-blue-900 flex items-start gap-1.5">
              <ShieldAlert className="w-4 h-4 text-[#002147] shrink-0 mt-0.5" />
              <div>
                <strong>Bench Calibration &amp; Verification Utility:</strong> Used by RMC field engineers to evaluate AWS datalogger analog inputs, step limits, and WMO discrimination.
              </div>
            </div>

            {/* Target Station Selector */}
            <div className="flex items-center justify-between gap-2">
              <label htmlFor="bench-station-select" className="text-[11px] font-bold text-slate-700">Target AWS Node:</label>
              <select
                id="bench-station-select"
                value={targetId}
                onChange={(e) => setTargetId(e.target.value)}
                className="text-xs bg-white border border-slate-300 rounded px-2 py-1 font-mono font-semibold text-[#002147]"
              >
                {IMD_AWS_STATIONS.map((st) => (
                  <option key={st.stationId} value={st.stationId}>
                    {st.stationId} - {st.name.split(',')[0]}
                  </option>
                ))}
              </select>
            </div>

            {/* Field Diagnostic Controls (Government Terminology) */}
            <div className="space-y-1.5">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
                Instrument Anomaly &amp; Severe Weather Injections:
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                {/* 1. Thermistor Open-Circuit */}
                <button
                  onClick={() =>
                    logAction(`Simulated Thermistor Open-Circuit on ${targetId}`, () =>
                      onTriggerThermistorSpike(targetId)
                    )
                  }
                  className="p-2 text-left rounded bg-white hover:bg-red-50 border border-slate-300 hover:border-red-400 transition-colors shadow-2xs"
                >
                  <div className="font-bold text-red-700">Simulate Thermistor Open-Circuit</div>
                  <div className="text-[10px] text-slate-500">Triggers SENSOR_SPIKE (&gt;50°C in &lt;5s)</div>
                </button>

                {/* 2. Signal Wire Disconnect / Freeze */}
                <button
                  onClick={() =>
                    logAction(`Simulated Signal Wire Disconnect / Stuck ADC on ${targetId}`, () =>
                      onTriggerWireDisconnectFreeze(targetId)
                    )
                  }
                  className="p-2 text-left rounded bg-white hover:bg-slate-100 border border-slate-300 hover:border-slate-500 transition-colors shadow-2xs"
                >
                  <div className="font-bold text-slate-800">Signal Wire Disconnect / Freeze</div>
                  <div className="text-[10px] text-slate-500">Triggers FROZEN_VALUE (Zero variance &ge;6 ticks)</div>
                </button>

                {/* 3. Barometer Calibration Drift */}
                <button
                  onClick={() =>
                    logAction(`Injected Barometer Drift (-0.4 hPa/hr) on ${targetId}`, () =>
                      onTriggerBarometerDrift(targetId)
                    )
                  }
                  className="p-2 text-left rounded bg-white hover:bg-yellow-50 border border-slate-300 hover:border-yellow-400 transition-colors shadow-2xs"
                >
                  <div className="font-bold text-yellow-800">Barometer Drift (-0.4 hPa/hr)</div>
                  <div className="text-[10px] text-slate-500">Triggers CALIBRATION_DRIFT regression check</div>
                </button>

                {/* 4. Severe Convective Front Dynamics */}
                <button
                  onClick={() =>
                    logAction(`Triggered Severe Convective Front Dynamics on ${targetId}`, () =>
                      onTriggerConvectiveStorm(targetId)
                    )
                  }
                  className="p-2 text-left rounded bg-white hover:bg-amber-50 border border-slate-300 hover:border-amber-500 transition-colors shadow-2xs"
                >
                  <div className="font-bold text-amber-800">Severe Convective Front Dynamics</div>
                  <div className="text-[10px] text-slate-500">Pressure drop + Humidity surge (Valid storm)</div>
                </button>
              </div>

              {/* Reset & Stream Pause */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() =>
                    logAction(`Reset all probes on ${targetId} to nominal IMD baseline`, () =>
                      onResetToNominal(targetId)
                    )
                  }
                  className="flex-1 py-1.5 px-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-[11px] font-bold flex items-center justify-center gap-1 transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset Probes to Nominal IMD Baseline</span>
                </button>

                <button
                  onClick={onTogglePause}
                  className={`py-1.5 px-3 rounded text-[11px] font-bold border flex items-center gap-1 ${
                    isPaused
                      ? 'bg-amber-600 text-white border-amber-700'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  {isPaused ? <Play className="w-3 h-3 fill-current" /> : <Pause className="w-3 h-3" />}
                  <span>{isPaused ? 'Resume Stream' : 'Pause Stream'}</span>
                </button>
              </div>
            </div>

            {/* Status Feedback Notice */}
            {statusNotice && (
              <div className="p-1.5 bg-emerald-100 border border-emerald-300 text-emerald-900 rounded text-[10px] font-mono flex items-center gap-1.5">
                <Check className="w-3 h-3 text-emerald-700" />
                <span>{statusNotice}</span>
              </div>
            )}

            {/* Operator Audit Log Textarea */}
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-600">
                <FileTerminal className="w-3 h-3 text-slate-500" />
                <span>Operator Audit Log (SEC-4102-IMD):</span>
              </div>
              <textarea
                rows={3}
                value={auditLogText}
                onChange={(e) => setAuditLogText(e.target.value)}
                className="w-full text-[10px] font-mono p-1.5 bg-white border border-slate-300 rounded text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#002147]"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
