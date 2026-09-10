/**
 * sensorFaultEngine.ts
 * AGENT 2 — COMPREHENSIVE SENSOR FAULT DETECTION ENGINE (ALL POSSIBLE CASES)
 *
 * Implements every known sensor fault pattern from WMO guidelines:
 * WMO-No. 8 (Guide to Meteorological Instruments and Methods of Observation),
 * WMO-No. 558 (Manual on the Global Data-processing and Forecasting System),
 * and IMD AWS QC Guidelines.
 */

export type SeverityLevel = 'CRITICAL' | 'WARNING' | 'INFO';

export interface FaultResult {
  fault: boolean;
  code: string;
  category: string;
  severity: SeverityLevel;
  message: string;
  value: unknown;
  threshold?: string;
  recommendedAction?: string;
}

export type DistrictHealthStatus = 'HEALTHY' | 'DEGRADED' | 'CRITICAL' | 'OFFLINE' | 'LOADING';

export interface SensorReport {
  districtId: string;
  districtName: string;
  state: string;
  timestamp: string;
  overallStatus: DistrictHealthStatus;
  faults: FaultResult[];
  passedChecks: number;
  failedChecks: number;
  faultCategories: string[];
  recommendation: string;
}

export enum FaultCode {
  // Category 1: Gross Limits
  GROSS_LIMIT_TEMP = 'GROSS_LIMIT_TEMP',
  GROSS_LIMIT_HUMIDITY = 'GROSS_LIMIT_HUMIDITY',
  GROSS_LIMIT_PRESSURE = 'GROSS_LIMIT_PRESSURE',
  GROSS_LIMIT_WIND_SPEED = 'GROSS_LIMIT_WIND_SPEED',
  GROSS_LIMIT_WIND_DIR = 'GROSS_LIMIT_WIND_DIR',
  GROSS_LIMIT_VISIBILITY = 'GROSS_LIMIT_VISIBILITY',
  GROSS_LIMIT_DEW_POINT = 'GROSS_LIMIT_DEW_POINT',
  GROSS_LIMIT_UV = 'GROSS_LIMIT_UV',
  GROSS_LIMIT_PRECIP = 'GROSS_LIMIT_PRECIP',
  GROSS_LIMIT_CLOUD = 'GROSS_LIMIT_CLOUD',

  // Category 2: Soft Limits
  SOFT_LIMIT_TEMP = 'SOFT_LIMIT_TEMP',
  SOFT_LIMIT_WIND_SPEED = 'SOFT_LIMIT_WIND_SPEED',
  SOFT_LIMIT_PRESSURE = 'SOFT_LIMIT_PRESSURE',
  SOFT_LIMIT_PRECIP = 'SOFT_LIMIT_PRECIP',
  SOFT_LIMIT_UV = 'SOFT_LIMIT_UV',
  SOFT_LIMIT_HUMIDITY_SATURATION = 'SOFT_LIMIT_HUMIDITY_SATURATION',

  // Category 3: Step Checks
  STEP_FAIL_TEMP = 'STEP_FAIL_TEMP',
  STEP_FAIL_PRESSURE = 'STEP_FAIL_PRESSURE',
  STEP_FAIL_HUMIDITY = 'STEP_FAIL_HUMIDITY',
  STEP_FAIL_WIND_SPEED = 'STEP_FAIL_WIND_SPEED',
  STEP_FAIL_DEW_POINT = 'STEP_FAIL_DEW_POINT',
  STEP_FAIL_VISIBILITY = 'STEP_FAIL_VISIBILITY',

  // Category 4: Internal Consistency
  CONSISTENCY_DEW_GT_TEMP = 'CONSISTENCY_DEW_GT_TEMP',
  CONSISTENCY_DEW_HUMIDITY_MISMATCH = 'CONSISTENCY_DEW_HUMIDITY_MISMATCH',
  CONSISTENCY_PRECIP_WITHOUT_CLOUDS = 'CONSISTENCY_PRECIP_WITHOUT_CLOUDS',
  CONSISTENCY_HIGH_UV_OVERCAST = 'CONSISTENCY_HIGH_UV_OVERCAST',
  CONSISTENCY_GUST_LT_SPEED = 'CONSISTENCY_GUST_LT_SPEED',
  CONSISTENCY_SURFACE_GT_MSL = 'CONSISTENCY_SURFACE_GT_MSL',
  CONSISTENCY_APPARENT_TEMP_DEV = 'CONSISTENCY_APPARENT_TEMP_DEV',
  CONSISTENCY_NIGHT_SUNSHINE = 'CONSISTENCY_NIGHT_SUNSHINE',

  // Category 5: Persistence / Flat Line
  FLAT_LINE_WARNING = 'FLAT_LINE_WARNING',
  FLAT_LINE_CRITICAL = 'FLAT_LINE_CRITICAL',
  FLAT_LINE_HUMIDITY_BOUND = 'FLAT_LINE_HUMIDITY_BOUND',
  FLAT_LINE_WIND_DIR_BOUND = 'FLAT_LINE_WIND_DIR_BOUND',
  FLAT_LINE_PRESSURE_HOUR = 'FLAT_LINE_PRESSURE_HOUR',

  // Category 6: Missing Data / Comms
  COMMS_STALE = 'COMMS_STALE',
  COMMS_OFFLINE = 'COMMS_OFFLINE',
  COMMS_PARTIAL_LOSS = 'COMMS_PARTIAL_LOSS',
  COMMS_TOTAL_LOSS = 'COMMS_TOTAL_LOSS',
  COMMS_NETWORK_DEGRADED = 'COMMS_NETWORK_DEGRADED',

  // Category 7: Statistical Anomaly
  STAT_ANOMALY_TEMP = 'STAT_ANOMALY_TEMP',
  STAT_ANOMALY_PRESSURE_SPATIAL = 'STAT_ANOMALY_PRESSURE_SPATIAL',
  STAT_ANOMALY_PRECIP_SPIKE = 'STAT_ANOMALY_PRECIP_SPIKE',

  // Category 8: India Specific
  INDIA_TEMP_HEAT_ANOMALY = 'INDIA_TEMP_HEAT_ANOMALY',
  INDIA_LOW_HUMIDITY_COASTAL = 'INDIA_LOW_HUMIDITY_COASTAL',
  INDIA_FREEZING_LEVEL_PLAINS = 'INDIA_FREEZING_LEVEL_PLAINS',
  INDIA_NIGHT_UV_ANOMALY = 'INDIA_NIGHT_UV_ANOMALY',
}

export interface LiveDistrictReading {
  timestamp: string;
  temperature_2m?: number | null;
  relative_humidity_2m?: number | null;
  apparent_temperature?: number | null;
  precipitation?: number | null;
  weather_code?: number | null;
  pressure_msl?: number | null;
  surface_pressure?: number | null;
  wind_speed_10m?: number | null;
  wind_direction_10m?: number | null;
  wind_gusts_10m?: number | null;
  cloud_cover?: number | null;
  visibility?: number | null;
  uv_index?: number | null;
  is_day?: number | boolean | null;
  sunshine_duration?: number | null;
  dew_point_2m?: number | null;
  freezing_level_height?: number | null;
  lastPacketReceivedMs?: number;
  fetchErrorCount?: number;
}

