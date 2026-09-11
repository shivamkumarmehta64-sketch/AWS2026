import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';
import Script from 'next/script';
import './globals.css';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-sans',
  display: 'swap',
  preload: true,
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-mono',
  display: 'swap',
  preload: true,
});

export const metadata: Metadata = {
  title: 'Project JATAYU | National Automated Weather Station QMS (JATAYU-QMS)',
  description:
    'Project JATAYU (Joint Atmospheric Telemetry & Anomaly Unification) — National Automated Weather Station Quality Management System (JATAYU-QMS) under Ministry of Earth Sciences (MoES) & IMD for SIH26073.',
  keywords: [
    'Project JATAYU', 'JATAYU-QMS', 'Automatic Weather Station', 'IMD Weather', 'Weather Telemetry', 
    'Sensor Health Check', 'SIH26073', 'Ministry of Earth Sciences', 'WMO Pub 8', 'India Weather Network',
  ],
  manifest: '/manifest.json',
  icons: {
    icon: '/jatayu-seal.jpg',
    apple: '/jatayu-seal.jpg',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${plusJakartaSans.variable} ${jetbrainsMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#F8FAFC] text-slate-900 font-sans selection:bg-amber-100 selection:text-amber-950">
        {children}
        {process.env.NODE_ENV === 'production' && (
          <Script
            id="register-sw"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                if ('serviceWorker' in navigator) {
                  window.addEventListener('load', function() {
                    navigator.serviceWorker.register('/sw.js').then(
                      function(registration) {
                        console.log('ServiceWorker registration successful with scope: ', registration.scope);
                      },
                      function(err) {
                        console.error('ServiceWorker registration failed: ', err);
                      }
                    );
                  });
                }
              `,
            }}
          />
        )}
      </body>
    </html>
  );
}

