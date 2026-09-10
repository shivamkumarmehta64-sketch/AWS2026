import { NextRequest, NextResponse } from 'next/server';
import { nicWmoEngineInstance, TelemetryPacket } from '@/lib/anomalyLogic';
import { IMD_AWS_STATIONS, getStationProfile } from '@/lib/stationData';
import { fetchLiveStationObservation } from '@/lib/liveWeatherService';

// In-memory sliding window rate limiter: max 240 requests per minute per station/IP
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

// In-memory ring buffer for live ingested telemetry from mobile phones / ESP32
const liveIngestedBuffer: TelemetryPacket[] = [];

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const windowMs = 60 * 1000;
  const maxRequests = 240;

  const record = rateLimitMap.get(key);
  if (!record || record.resetTime < now) {
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
    return false;
  }

  if (record.count >= maxRequests) {
    return true;
  }

  record.count++;
  return false;
}

/**
 * NAWS-QMS Real-Time Telemetry Ingestion API (Problem SIH26073)
 * Provides high-throughput, low-latency (<5ms) validation of 3 primary parameters:
 * - Temperature (°C)
 * - Atmospheric Pressure (hPa)
 * - Relative Humidity (%)
 */
export async function POST(request: NextRequest) {
  const startTime = performance.now();
  const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1';

  // 1. Content Length Check (< 15 KB)
  const contentLength = Number(request.headers.get('content-length') || 0);
  if (contentLength > 15360) {
    return NextResponse.json(
      {
        success: false,
        error: 'Payload Too Large. Maximum allowed size is 15 KB.',
      },
      { status: 413 }
    );
  }

  try {
    const body = await request.json();
    const { stationId, temperature, pressure, humidity, timestamp, lat, lon, deviceName } = body;

    if (!stationId || typeof stationId !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing or invalid parameter: stationId (e.g. "AWS-MOB-01" or "AWS-DEL-04")',
        },
        { status: 400 }
      );
    }

    // Rate limiting keyed by stationId or clientIp
    const rateLimitKey = `${stationId}_${clientIp}`;
    if (isRateLimited(rateLimitKey)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Rate limit exceeded. Maximum 240 requests per minute allowed.',
        },
        { status: 429, headers: { 'Retry-After': '60' } }
      );
    }

    // Flexible Station ID format supporting mobile nodes, districts, and legacy IMD nodes
    const stationIdRegex = /^AWS-[A-Za-z0-9_-]{2,24}$/;
    if (!stationIdRegex.test(stationId)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Malformed station ID format. Expected format: AWS-XXX-99 or AWS-MOB-XX',
        },
        { status: 400 }
      );
    }

    // Parse & sanitize numeric values (allowing null for dropped packets)
    const parseParam = (val: unknown, min: number, max: number): number | null => {
      if (val === null || val === undefined || val === '') return null;
      const num = Number(val);
      if (isNaN(num) || !isFinite(num)) return null;
      // Clamp or reject unphysical inputs beyond absolute planetary bounds
      if (num < min || num > max) return null;
      return Math.round(num * 100) / 100;
    };

    const rawTemp = parseParam(temperature, -90, 70);
    const rawPress = parseParam(pressure, 600, 1100);
    const rawHum = parseParam(humidity, 0, 100);

    const safeTimestamp = (typeof timestamp === 'number' && timestamp > 0 && timestamp < Date.now() + 86400000)
      ? timestamp
      : Date.now();

    // Ingest & evaluate through WMO Pub No. 8 Quality Control Pipeline
    const evaluatedPacket: TelemetryPacket = nicWmoEngineInstance.processIngestedObservation(
      stationId,
      rawTemp,
      rawPress,
      rawHum,
      safeTimestamp
    );

    // Attach mobile hardware GPS and device metadata if provided
    (evaluatedPacket as unknown as { mobileMetadata?: { lat?: number; lon?: number; deviceName?: string } }).mobileMetadata = {
      lat: typeof lat === 'number' && !isNaN(lat) ? lat : undefined,
      lon: typeof lon === 'number' && !isNaN(lon) ? lon : undefined,
      deviceName: typeof deviceName === 'string' ? deviceName : 'Field Smartphone Sensor',
    };

    // Save into live ingestion ring buffer for real-time mobile sync
    liveIngestedBuffer.unshift(evaluatedPacket);
    if (liveIngestedBuffer.length > 50) {
      liveIngestedBuffer.pop();
    }

    const latencyMs = Math.round((performance.now() - startTime) * 100) / 100;

    return NextResponse.json(
      {
        success: true,
        latencyMs,
        compliance: 'WMO Pub No. 8 & SIH26073 Quality Management Standards',
        data: evaluatedPacket,
      },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: 'Invalid JSON payload structure.',
      },
      { status: 400 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const stationId = searchParams.get('stationId');
  const isLive = searchParams.get('live') === 'true';
  const isLatest = searchParams.get('latest') === 'true';
  const since = Number(searchParams.get('since') || 0);

  // Return live ingested packets from mobile phones or external transmitters
  if (isLatest) {
    const filtered = since > 0
      ? liveIngestedBuffer.filter((p) => p.timestamp > since)
      : liveIngestedBuffer.slice(0, 10);

    return NextResponse.json({
      success: true,
      count: filtered.length,
      packets: filtered,
    });
  }

  // If live query requested for a specific station, fetch from Open-Meteo public API
  if (isLive && stationId) {
    const station = getStationProfile(stationId);
    if (station) {
      const liveData = await fetchLiveStationObservation(station);
      if (liveData) {
        return NextResponse.json({
          success: true,
          stationId: station.stationId,
          name: station.name,
          coordinates: { latitude: station.latitude, longitude: station.longitude },
          liveObservation: liveData,
          source: 'Open-Meteo Free Public Meteorological API',
        });
      }
    }
  }

  const stations = IMD_AWS_STATIONS.map((s) => ({
    stationId: s.stationId,
    name: s.name,
    state: s.state,
    coordinates: { lat: s.latitude, lon: s.longitude },
    elevationM: s.elevationM,
    status: s.status || 'OPERATIONAL',
  }));

  return NextResponse.json({
    system: 'National Automatic Weather Station Quality Management System (NAWS-QMS)',
    version: '4.2.8',
    problemStatement: 'SIH26073 - Automated Telemetry Anomaly Detection',
    liveDataSource: 'Open-Meteo Free Public Satellite & Surface API',
    qualityFlags: {
      FLAG_1_VERIFIED_GOOD: 'Observation nominal, within step limits and verified for NWP ingestion.',
      FLAG_2_CONVECTIVE_STORM: 'Severe convective front (pressure drop + humidity surge). Validated for NWP.',
      FLAG_3_SUSPECT_DRIFT: 'Barometer gradual monotonic calibration drift.',
      FLAG_4_CORRUPT_HARDWARE: 'Thermistor open circuit spike or stuck ADC register freeze. Quarantined.',
      FLAG_5_PACKET_LOSS: 'Missing frames or corrupted payload. Reconstructed from historical baseline.',
    },
    totalMonitoredStations: stations.length,
    stations,
  });
}