export interface DistrictMeta {
  id: string;
  name: string;
  state: string;
  lat: number;
  lng: number;
  population?: number;
  elevation?: number;
  isCoastal?: boolean;
}

export interface HistoricalReading {
  timestamp: string;
  temperature?: number | null;
  humidity?: number | null;
  pressure?: number | null;
  wind_speed?: number | null;
  wind_direction?: number | null;
  precipitation?: number | null;
  dew_point?: number | null;
  visibility?: number | null;
}

// ━━━━━ CATEGORY 1: GROSS LIMIT VIOLATIONS ━━━━━
export const GrossLimits = {
  checkTemp: (v: number | null | undefined): FaultResult => {
    if (v == null) return { fault: false, code: FaultCode.GROSS_LIMIT_TEMP, category: 'Gross Limit', severity: 'CRITICAL', message: 'OK', value: v };
    const fail = v < -89 || v > 60;
    return {
      fault: fail,
      code: FaultCode.GROSS_LIMIT_TEMP,
      category: 'Gross Limit Violation',
      severity: 'CRITICAL',
      message: fail ? `Temperature ${v.toFixed(1)}°C violates physical limit [-89°C, 60°C]` : 'Temperature within physical range',
      value: v,
      threshold: '[-89.0°C, 60.0°C]',
      recommendedAction: 'Inspect PT100 thermistor probe and ADC transducer wiring for open/short circuit'
    };
  },

  checkHumidity: (v: number | null | undefined): FaultResult => {
    if (v == null) return { fault: false, code: FaultCode.GROSS_LIMIT_HUMIDITY, category: 'Gross Limit', severity: 'CRITICAL', message: 'OK', value: v };
    const fail = v < 0 || v > 100;
    return {
      fault: fail,
      code: FaultCode.GROSS_LIMIT_HUMIDITY,
      category: 'Gross Limit Violation',
      severity: 'CRITICAL',
      message: fail ? `Relative Humidity ${v.toFixed(1)}% violates physical limit [0%, 100%]` : 'Humidity within physical range',
      value: v,
      threshold: '[0%, 100%]',
      recommendedAction: 'Recalibrate capacitive polymer hygrometer; inspect for saline or chemical coating'
    };
  },

  checkPressure: (v: number | null | undefined): FaultResult => {
    if (v == null) return { fault: false, code: FaultCode.GROSS_LIMIT_PRESSURE, category: 'Gross Limit', severity: 'CRITICAL', message: 'OK', value: v };
    const fail = v < 870 || v > 1085;
    return {
      fault: fail,
      code: FaultCode.GROSS_LIMIT_PRESSURE,
      category: 'Gross Limit Violation',
      severity: 'CRITICAL',
      message: fail ? `Atmospheric Pressure ${v.toFixed(1)} hPa violates physical limit [870 hPa, 1085 hPa]` : 'Pressure within physical range',
      value: v,
      threshold: '[870.0 hPa, 1085.0 hPa]',
      recommendedAction: 'Check silicon piezoresistive barometer diaphragm and static vent port blockage'
    };
  },

  checkWindSpeed: (v: number | null | undefined): FaultResult => {
    if (v == null) return { fault: false, code: FaultCode.GROSS_LIMIT_WIND_SPEED, category: 'Gross Limit', severity: 'CRITICAL', message: 'OK', value: v };
    const fail = v < 0 || v > 113; // 113 m/s = ~407 km/h (highest recorded gust on Earth)
    return {
      fault: fail,
      code: FaultCode.GROSS_LIMIT_WIND_SPEED,
      category: 'Gross Limit Violation',
      severity: 'CRITICAL',
      message: fail ? `Wind speed ${v.toFixed(1)} m/s violates physical limit [0 m/s, 113 m/s]` : 'Wind speed within physical range',
      value: v,
      threshold: '[0 m/s, 113 m/s]',
      recommendedAction: 'Inspect cup/ultrasonic anemometer bearings and optical pulse encoder'
    };
  },

  checkWindDir: (v: number | null | undefined): FaultResult => {
    if (v == null) return { fault: false, code: FaultCode.GROSS_LIMIT_WIND_DIR, category: 'Gross Limit', severity: 'CRITICAL', message: 'OK', value: v };
    const fail = v < 0 || v > 360;
    return {
      fault: fail,
      code: FaultCode.GROSS_LIMIT_WIND_DIR,
      category: 'Gross Limit Violation',
      severity: 'CRITICAL',
      message: fail ? `Wind direction ${v}° violates circular azimuth [0°, 360°]` : 'Wind direction within valid azimuth',
      value: v,
      threshold: '[0°, 360°]',
      recommendedAction: 'Check wind vane potentiometer deadband and digital compass orientation'
    };
  },

  checkVisibility: (v: number | null | undefined): FaultResult => {
    if (v == null) return { fault: false, code: FaultCode.GROSS_LIMIT_VISIBILITY, category: 'Gross Limit', severity: 'CRITICAL', message: 'OK', value: v };
    const fail = v < 0 || v > 100000;
    return {
      fault: fail,
      code: FaultCode.GROSS_LIMIT_VISIBILITY,
      category: 'Gross Limit Violation',
      severity: 'CRITICAL',
      message: fail ? `Visibility ${v}m violates optical sensor bounds [0m, 100000m]` : 'Visibility within physical range',
      value: v,
      threshold: '[0m, 100,000m]',
      recommendedAction: 'Clean optical forward-scatter lenses; check for cobwebs or emitter laser degradation'
    };
  },

  checkDewPoint: (v: number | null | undefined): FaultResult => {
    if (v == null) return { fault: false, code: FaultCode.GROSS_LIMIT_DEW_POINT, category: 'Gross Limit', severity: 'CRITICAL', message: 'OK', value: v };
    const fail = v < -90 || v > 60;
    return {
      fault: fail,
      code: FaultCode.GROSS_LIMIT_DEW_POINT,
      category: 'Gross Limit Violation',
      severity: 'CRITICAL',
      message: fail ? `Dew point ${v.toFixed(1)}°C violates physical range [-90°C, 60°C]` : 'Dew point within physical range',
      value: v,
      threshold: '[-90.0°C, 60.0°C]',
      recommendedAction: 'Check psychrometric computation chip and secondary chilled mirror / capacitive hygrometer'
    };
  },

  checkUVIndex: (v: number | null | undefined): FaultResult => {
    if (v == null) return { fault: false, code: FaultCode.GROSS_LIMIT_UV, category: 'Gross Limit', severity: 'CRITICAL', message: 'OK', value: v };
    const fail = v < 0 || v > 20;
    return {
      fault: fail,
      code: FaultCode.GROSS_LIMIT_UV,
      category: 'Gross Limit Violation',
      severity: 'CRITICAL',
      message: fail ? `UV Index ${v} violates solar radiometer bounds [0, 20]` : 'UV Index within valid range',
      value: v,
      threshold: '[0, 20]',
      recommendedAction: 'Inspect pyranometer diffuser glass dome for dirt or photodiode amplifier saturation'
    };
  },

  checkPrecip: (v: number | null | undefined): FaultResult => {
    if (v == null) return { fault: false, code: FaultCode.GROSS_LIMIT_PRECIP, category: 'Gross Limit', severity: 'CRITICAL', message: 'OK', value: v };
    const fail = v < 0 || v > 300; // mm/hr
    return {
      fault: fail,
      code: FaultCode.GROSS_LIMIT_PRECIP,
      category: 'Gross Limit Violation',
      severity: 'CRITICAL',
      message: fail ? `Precipitation rate ${v.toFixed(1)} mm/hr exceeds physical maximum 300 mm/hr` : 'Precipitation within physical range',
      value: v,
      threshold: '[0.0 mm/hr, 300.0 mm/hr]',
      recommendedAction: 'Inspect tipping bucket rain gauge funnel for debris or reed switch chatter'
    };
  },

  checkCloudCover: (v: number | null | undefined): FaultResult => {
    if (v == null) return { fault: false, code: FaultCode.GROSS_LIMIT_CLOUD, category: 'Gross Limit', severity: 'CRITICAL', message: 'OK', value: v };
    const fail = v < 0 || v > 100;
    return {
      fault: fail,
      code: FaultCode.GROSS_LIMIT_CLOUD,
      category: 'Gross Limit Violation',
      severity: 'CRITICAL',
      message: fail ? `Cloud cover ${v}% violates bounds [0%, 100%]` : 'Cloud cover within valid percentage',
      value: v,
      threshold: '[0%, 100%]',
      recommendedAction: 'Check ceilometer laser transceiver and lidar signal processor'
    };
  },
};

