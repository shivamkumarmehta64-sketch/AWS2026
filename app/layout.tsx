import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'National Automatic Weather Station Network | Live Quality & Sensor Monitor',
  description:
    'National Automatic Weather Station Quality Management System (NAWS-QMS) — Real-time automated weather monitoring, sensor health verification, and AI-powered fault detection across India.',
  keywords: [
    'Automatic Weather Station', 'IMD Weather', 'Weather Telemetry', 'Sensor Health Check',
    'Weather Forecast Quality Control', 'India Weather Network', 'Real-Time Weather India',
  ],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col bg-[#F8FAFC] text-slate-900">
        {children}
      </body>
    </html>
  );
}
