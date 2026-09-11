import { describe, it, expect, beforeEach } from 'vitest';
import { NICWMOAnomalyEngine } from '../lib/anomalyLogic';

describe('NICWMOAnomalyEngine', () => {
  let engine: NICWMOAnomalyEngine;
  const stationId = 'AWS-DEL-04'; // Known station

  beforeEach(() => {
    engine = new NICWMOAnomalyEngine();
  });

  it('nominal observations get FLAG_1_VERIFIED_GOOD', () => {
    const pkt = engine.generatePacket(stationId);
    expect(pkt.wmoFlag).toBe('FLAG_1_VERIFIED_GOOD');
    expect(pkt.classification).toBe('NOMINAL_OPERATION');
  });

  it('thermistor spike injection produces FLAG_4_CORRUPT_HARDWARE with SENSOR_SPIKE classification', () => {
    engine.triggerThermistorSpike(stationId);
    let pkt = engine.generatePacket(stationId); // tick 1
    pkt = engine.generatePacket(stationId); // tick 2
    expect(pkt.wmoFlag).toBe('FLAG_4_CORRUPT_HARDWARE');
    expect(pkt.classification).toBe('SENSOR_SPIKE');
  });

  it('frozen value injection produces FLAG_4_CORRUPT_HARDWARE with FROZEN_VALUE classification', () => {
    engine.triggerWireDisconnectFreeze(stationId);
    let pkt;
    for (let i = 0; i < 7; i++) {
      pkt = engine.generatePacket(stationId);
    }
    expect(pkt!.wmoFlag).toBe('FLAG_4_CORRUPT_HARDWARE');
    expect(pkt!.classification).toBe('FROZEN_VALUE');
  });

  it('barometer drift injection produces FLAG_3_SUSPECT_DRIFT', () => {
    engine.triggerBarometerDrift(stationId);
    let pkt;
    for (let i = 0; i < 5; i++) {
      pkt = engine.generatePacket(stationId);
    }
    expect(pkt!.wmoFlag).toBe('FLAG_3_SUSPECT_DRIFT');
    expect(pkt!.classification).toBe('CALIBRATION_DRIFT');
  });

  it('convective storm injection produces FLAG_2_CONVECTIVE_STORM (NOT a sensor fault)', () => {
    engine.generatePacket(stationId); // baseline
    engine.triggerConvectiveStorm(stationId);
    const pkt = engine.generatePacket(stationId); // tick 1 jump
    expect(pkt.wmoFlag).toBe('FLAG_2_CONVECTIVE_STORM');
    expect(pkt.classification).toBe('GENUINE_CONVECTIVE_EVENT');
  });

  it('packet loss (null values) produces FLAG_5_PACKET_LOSS', () => {
    engine.triggerPacketLoss(stationId);
    const pkt = engine.generatePacket(stationId);
    expect(pkt.wmoFlag).toBe('FLAG_5_PACKET_LOSS');
    expect(pkt.classification).toBe('TELEMETRY_PACKET_LOSS');
  });

  it('WMA imputation produces non-null imputed values even when raw values are null', () => {
    // Generate nominal packets to populate buffer
    for (let i = 0; i < 5; i++) {
      engine.generatePacket(stationId);
    }
    engine.triggerPacketLoss(stationId);
    const pkt = engine.generatePacket(stationId);
    expect(pkt.raw.temperature).toBeNull();
    expect(pkt.imputed.temperature).not.toBeNull();
    expect(typeof pkt.imputed.temperature).toBe('number');
  });

  it('spatial cross-validation returns REGIONAL_WEATHER when multiple neighbors are anomalous', () => {
    engine.generatePacket('AWS-DEL-04');
    engine.triggerConvectiveStorm('AWS-DEL-04');
    const pkt1 = engine.generatePacket('AWS-DEL-04');

    engine.generatePacket('AWS-AGR-19'); // ~176km
    engine.triggerConvectiveStorm('AWS-AGR-19');
    const pkt2 = engine.generatePacket('AWS-AGR-19');

    engine.generatePacket('AWS-JAI-09'); // ~238km
    engine.triggerConvectiveStorm('AWS-JAI-09');
    const pkt3 = engine.generatePacket('AWS-JAI-09');

    const allLatest: Record<string, import('@/lib/anomalyLogic').TelemetryPacket> = {
      'AWS-DEL-04': pkt1,
      'AWS-AGR-19': pkt2,
      'AWS-JAI-09': pkt3
    };

    const result = engine.spatialCrossValidate('AWS-DEL-04', pkt1.classification, allLatest);
    expect(result.verdict).toBe('REGIONAL_WEATHER');
  });

  it('XAI attribution weights sum to approximately 100%', () => {
    const pkt = engine.generatePacket(stationId);
    const sum = pkt.xaiAttribution.tempWeight + pkt.xaiAttribution.pressWeight + pkt.xaiAttribution.humWeight;
    expect(sum).toBeGreaterThanOrEqual(99.9);
    expect(sum).toBeLessThanOrEqual(100.1);
  });

  it('security seal HMAC is generated for every packet', () => {
    const pkt = engine.generatePacket(stationId);
    expect(pkt.securitySeal).toBeDefined();
    expect(pkt.securitySeal.hmacSha256).toMatch(/^0x[0-9a-f]+$/);
  });
});