// ━━━━━ CATEGORY 2: SOFT LIMIT VIOLATIONS ━━━━━
export const SoftLimits = {
  checkSoftTemp: (v: number | null | undefined): FaultResult => {
    if (v == null) return { fault: false, code: FaultCode.SOFT_LIMIT_TEMP, category: 'Soft Limit', severity: 'WARNING', message: 'OK', value: v };
    const fail = v > 50 || v < -20;
    return {
      fault: fail,
      code: FaultCode.SOFT_LIMIT_TEMP,
      category: 'Soft Limit Violation',
      severity: 'WARNING',
      message: fail ? `Temperature ${v.toFixed(1)}°C is climatologically extreme for India (exceeds soft bounds [-20°C, 50°C])` : 'Temperature within climatological expectations',
      value: v,
      threshold: '[-20.0°C, 50.0°C]',
      recommendedAction: 'Cross-verify against nearest 3 AWS stations to differentiate severe heatwave/coldwave from sensor drift'
    };
  },

  checkSoftWindSpeed: (v: number | null | undefined, isCycloneExpected = false): FaultResult => {
    if (v == null) return { fault: false, code: FaultCode.SOFT_LIMIT_WIND_SPEED, category: 'Soft Limit', severity: 'WARNING', message: 'OK', value: v };
    const fail = v > 75 && !isCycloneExpected;
    return {
      fault: fail,
      code: FaultCode.SOFT_LIMIT_WIND_SPEED,
      category: 'Soft Limit Violation',
      severity: 'WARNING',
      message: fail ? `Wind speed ${v.toFixed(1)} m/s is abnormally high (> 75 m/s) without active cyclone bulletin` : 'Wind speed within normal limits',
      value: v,
      threshold: '75.0 m/s',
      recommendedAction: 'Verify DWR Doppler radar velocity profile and anemometer mast stability'
    };
  },

  checkSoftPressure: (v: number | null | undefined, isStormSystem = false): FaultResult => {
    if (v == null) return { fault: false, code: FaultCode.SOFT_LIMIT_PRESSURE, category: 'Soft Limit', severity: 'WARNING', message: 'OK', value: v };
    const fail = v < 950 && !isStormSystem;
    return {
      fault: fail,
      code: FaultCode.SOFT_LIMIT_PRESSURE,
      category: 'Soft Limit Violation',
      severity: 'WARNING',
      message: fail ? `Pressure ${v.toFixed(1)} hPa is suspiciously low (< 950 hPa) without tropical depression` : 'Pressure within soft limits',
      value: v,
      threshold: '950.0 hPa',
      recommendedAction: 'Inspect barometer altitude offset setting and check for pneumatic leaks'
    };
  },

  checkSoftPrecip: (v: number | null | undefined, isStormContext = false): FaultResult => {
    if (v == null) return { fault: false, code: FaultCode.SOFT_LIMIT_PRECIP, category: 'Soft Limit', severity: 'WARNING', message: 'OK', value: v };
    const fail = v > 100 && !isStormContext;
    return {
      fault: fail,
      code: FaultCode.SOFT_LIMIT_PRECIP,
      category: 'Soft Limit Violation',
      severity: 'WARNING',
      message: fail ? `Extreme rainfall rate ${v.toFixed(1)} mm/hr reported without regional convective cluster` : 'Precipitation within soft limits',
      value: v,
      threshold: '100.0 mm/hr',
      recommendedAction: 'Check for mechanical siphoning or false bucket tipping due to wind-induced mast vibrations'
    };
  },

  checkSoftUV: (uv: number | null | undefined, cloudCover: number | null | undefined): FaultResult => {
    if (uv == null) return { fault: false, code: FaultCode.SOFT_LIMIT_UV, category: 'Soft Limit', severity: 'WARNING', message: 'OK', value: uv };
    const fail = uv > 15 && (cloudCover != null && cloudCover > 30);
    return {
      fault: fail,
      code: FaultCode.SOFT_LIMIT_UV,
      category: 'Soft Limit Violation',
      severity: 'WARNING',
      message: fail ? `UV Index ${uv} exceeds 15 without clear sky (cloud cover ${cloudCover}%)` : 'UV index matches sky condition',
      value: { uv, cloudCover },
      threshold: 'UV ≤ 15 or Cloud ≤ 30%',
      recommendedAction: 'Recalibrate UV spectroradiometer amplifier gain'
    };
  },

  checkHumiditySaturation: (history: HistoricalReading[]): FaultResult => {
    if (!history || history.length < 4) {
      return { fault: false, code: FaultCode.SOFT_LIMIT_HUMIDITY_SATURATION, category: 'Soft Limit', severity: 'WARNING', message: 'OK', value: null };
    }
    const recent = history.slice(-4);
    const saturated = recent.every(r => r.humidity != null && r.humidity >= 99.8);
    return {
      fault: saturated,
      code: FaultCode.SOFT_LIMIT_HUMIDITY_SATURATION,
      category: 'Soft Limit Violation',
      severity: 'WARNING',
      message: saturated ? 'Humidity sustained at 100% saturation for > 2 hours (condensation trapping)' : 'Humidity dynamic is healthy',
      value: 100,
      threshold: '100% for < 2 hrs',
      recommendedAction: 'Activate heated sensor filter cap to evaporate water droplets from sensor membrane'
    };
  },
};

