/**
 * vayuPoller.ts
 * AGENT 6 — BACKGROUND POLLER + HEALTH ORCHESTRATOR
 *
 * Runs silent 30-second background loop with adaptive refresh rates,
 * triggers browser notifications on critical sensor anomalies,
 * and maintains continuous health status synchronization across all 766 districts.
 */

import {
  enqueueDistrictFetch,
  initializeDistrictEngine
} from './districtEngine';
import { ALL_766_DISTRICTS } from './india766Districts';
import { DistrictHealthStatus } from './sensorFaultEngine';
import { logVayuEvent } from './vayuEventLog';

interface PollerState {
  running: boolean;
  lastCycleTimestamp: number | null;
  totalCyclesCompleted: number;
  activeQueueLength: number;
  notificationPermission: NotificationPermission | 'unsupported';
}

const pollerState: PollerState = {
  running: false,
  lastCycleTimestamp: null,
  totalCyclesCompleted: 0,
  activeQueueLength: 0,
  notificationPermission: 'default'
};

let pollerIntervalId: NodeJS.Timeout | null = null;
const previousDistrictHealth = new Map<string, DistrictHealthStatus>();
const offlineRetryCounts = new Map<string, number>();

// Request browser notification permission
export async function requestNotificationPermission(): Promise<NotificationPermission | 'unsupported'> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    pollerState.notificationPermission = 'unsupported';
    return 'unsupported';
  }

  try {
    const res = await Notification.requestPermission();
    pollerState.notificationPermission = res;
    return res;
  } catch (e) {
    console.warn('Could not request notification permission:', e);
    return 'default';
  }
}

// Dispatch browser notification on critical sensor failure
function sendCriticalNotification(districtName: string, state: string, faultCode: string, message: string) {
  if (typeof window === 'undefined' || !('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;

  try {
    const notif = new Notification(`⚠ Vayu Alert — ${districtName}, ${state}`, {
      body: `${faultCode} — ${message}`,
      icon: '/icon.png',
      tag: `vayu-crit-${districtName}`,
    });

    notif.onclick = () => {
      window.focus();
    };
  } catch (e) {
    console.warn('Notification error:', e);
  }
}

// Main 30-second cycle runner
async function runPollerCycle() {
  if (!pollerState.running) return;

  // If user has switched tabs, reduce poller work
  if (typeof document !== 'undefined' && document.hidden) return;

  const now = Date.now();
  pollerState.lastCycleTimestamp = now;
  pollerState.totalCyclesCompleted++;

  // Evaluate which districts are due for adaptive refresh
  for (const d of ALL_766_DISTRICTS) {
    const lastHealth = previousDistrictHealth.get(d.id) || 'LOADING';

    let refreshThresholdMs = 300000; // 5 min default for HEALTHY
    if (lastHealth === 'CRITICAL') {
      refreshThresholdMs = 60000; // 1 min for CRITICAL
    } else if (lastHealth === 'DEGRADED') {
      refreshThresholdMs = 120000; // 2 min for DEGRADED
    } else if (lastHealth === 'OFFLINE') {
      const retries = offlineRetryCounts.get(d.id) || 0;
      if (retries >= 3) {
        // Stop retrying offline node after 3 attempts
        continue;
      }
      refreshThresholdMs = 600000; // 10 min retry
    }

    // Schedule priority fetch if due
    enqueueDistrictFetch(d.id, lastHealth === 'CRITICAL' ? 80 : (lastHealth === 'DEGRADED' ? 40 : 5));
  }
}

/**
 * Begin background loop
 */
export function startPoller() {
  if (pollerState.running) return;
  pollerState.running = true;

  // Initialize engine and first batch
  initializeDistrictEngine();

  // Ask for notification permission if not asked
  if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
    requestNotificationPermission();
  }

  // Run cycle every 30 seconds
  pollerIntervalId = setInterval(runPollerCycle, 30000);
}

/**
 * Freeze all background polling
 */
export function pausePoller() {
  pollerState.running = false;
  if (pollerIntervalId) {
    clearInterval(pollerIntervalId);
    pollerIntervalId = null;
  }
}

/**
 * Get poller diagnostics
 */
export function getPollerStatus(): PollerState {
  return { ...pollerState };
}

/**
 * Force reset and re-fetch all districts
 */
export function forceRefreshAll() {
  import('./india766Districts').then(({ ALL_766_DISTRICTS }) => {
    for (const d of ALL_766_DISTRICTS) {
      enqueueDistrictFetch(d.id, 90);
    }
  });
}
