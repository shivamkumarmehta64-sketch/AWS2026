import { describe, it, expect } from 'vitest';
import { IMD_AWS_STATIONS } from '../lib/stationData';

describe('Station Data', () => {
  it('all 21 stations have valid lat/lon within India bounds', () => {
    expect(IMD_AWS_STATIONS.length).toBe(21);
    IMD_AWS_STATIONS.forEach(station => {
      // India bounds approx: Lat 6 to 38, Lon 68 to 98
      expect(station.latitude).toBeGreaterThanOrEqual(6);
      expect(station.latitude).toBeLessThanOrEqual(38);
      expect(station.longitude).toBeGreaterThanOrEqual(68);
      expect(station.longitude).toBeLessThanOrEqual(98);
    });
  });

  it('all station IDs match the expected format AWS-XXX-NN', () => {
    IMD_AWS_STATIONS.forEach(station => {
      expect(station.stationId).toMatch(/^AWS-[A-Z]{3}-\d{2}$/);
    });
  });

  it('all WMO block numbers are valid 5-digit strings', () => {
    IMD_AWS_STATIONS.forEach(station => {
      expect(station.wmoBlockNo).toMatch(/^\d{5}$/);
    });
  });

  it('no two stations share the same stationId', () => {
    const ids = IMD_AWS_STATIONS.map(s => s.stationId);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });
});