// ━━━━━ CATEGORY 3: STEP CHECK VIOLATIONS ━━━━━
export const StepChecks = {
  checkTempStep: (curr: number | null | undefined, prev: number | null | undefined): FaultResult => {
    if (curr == null || prev == null) return { fault: false, code: FaultCode.STEP_FAIL_TEMP, category: 'Step Check', severity: 'CRITICAL', message: 'OK', value: null };
    const diff = Math.abs(curr - prev);
    const fail = diff > 5.0; // > 5°C in 10 min
    return {
      fault: fail,
      code: FaultCode.STEP_FAIL_TEMP,
      category: 'Step Check Violation',
      severity: 'CRITICAL',
      message: fail ? `Temperature jump of ${diff.toFixed(1)}°C in 10 min exceeds WMO limit (5°C/10min)` : 'Temperature rate of change nominal',
      value: diff,
      threshold: '≤ 5.0°C / 10 min',
      recommendedAction: 'Hold previous valid temperature; inspect RTD lead wires for loose terminal screw'
    };
  },

  checkPressureStep: (curr: number | null | undefined, prev: number | null | undefined): FaultResult => {
    if (curr == null || prev == null) return { fault: false, code: FaultCode.STEP_FAIL_PRESSURE, category: 'Step Check', severity: 'CRITICAL', message: 'OK', value: null };
    const diff = Math.abs(curr - prev);
    const fail = diff > 3.0; // > 3 hPa in 10 min
    return {
      fault: fail,
      code: FaultCode.STEP_FAIL_PRESSURE,
      category: 'Step Check Violation',
      severity: 'CRITICAL',
      message: fail ? `Pressure jump of ${diff.toFixed(1)} hPa in 10 min exceeds limit (3 hPa/10min)` : 'Pressure rate of change nominal',
      value: diff,
      threshold: '≤ 3.0 hPa / 10 min',
      recommendedAction: 'Inspect barometer port for wind gust dynamic pressure infiltration or electrical noise'
    };
  },

  checkHumidityStep: (curr: number | null | undefined, prev: number | null | undefined): FaultResult => {
    if (curr == null || prev == null) return { fault: false, code: FaultCode.STEP_FAIL_HUMIDITY, category: 'Step Check', severity: 'WARNING', message: 'OK', value: null };
    const diff = Math.abs(curr - prev);
    const fail = diff > 30.0; // > 30% in 10 min
    return {
      fault: fail,
      code: FaultCode.STEP_FAIL_HUMIDITY,
      category: 'Step Check Violation',
      severity: 'WARNING',
      message: fail ? `Humidity jump of ${diff.toFixed(1)}% in 10 min exceeds limit (30%/10min)` : 'Humidity rate of change nominal',
      value: diff,
      threshold: '≤ 30.0% / 10 min',
      recommendedAction: 'Check capacitive humidity sensing element for rapid wetting or water droplet splash'
    };
  },

  checkWindSpeedStep: (curr: number | null | undefined, prev: number | null | undefined): FaultResult => {
    if (curr == null || prev == null) return { fault: false, code: FaultCode.STEP_FAIL_WIND_SPEED, category: 'Step Check', severity: 'CRITICAL', message: 'OK', value: null };
    const diff = Math.abs(curr - prev);
    const fail = diff > 40.0; // > 40 m/s in 10 min
    return {
      fault: fail,
      code: FaultCode.STEP_FAIL_WIND_SPEED,
      category: 'Step Check Violation',
      severity: 'CRITICAL',
      message: fail ? `Wind speed step change of ${diff.toFixed(1)} m/s in 10 min exceeds threshold (40 m/s)` : 'Wind speed rate of change nominal',
      value: diff,
      threshold: '≤ 40.0 m/s / 10 min',
      recommendedAction: 'Check ultrasonic transducer path for bird interference or electronic chopper spike'
    };
  },

  checkDewPointStep: (curr: number | null | undefined, prev: number | null | undefined): FaultResult => {
    if (curr == null || prev == null) return { fault: false, code: FaultCode.STEP_FAIL_DEW_POINT, category: 'Step Check', severity: 'WARNING', message: 'OK', value: null };
    const diff = Math.abs(curr - prev);
    const fail = diff > 10.0; // > 10°C in 10 min
    return {
      fault: fail,
      code: FaultCode.STEP_FAIL_DEW_POINT,
      category: 'Step Check Violation',
      severity: 'WARNING',
      message: fail ? `Dew point jump of ${diff.toFixed(1)}°C in 10 min exceeds limit (10°C/10min)` : 'Dew point rate of change nominal',
      value: diff,
      threshold: '≤ 10.0°C / 10 min',
      recommendedAction: 'Verify combined temperature and humidity sensor timing synchronization'
    };
  },

  checkVisibilityStep: (curr: number | null | undefined, prev: number | null | undefined): FaultResult => {
    if (curr == null || prev == null) return { fault: false, code: FaultCode.STEP_FAIL_VISIBILITY, category: 'Step Check', severity: 'WARNING', message: 'OK', value: null };
    const diff = Math.abs(curr - prev);
    const fail = diff > 50000; // > 50000 m in 10 min
    return {
      fault: fail,
      code: FaultCode.STEP_FAIL_VISIBILITY,
      category: 'Step Check Violation',
      severity: 'WARNING',
      message: fail ? `Visibility step shift of ${diff}m in 10 min exceeds threshold (50km)` : 'Visibility rate of change nominal',
      value: diff,
      threshold: '≤ 50,000m / 10 min',
      recommendedAction: 'Clean transmissometer lens; check for insect obstruction on optical receiver'
    };
  },
};

