import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'NAWS-QMS v4.2.8 | National Automatic Weather Station Quality Management System | MoES & IMD',
  description:
    'Official Real-Time Quality Control, Anomaly Discrimination and Surveillance Portal for Automatic Weather Stations (AWS). Developed under the aegis of the Ministry of Earth Sciences (MoES) and India Meteorological Department (IMD) by National Informatics Centre (NIC).',
  keywords: [
    'MoES',
    'IMD',
    'NAWS-QMS',
    'Automatic Weather Station',
    'National Informatics Centre',
    'NIC',
    'WMO Pub No. 8',
    'Meteorological Quality Control',
    'SIH26073',
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
