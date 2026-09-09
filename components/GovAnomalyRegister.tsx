'use client';

import React from 'react';
import { WorkOrderTicket } from '@/lib/anomalyLogic';
import { 
  ClipboardList, 
  Download, 
  AlertTriangle, 
  CheckCircle2, 
  Wrench, 
  CloudLightning,
  Sparkles,
  FileSpreadsheet
} from 'lucide-react';

interface GovAnomalyRegisterProps {
  workOrders: WorkOrderTicket[];
  language: 'hi' | 'en';
}

export const GovAnomalyRegister: React.FC<GovAnomalyRegisterProps> = ({
  workOrders,
  language,
}) => {
  const handleExportCSV = () => {
    const timestamp = new Date().toISOString();
    let csv = `========================================================================================\n`;
    csv += `GOVERNMENT OF INDIA | MINISTRY OF EARTH SCIENCES (MoES)\n`;
    csv += `INDIA METEOROLOGICAL DEPARTMENT (IMD) - QUALITY MANAGEMENT DIVISION\n`;
    csv += `NATIONAL AUTOMATIC WEATHER STATION NETWORK (NAWS-QMS v4.2.8)\n`;
    csv += `OFFICIAL AUDIT REPORT & ANOMALY WORK-ORDER REGISTER\n`;
    csv += `EXTRACTED AT: ${timestamp} IST | CLASSIFICATION: OFFICIAL USE ONLY\n`;
    csv += `========================================================================================\n\n`;
    csv += `Ticket ID,Station Code,Observatory Name,State,Timestamp (IST),Parameter Involved,Classification,Alert Level,Fault Probability,XAI Contribution Breakdown,Observed vs Imputed,Action Taken,Work-Order Status\n`;

    workOrders.forEach((wo) => {
      csv += `"${wo.ticketId}","${wo.stationId}","${wo.stationName}","${wo.state}","${wo.timestamp}","${wo.parameterInvolved}","${wo.classification}","${wo.alertLevel}","${(wo.faultProbability * 100).toFixed(1)}%","${wo.xaiBreakdown}","${wo.observedVsImputed}","${wo.operationalAction.replace(/"/g, '""')}","${wo.status}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `IMD_AWS_QMS_Audit_Report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white border border-slate-300 rounded shadow-xs p-4 space-y-3">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-[#002147] text-white rounded">
            <ClipboardList className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wide text-[#002147]">
              {language === 'hi'
                ? 'डायग्नोस्टिक वर्क-ऑर्डर एवं विसंगति रजिस्टर'
                : 'Diagnostic Work-Order & Anomaly Register (SIH26073)'}
            </h2>
            <p className="text-xs text-slate-500">
              {language === 'hi'
                ? 'डब्ल्यूएमओ गुणवत्ता नियंत्रण, विसंगति वर्गीकरण और फील्ड रखरखाव लॉग'
                : 'WMO Pub No. 8 Quality Audit, Root-Cause Classification & Field Maintenance Orders'}
            </p>
          </div>
        </div>

        {/* Download Official Audit Report Button */}
        <button
          onClick={handleExportCSV}
          disabled={workOrders.length === 0}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#002147] hover:bg-[#0B3B60] text-white text-xs font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-xs"
        >
          <FileSpreadsheet className="w-3.5 h-3.5" />
          <span>{language === 'hi' ? 'आधिकारिक ऑडिट रिपोर्ट डाउनलोड करें (.csv)' : 'Download Official Audit Report (CSV)'}</span>
        </button>
      </div>

      {/* Formal Government Work-Order Table */}
      <div className="overflow-x-auto border border-slate-300 rounded">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-[#002147] text-white font-semibold text-[11px]">
              <th className="py-2 px-2.5 border-r border-slate-600">Incident Ticket ID</th>
              <th className="py-2 px-2.5 border-r border-slate-600">Station / State</th>
              <th className="py-2 px-2.5 border-r border-slate-600">Parameter</th>
              <th className="py-2 px-2.5 border-r border-slate-600">Root-Cause Classification</th>
              <th className="py-2 px-2.5 border-r border-slate-600 text-right">Fault Probability</th>
              <th className="py-2 px-2.5 border-r border-slate-600">XAI Contribution Breakdown</th>
              <th className="py-2 px-2.5 border-r border-slate-600">Observed vs Imputed</th>
              <th className="py-2 px-2.5">Operational Action Taken</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 font-mono text-[11px]">
            {workOrders.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-500 font-sans">
                  <div className="flex flex-col items-center justify-center gap-1">
                    <CheckCircle2 className="w-6 h-6 text-emerald-600 mb-1" />
                    <span className="font-semibold text-slate-700">No Active Discontinuities or Hardware Faults</span>
                    <span className="text-xs text-slate-500">All 20 AWS nodes operating within nominal WMO quality tolerances.</span>
                  </div>
                </td>
              </tr>
            ) : (
              workOrders.map((wo, idx) => (
                <tr
                  key={wo.ticketId}
                  className={idx % 2 === 0 ? 'bg-white hover:bg-slate-50' : 'bg-[#F8FAFC] hover:bg-slate-50'}
                >
                  <td className="py-1.5 px-2.5 font-bold text-[#002147] border-r border-slate-200 whitespace-nowrap">
                    {wo.ticketId}
                    <div className="text-[10px] text-slate-500 font-normal">{wo.timestamp}</div>
                  </td>
                  <td className="py-1.5 px-2.5 border-r border-slate-200 whitespace-nowrap font-sans">
                    <div className="font-bold text-slate-800">{wo.stationId}</div>
                    <div className="text-[10px] text-slate-500">{wo.state}</div>
                  </td>
                  <td className="py-1.5 px-2.5 border-r border-slate-200 font-sans font-medium text-slate-800">
                    {wo.parameterInvolved}
                  </td>
                  <td className="py-1.5 px-2.5 border-r border-slate-200 font-sans">
                    {wo.classification === 'GENUINE_CONVECTIVE_EVENT' && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                        <CloudLightning className="w-3 h-3 text-amber-700" />
                        Valid Convective Storm
                      </span>
                    )}
                    {wo.classification === 'SENSOR_SPIKE' && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-900 border border-red-300">
                        <AlertTriangle className="w-3 h-3 text-red-700" />
                        Thermistor Open-Circuit
                      </span>
                    )}
                    {wo.classification === 'FROZEN_VALUE' && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-900 border border-rose-300">
                        <Wrench className="w-3 h-3 text-rose-700" />
                        ADC Freeze / Disconnect
                      </span>
                    )}
                    {wo.classification === 'CALIBRATION_DRIFT' && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-yellow-100 text-yellow-900 border border-yellow-300">
                        Barometer Drift (-0.4 hPa)
                      </span>
                    )}
                    {wo.classification === 'TELEMETRY_PACKET_LOSS' && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-900 border border-purple-300">
                        DCP Telemetry Drop
                      </span>
                    )}
                  </td>
                  <td className="py-1.5 px-2.5 border-r border-slate-200 text-right font-bold text-slate-800">
                    {(wo.faultProbability * 100).toFixed(1)}%
                  </td>
                  <td className="py-1.5 px-2.5 border-r border-slate-200 text-[10px] text-slate-700 font-mono">
                    {wo.xaiBreakdown}
                  </td>
                  <td className="py-1.5 px-2.5 border-r border-slate-200 text-[10px] font-mono text-slate-800 whitespace-nowrap">
                    {wo.observedVsImputed}
                  </td>
                  <td className="py-1.5 px-2.5 font-sans text-xs text-slate-700">
                    {wo.operationalAction}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