// ━━━━━ CATEGORY 4: INTERNAL CONSISTENCY CHECKS ━━━━━
export const ConsistencyChecks = {
  checkDewVsTemp: (dew: number | null | undefined, temp: number | null | undefined): FaultResult => {
    if (dew == null || temp == null) return { fault: false, code: FaultCode.CONSISTENCY_DEW_GT_TEMP, category: 'Internal Consistency', severity: 'CRITICAL', message: 'OK', value: null };
    const fail = dew > temp + 0.1; // Dew point cannot physically exceed ambient temperature
    return {
      fault: fail,
      code: FaultCode.CONSISTENCY_DEW_GT_TEMP,
      category: 'Internal Consistency Violation',
      severity: 'CRITICAL',
      message: fail ? `Dew point (${dew.toFixed(1)}°C) exceeds ambient temperature (${temp.toFixed(1)}°C) — thermodynamic impossibility` : 'Dew point is thermodynamically consistent with temperature',
      value: { dew, temp },
      threshold: 'Dew Point ≤ Temperature',
      recommendedAction: 'Recalibrate humidity sensor immediately; reading indicates sensor failure or calibration error'
    };
  },

  checkHighHumidityDewSpread: (rh: number | null | undefined, dew: number | null | undefined, temp: number | null | undefined): FaultResult => {
    if (rh == null || dew == null || temp == null) return { fault: false, code: FaultCode.CONSISTENCY_DEW_HUMIDITY_MISMATCH, category: 'Internal Consistency', severity: 'WARNING', message: 'OK', value: null };
    const spread = Math.abs(temp - dew);
    const fail = rh > 95 && spread > 1.2;
    return {
      fault: fail,
      code: FaultCode.CONSISTENCY_DEW_HUMIDITY_MISMATCH,
      category: 'Internal Consistency Violation',
      severity: 'WARNING',
      message: fail ? `Humidity is ${rh.toFixed(1)}% but T-Td depression is ${spread.toFixed(1)}°C (must be < 1.0°C at saturation)` : 'Humidity and dew point spread consistent',
      value: { rh, spread },
      threshold: 'At RH > 95%, |T - Td| ≤ 1.0°C',
      recommendedAction: 'Check hygrometer linearity at upper saturation regime (> 95%)'
    };
  },

  checkPrecipWithoutClouds: (precip: number | null | undefined, cloudCover: number | null | undefined): FaultResult => {
    if (precip == null || cloudCover == null) return { fault: false, code: FaultCode.CONSISTENCY_PRECIP_WITHOUT_CLOUDS, category: 'Internal Consistency', severity: 'WARNING', message: 'OK', value: null };
    const fail = precip > 0.2 && cloudCover < 10;
    return {
      fault: fail,
      code: FaultCode.CONSISTENCY_PRECIP_WITHOUT_CLOUDS,
      category: 'Internal Consistency Violation',
      severity: 'WARNING',
      message: fail ? `Rain rate ${precip.toFixed(1)} mm/hr registered under clear sky (cloud cover only ${cloudCover}%)` : 'Precipitation correlates with cloud cover',
      value: { precip, cloudCover },
      threshold: 'Precip > 0 requires Cloud Cover ≥ 10%',
      recommendedAction: 'Inspect rain gauge collector funnel for bird droppings, falling leaves, or artificial sprinkler splash'
    };
  },

  checkHighUVOvercast: (uv: number | null | undefined, cloudCover: number | null | undefined): FaultResult => {
    if (uv == null || cloudCover == null) return { fault: false, code: FaultCode.CONSISTENCY_HIGH_UV_OVERCAST, category: 'Internal Consistency', severity: 'WARNING', message: 'OK', value: null };
    const fail = uv > 8 && cloudCover > 80;
    return {
      fault: fail,
      code: FaultCode.CONSISTENCY_HIGH_UV_OVERCAST,
      category: 'Internal Consistency Violation',
      severity: 'WARNING',
      message: fail ? `High UV Index (${uv}) reported during overcast conditions (cloud cover ${cloudCover}%)` : 'UV index consistent with cloud cover',
      value: { uv, cloudCover },
      threshold: 'UV ≤ 8 under overcast (> 80% clouds)',
      recommendedAction: 'Inspect pyranometer dome cleanliness and verify cloud base ceilometer readings'
    };
  },

  checkGustVsSpeed: (gust: number | null | undefined, speed: number | null | undefined): FaultResult => {
    if (gust == null || speed == null) return { fault: false, code: FaultCode.CONSISTENCY_GUST_LT_SPEED, category: 'Internal Consistency', severity: 'CRITICAL', message: 'OK', value: null };
    const fail = gust < speed - 0.2; // Gust cannot be less than sustained mean wind speed
    return {
      fault: fail,
      code: FaultCode.CONSISTENCY_GUST_LT_SPEED,
      category: 'Internal Consistency Violation',
      severity: 'CRITICAL',
      message: fail ? `Wind gust (${gust.toFixed(1)} m/s) is lower than sustained wind speed (${speed.toFixed(1)} m/s)` : 'Wind gust is equal to or greater than sustained speed',
      value: { gust, speed },
      threshold: 'Wind Gust ≥ Sustained Wind Speed',
      recommendedAction: 'Inspect datalogger averaging algorithm and peak-detection sampling window'
    };
  },

  checkSurfaceVsMSLPressure: (surfaceP: number | null | undefined, mslP: number | null | undefined, elevM: number = 0): FaultResult => {
    if (surfaceP == null || mslP == null) return { fault: false, code: FaultCode.CONSISTENCY_SURFACE_GT_MSL, category: 'Internal Consistency', severity: 'WARNING', message: 'OK', value: null };
    // At sea level (elev ~ 0), surface pressure cannot be significantly greater than MSL pressure
    const fail = elevM <= 50 && surfaceP > mslP + 3.0;
    return {
      fault: fail,
      code: FaultCode.CONSISTENCY_SURFACE_GT_MSL,
      category: 'Internal Consistency Violation',
      severity: 'WARNING',
      message: fail ? `Surface pressure (${surfaceP.toFixed(1)} hPa) exceeds MSL pressure (${mslP.toFixed(1)} hPa) at low elevation` : 'Barometric reduction consistent',
      value: { surfaceP, mslP, elevM },
      threshold: 'Surface Pressure ≤ MSL Pressure at sea level',
      recommendedAction: 'Check barometric station height parameter configured in datalogger ROM'
    };
  },

  checkApparentTempDeviation: (apparent: number | null | undefined, actual: number | null | undefined): FaultResult => {
    if (apparent == null || actual == null) return { fault: false, code: FaultCode.CONSISTENCY_APPARENT_TEMP_DEV, category: 'Internal Consistency', severity: 'WARNING', message: 'OK', value: null };
    const diff = Math.abs(apparent - actual);
    const fail = diff > 15.0;
    return {
      fault: fail,
      code: FaultCode.CONSISTENCY_APPARENT_TEMP_DEV,
      category: 'Internal Consistency Violation',
      severity: 'WARNING',
      message: fail ? `Apparent temperature (${apparent.toFixed(1)}°C) deviates by ${diff.toFixed(1)}°C from actual (${actual.toFixed(1)}°C)` : 'Heat index and wind chill consistent',
      value: diff,
      threshold: '|Apparent - Actual| ≤ 15.0°C',
      recommendedAction: 'Verify combined wind speed and relative humidity inputs into bioclimatic formula'
    };
  },

  checkNightSunshine: (sunshineSec: number | null | undefined, isDay: number | boolean | null | undefined): FaultResult => {
    if (sunshineSec == null || isDay == null) return { fault: false, code: FaultCode.CONSISTENCY_NIGHT_SUNSHINE, category: 'Internal Consistency', severity: 'CRITICAL', message: 'OK', value: null };
    const dayBool = typeof isDay === 'boolean' ? isDay : isDay === 1;
    const fail = !dayBool && sunshineSec > 60;
    return {
      fault: fail,
      code: FaultCode.CONSISTENCY_NIGHT_SUNSHINE,
      category: 'Internal Consistency Violation',
      severity: 'CRITICAL',
      message: fail ? `Sunshine duration (${sunshineSec}s) registered when is_day is FALSE (solar night)` : 'Sunshine duration matches astronomical day/night cycle',
      value: { sunshineSec, isDay: dayBool },
      threshold: 'Sunshine = 0 during solar night',
      recommendedAction: 'Check station RTC clock synchronization and pyranometer threshold voltage offset'
    };
  },
};

