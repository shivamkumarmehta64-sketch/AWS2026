'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Smartphone,
  Copy,
  Check,
  ExternalLink,
  QrCode,
  ShieldCheck,
  Wifi,
  Sparkles,
  Sliders,
  Send
} from 'lucide-react';
import QRCode from 'qrcode';

interface GovMobileQRModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: 'hi' | 'en';
}

export const GovMobileQRModal: React.FC<GovMobileQRModalProps> = ({
  isOpen,
  onClose,
  language,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [mobileUrl, setMobileUrl] = useState<string>('');
  const [customHost, setCustomHost] = useState<string>('');
  const [isCopied, setIsCopied] = useState<boolean>(false);

  const generateQRCode = async (url: string) => {
    try {
      const dataUrl = await QRCode.toDataURL(url, {
        width: 320,
        margin: 2,
        color: { dark: '#002147', light: '#FFFFFF' },
      });
      setQrDataUrl(dataUrl);
    } catch {
      // QR generation fallback
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const origin = window.location.origin;
      const defaultUrl = `${origin}/mobile`;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMobileUrl(defaultUrl);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCustomHost(origin);
      generateQRCode(defaultUrl);
    }
  }, [isOpen]);

  const handleCustomHostChange = (newOrigin: string) => {
    setCustomHost(newOrigin);
    const updated = `${newOrigin.replace(/\/$/, '')}/mobile`;
    setMobileUrl(updated);
    generateQRCode(updated);
  };

  const handleCopy = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(mobileUrl);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white border-2 border-[#002147] rounded-xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-[#002147] text-white px-5 py-3.5 flex items-center justify-between border-b-2 border-amber-400">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-amber-400 text-slate-950 font-black">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold tracking-wide">
                {language === 'hi'
                  ? 'मोबाइल एडब्ल्यूएस ट्रांसमीटर कनेक्ट करें'
                  : 'Connect Smartphone as AWS Edge Node'}
              </h2>
              <p className="text-[11px] text-slate-300">
                {language === 'hi'
                  ? 'किसी भी स्मार्टफोन को वास्तविक मौसम टेलीमेट्री ट्रांसमीटर में बदलें'
                  : 'Turn any smartphone into a live calibrated weather datalogger'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 text-xs text-slate-700">
          {/* QR Code Container */}
          <div className="flex flex-col items-center justify-center bg-[#001122] p-6 rounded-xl border border-slate-700 shadow-inner relative overflow-hidden">
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-sky-400/40 via-slate-900/0 to-slate-900/0" />
            <div className="absolute top-0 left-0 w-full h-0.5 bg-sky-400/50 animate-pulse shadow-[0_0_8px_rgba(56,189,248,0.8)]" style={{ animationDuration: '3s' }} />
            
            {qrDataUrl ? (
              <div className="relative z-10 p-2 bg-white rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.3)] border-2 border-emerald-400 transition-transform hover:scale-105">
                <img
                  src={qrDataUrl}
                  alt="Scan to open Mobile AWS Edge Node"
                  className="w-44 h-44 sm:w-52 sm:h-52 rounded"
                />
              </div>
            ) : (
              <div className="w-48 h-48 flex items-center justify-center bg-slate-800 rounded text-sky-400 font-mono text-[10px] animate-pulse">
                Initializing Edge Node Gateway...
              </div>
            )}

            <p className="text-center text-[11px] font-bold text-sky-300 mt-4 flex items-center gap-1.5 bg-sky-950/50 px-3 py-1.5 rounded-full border border-sky-800/50 z-10 backdrop-blur-sm">
              <QrCode className="w-3.5 h-3.5" />
              <span>
                {language === 'hi'
                  ? 'फ़ोन कैमरे से स्कैन करें और तुरंत कनेक्ट करें (शून्य इंस्टॉल)'
                  : 'Scan with camera to deploy zero-install edge node'}
              </span>
            </p>
          </div>

          {/* Quick Jury Demo Instructions */}
          <div className="bg-sky-50 border border-sky-200 rounded-lg p-3 space-y-1.5">
            <div className="font-bold text-[#002147] flex items-center gap-1.5 text-xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>{language === 'hi' ? 'SIH जूरी प्रस्तुति युक्ति' : 'SIH Jury Live Demonstration Playbook'}</span>
            </div>
            <ul className="list-disc list-inside text-[11px] text-slate-600 space-y-1">
              <li>
                <strong>Step 1:</strong> Have a team member or judge scan this QR code with their phone.
              </li>
              <li>
                <strong>Step 2:</strong> The phone reads its real GPS coordinates and pulls live Open-Meteo weather.
              </li>
              <li>
                <strong>Step 3:</strong> Have the judge tap <strong>&quot;Inject PT100 Spike&quot;</strong> or <strong>&quot;Convective Squall&quot;</strong> on their phone — watch the main dashboard react instantly!
              </li>
            </ul>
          </div>

          {/* Direct Link & Custom IP (For local Wi-Fi hackathon setups) */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-slate-600">
              {language === 'hi' ? 'मोबाइल नोड यूआरएल (लोकल नेटवर्क या डोमेन):' : 'Mobile Node URL / IP Address:'}
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={customHost}
                onChange={(e) => handleCustomHostChange(e.target.value)}
                placeholder="http://192.168.1.100:3000"
                className="flex-1 bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 font-mono text-[11px] text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#002147]"
              />
              <button
                onClick={handleCopy}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded font-semibold flex items-center gap-1 text-xs transition-colors cursor-pointer"
                title="Copy URL"
              >
                {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{isCopied ? 'Copied' : 'Copy'}</span>
              </button>
              <a
                href={mobileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 bg-[#002147] hover:bg-slate-800 text-white rounded font-semibold flex items-center gap-1 text-xs transition-colors cursor-pointer"
                title="Open in new tab to test"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Test</span>
              </a>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-100 border-t border-slate-200 px-5 py-2.5 flex items-center justify-between text-[11px] text-slate-600">
          <span>W3C Sensor API &amp; Geolocation Compliant</span>
          <button
            onClick={onClose}
            className="bg-[#002147] hover:bg-slate-800 text-white px-4 py-1 rounded font-bold transition-colors"
          >
            {language === 'hi' ? 'पूर्ण' : 'Done'}
          </button>
        </div>
      </div>
    </div>
  );
};
