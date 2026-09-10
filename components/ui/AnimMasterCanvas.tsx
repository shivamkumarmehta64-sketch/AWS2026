'use client';

import React, { useEffect, useRef } from 'react';
import { createParticleGrid, updateParticleGrid, renderParticleGrid, Particle } from '@/lib/animMaster';

interface AnimMasterCanvasProps {
  className?: string;
  colorScheme?: 'sky' | 'emerald' | 'amber' | 'violet';
  spacing?: number;
  interactiveRadius?: number;
}

export const AnimMasterCanvas: React.FC<AnimMasterCanvasProps> = ({
  className = '',
  colorScheme = 'sky',
  spacing = 38,
  interactiveRadius = 150,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || window.innerHeight);

    let particles: Particle[] = createParticleGrid(width, height, spacing, colorScheme);

    let mouseX = -1000;
    let mouseY = -1000;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
    };

    const handleMouseLeave = () => {
      mouseX = -1000;
      mouseY = -1000;
    };

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
      particles = createParticleGrid(width, height, spacing, colorScheme);
    };

    const parentElem = canvas.parentElement || window;
    parentElem.addEventListener('mousemove', handleMouseMove as EventListener);
    parentElem.addEventListener('mouseleave', handleMouseLeave as EventListener);
    window.addEventListener('resize', handleResize);

    const startTime = performance.now();

    const loop = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      updateParticleGrid(particles, mouseX, mouseY, elapsed, interactiveRadius);
      renderParticleGrid(ctx, particles, width, height);
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
      parentElem.removeEventListener('mousemove', handleMouseMove as EventListener);
      parentElem.removeEventListener('mouseleave', handleMouseLeave as EventListener);
      window.removeEventListener('resize', handleResize);
    };
  }, [colorScheme, spacing, interactiveRadius]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 pointer-events-none z-0 transition-opacity duration-700 ${className}`}
    />
  );
};