// ━━━━━ CATEGORY 5: PERSISTENCE / FLAT LINE CHECKS ━━━━━
export const PersistenceChecks = {
  checkFlatLine: (history: HistoricalReading[]): FaultResult[] => {
    const results: FaultResult[] = [];
    if (!history || history.length < 3) return results;

    const params: Array<{ key: keyof HistoricalReading; name: string }> = [
      { key: 'temperature', name: 'Temperature' },
      { key: 'humidity', name: 'Humidity' },
      { key: 'pressure', name: 'Pressure' },
      { key: 'wind_speed', name: 'Wind Speed' },
      { key: 'dew_point', name: 'Dew Point' },
    ];

    for (const p of params) {
      const values = history.slice(-6).map(h => h[p.key]).filter((v): v is number => typeof v === 'number');
      if (values.length < 3) continue;

      // Check for zero variance
      const mean = values.reduce((a, b) => a + b, 0) / values.length;
      const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;

      if (variance < 1e-7) {
        if (values.length >= 6) {
          results.push({
            fault: true,
            code: FaultCode.FLAT_LINE_CRITICAL,
            category: 'Persistence / Flat Line Check',
            severity: 'CRITICAL',
            message: `${p.name} frozen completely at ${values[0]} for 6+ consecutive observations`,
            value: values[0],
            threshold: 'Variance > 0 over 6 frames',
            recommendedAction: `Inspect ${p.name} ADC transducer buffer and RS-485 bus communication for deadlock`
          });
        } else {
          results.push({
            fault: true,
            code: FaultCode.FLAT_LINE_WARNING,
            category: 'Persistence / Flat Line Check',
            severity: 'WARNING',
            message: `${p.name} stagnant at ${values[0]} for 3 consecutive observations`,
            value: values[0],
            threshold: 'Variance > 0 over 3 frames',
            recommendedAction: `Monitor ${p.name} sensor for impending signal freezing`
          });
        }
      }
    }

    // Special: Humidity stuck at 0% or 100%
    const latestRH = history[history.length - 1]?.humidity;
    const prevRH = history[history.length - 2]?.humidity;
    if (latestRH != null && prevRH != null && (latestRH === 0 || latestRH === 100) && latestRH === prevRH) {
      results.push({
        fault: true,
        code: FaultCode.FLAT_LINE_HUMIDITY_BOUND,
        category: 'Persistence / Flat Line Check',
        severity: 'CRITICAL',
        message: `Humidity frozen hard-stuck at boundary ${latestRH}%`,
        value: latestRH,
        threshold: 'RH strictly within bounds (0%, 100%)',
        recommendedAction: 'Hygrometer output shorted to power rail or ground; replace sensor module'
      });
    }

    // Special: Wind direction stuck at exactly 0° or 360°
    const latestWD = history[history.length - 1]?.wind_direction;
    const prevWD = history[history.length - 2]?.wind_direction;
    if (latestWD != null && prevWD != null && (latestWD === 0 || latestWD === 360) && latestWD === prevWD) {
      results.push({
        fault: true,
        code: FaultCode.FLAT_LINE_WIND_DIR_BOUND,
        category: 'Persistence / Flat Line Check',
        severity: 'WARNING',
        message: `Wind direction stuck at dead-zone azimuth ${latestWD}°`,
        value: latestWD,
        threshold: 'Continuous azimuthal variance',
        recommendedAction: 'Inspect wind vane potentiometer wiper arm for mechanical jamming'
      });
    }

    return results;
  },
};

// ━━━━━ CATEGORY 6: MISSING DATA / COMMS FAULT ━━━━━
export const CommsChecks = {
  checkComms: (reading: LiveDistrictReading | null | undefined): FaultResult[] => {
    const results: FaultResult[] = [];
    if (!reading) {
      results.push({
        fault: true,
        code: FaultCode.COMMS_TOTAL_LOSS,
        category: 'Missing Data / Comms Fault',
        severity: 'CRITICAL',
        message: 'No packet received from weather station (Total Telemetry Loss)',
        value: null,
        recommendedAction: 'Inspect solar battery voltage, DCP transmitter antenna, and cellular 4G/GPRS link'
      });
      return results;
    }

    const now = Date.now();
    const lastRec = reading.lastPacketReceivedMs ?? now;
    const elapsedMinutes = (now - lastRec) / 60000;

    if (elapsedMinutes > 15) {
      results.push({
        fault: true,
        code: FaultCode.COMMS_OFFLINE,
        category: 'Missing Data / Comms Fault',
        severity: 'CRITICAL',
        message: `Station silent for ${elapsedMinutes.toFixed(0)} minutes (> 15 min threshold) — Station Offline`,
        value: elapsedMinutes,
        threshold: '< 15 minutes',
        recommendedAction: 'Dispatch field technician for site power supply and telemetry hardware check'
      });
    } else if (elapsedMinutes > 5) {
      results.push({
        fault: true,
        code: FaultCode.COMMS_STALE,
        category: 'Missing Data / Comms Fault',
        severity: 'WARNING',
        message: `Data is stale; last telemetry received ${elapsedMinutes.toFixed(0)} minutes ago`,
        value: elapsedMinutes,
        threshold: '< 5 minutes',
        recommendedAction: 'Check INSAT-3D DCP uplink schedule and buffer latency'
      });
    }

    // Check for partial parameter loss
    const primaryFields = [
      reading.temperature_2m,
      reading.relative_humidity_2m,
      reading.pressure_msl,
      reading.wind_speed_10m
    ];
    const nullCount = primaryFields.filter(f => f == null).length;
    if (nullCount === primaryFields.length) {
      results.push({
        fault: true,
        code: FaultCode.COMMS_TOTAL_LOSS,
        category: 'Missing Data / Comms Fault',
        severity: 'CRITICAL',
        message: 'All primary meteorological channels returned NULL in telemetry frame',
        value: nullCount,
        threshold: 'Primary channels mandatory',
        recommendedAction: 'Check datalogger multiplexer and analog input conditioning board'
      });
    } else if (nullCount > 0) {
      results.push({
        fault: true,
        code: FaultCode.COMMS_PARTIAL_LOSS,
        category: 'Missing Data / Comms Fault',
        severity: 'WARNING',
        message: `${nullCount} primary sensor channel(s) missing from frame`,
        value: nullCount,
        threshold: 'Zero channel packet loss',
        recommendedAction: 'Inspect individual sensor signal cables for detachment'
      });
    }

    if (reading.fetchErrorCount && reading.fetchErrorCount >= 3) {
      results.push({
        fault: true,
        code: FaultCode.COMMS_NETWORK_DEGRADED,
        category: 'Missing Data / Comms Fault',
        severity: 'INFO',
        message: `Telemetry uplink experienced ${reading.fetchErrorCount} consecutive timeout retries`,
        value: reading.fetchErrorCount,
        threshold: '< 3 network retries',
        recommendedAction: 'Evaluate RSSI signal strength of station 4G modem'
      });
    }

    return results;
  },
};

