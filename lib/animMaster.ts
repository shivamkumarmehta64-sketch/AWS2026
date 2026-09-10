/**
 * AnimMaster Lib Engine
 * Advanced particle physics, dynamic wave equations, and interpolation helpers for interactive UI canvas effects.
 */

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  baseRadius: number;
  color: string;
  alpha: number;
  originalX: number;
  originalY: number;
}

export interface WaveConfig {
  amplitude: number;
  frequency: number;
  speed: number;
  color: string;
}

/**
 * Creates an array of particle objects initialized in a grid layout
 */
export function createParticleGrid(
  width: number,
  height: number,
  spacing: number = 35,
  colorScheme: 'sky' | 'emerald' | 'amber' | 'violet' = 'sky'
): Particle[] {
  const particles: Particle[] = [];
  const cols = Math.floor(width / spacing);
  const rows = Math.floor(height / spacing);

  const colors = {
    sky: ['rgba(14, 165, 233, ', 'rgba(56, 189, 248, ', 'rgba(99, 102, 241, '],
    emerald: ['rgba(16, 185, 129, ', 'rgba(52, 211, 153, ', 'rgba(20, 184, 166, '],
    amber: ['rgba(245, 158, 11, ', 'rgba(251, 191, 36, ', 'rgba(234, 88, 12, '],
    violet: ['rgba(139, 92, 246, ', 'rgba(167, 139, 250, ', 'rgba(236, 72, 153, '],
  }[colorScheme];

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = c * spacing + spacing / 2;
      const y = r * spacing + spacing / 2;
      const colorPrefix = colors[(r + c) % colors.length];
      const baseRadius = 1.2 + Math.random() * 1.5;

      particles.push({
        x,
        y,
        vx: 0,
        vy: 0,
        radius: baseRadius,
        baseRadius,
        color: colorPrefix,
        alpha: 0.2 + Math.random() * 0.4,
        originalX: x,
        originalY: y,
      });
    }
  }

  return particles;
}

/**
 * Updates particle position based on mouse interaction and harmonic restitution physics
 */
export function updateParticleGrid(
  particles: Particle[],
  mouseX: number,
  mouseY: number,
  time: number,
  interactiveRadius: number = 140
): void {
  for (let i = 0; i < particles.length; i++) {
    const p = particles[i];

    // Distance from mouse cursor
    const dx = mouseX - p.x;
    const dy = mouseY - p.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // Mouse repulsion force
    if (dist < interactiveRadius && dist > 0) {
      const force = (interactiveRadius - dist) / interactiveRadius;
      const angle = Math.atan2(dy, dx);
      p.vx -= Math.cos(angle) * force * 1.8;
      p.vy -= Math.sin(angle) * force * 1.8;
      p.alpha = Math.min(0.9, p.alpha + force * 0.4);
      p.radius = p.baseRadius + force * 2.5;
    } else {
      p.radius = p.baseRadius + (p.radius - p.baseRadius) * 0.92;
      p.alpha = Math.max(0.2, p.alpha * 0.96);
    }

    // Wave motion modulation
    const waveY = Math.sin(p.originalX * 0.015 + time * 0.002) * 6;
    const targetY = p.originalY + waveY;

    // Spring restitution back to target position
    const springStiffness = 0.04;
    const damping = 0.82;

    p.vx += (p.originalX - p.x) * springStiffness;
    p.vy += (targetY - p.y) * springStiffness;

    p.vx *= damping;
    p.vy *= damping;

    p.x += p.vx;
    p.y += p.vy;
  }
}

/**
 * Render particle connections and glowing nodes onto 2D Canvas context
 */
export function renderParticleGrid(
  ctx: CanvasRenderingContext2D,
  particles: Particle[],
  width: number,
  height: number,
  connectionDistance: number = 48
): void {
  ctx.clearRect(0, 0, width, height);

  // Render particle nodes
  for (let i = 0; i < particles.length; i++) {
    const p = particles[i];
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    ctx.fillStyle = `${p.color}${p.alpha})`;
    ctx.fill();
  }

  // Render subtle node-to-node proximity lines
  ctx.lineWidth = 0.6;
  for (let i = 0; i < particles.length; i++) {
    const p1 = particles[i];
    if (p1.alpha < 0.3) continue;

    for (let j = i + 1; j < particles.length; j++) {
      const p2 = particles[j];
      const dx = p1.x - p2.x;
      const dy = p1.y - p2.y;
      const distSq = dx * dx + dy * dy;

      if (distSq < connectionDistance * connectionDistance) {
        const alpha = (1 - Math.sqrt(distSq) / connectionDistance) * p1.alpha * 0.5;
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.strokeStyle = `rgba(56, 189, 248, ${alpha})`;
        ctx.stroke();
      }
    }
  }
}
