'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useInView } from 'framer-motion';
import {
  ArrowRight, Play, Activity, ShieldCheck, Zap, Radio,
  Cpu, Globe, Smartphone, CloudLightning, BarChart3, Lock
} from 'lucide-react';

/* ─── Animated Counter Hook ─── */
function useCounter(target: number, duration = 2000, decimals = 0) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });

  useEffect(() => {
    if (!inView) return;
    const start = performance.now();
    const step = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(parseFloat((eased * target).toFixed(decimals)));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [inView, target, duration, decimals]);

  return { count, ref };
}

/* ─── Animated Background Grid ─── */
function AnimatedGrid() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Dot grid */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: 'radial-gradient(#002147 1.5px, transparent 1.5px)',
          backgroundSize: '28px 28px',
        }}
      />
      {/* Radial glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full opacity-[0.06]"
        style={{
          background: 'radial-gradient(circle, #002147 0%, transparent 70%)',
        }}
      />
      {/* Floating horizontal lines */}
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="absolute h-px bg-gradient-to-r from-transparent via-[#002147]/10 to-transparent"
          style={{
            top: `${18 + i * 16}%`,
            left: '-10%',
            right: '-10%',
            animation: `floatLine ${8 + i * 2}s ease-in-out infinite`,
            animationDelay: `${i * 1.2}s`,
          }}
        />
      ))}
      <style>{`
        @keyframes floatLine {
          0%, 100% { transform: translateX(0); opacity: 0.3; }
          50% { transform: translateX(30px); opacity: 0.8; }
        }
      `}</style>
    </div>
  );
}

/* ─── Capability Card ─── */
function CapCard({ icon, title, desc, delay }: { icon: React.ReactNode; title: string; desc: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay, ease: 'easeOut' }}
      className="bg-white/70 backdrop-blur-sm border border-slate-200/80 rounded-2xl p-5 hover:shadow-lg hover:border-slate-300 transition-all duration-300 group"
    >
      <div className="w-10 h-10 rounded-xl bg-[#002147]/5 flex items-center justify-center mb-3 group-hover:bg-[#002147]/10 transition-colors">
        {icon}
      </div>
      <h3 className="font-bold text-[#002147] text-sm mb-1">{title}</h3>
      <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
    </motion.div>
  );
}