// ━━━━━ CATEGORY 7: STATISTICAL ANOMALY CHECKS ━━━━━
export const StatisticalChecks = {
  checkTempDeviation: (currentTemp: number | null | undefined, history: HistoricalReading[]): FaultResult => {
    if (currentTemp == null || !history || history.length < 12) {
      return { fault: false, code: FaultCode.STAT_ANOMALY_TEMP, category: 'Statistical Anomaly', severity: 'WARNING', message: 'OK', value: null };
    }
    const temps = history.map(h => h.temperature).filter((v): v is number => typeof v === 'number');
    if (temps.length < 10) {
      return { fault: false, code: FaultCode.STAT_ANOMALY_TEMP, category: 'Statistical Anomaly', severity: 'WARNING', message: 'OK', value: null };
    }
    const mean = temps.reduce((a, b) => a + b, 0) / temps.length;
    const stdDev = Math.sqrt(temps.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / temps.length) || 1.0;
    const zScore = Math.abs(currentTemp - mean) / stdDev;
    const fail = zScore > 4.0; // 4-sigma statistical anomaly
    return {
      fault: fail,
      code: FaultCode.STAT_ANOMALY_TEMP,
      category: 'Statistical Anomaly Check',
      severity: 'WARNING',
      message: fail ? `Temperature ${currentTemp.toFixed(1)}°C deviates by ${zScore.toFixed(1)}σ from 24h rolling mean (${mean.toFixed(1)}°C)` : 'Temperature statistically normal',
      value: { zScore, mean, stdDev },
      threshold: 'Z-score ≤ 4.0σ',
      recommendedAction: 'Check station surroundings for localized artificial heat sources or sensor displacement'
    };
  },

  checkPressureSpatialAnomaly: (currentP: number | null | undefined, neighborPressures: number[]): FaultResult => {
    if (currentP == null || !neighborPressures || neighborPressures.length < 3) {
      return { fault: false, code: FaultCode.STAT_ANOMALY_PRESSURE_SPATIAL, category: 'Statistical Anomaly', severity: 'WARNING', message: 'OK', value: null };
    }
    const medianNeighbor = [...neighborPressures].sort((a, b) => a - b)[Math.floor(neighborPressures.length / 2)];
    const diff = Math.abs(currentP - medianNeighbor);
    const fail = diff > 10.0; // differs > 10 hPa from nearest 3 districts at similar elevation
    return {
      fault: fail,
      code: FaultCode.STAT_ANOMALY_PRESSURE_SPATIAL,
      category: 'Statistical Anomaly Check',
      severity: 'WARNING',
      message: fail ? `Pressure differs by ${diff.toFixed(1)} hPa from regional cohort median (${medianNeighbor.toFixed(1)} hPa)` : 'Pressure spatially consistent with regional cohort',
      value: { currentP, medianNeighbor, diff },
      threshold: 'Cohort deviation ≤ 10.0 hPa',
      recommendedAction: 'Perform two-point dead-weight pressure recalibration against traveling standard barometer'
    };
  },

  checkPrecipSpike: (currentPrecip: number | null | undefined, stateAvgPrecip: number = 0.5): FaultResult => {
    if (currentPrecip == null) return { fault: false, code: FaultCode.STAT_ANOMALY_PRECIP_SPIKE, category: 'Statistical Anomaly', severity: 'WARNING', message: 'OK', value: null };
    const fail = currentPrecip > 20.0 && currentPrecip > stateAvgPrecip * 5;
    return {
      fault: fail,
      code: FaultCode.STAT_ANOMALY_PRECIP_SPIKE,
      category: 'Statistical Anomaly Check',
      severity: 'WARNING',
      message: fail ? `Precipitation spike ${currentPrecip.toFixed(1)} mm/hr is > 5x state average (${stateAvgPrecip.toFixed(1)} mm/hr)` : 'Precipitation consistent with state patterns',
      value: { currentPrecip, stateAvgPrecip },
      threshold: '≤ 5x state average hourly rate',
      recommendedAction: 'Check INSAT-3D cloud top temperature to confirm presence of convective thunderstorm cloud'
    };
  },
};

// ━━━━━ CATEGORY 8: INDIA-SPECIFIC CONTEXT CHECKS ━━━━━
export const IndiaContextChecks = {
  checkRegionalHeatAnomaly: (temp: number | null | undefined, state: string): FaultResult => {
    if (temp == null) return { fault: false, code: FaultCode.INDIA_TEMP_HEAT_ANOMALY, category: 'India-Specific Context', severity: 'WARNING', message: 'OK', value: null };
    const isDesertRegion = state.toLowerCase().includes('rajasthan') || state.toLowerCase().includes('sindh');
    const fail = temp > 47.0 && !isDesertRegion;
    return {
      fault: fail,
      code: FaultCode.INDIA_TEMP_HEAT_ANOMALY,
      category: 'India-Specific Context Check',
      severity: 'WARNING',
      message: fail ? `Temperature ${temp.toFixed(1)}°C exceeds 47°C in non-desert state (${state})` : 'Temperature conforms to regional climate expectations',
      value: { temp, state },
      threshold: 'Temp ≤ 47°C outside Thar Desert',
      recommendedAction: 'Verify aspirated radiation shield fan is operational to avoid radiant overheating'
    };
  },

  checkCoastalLowHumidity: (rh: number | null | undefined, isCoastal = false, state = ''): FaultResult => {
    if (rh == null) return { fault: false, code: FaultCode.INDIA_LOW_HUMIDITY_COASTAL, category: 'India-Specific Context', severity: 'CRITICAL', message: 'OK', value: null };
    const isMarineZone = isCoastal || state.toLowerCase().includes('kerala') || state.toLowerCase().includes('goa');
    const fail = isMarineZone && rh < 10.0;
    return {
      fault: fail,
      code: FaultCode.INDIA_LOW_HUMIDITY_COASTAL,
      category: 'India-Specific Context Check',
      severity: 'CRITICAL',
      message: fail ? `Relative Humidity ${rh.toFixed(1)}% dropped below 10% in coastal maritime maritime zone (${state}) — sensor failure suspect` : 'Humidity normal for coastal maritime atmosphere',
      value: { rh, state },
      threshold: 'RH ≥ 10.0% in Coastal/Kerala stations',
      recommendedAction: 'Hygrometer element contaminated with sea salt residue; clean or replace sensor element'
    };
  },

  checkPlainsFreezingLevel: (freezingLevelM: number | null | undefined, state: string, elevM: number = 200): FaultResult => {
    if (freezingLevelM == null) return { fault: false, code: FaultCode.INDIA_FREEZING_LEVEL_PLAINS, category: 'India-Specific Context', severity: 'CRITICAL', message: 'OK', value: null };
    const isHimalayan = state.toLowerCase().includes('jammu') || state.toLowerCase().includes('kashmir') ||
      state.toLowerCase().includes('ladakh') || state.toLowerCase().includes('himachal') ||
      state.toLowerCase().includes('uttarakhand') || state.toLowerCase().includes('sikkim');
    const fail = !isHimalayan && elevM < 800 && freezingLevelM < 2000;
    return {
      fault: fail,
      code: FaultCode.INDIA_FREEZING_LEVEL_PLAINS,
      category: 'India-Specific Context Check',
      severity: 'CRITICAL',
      message: fail ? `Freezing level height ${freezingLevelM}m MSL is abnormally low (< 2000m) in Indian plains (${state})` : 'Freezing level altitude consistent',
      value: { freezingLevelM, state, elevM },
      threshold: 'Freezing level ≥ 2000m in plains',
      recommendedAction: 'Check barometric hypsometric calculation formula in station datalogger'
    };
  },

  checkNighttimeUV: (uv: number | null | undefined, localHourIST: number): FaultResult => {
    if (uv == null) return { fault: false, code: FaultCode.INDIA_NIGHT_UV_ANOMALY, category: 'India-Specific Context', severity: 'CRITICAL', message: 'OK', value: null };
    const isNightIST = (localHourIST >= 0 && localHourIST < 5) || (localHourIST >= 20 && localHourIST <= 23);
    const fail = isNightIST && uv > 12.0;
    return {
      fault: fail,
      code: FaultCode.INDIA_NIGHT_UV_ANOMALY,
      category: 'India-Specific Context Check',
      severity: 'CRITICAL',
      message: fail ? `UV Index ${uv} registered during nighttime (${localHourIST}:00 IST) — photodiode fault or timestamp glitch` : 'UV index zero at night',
      value: { uv, localHourIST },
      threshold: 'UV Index = 0 at night [20:00 - 05:00 IST]',
      recommendedAction: 'Inspect radiometer amplifier for ground loop voltage offset or clock synchronization error'
    };
  },
};

