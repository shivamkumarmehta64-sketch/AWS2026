/**
 * scripts/verify-heatwave-engine.ts
 * Verification suite for IMD Heatwave Decision Support System (DSS) Engine
 */

import {
  evaluateIMDHeatwave,
  calculateHumidex,
  getHumidexStress,
  getClimatologicalNormalMaxTemp
} from '../lib/heatwaveEngine';
import { IndiaDistrict } from '../lib/india766Districts';
import { LiveDistrictReading, HistoricalReading } from '../lib/sensorFaultEngine';

let totalTests = 0;
let passedTests = 0;

function assert(condition: boolean, testName: string) {
  totalTests++;
  if (condition) {
    console.log(`[PASS] ${testName}`);
    passedTests++;
  } else {
    console.error(`[FAIL] ${testName}`);
  }
}

console.log('================================================================');
console.log('IMD HEATWAVE DECISION SUPPORT SYSTEM (DSS) — VERIFICATION SUITE');
console.log('================================================================\n');

// 1. Climatological Normals
console.log('--- TEST GROUP 1: CLIMATOLOGICAL NORMALS ---');
const normPlains = getClimatologicalNormalMaxTemp(28.6, 77.2, 200, false);
assert(normPlains >= 37.0 && normPlains <= 42.0, `Indo-gangetic plains normal ${normPlains}°C is realistic`);
const normHills = getClimatologicalNormalMaxTemp(32.0, 77.0, 1600, false);
assert(normHills === 24.5, `High altitude hills normal is ${normHills}°C`);
const normCoastal = getClimatologicalNormalMaxTemp(19.0, 72.8, 10, true);
assert(normCoastal === 34.5, `Coastal normal is ${normCoastal}°C`);

// Mock districts
const plainsDistrict: IndiaDistrict = {
  id: 'IN-RJ-JAI',
  name: 'Jaipur',
  state: 'Rajasthan',
  lat: 26.9124,
  lng: 75.7873,
  population: 3100000,
  isCoastal: false
};

const coastalDistrict: IndiaDistrict = {
  id: 'IN-MH-MUM',
  name: 'Mumbai',
  state: 'Maharashtra',
  lat: 19.0760,
  lng: 72.8777,
  population: 12400000,
  isCoastal: true
};

const hillsDistrict: IndiaDistrict = {
  id: 'IN-HP-SHI',
  name: 'Shimla',
  state: 'Himachal Pradesh',
  lat: 31.1048,
  lng: 77.1734,
  population: 170000,
  isCoastal: false
};

// 2. Normal Conditions (Green)
console.log('\n--- TEST GROUP 2: NORMAL CLIMATOLOGICAL BOUNDS ---');
const normalReading: LiveDistrictReading = {
  timestamp: new Date().toISOString(),
  temperature_2m: 32.0,
  relative_humidity_2m: 50,
  apparent_temperature: 33.0,
  precipitation: 0,
  weather_code: 0,
  pressure_msl: 1010,
  surface_pressure: 990,
  wind_speed_10m: 3.5,
  wind_direction_10m: 180,
  wind_gusts_10m: 5.0,
  cloud_cover: 20,
  visibility: 10000,
  uv_index: 6,
  is_day: 1,
  sunshine_duration: 3600,
  dew_point_2m: 20.0,
  freezing_level_height: 4500,
  lastPacketReceivedMs: Date.now(),
  fetchErrorCount: 0
};

const repNormal = evaluateIMDHeatwave(plainsDistrict, normalReading, []);
assert(repNormal.warningLevel === 'NO_WARNING', 'Jaipur at 32°C evaluates to NO_WARNING (Green)');
assert(repNormal.heatwaveStatus === 'NORMAL', 'Jaipur classification is NORMAL');