/* ─── Main Landing Page ─── */
export default function LandingPage() {
  const [systemAge, setSystemAge] = useState(0);

  // Simulated system uptime ticker
  useEffect(() => {
    const start = Date.now();
    const interval = setInterval(() => {
      setSystemAge(Math.floor((Date.now() - start) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const stations = useCounter(1350, 2200);
  const qcScore = useCounter(98.5, 2400, 1);
  const latency = useCounter(4.2, 1800, 1);
  const districts = useCounter(766, 2000);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 flex flex-col relative overflow-hidden font-sans">

      {/* ═══ Indian National Tricolor Band ═══ */}
      <div className="absolute top-0 w-full flex h-1.5 z-50">
        <div className="flex-1 bg-[#FF9933]" />
        <div className="flex-1 bg-white" />
        <div className="flex-1 bg-[#138808]" />
      </div>

      <AnimatedGrid />

      {/* ═══ HERO SECTION ═══ */}
      <section className="flex-1 flex flex-col items-center justify-center relative z-10 px-6 pt-12 pb-8">
        <div className="max-w-5xl w-full flex flex-col items-center text-center">

          {/* Live System Status Badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="mb-8"
          >
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-200 shadow-sm">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
              <span className="text-xs font-bold text-emerald-800 tracking-wide uppercase">
                System Operational
              </span>
              <span className="text-[10px] font-mono text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">
                Uptime: {systemAge}s
              </span>
            </div>
          </motion.div>

          {/* Emblems */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.15, ease: 'easeOut' }}
            className="flex items-center justify-center gap-5 mb-8"
          >
            <div className="w-16 h-16 md:w-20 md:h-20 bg-white border border-slate-200 flex items-center justify-center rounded-full shadow-md">
              <Image src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg" alt="Emblem of India" width={48} height={48} className="h-10 md:h-12 w-auto" style={{ width: 'auto', height: '100%' }} unoptimized />
            </div>
            <div className="w-1 h-10 bg-gradient-to-b from-[#FF9933] via-white to-[#138808] rounded-full" />
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden border-[3px] border-amber-400 shadow-lg bg-slate-950 flex items-center justify-center">
              <Image src="/jatayu-seal.jpg" alt="Project JATAYU Emblem" width={80} height={80} className="w-full h-full object-cover" />
            </div>
          </motion.div>

          {/* Hero Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: 'easeOut' }}
            className="mb-6"
          >
            <h1 className="text-5xl md:text-7xl font-extrabold text-[#002147] tracking-tight mb-4 leading-[1.1]">
              PROJECT JATAYU
            </h1>
            <p className="text-lg md:text-xl text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed">
              Joint Atmospheric Telemetry & Anomaly Unification
              <br />
              <span className="text-[#002147] font-semibold">National AWS Quality Management System</span>
            </p>
            <div className="mt-3 inline-flex items-center gap-2 text-xs text-slate-400 font-mono">
              <Lock className="w-3 h-3" />
              <span>SIH26073 • Ministry of Earth Sciences • IMD</span>
            </div>
          </motion.div>

          {/* ═══ LIVE STATS RIBBON ═══ */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5, ease: 'easeOut' }}
            className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 w-full max-w-3xl mb-10"
          >
            {[
              { ref: stations.ref, value: stations.count.toLocaleString(), suffix: '', label: 'AWS Stations Monitored', icon: <Radio className="w-4 h-4 text-sky-500" /> },
              { ref: qcScore.ref, value: qcScore.count, suffix: '%', label: 'Quality Compliance', icon: <ShieldCheck className="w-4 h-4 text-emerald-500" /> },
              { ref: latency.ref, value: latency.count, suffix: 'ms', label: 'Avg QC Latency', icon: <Zap className="w-4 h-4 text-amber-500" /> },
              { ref: districts.ref, value: districts.count.toLocaleString(), suffix: '', label: 'Districts Covered', icon: <Globe className="w-4 h-4 text-purple-500" /> },
            ].map((stat, i) => (
              <div key={i} className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl p-4 text-center shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-center gap-1.5 mb-1.5">
                  {stat.icon}
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{stat.label}</span>
                </div>
                <span ref={stat.ref} className="text-2xl md:text-3xl font-extrabold text-[#002147] font-mono tabular-nums">
                  {stat.value}{stat.suffix}
                </span>
              </div>
            ))}
          </motion.div>

          {/* ═══ CTA BUTTONS ═══ */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7, ease: 'easeOut' }}
            className="grid md:grid-cols-2 gap-4 w-full max-w-2xl mb-16"
          >
            <Link href="/pitch" className="group flex items-center gap-4 p-5 bg-[#002147] hover:bg-[#001a38] rounded-2xl shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-0.5 border border-[#002147]">
              <div className="w-14 h-14 bg-white/10 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-white/15 transition-colors">
                <Play className="w-7 h-7 text-white ml-0.5" />
              </div>
              <div className="text-left flex-1">
                <h2 className="text-lg font-bold text-white mb-0.5">Start Pitch Deck</h2>
                <p className="text-xs text-slate-300">Guided presentation for hackathon judges</p>
              </div>
              <ArrowRight className="w-5 h-5 text-amber-400 group-hover:translate-x-1 transition-transform shrink-0" />
            </Link>

            <Link href="/dashboard" className="group flex items-center gap-4 p-5 bg-white hover:bg-slate-50 rounded-2xl shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-0.5 border-2 border-slate-200 hover:border-slate-300">
              <div className="w-14 h-14 bg-slate-900 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-slate-800 transition-colors">
                <Activity className="w-7 h-7 text-amber-400" />
              </div>
              <div className="text-left flex-1">
                <h2 className="text-lg font-bold text-[#002147] mb-0.5">Technical Console</h2>
                <p className="text-xs text-slate-500">Live GIS map, AI metrics & telemetry</p>
              </div>
              <ArrowRight className="w-5 h-5 text-[#002147] group-hover:translate-x-1 transition-transform shrink-0" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ═══ CAPABILITIES SECTION ═══ */}
      <section className="relative z-10 px-6 pb-16">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-8"
          >
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">Core Capabilities</h2>
            <p className="text-2xl md:text-3xl font-extrabold text-[#002147]">What Makes JATAYU Different</p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <CapCard
              icon={<CloudLightning className="w-5 h-5 text-amber-600" />}
              title="Storm vs Fault"
              desc="Discriminates genuine severe weather from broken sensors in <5ms"
              delay={0}
            />
            <CapCard
              icon={<Cpu className="w-5 h-5 text-sky-600" />}
              title="Zahumenský XAI"
              desc="Explainable AI with SHAP attribution for every quality decision"
              delay={0.08}
            />
            <CapCard
              icon={<Globe className="w-5 h-5 text-emerald-600" />}
              title="Spatial Cross-Val"
              desc="Cross-validates against neighboring stations using Haversine geometry"
              delay={0.16}
            />
            <CapCard
              icon={<Smartphone className="w-5 h-5 text-purple-600" />}
              title="Mobile Sensors"
              desc="Turn any smartphone into a calibrated mobile weather node"
              delay={0.24}
            />
            <CapCard
              icon={<BarChart3 className="w-5 h-5 text-rose-600" />}
              title="Predictive RUL"
              desc="Models thermal decay to predict sensor failure before it happens"
              delay={0.32}
            />
            <CapCard
              icon={<Lock className="w-5 h-5 text-slate-600" />}
              title="Crypto Seals"
              desc="HMAC-SHA256 tamper detection with Merkle audit trails"
              delay={0.40}
            />
          </div>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="relative z-10 border-t border-slate-200 bg-white/50 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-2 text-[11px] text-slate-400">
          <span>© 2026 Project JATAYU • Smart India Hackathon 2026 • Problem Statement SIH26073</span>
          <span className="font-mono">WMO Pub No. 8 Compliant • ITU-T X.1303 CAP Integration • GIGW 3.0 Standards</span>
        </div>
      </footer>
    </div>
  );
}