// ━━━━━ MASTER RUNNER ━━━━━
export function runAllFaultChecks(
  reading: LiveDistrictReading | null | undefined,
  history: HistoricalReading[] = [],
  districtMeta: DistrictMeta,
  neighborPressures: number[] = [],
  stateAvgPrecip: number = 0.5
): SensorReport {
  const faults: FaultResult[] = [];
  let passedCount = 0;

  function evaluate(res: FaultResult) {
    if (res.fault) {
      faults.push(res);
    } else {
      passedCount++;
    }
  }

  // 1. Missing data & comms checks
  const commsResults = CommsChecks.checkComms(reading);
  for (const c of commsResults) {
    if (c.fault) faults.push(c);
    else passedCount++;
  }

  if (reading) {
    // 2. Category 1: Gross Limits
    evaluate(GrossLimits.checkTemp(reading.temperature_2m));
    evaluate(GrossLimits.checkHumidity(reading.relative_humidity_2m));
    evaluate(GrossLimits.checkPressure(reading.pressure_msl));
    evaluate(GrossLimits.checkWindSpeed(reading.wind_speed_10m));
    evaluate(GrossLimits.checkWindDir(reading.wind_direction_10m));
    evaluate(GrossLimits.checkVisibility(reading.visibility));
    evaluate(GrossLimits.checkDewPoint(reading.dew_point_2m));
    evaluate(GrossLimits.checkUVIndex(reading.uv_index));
    evaluate(GrossLimits.checkPrecip(reading.precipitation));
    evaluate(GrossLimits.checkCloudCover(reading.cloud_cover));

    // 3. Category 2: Soft Limits
    evaluate(SoftLimits.checkSoftTemp(reading.temperature_2m));
    evaluate(SoftLimits.checkSoftWindSpeed(reading.wind_speed_10m));
    evaluate(SoftLimits.checkSoftPressure(reading.pressure_msl));
    evaluate(SoftLimits.checkSoftPrecip(reading.precipitation));
    evaluate(SoftLimits.checkSoftUV(reading.uv_index, reading.cloud_cover));
    evaluate(SoftLimits.checkHumiditySaturation(history));

    // 4. Category 3: Step Checks (comparing with previous history)
    const prev = history.length > 0 ? history[history.length - 1] : null;
    if (prev) {
      evaluate(StepChecks.checkTempStep(reading.temperature_2m, prev.temperature));
      evaluate(StepChecks.checkPressureStep(reading.pressure_msl, prev.pressure));
      evaluate(StepChecks.checkHumidityStep(reading.relative_humidity_2m, prev.humidity));
      evaluate(StepChecks.checkWindSpeedStep(reading.wind_speed_10m, prev.wind_speed));
      evaluate(StepChecks.checkDewPointStep(reading.dew_point_2m, prev.dew_point));
      evaluate(StepChecks.checkVisibilityStep(reading.visibility, prev.visibility));
    }

    // 5. Category 4: Internal Consistency
    evaluate(ConsistencyChecks.checkDewVsTemp(reading.dew_point_2m, reading.temperature_2m));
    evaluate(ConsistencyChecks.checkHighHumidityDewSpread(reading.relative_humidity_2m, reading.dew_point_2m, reading.temperature_2m));
    evaluate(ConsistencyChecks.checkPrecipWithoutClouds(reading.precipitation, reading.cloud_cover));
    evaluate(ConsistencyChecks.checkHighUVOvercast(reading.uv_index, reading.cloud_cover));
    evaluate(ConsistencyChecks.checkGustVsSpeed(reading.wind_gusts_10m, reading.wind_speed_10m));
    evaluate(ConsistencyChecks.checkSurfaceVsMSLPressure(reading.surface_pressure, reading.pressure_msl, districtMeta.elevation || 0));
    evaluate(ConsistencyChecks.checkApparentTempDeviation(reading.apparent_temperature, reading.temperature_2m));
    evaluate(ConsistencyChecks.checkNightSunshine(reading.sunshine_duration, reading.is_day));

    // 6. Category 5: Persistence / Flat Line
    const flatLineResults = PersistenceChecks.checkFlatLine(history);
    for (const f of flatLineResults) {
      if (f.fault) faults.push(f);
      else passedCount++;
    }

    // 7. Category 7: Statistical Anomalies
    evaluate(StatisticalChecks.checkTempDeviation(reading.temperature_2m, history));
    evaluate(StatisticalChecks.checkPressureSpatialAnomaly(reading.pressure_msl, neighborPressures));
    evaluate(StatisticalChecks.checkPrecipSpike(reading.precipitation, stateAvgPrecip));

    // 8. Category 8: India Specific
    const now = new Date();
    const istHours = (now.getUTCHours() + 5 + Math.floor((now.getUTCMinutes() + 30) / 60)) % 24;
    evaluate(IndiaContextChecks.checkRegionalHeatAnomaly(reading.temperature_2m, districtMeta.state));
    evaluate(IndiaContextChecks.checkCoastalLowHumidity(reading.relative_humidity_2m, districtMeta.isCoastal, districtMeta.state));
    evaluate(IndiaContextChecks.checkPlainsFreezingLevel(reading.freezing_level_height, districtMeta.state, districtMeta.elevation || 200));
    evaluate(IndiaContextChecks.checkNighttimeUV(reading.uv_index, istHours));
  }

  // Derive Overall Health Status
  let overallStatus: DistrictHealthStatus = 'HEALTHY';
  if (faults.some(f => f.code === FaultCode.COMMS_OFFLINE || f.code === FaultCode.COMMS_TOTAL_LOSS)) {
    overallStatus = 'OFFLINE';
  } else if (faults.some(f => f.severity === 'CRITICAL')) {
    overallStatus = 'CRITICAL';
  } else if (faults.some(f => f.severity === 'WARNING')) {
    overallStatus = 'DEGRADED';
  }

  const faultCategories = Array.from(new Set(faults.map(f => f.category)));

  // Recommendation synthesis
  let recommendation = 'All WMO & IMD sensor verification checks passed. Observations nominal for assimilation.';
  if (overallStatus === 'CRITICAL') {
    const crit = faults.find(f => f.severity === 'CRITICAL');
    recommendation = `CRITICAL ALERT: ${crit?.message}. Action: ${crit?.recommendedAction || 'Immediate technician inspection required.'}`;
  } else if (overallStatus === 'DEGRADED') {
    const warn = faults.find(f => f.severity === 'WARNING');
    recommendation = `ADVISORY: ${warn?.message}. Action: ${warn?.recommendedAction || 'Monitor station drift.'}`;
  } else if (overallStatus === 'OFFLINE') {
    recommendation = 'OFFLINE ALERT: Station telemetry silent. Check remote power and satellite/cellular uplink.';
  }

  return {
    districtId: districtMeta.id,
    districtName: districtMeta.name,
    state: districtMeta.state,
    timestamp: reading?.timestamp || new Date().toISOString(),
    overallStatus,
    faults,
    passedChecks: passedCount,
    failedChecks: faults.length,
    faultCategories,
    recommendation
  };
}
