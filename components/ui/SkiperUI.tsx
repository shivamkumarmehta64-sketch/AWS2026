'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, useSpring, AnimatePresence } from 'framer-motion';

/**
 * -------------------------------------------------------------------
 * 1. SKIPER SPOTLIGHT CARD
 * Mouse-tracking radial spotlight card with dynamic border glow
 * -------------------------------------------------------------------
 */
interface SkiperSpotlightCardProps {
  children: React.ReactNode;
  className?: string;
  spotlightColor?: string;
  borderColor?: string;
}

export const SkiperSpotlightCard: React.FC<SkiperSpotlightCardProps> = ({
  children,
  className = '',
  spotlightColor = 'rgba(56, 189, 248, 0.15)',
  borderColor = 'rgba(56, 189, 248, 0.3)',
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleMouseEnter = () => setOpacity(1);
  const handleMouseLeave = () => setOpacity(0);

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white/90 dark:bg-slate-900/90 dark:border-slate-800 backdrop-blur-md transition-all duration-300 shadow-sm hover:shadow-xl ${className}`}
    >
      {/* Background Spotlight */}
      <div
        className="pointer-events-none absolute -inset-px transition-opacity duration-300"
        style={{
          opacity,
          background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, ${spotlightColor}, transparent 40%)`,
        }}
      />
      {/* Border Spotlight */}
      <div
        className="pointer-events-none absolute -inset-px rounded-2xl transition-opacity duration-300 z-10"
        style={{
          opacity,
          background: `radial-gradient(400px circle at ${position.x}px ${position.y}px, ${borderColor}, transparent 40%)`,
          maskImage: 'linear-gradient(black, black) content-box, linear-gradient(black, black)',
          WebkitMaskImage: 'linear-gradient(black, black) content-box, linear-gradient(black, black)',
          maskComposite: 'exclude',
          WebkitMaskComposite: 'xor',
          padding: '1.5px',
        }}
      />
      <div className="relative z-20">{children}</div>
    </div>
  );
};

/**
 * -------------------------------------------------------------------
 * 2. SKIPER DYNAMIC DOCK
 * Floating iOS-style dynamic island action dock with spring physics
 * -------------------------------------------------------------------
 */
export interface SkiperDockItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  badge?: string | number;
  active?: boolean;
}

interface SkiperDynamicDockProps {
  items: SkiperDockItem[];
  className?: string;
}

export const SkiperDynamicDock: React.FC<SkiperDynamicDockProps> = ({ items, className = '' }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 ${className}`}>
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-slate-900/90 border border-slate-700/80 backdrop-blur-xl shadow-2xl text-white"
      >
        {items.map((item, index) => {
          const isHovered = hoveredIndex === index;
          const isNeighbor = hoveredIndex !== null && Math.abs(hoveredIndex - index) === 1;

          let scale = 1;
          if (isHovered) scale = 1.3;
          else if (isNeighbor) scale = 1.12;

          return (
            <div
              key={item.id}
              className="relative group flex items-center justify-center"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {/* Tooltip */}
              <AnimatePresence>
                {isHovered && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.8 }}
                    animate={{ opacity: 1, y: -45, scale: 1 }}
                    exit={{ opacity: 0, y: 5, scale: 0.8 }}
                    transition={{ duration: 0.15 }}
                    className="absolute whitespace-nowrap px-3 py-1 rounded-md bg-slate-950 border border-slate-800 text-xs font-semibold text-slate-100 shadow-xl pointer-events-none z-50"
                  >
                    {item.label}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Action Button */}
              <motion.button
                onClick={item.onClick}
                animate={{ scale }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                className={`relative w-10 h-10 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
                  item.active
                    ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/50'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                {item.icon}
                {item.badge !== undefined && item.badge !== null && (
                  <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white shadow-md">
                    {item.badge}
                  </span>
                )}
              </motion.button>
            </div>
          );
        })}
      </motion.div>
    </div>
  );
};

/**
 * -------------------------------------------------------------------
 * 3. SKIPER ANIMATED COUNTER
 * Smooth spring numeric counter for live weather metrics
 * -------------------------------------------------------------------
 */
interface SkiperAnimatedCounterProps {
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

export const SkiperAnimatedCounter: React.FC<SkiperAnimatedCounterProps> = ({
  value,
  decimals = 1,
  prefix = '',
  suffix = '',
  className = '',
}) => {
  const springValue = useSpring(value, { stiffness: 80, damping: 18 });
  const [displayValue, setDisplayValue] = useState(value.toFixed(decimals));

  useEffect(() => {
    springValue.set(value);
  }, [value, springValue]);

  useEffect(() => {
    const unsubscribe = springValue.on('change', (latest) => {
      setDisplayValue(latest.toFixed(decimals));
    });
    return unsubscribe;
  }, [springValue, decimals]);

  return (
    <span className={`inline-flex items-baseline font-mono tracking-tight ${className}`}>
      {prefix}
      {displayValue}
      {suffix}
    </span>
  );
};

/**
 * -------------------------------------------------------------------
 * 4. SKIPER BORDER BEAM
 * Moving animated border beam gradient
 * -------------------------------------------------------------------
 */
interface SkiperBorderBeamProps {
  size?: number;
  duration?: number;
  delay?: number;
  colorFrom?: string;
  colorTo?: string;
}

export const SkiperBorderBeam: React.FC<SkiperBorderBeamProps> = ({
  size = 200,
  duration = 8,
  delay = 0,
  colorFrom = '#38bdf8',
  colorTo = '#818cf8',
}) => {
  return (
    <div
      style={{
        '--size': `${size}px`,
        '--duration': `${duration}s`,
        '--delay': `${delay}s`,
        '--color-from': colorFrom,
        '--color-to': colorTo,
      } as React.CSSProperties}
      className="pointer-events-none absolute inset-0 rounded-[inherit] border border-transparent [mask-clip:padding-box,border-box] [mask-composite:intersect] [mask-image:linear-gradient(transparent,transparent),linear-gradient(black,black)]"
    >
      <div className="absolute aspect-square w-[var(--size)] animate-skiper-border-beam bg-gradient-to-l from-[var(--color-from)] via-[var(--color-to)] to-transparent" />
    </div>
  );
};
