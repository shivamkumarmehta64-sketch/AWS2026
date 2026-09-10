'use client';

import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';

/**
 * -------------------------------------------------------------------
 * 1. VENGEANCE DISPLACEMENT CARD
 * Interactive 3D tilt card with cursor perspective displacement
 * -------------------------------------------------------------------
 */
interface VengeanceDisplacementCardProps {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number;
  glowColor?: string;
}

export const VengeanceDisplacementCard: React.FC<VengeanceDisplacementCardProps> = ({
  children,
  className = '',
  maxTilt = 12,
  glowColor = 'rgba(14, 165, 233, 0.25)',
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [glowPos, setGlowPos] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const rX = ((mouseY - height / 2) / (height / 2)) * -maxTilt;
    const rY = ((mouseX - width / 2) / (width / 2)) * maxTilt;

    setRotateX(rX);
    setRotateY(rY);
    setGlowPos({ x: (mouseX / width) * 100, y: (mouseY / height) * 100 });
  };

  const handleMouseEnter = () => setIsHovered(true);

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotateX(0);
    setRotateY(0);
    setGlowPos({ x: 50, y: 50 });
  };

  return (
    <div style={{ perspective: '1000px' }} className="w-full">
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        animate={{
          rotateX: isHovered ? rotateX : 0,
          rotateY: isHovered ? rotateY : 0,
          scale: isHovered ? 1.02 : 1,
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className={`relative overflow-hidden rounded-2xl border border-slate-200/90 bg-gradient-to-br from-white/95 to-slate-50/95 dark:from-slate-900/95 dark:to-slate-950/95 shadow-lg transition-shadow duration-300 hover:shadow-2xl ${className}`}
        style={{
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Dynamic Cursor Gradient Fill */}
        <div
          className="pointer-events-none absolute -inset-px transition-opacity duration-300"
          style={{
            opacity: isHovered ? 1 : 0,
            background: `radial-gradient(500px circle at ${glowPos.x}% ${glowPos.y}%, ${glowColor}, transparent 50%)`,
          }}
        />

        {/* Gloss Reflection Layer */}
        <div
          className="pointer-events-none absolute inset-0 opacity-20 bg-gradient-to-tr from-transparent via-white to-transparent transform -translate-x-full transition-transform duration-1000 group-hover:translate-x-full"
          style={{
            transform: isHovered ? `translate3d(${(glowPos.x - 50) * 0.4}px, ${(glowPos.y - 50) * 0.4}px, 20px)` : 'none',
          }}
        />

        <div className="relative z-10" style={{ transform: 'translateZ(30px)' }}>
          {children}
        </div>
      </motion.div>
    </div>
  );
};

/**
 * -------------------------------------------------------------------
 * 2. VENGEANCE GLOW BADGE
 * Neon glowing quality indicator badge with multi-layer ring pulses
 * -------------------------------------------------------------------
 */
interface VengeanceGlowBadgeProps {
  label: string;
  level?: 1 | 2 | 3 | 4 | 5;
  variant?: 'emerald' | 'amber' | 'red' | 'blue' | 'purple';
  className?: string;
}

export const VengeanceGlowBadge: React.FC<VengeanceGlowBadgeProps> = ({
  label,
  variant = 'emerald',
  className = '',
}) => {
  const styles = {
    emerald: {
      bg: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30',
      dot: 'bg-emerald-500',
      glow: 'shadow-emerald-500/50',
    },
    amber: {
      bg: 'bg-amber-500/10 text-amber-600 border-amber-500/30',
      dot: 'bg-amber-500',
      glow: 'shadow-amber-500/50',
    },
    red: {
      bg: 'bg-rose-500/10 text-rose-600 border-rose-500/30',
      dot: 'bg-rose-500',
      glow: 'shadow-rose-500/50',
    },
    blue: {
      bg: 'bg-sky-500/10 text-sky-600 border-sky-500/30',
      dot: 'bg-sky-500',
      glow: 'shadow-sky-500/50',
    },
    purple: {
      bg: 'bg-purple-500/10 text-purple-600 border-purple-500/30',
      dot: 'bg-purple-500',
      glow: 'shadow-purple-500/50',
    },
  }[variant];

  return (
    <span
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-bold backdrop-blur-md shadow-sm transition-all duration-300 ${styles.bg} ${styles.glow} ${className}`}
    >
      <span className="relative flex h-2 w-2">
        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${styles.dot}`} />
        <span className={`relative inline-flex rounded-full h-2 w-2 ${styles.dot}`} />
      </span>
      {label}
    </span>
  );
};

/**
 * -------------------------------------------------------------------
 * 3. VENGEANCE INTERACTIVE GRID
 * Reactive grid background with ambient lighting cursor trail
 * -------------------------------------------------------------------
 */
export const VengeanceInteractiveGrid: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0284c715_1px,transparent_1px),linear-gradient(to_bottom,#0284c715_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
    </div>
  );
};

/**
 * -------------------------------------------------------------------
 * 4. VENGEANCE RADAR PULSE
 * Concentric expanding radar rings for active meteorological sensing
 * -------------------------------------------------------------------
 */
export const VengeanceRadarPulse: React.FC<{ size?: number; className?: string }> = ({
  size = 48,
  className = '',
}) => {
  return (
    <div className={`relative flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <motion.div
        animate={{ scale: [1, 2.2], opacity: [0.6, 0] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: 'easeOut' }}
        className="absolute inset-0 rounded-full border border-sky-400/80 bg-sky-400/20"
      />
      <motion.div
        animate={{ scale: [1, 1.6], opacity: [0.8, 0] }}
        transition={{ duration: 2.2, delay: 0.7, repeat: Infinity, ease: 'easeOut' }}
        className="absolute inset-0 rounded-full border border-sky-500/80"
      />
      <div className="w-3 h-3 rounded-full bg-sky-500 shadow-lg shadow-sky-500/80 z-10" />
    </div>
  );
};
