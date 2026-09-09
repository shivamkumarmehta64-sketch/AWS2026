import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'NAWS-QMS | Smart AWS Telemetry & Anomaly Detection (SIH26073 Prototype)',
  description:
    'National Automatic Weather Station Quality Management System (NAWS-QMS) — An innovation prototype developed for Smart India Hackathon (SIH26073). Demonstrates automated sensor fault discrimination, WMO Pub No. 8 validation, and Explainable AI root-cause isolation.',
  keywords: [
    'Smart India Hackathon', 'SIH26073', 'Automatic Weather Station', 'AWS Telemetry',
    'WMO Pub No. 8', 'Sensor Anomaly Detection', 'Explainable AI', 'XAI', 'Meteorological Quality Control',
  ],
};

// Inline security script replaces the 131-line SecurityGuardian component
const SECURITY_SCRIPT = `
(function(){
  try{console.clear();console.log('%c🔒 NAWS-QMS SECURITY POLICY ACTIVE','color:#fff;background:#002147;font-size:16px;font-weight:bold;padding:6px 12px;border-radius:4px');console.log('%c⚠️ WARNING: DevTools inspection is monitored.','color:#dc2626;font-size:12px;font-weight:600')}catch(e){}
  document.addEventListener('keydown',function(e){
    if(e.key==='F12'||(e.ctrlKey&&e.shiftKey&&/^[IJCijc]$/.test(e.key))||(e.ctrlKey&&/^[USus]$/.test(e.key))){e.preventDefault();e.stopPropagation()}
  },true);
  document.addEventListener('contextmenu',function(e){e.preventDefault()},true);
})();`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-[#F1F5F9] text-slate-900">
        <script dangerouslySetInnerHTML={{ __html: SECURITY_SCRIPT }} />
        {children}
      </body>
    </html>
  );
}