// 3. Heatwave Criteria in Plains (T >= 40°C & Dep >= 4.5°C)
console.log('\n--- TEST GROUP 3: HEATWAVE IN PLAINS ---');
const hwReading: LiveDistrictReading = {
  ...normalReading,
  temperature_2m: 46.5,
  apparent_temperature: 47.0
};
const repHW = evaluateIMDHeatwave(plainsDistrict, hwReading, []);
assert(repHW.warningLevel === 'ALERT' || repHW.warningLevel === 'WARNING_SEVERE', 'Plains at 46.5°C triggers Heatwave Alert (Orange/Red)');
assert(repHW.heatwaveStatus !== 'NORMAL', 'heatwaveStatus is active');

// 4. Severe Heatwave Criteria in Plains (T >= 47°C or Dep > 6.4°C)
console.log('\n--- TEST GROUP 4: SEVERE HEATWAVE (T >= 47°C) ---');
const severeReading: LiveDistrictReading = {
  ...normalReading,
  temperature_2m: 48.5,
  apparent_temperature: 49.0
};
const repSevere = evaluateIMDHeatwave(plainsDistrict, severeReading, []);
assert(repSevere.warningLevel === 'WARNING_SEVERE', 'Plains at 48.5°C triggers WARNING_SEVERE (Red Alert)');
assert(repSevere.heatwaveStatus === 'SEVERE_HEAT_WAVE', 'Classification is SEVERE_HEAT_WAVE');

// 5. Coastal Heatwave (T >= 37°C)
console.log('\n--- TEST GROUP 5: COASTAL HEATWAVE ---');
const coastalHWReading: LiveDistrictReading = {
  ...normalReading,
  temperature_2m: 39.5,
  apparent_temperature: 40.0
};
const repCoastal = evaluateIMDHeatwave(coastalDistrict, coastalHWReading, []);
assert(repCoastal.warningLevel !== 'NO_WARNING', 'Mumbai at 39.5°C triggers coastal heatwave alert');

// 6. Hills Heatwave (T >= 30°C)
console.log('\n--- TEST GROUP 6: HILLS HEATWAVE ---');
const hillsHWReading: LiveDistrictReading = {
  ...normalReading,
  temperature_2m: 33.5,
  apparent_temperature: 34.0
};
const repHills = evaluateIMDHeatwave(hillsDistrict, hillsHWReading, []);
assert(repHills.warningLevel !== 'NO_WARNING', 'Shimla at 33.5°C triggers hills heatwave alert');

// 7. Humidex Calculation & Stress Categories
console.log('\n--- TEST GROUP 7: BIOCLIMATIC HUMIDEX ---');
const h1 = calculateHumidex(32, 70); // Warm and humid
assert(h1 > 40, `Humidex for 32°C at 70% RH is ${h1} > 40`);
const stress1 = getHumidexStress(h1);
assert(stress1 === 'Extreme Caution' || stress1 === 'Danger', `Humidex categorized as ${stress1}`);

const h2 = calculateHumidex(22, 40); // Mild
assert(getHumidexStress(h2) === 'Comfortable', 'Humidex for 22°C at 40% RH is Comfortable');

// 8. 5-Day Horizon Outlook
console.log('\n--- TEST GROUP 8: 5-DAY HORIZON OUTLOOK ---');
assert(repSevere.dayForecast.length === 5, '5-day forecast horizon generates exactly 5 days');
assert(repSevere.dayForecast[0].day === 1, 'Day 1 outlook initialized');
assert(repSevere.dayForecast[4].day === 5, 'Day 5 outlook initialized');

// 9. NDMA Health Advisories
console.log('\n--- TEST GROUP 9: NDMA / MoES ADVISORIES ---');
assert(repSevere.healthAdvisory.length > 0, 'Health advisories populated for severe heatwave');

console.log('\n================================================================');
console.log(`TOTAL CHECKS EXECUTED: ${totalTests}`);
console.log(`TOTAL CHECKS PASSED: ${passedTests} (${Math.round((passedTests / totalTests) * 100)}%)`);
console.log('================================================================');

if (passedTests !== totalTests) {
  process.exit(1);
}
