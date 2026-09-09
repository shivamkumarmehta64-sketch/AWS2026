'use client';

import React, { useState } from 'react';
import { 
  Wrench, 
  ChevronDown, 
  RotateCcw, 
  Play, 
  Pause, 
  ShieldAlert, 
  FileTerminal,
  X,
  Check,
  Zap,
  Activity
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
    'SIH Jury Testbench Ready.\nTarget: AWS-DEL-04 (Safdarjung Observatory)\nClick any test scenario to inject live faults into the telemetry stream.'
  );
  const [statusNotice, setStatusNotice] = useState<string | null>(null);

  const logAction = (msg: string, callback: () => void) => {
    callback();
    const time = new Date().toLocaleTimeString('en-IN', { hour12: false });
    setAuditLogText((prev) => `[${time} IST] ${msg}\n${prev}`);
    setStatusNotice(msg);
    setTimeout(() => setStatusNotice(null), 4000);
  };

  // Minimized Floating Pill Launcher (Never overlaps chart content)
  if (!isOpen) {
    return (
      <aside aria-label="SIH Jury Evaluation Testbench Launcher" className="fixed bottom-4 right-4 z-40">
        <button
          onClick={() => setIsOpen(true)}
          className="bg-[#002147] hover:bg-[#0B3B60] text-white px-3.5 py-2 rounded-full shadow-2xl border-2 border-amber-400 flex items-center gap-2.5 text-xs font-bold transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-amber-400"
          title="Open SIH Live Anomaly Injection & Sensor Simulation Testbench"
        >
          <Zap className="w-4 h-4 text-amber-400 animate-pulse" />
          <span>⚡ Live Testbench Simulator</span>
          <span className="bg-amber-400/20 text-amber-300 text-[10px] px-1.5 py-0.5 rounded font-mono font-semibold border border-amber-400/30">
            SIH Demo
          </span>
        </button>
      </aside>
    );
  }

  // Expanded Interactive Testbench Modal / Drawer
  return (
    <aside aria-label="SIH Live Sensor Anomaly Injection Testbench" className="fixed bottom-3 right-4 z-50 w-full max-w-md shadow-2xl">
      <div className="bg-[#002147] text-white border-2 border-slate-400 rounded-lg overflow-hidden shadow-2xl">
        {/* Accordion / Modal Header with Minimize & Close */}
        <div className="w-full px-3.5 py-2.5 flex items-center justify-between bg-[#002147] border-b border-slate-700">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <div>
              <span className="text-xs font-bold tracking-wide block">
                SIH Jury Testbench: Live Fault Injection
              </span>
              <span className="text-[10px] text-slate-300">
                Simulate sensor failures &amp; verify ML detection
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-slate-700 rounded text-slate-300 hover:text-white transition-colors"
              title="Minimize Testbench"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-rose-700 rounded text-slate-300 hover:text-white transition-colors"
              title="Close Testbench"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Collapsible Utility Body */}
        <div className="bg-[#F8FAFC] text-slate-800 p-3.5 text-xs space-y-3 max-h-[480px] overflow-y-auto">
          <div className="p-2 bg-blue-50 border border-blue-200 rounded text-[11px] text-blue-900 flex items-start gap-1.5">
            <ShieldAlert className="w-4 h-4 text-[#002147] shrink-0 mt-0.5" />
            <div>
              <strong>Demonstration Utility for Evaluators:</strong> Click any scenario below to inject faults in real time. Observe instant quarantine, WMO QC flag updates, and automated work orders.
            </div>
          </div>

          {/* Target Station Selector */}
          <div className="flex items-center justify-between gap-2">
            <label htmlFor="bench-station-select" className="text-[11px] font-bold text-slate-700">
              Target AWS Node:
            </label>
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

          {/* Interactive Scenario Buttons */}
          <div className="space-y-1.5">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1">
              <Activity className="w-3 h-3 text-slate-600" />
              <span>Inject Fault or Severe Storm:</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
              {/* 1. Thermistor Open-Circuit */}
              <button
                onClick={() =>
                  logAction(`Injected Thermistor Open-Circuit on ${targetId}`, () =>
                    onTriggerThermistorSpike(targetId)
                  )
                }
                className="p-2 text-left rounded bg-white hover:bg-red-50 border border-slate-300 hover:border-red-400 transition-colors shadow-2xs group"
              >
                <div className="font-bold text-red-700 group-hover:underline">1. Thermistor Open-Circuit</div>
                <div className="text-[10px] text-slate-500">Unphysical jump (&gt;54°C in &lt;5s) → SENSOR_SPIKE</div>
              </button>

              {/* 2. Signal Wire Disconnect / Freeze */}
              <button
                onClick={() =>
                  logAction(`Injected Signal Wire Disconnect on ${targetId}`, () =>
                    onTriggerWireDisconnectFreeze(targetId)
                  )
                }
                className="p-2 text-left rounded bg-white hover:bg-slate-100 border border-slate-300 hover:border-slate-500 transition-colors shadow-2xs group"
              >
                <div className="font-bold text-slate-800 group-hover:underline">2. Stuck Sensor / Wire Disconnect</div>
                <div className="text-[10px] text-slate-500">Zero variance across 6 ticks → FROZEN_VALUE</div>
              </button>

              {/* 3. Barometer Calibration Drift */}
              <button
                onClick={() =>
                  logAction(`Injected Barometer Drift (-0.4 hPa/hr) on ${targetId}`, () =>
                    onTriggerBarometerDrift(targetId)
                  )
                }
                className="p-2 text-left rounded bg-white hover:bg-yellow-50 border border-slate-300 hover:border-yellow-400 transition-colors shadow-2xs group"
              >
                <div className="font-bold text-yellow-800 group-hover:underline">3. Barometer Drift (-0.4 hPa/hr)</div>
                <div className="text-[10px] text-slate-500">Monotonic drift → CALIBRATION_DRIFT</div>
              </button>

              {/* 4. Severe Convective Front Dynamics */}
              <button
                onClick={() =>
                  logAction(`Injected Severe Convective Front on ${targetId}`, () =>
                    onTriggerConvectiveStorm(targetId)
                  )
                }
                className="p-2 text-left rounded bg-white hover:bg-amber-50 border border-slate-300 hover:border-amber-500 transition-colors shadow-2xs group"
              >
                <div className="font-bold text-amber-800 group-hover:underline">4. Severe Convective Storm</div>
                <div className="text-[10px] text-slate-500">Pressure drop + Humidity surge (Valid storm)</div>
              </button>
            </div>

            {/* Reset & Stream Pause */}
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() =>
                  logAction(`Reset all probes on ${targetId} to nominal baseline`, () =>
                    onResetToNominal(targetId)
                  )
                }
                className="flex-1 py-1.5 px-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-[11px] font-bold flex items-center justify-center gap-1 transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Node to Nominal Baseline</span>
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
                <span>{isPaused ? 'Resume' : 'Pause'}</span>
              </button>
            </div>
          </div>

          {/* Status Feedback Notice */}
          {statusNotice && (
            <div className="p-2 bg-emerald-100 border border-emerald-300 text-emerald-900 rounded text-[11px] font-mono flex items-center gap-1.5 animate-fadeIn">
              <Check className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
              <span>{statusNotice}</span>
            </div>
          )}

          {/* Testbench Log */}
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-600">
              <FileTerminal className="w-3 h-3 text-slate-500" />
              <span>Testbench Activity Log:</span>
            </div>
            <textarea
              rows={2}
              value={auditLogText}
              onChange={(e) => setAuditLogText(e.target.value)}
              className="w-full text-[10px] font-mono p-1.5 bg-white border border-slate-300 rounded text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#002147]"
            />
          </div>
        </div>
      </div>
    </aside>
  );
};

