import { NextRequest, NextResponse } from 'next/server';
import { nicWmoEngineInstance, TelemetryPacket } from '@/lib/anomalyLogic';
import { IMD_AWS_STATIONS, getStationProfile } from '@/lib/stationData';

/**
 * MoES / IMD AWS Real-Time Telemetry Ingestion API (Problem SIH26073)
 * Provides high-throughput, low-latency (<5ms) validation of 3 primary parameters:
 * - Temperature (°C)
 * - Atmospheric Pressure (hPa)
 * - Relative Humidity (%)
 */

export async function POST(request: NextRequest) {
  const startTime = performance.now();

  try {
    const body = await request.json();
    const { stationId, temperature, pressure, humidity, timestamp } = body;

    if (!stationId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required parameter: stationId (e.g. "AWS-DEL-04")',
        },
        { status: 400 }
      );
    }

    // Validate station ID
    try {
      getStationProfile(stationId);
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: `Unregistered station ID: ${stationId}. Must be one of the 20 registered IMD AWS nodes.`,
        },
        { status: 404 }
      );
    }

    // Parse numeric values (allowing null for dropped packets)
    const parseParam = (val: unknown): number | null => {
      if (val === null || val === undefined || val === '') return null;
      const num = Number(val);
      return isNaN(num) ? null : num;
    };

    const rawTemp = parseParam(temperature);
    const rawPress = parseParam(pressure);
    const rawHum = parseParam(humidity);
    const pktTimestamp = timestamp ? Number(timestamp) : Date.now();

    // Ingest & evaluate through WMO Pub No. 8 Quality Control Pipeline
    const evaluatedPacket: TelemetryPacket = nicWmoEngineInstance.processIngestedObservation(
      stationId,
      rawTemp,
      rawPress,
      rawHum,
      pktTimestamp
    );

    const latencyMs = Math.round((performance.now() - startTime) * 100) / 100;

    return NextResponse.json(
      {
        success: true,
        latencyMs,
        compliance: 'WMO Pub No. 8 & IMD Quality Management Standards',
        data: evaluatedPacket,
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Invalid JSON payload';
    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 400 }
    );
  }
}

export async function GET() {
  const stations = IMD_AWS_STATIONS.map((s) => ({
    stationId: s.stationId,
    name: s.name,
    state: s.state,
    coordinates: { lat: s.latitude, lon: s.longitude },
    elevationM: s.elevationM,
    sensors: s.sensorMetadata,
  }));

  return NextResponse.json({
    system: 'National Automatic Weather Station Quality Management System (NAWS-QMS)',
    version: '4.2.8',
    problemStatement: 'SIH26073 - Ministry of Earth Sciences (MoES) / IMD',
    telemetryCycleSeconds: 2.5,
    parameters: [
      { name: 'Ambient Temperature', symbol: 'T', unit: '°C', minLimit: -10.0, maxLimit: 55.0 },
      { name: 'Atmospheric Pressure', symbol: 'P', unit: 'hPa', minLimit: 920.0, maxLimit: 1050.0 },
      { name: 'Relative Humidity', symbol: 'RH', unit: '%', minLimit: 5.0, maxLimit: 100.0 },
    ],
    qualityFlags: {
      FLAG_1_VERIFIED_GOOD: 'Observation nominal, within step limits and verified for NWP ingestion.',
      FLAG_2_CONVECTIVE_STORM: 'Severe convective front (pressure drop + humidity surge). Validated for NWP.',
      FLAG_3_SUSPECT_DRIFT: 'Barometer or sensor gradual monotonic calibration drift.',
      FLAG_4_CORRUPT_HARDWARE: 'Thermistor open circuit spike or stuck ADC register freeze. Quarantined.',
      FLAG_5_PACKET_LOSS: 'Missing frames or corrupted payload. RF link audit recommended.',
    },
    totalMonitoredStations: stations.length,
    stations,
  });
}
