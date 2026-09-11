'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  X,
  Smartphone,
  Copy,
  Check,
  ExternalLink,
  QrCode,
  Sparkles
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
  const [detectedLanIp, setDetectedLanIp] = useState<string | null>(null);
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
    if (!isOpen) return;
    if (typeof window === 'undefined') return;

    let isMounted = true;

    const setupUrl = async () => {
      const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      let targetUrl = `${window.location.origin}/mobile`;

      if (isLocalhost) {
        try {
          const res = await fetch('/api/network-ip');
          const data = await res.json();
          if (data?.lanIp && data.lanIp !== '127.0.0.1') {
            if (isMounted) setDetectedLanIp(data.lanIp);
            targetUrl = `http://${data.lanIp}:3000/mobile`;
          }
        } catch {
          // fallback to default targetUrl
        }
      }

      if (isMounted) {
        setMobileUrl(targetUrl);
        await generateQRCode(targetUrl);
      }
    };

    setupUrl();

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

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
        <div className="p-5 space-y-4 text-xs text-slate-700 max-h-[85vh] overflow-y-auto">
          {/* Unique Direct Sensor Link (No QR Scanning Required) */}
          <div className="bg-emerald-50 border-2 border-emerald-400 rounded-xl p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-bold text-emerald-900 text-xs">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>DIRECT UNIQUE SENSOR LINK (NO QR SCANNER REQUIRED)</span>
              </div>
              <span className="bg-emerald-600 text-white text-[9px] font-bold px-2 py-0.5 rounded">
                1-CLICK CONNECT
              </span>
            </div>
            <p className="text-[11px] text-emerald-950 leading-relaxed">
              If your phone cannot scan the QR code, simply copy this unique link or open it directly on your mobile browser (Chrome/Safari):
            </p>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-white border border-emerald-300 rounded px-2.5 py-1.5 font-mono text-[11px] text-emerald-950 select-all truncate">
                {mobileUrl}
              </div>
              <button
                onClick={handleCopy}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold flex items-center gap-1 text-xs transition-colors shrink-0"
              >
                {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{isCopied ? 'Copied!' : 'Copy Link'}</span>
              </button>
              <a
                href={mobileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 bg-[#002147] hover:bg-[#003366] text-white rounded font-bold flex items-center gap-1 text-xs transition-colors shrink-0"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open in Tab</span>
              </a>
            </div>
          </div>

          {/* QR Code Container */}
          <div className="flex flex-col items-center justify-center bg-[#001122] p-6 rounded-xl border border-slate-700 shadow-inner relative overflow-hidden">
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-sky-400/40 via-slate-900/0 to-slate-900/0" />
            <div className="absolute top-0 left-0 w-full h-0.5 bg-sky-400/50 animate-pulse shadow-[0_0_8px_rgba(56,189,248,0.8)]" style={{ animationDuration: '3s' }} />
            
            {qrDataUrl ? (
              <div className="relative z-10 p-2 bg-white rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.3)] border-2 border-emerald-400 transition-transform hover:scale-105">
                <Image
                  src={qrDataUrl}
                  alt="Scan to open Mobile AWS Edge Node"
                  width={208}
                  height={208}
                  unoptimized
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
                  ? 'फ़ोन कैमरे से स्कैन करें और तुरंत कनेक्ट करें (वैकल्पिक)'
                  : 'Or scan with camera to deploy zero-install edge node'}
              </span>
            </p>
          </div>


          {/* Quick Jury Demo Instructions */}
          <div className="bg-sky-50 border border-sky-200 rounded-lg p-3 space-y-1.5">
            <div className="font-bold text-[#002147] flex items-center gap-1.5 text-xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>{language === 'hi' ? 'मोबाइल कनेक्शन एवं जूरी डेमो गाइड' : 'How Phones Connect (Why Localhost Fails on Mobile)'}</span>
            </div>
            <p className="text-[11px] text-slate-700 leading-relaxed">
              <strong>Important:</strong> A phone cannot open <code className="bg-slate-200 px-1 py-0.2 rounded font-mono text-red-700">localhost:3000</code> because on a phone, &ldquo;localhost&rdquo; points to the phone itself, not your laptop!
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px] text-slate-700 pt-1">
              <div className="bg-white p-2 rounded border border-slate-200 space-y-0.5">
                <strong className="text-emerald-800 block flex items-center gap-1">
                  <span>📶 Method 1: Same Wi-Fi (Auto-Detected)</span>
                </strong>
                <span>Connect your phone to the same Wi-Fi as this computer and scan this QR code. It points directly to your computer&apos;s LAN IP {detectedLanIp ? `(${detectedLanIp})` : ''}.</span>
              </div>
              <div className="bg-white p-2 rounded border border-slate-200 space-y-0.5">
                <strong className="text-sky-800 block flex items-center gap-1">
                  <span>☁️ Method 2: Cellular Data (4G/5G)</span>
                </strong>
                <span>Deploy live on Vercel or run <code className="bg-slate-100 px-1 rounded font-mono">npx cloudflared tunnel --url http://localhost:3000</code> in terminal to get a public HTTPS link!</span>
              </div>
            </div>
          </div>

          {/* Direct Link & Custom IP / Untun Tunnel */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-semibold text-slate-700">
                {language === 'hi' ? 'वर्तमान मोबाइल नोड यूआरएल:' : 'Active Mobile Node QR Target URL:'}
              </label>
              <span className="text-[10px] text-emerald-700 font-bold font-mono">
                {detectedLanIp ? `✓ Auto-LAN (${detectedLanIp})` : 'Public Origin'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={mobileUrl}
                onChange={(e) => {
                  setMobileUrl(e.target.value);
                  generateQRCode(e.target.value);
                }}
                placeholder="http://192.168.1.100:3000/mobile or https://xxx.trycloudflare.com/mobile"
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

            {/* Quick Cloudflare / Vercel command badge */}
            <div className="p-2 rounded bg-slate-100 border border-slate-200 text-[10px] text-slate-600 flex items-center justify-between gap-2">
              <span className="truncate">
                💡 <strong>Instant Free Cloud Tunnel:</strong> Run <code className="bg-slate-200 px-1 py-0.5 rounded font-mono font-bold text-[#002147]">npx -y cloudflared tunnel --url http://localhost:3000</code> for a public URL!
              </span>
              <button
                type="button"
                onClick={() => {
                  if (typeof navigator !== 'undefined' && navigator.clipboard) {
                    navigator.clipboard.writeText('npx -y cloudflared tunnel --url http://localhost:3000');
                  }
                }}
                className="px-2 py-0.5 bg-white border border-slate-300 rounded text-[9px] font-bold text-slate-700 hover:bg-slate-50 shrink-0 cursor-pointer"
                title="Copy Cloudflared command"
              >
                Copy CMD
              </button>
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
