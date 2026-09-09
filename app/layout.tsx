import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'NAWS-QMS | Smart AWS Telemetry & Anomaly Detection (SIH26073 Prototype)',
  description:
    'National Automatic Weather Station Quality Management System (NAWS-QMS) — An innovation prototype developed for Smart India Hackathon (SIH26073). Demonstrates automated sensor fault discrimination, WMO Pub No. 8 validation, and Explainable AI root-cause isolation using simulated telemetry.',
  keywords: [
    'Smart India Hackathon',
    'SIH26073',
    'Automatic Weather Station',
    'AWS Telemetry',
    'WMO Pub No. 8',
    'Sensor Anomaly Detection',
    'Explainable AI',
    'XAI',
    'Meteorological Quality Control',
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-[#F1F5F9] text-slate-900">{children}</body>
    </html>
  );
}
