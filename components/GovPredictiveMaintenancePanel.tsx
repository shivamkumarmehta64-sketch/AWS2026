'use client';

import React, { useMemo } from 'react';
import { TelemetryPacket, calculatePredictiveSensorHealth, SensorHealthScorecard } from '@/lib/anomalyLogic';
import { Wrench, Clock, Activity, Cpu } from 'lucide-react';

interface Props {
  packets: TelemetryPacket[];
  stationName: string;
  language: 'hi' | 'en';
}

export const GovPredictiveMaintenancePanel = React.memo<Props>(function GovPredictiveMaintenancePanel({
  packets,
  stationName,
  language,
}) {
  const scorecards = useMemo<SensorHealthScorecard[]>(() => {
    return calculatePredictiveSensorHealth(packets);
  }, [packets]);

  const overallScore = Math.round(
    scorecards.reduce((acc, s) => acc + s.healthPercent, 0) / (scorecards.length || 1)
  );

  return (
    <div className="bg-white border border-slate-300 rounded-xl shadow-xs p-4 space-y-3">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-[#002147] text-white">
            <Cpu className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wide text-[#002147] flex items-center gap-2">
              <span>{language === 'hi' ? 'भविष्यसूचक सेंसर स्वास्थ्य एवं शेषावधि (RUL)' : 'Predictive Sensor Health & Remaining Useful Life (RUL)'}</span>
              <span className="bg-sky-100 text-sky-800 text-[10px] px-2 py-0.2 rounded font-bold border border-sky-300">
                AI Early Warning
              </span>
            </h2>
            <p className="text-[11px] text-slate-500">
              {language === 'hi'
                ? 'सेंसर के खराब होने से पहले ही विसंगति और रीकैलिब्रेशन की भविष्यवाणी'
                : `Proactive sensor degradation modeling & calibration countdowns for ${stationName}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="text-right">
            <div className="text-[10px] uppercase font-bold text-slate-500">Overall Sensor Array Index</div>
            <div className={`text-base font-black font-mono ${overallScore > 80 ? 'text-emerald-700' : overallScore > 50 ? 'text-amber-700' : 'text-red-700'}`}>
              {overallScore}% Health Score
            </div>
          </div>
        </div>
      </div>

      {/* 3 Proactive Sensor Scorecards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {scorecards.map((card) => {
          const isOptimal = card.degradationStatus === 'OPTIMAL';
          const isWarning = card.degradationStatus === 'EARLY_DEGRADATION';
          return (
            <div
              key={card.sensorType}
              className={`p-3 rounded-lg border flex flex-col justify-between space-y-2 transition-all ${
                isOptimal
                  ? 'bg-emerald-50/60 border-emerald-200'
                  : isWarning
                  ? 'bg-amber-50/70 border-amber-300 shadow-xs'
                  : 'bg-red-50/80 border-red-300 shadow-xs'
              }`}
            >
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold text-slate-800 truncate" title={card.displayName}>
                    {card.displayName}
                  </span>
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${
                      isOptimal
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : isWarning
                        ? 'bg-amber-100 text-amber-900 border-amber-300'
                        : 'bg-red-100 text-red-900 border-red-300'
                    }`}
                  >
                    {isOptimal ? 'Optimal' : isWarning ? 'Drift Warning' : 'Critical Action'}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-slate-600">Health Index:</span>
                    <strong className="text-slate-900">{card.healthPercent}%</strong>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        card.healthPercent > 75 ? 'bg-emerald-600' : card.healthPercent > 45 ? 'bg-amber-500' : 'bg-red-600'
                      }`}
                      style={{ width: `${card.healthPercent}%` }}
                    />
                  </div>
                </div>

                {/* RUL Indicator */}
                <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-200/80 text-[10px] font-mono">
                  <div className="bg-white/80 p-1.5 rounded border border-slate-200">
                    <span className="text-slate-500 block text-[9px]">Est. RUL Life:</span>
                    <strong className="text-[#002147] text-xs flex items-center gap-1">
                      <Clock className="w-3 h-3 text-sky-600" />
                      {card.estimatedRulDays > 0 ? `${card.estimatedRulDays} Days` : 'Expired'}
                    </strong>
                  </div>
                  <div className="bg-white/80 p-1.5 rounded border border-slate-200">
                    <span className="text-slate-500 block text-[9px]">Rolling Var (σ²):</span>
                    <strong className="text-slate-800 text-xs flex items-center gap-1">
                      <Activity className="w-3 h-3 text-emerald-600" />
                      {card.rollingVariance}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Action */}
              <div className="text-[10px] text-slate-700 bg-white/60 p-1.5 rounded border border-slate-200/60 leading-tight flex items-start gap-1">
                <Wrench className="w-3 h-3 text-slate-500 shrink-0 mt-0.5" />
                <span>{card.recommendedAction}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});
