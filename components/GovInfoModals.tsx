'use client';

import React from 'react';
import { X, Shield, BookOpen, Cpu, Globe2, Eye, Server, Layers, CheckCircle2, AlertTriangle, CloudLightning, Wrench } from 'lucide-react';

export type ActiveModalType = 'architecture' | 'methodology' | 'accessibility' | 'provenance' | null;

interface GovInfoModalsProps {
  activeModal: ActiveModalType;
  onClose: () => void;
  language: 'hi' | 'en';
}

export const GovInfoModals: React.FC<GovInfoModalsProps> = ({
  activeModal,
  onClose,
  language,
}) => {
  if (!activeModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
      <div className="bg-white border-2 border-[#002147] rounded-lg shadow-2xl max-w-3xl w-full max-h-[85vh] flex flex-col overflow-hidden animate-fadeIn">
        {/* Modal Header */}
        <div className="bg-[#002147] text-white px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {activeModal === 'architecture' && <Server className="w-5 h-5 text-sky-400" />}
            {activeModal === 'methodology' && <BookOpen className="w-5 h-5 text-amber-400" />}
            {activeModal === 'accessibility' && <Eye className="w-5 h-5 text-emerald-400" />}
            {activeModal === 'provenance' && <Layers className="w-5 h-5 text-purple-400" />}
            <h2 className="text-sm font-bold tracking-wide uppercase">
              {activeModal === 'architecture' && (language === 'hi' ? 'प्रणाली वास्तुकला एवं मापनीयता (SIH26073)' : 'System Architecture & Network Scalability (SIH26073)')}
              {activeModal === 'methodology' && (language === 'hi' ? 'विसंगति पहचान पद्धति एवं डब्ल्यूएमओ नियम' : 'Anomaly Detection Methodology & WMO Pub No. 8 QC Rules')}
              {activeModal === 'accessibility' && (language === 'hi' ? 'सुलभता एवं अनुपालन विवरण' : 'Accessibility Statement & Compliance Features')}
              {activeModal === 'provenance' && (language === 'hi' ? 'डेटा स्रोत एवं सिमुलेशन ढांचा' : 'Data Provenance & Simulation Framework')}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            title="Close Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-700 leading-relaxed font-sans">
          {/* 1. Architecture & Scalability */}
          {activeModal === 'architecture' && (
            <div className="space-y-4">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded text-blue-900">
                <div className="font-bold text-xs text-[#002147] mb-1">
                  Smart India Hackathon Prototype Scope (Problem Statement SIH26073):
                </div>
                <div>
                  This platform is a prototype automated quality management system designed to process surface Automatic Weather Station (AWS) telemetry, isolate transducer failures from severe convective storms, and gate high-integrity observations into Numerical Weather Prediction (NWP) assimilation models.
                </div>
              </div>

              <div className="space-y-2">
                <div className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <Cpu className="w-4 h-4 text-[#002147]" />
                  <span>Scaling to India's Full AWS Network (~1,350+ Nodes):</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded">
                    <div className="font-bold text-slate-800 mb-1">1. Ingestion Layer (Distributed Streaming)</div>
                    <p className="text-slate-600">
                      Partitioned Kafka/MQTT message brokers ingest dual-uplink DCP packets (INSAT-3D UHF @ 402.75 MHz and 4G GPRS VPN fallback). Handles 1,350+ stations transmitting every 15 minutes (~1.5k events/cycle) with sub-second latency.
                    </p>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded">
                    <div className="font-bold text-slate-800 mb-1">2. Line-Rate Edge QC Filter</div>
                    <p className="text-slate-600">
                      Stateless stream processors apply WMO Pub No. 8 physical limits and Rate of Change (RoC) tests in &lt;5ms per packet, instantly quarantining open-circuit thermistor spikes before database commit.
                    </p>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded">
                    <div className="font-bold text-slate-800 mb-1">3. Spatial Neighborhood Cross-Validation</div>
                    <p className="text-slate-600">
                      Inverse Distance Weighting (IDW) and spatial KNN check readings against neighboring AWS nodes within a 50 km radius to confirm regional microclimatic anomalies vs single-node hardware failure.
                    </p>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded">
                    <div className="font-bold text-slate-800 mb-1">4. Automated Field Hub Work Orders</div>
                    <p className="text-slate-600">
                      When transducer drift or ADC lock is detected across 6 consecutive cycles, formal work orders are routed directly to the corresponding Regional Meteorological Centre (RMC) field maintenance unit.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2. Methodology & WMO QC Rules */}
          {activeModal === 'methodology' && (
            <div className="space-y-4">
              <div className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                WMO Pub No. 8 &amp; WMO No. 548 Algorithmic Flags:
              </div>

              <div className="space-y-2">
                <div className="p-2.5 bg-emerald-50 border border-emerald-300 rounded flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-emerald-900">Flag 1: Validated (Good Data)</strong>
                    <p className="text-emerald-800 text-[11px] mt-0.5">
                      Observations satisfy physical climatological limits (-10°C to +55°C, 920–1050 hPa) and Rate of Change limits (&lt;0.3°C/min). Approved for unrestricted NWP assimilation.
                    </p>
                  </div>
                </div>

                <div className="p-2.5 bg-amber-50 border border-amber-300 rounded flex items-start gap-2">
                  <CloudLightning className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-amber-900">Flag 2: Severe Convective Storm (Valid Real Weather)</strong>
                    <p className="text-amber-800 text-[11px] mt-0.5">
                      Detects rapid pressure plunge (&gt;2.5 hPa drop) coupled with a humidity surge (&gt;15% increase) and evaporative cooling. While gradients exceed standard step limits, multivariate correlation confirms a genuine meteorological storm front rather than sensor defect.
                    </p>
                  </div>
                </div>

                <div className="p-2.5 bg-yellow-50 border border-yellow-300 rounded flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-700 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-yellow-900">Flag 3: Suspect Calibration Drift</strong>
                    <p className="text-yellow-800 text-[11px] mt-0.5">
                      Identifies monotonic baseline departure (&gt;0.4 hPa/hr divergence from diurnal curve) without corresponding weather front signatures. Sensor scheduled for NABL recalibration.
                    </p>
                  </div>
                </div>

                <div className="p-2.5 bg-rose-50 border border-rose-300 rounded flex items-start gap-2">
                  <Wrench className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-rose-900">Flag 4: Corrupt Hardware (Quarantined)</strong>
                    <p className="text-rose-800 text-[11px] mt-0.5">
                      Assigned to physical failures: Thermistor open-circuit spikes (&gt;54°C in &lt;5s) or signal wire disconnects (ADC register stuck with zero variance &ge; 6 ticks). Data immediately quarantined from weather forecasting models.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded text-slate-700">
                <div className="font-bold text-slate-900 mb-1">Explainable AI (XAI) Attribution Breakdown:</div>
                <p className="text-[11px]">
                  XAI percentages (e.g. <em>Temp: 88.2%, Press: 6.1%, Hum: 5.7%</em>) are computed using normalized z-score gradient deviations across parameters. When a single parameter deviates drastically while orthogonal sensors remain flat, the attribution engine identifies the exact faulty probe and provides transparent root-cause evidence to duty meteorologists.
                </p>
              </div>
            </div>
          )}

          {/* 3. Accessibility Statement */}
          {activeModal === 'accessibility' && (
            <div className="space-y-3">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded text-emerald-900">
                <div className="font-bold text-xs mb-1">Accessibility Design Compliance:</div>
                <p>
                  This prototype interface incorporates core Guidelines for Indian Government Websites (GIGW) and WCAG 2.1 AA standards for high-density monitoring applications.
                </p>
              </div>

              <ul className="space-y-2">
                <li className="p-2 bg-slate-50 border border-slate-200 rounded flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong>Typography Scaling Engine (A- / A / A+):</strong> Dynamic viewport rem-scaling adjusting text from 92% to 112% across tables and technical datasheets without layout clipping.
                  </div>
                </li>
                <li className="p-2 bg-slate-50 border border-slate-200 rounded flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong>High-Contrast Color Mode:</strong> High-visibility black &amp; yellow palette with 14:1 contrast ratio for night-shift operators and visually impaired technicians.
                  </div>
                </li>
                <li className="p-2 bg-slate-50 border border-slate-200 rounded flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong>Bilingual Interface (English / हिन्दी):</strong> Full localized departmental terminology supporting regional RMC duty officers.
                  </div>
                </li>
                <li className="p-2 bg-slate-50 border border-slate-200 rounded flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong>Keyboard Navigation:</strong> Explicit focus rings and ARIA live regions for high-priority telemetry stream alerts.
                  </div>
                </li>
              </ul>
            </div>
          )}

          {/* 4. Data Provenance & Simulation Framework */}
          {activeModal === 'provenance' && (
            <div className="space-y-3">
              <div className="p-3 bg-purple-50 border border-purple-200 rounded text-purple-900">
                <div className="font-bold text-xs mb-1">Data Provenance &amp; Simulation Disclosure:</div>
                <p>
                  To ensure ethical transparency during hackathon evaluation, all telemetry presented on this site is generated by a calibrated meteorological simulation engine rather than live government telemetry downlinks.
                </p>
              </div>

              <div className="space-y-2">
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded">
                  <strong className="text-slate-900">Station Geographic Metadata:</strong>
                  <p className="text-slate-600 text-[11px] mt-0.5">
                    Coordinates, elevations, and WMO block IDs (e.g. 42182 for Safdarjung) reference public WMO meteorological registry records to model realistic Indian climatic zones (Northern Plains, Coastal, Western Ghats, Deccan Plateau).
                  </p>
                </div>
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded">
                  <strong className="text-slate-900">Atmospheric Physics Modeling:</strong>
                  <p className="text-slate-600 text-[11px] mt-0.5">
                    Telemetry values are computed from diurnal solar elevation sinusoidal curves, microbarometric semi-diurnal tides, and relative humidity inverse cycles with gaussian stochastic noise.
                  </p>
                </div>
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded">
                  <strong className="text-slate-900">Hosting &amp; Deployment:</strong>
                  <p className="text-slate-600 text-[11px] mt-0.5">
                    Hosted on Vercel Serverless Edge Cloud for the SIH26073 evaluation showcase. Not hosted on or affiliated with National Informatics Centre (NIC) infrastructure.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-100 border-t border-slate-200 px-5 py-2.5 flex items-center justify-between text-[11px] text-slate-500">
          <span>SIH26073 Evaluation Documentation</span>
          <button
            onClick={onClose}
            className="px-3 py-1 bg-[#002147] hover:bg-[#0B3B60] text-white rounded font-bold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
