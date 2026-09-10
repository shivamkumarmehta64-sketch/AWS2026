import { ALL_766_DISTRICTS } from '../lib/india766Districts';
import { fetchDistrictFromOpenMeteo } from '../lib/districtEngine';
import { evaluateIMDHeatwave } from '../lib/heatwaveEngine';

async function testPurnea() {
  const purnea = ALL_766_DISTRICTS.find(d => d.name.toLowerCase().includes('purn'));
  console.log('================================================================');
  console.log('PURNEA (BIHAR) — OBSERVATIONAL METADATA & TELEMETRY AUDIT');
  console.log('================================================================');
  console.log('District ID:', purnea?.id);
  console.log('Name:', purnea?.name);
  console.log('State:', purnea?.state);
  console.log('Coordinates:', `${purnea?.lat}° N, ${purnea?.lng}° E`);
  console.log('Population:', purnea?.population?.toLocaleString('en-IN'));

  if (!purnea) return;

  const state = await fetchDistrictFromOpenMeteo(purnea);
  console.log('\n--- 12-PARAMETER LIVE METEOROLOGICAL TELEMETRY ---');
  console.log('Air Temperature (2m):', state.reading?.temperature_2m, '°C');
  console.log('Relative Humidity:', state.reading?.relative_humidity_2m, '%');
  console.log('Apparent Temperature (Feels Like):', state.reading?.apparent_temperature, '°C');
  console.log('Dew Point:', state.reading?.dew_point_2m, '°C');
  console.log('Mean Sea Level Pressure:', state.reading?.pressure_msl, 'hPa');
  console.log('Surface Pressure:', state.reading?.surface_pressure, 'hPa');
  console.log('Wind Speed (10m):', state.reading?.wind_speed_10m, 'km/h');
  console.log('Wind Direction:', state.reading?.wind_direction_10m, '°');
  console.log('Wind Gusts (10m):', state.reading?.wind_gusts_10m, 'km/h');
  console.log('Cloud Cover:', state.reading?.cloud_cover, '%');
  console.log('Horizontal Visibility:', state.reading?.visibility, 'm');
  console.log('UV Radiation Index:', state.reading?.uv_index);
  console.log('Accumulated Precipitation:', state.reading?.precipitation, 'mm');

  console.log('\n--- WMO-No. 8 AUTOMATED SENSOR QUALITY CONTROL REPORT ---');
  console.log('Overall Status:', state.health);
  console.log('Active Faults Count:', state.qcReport?.faults.length ?? 0);
  console.log('Active Sensor Faults:', state.qcReport?.faults.length === 0 ? 'None (All sensors operating within WMO nominal limits)' : state.qcReport?.faults);

  console.log('\n--- IMD HEATWAVE DECISION SUPPORT SYSTEM (DSS) ASSESSMENT ---');
  const hw = evaluateIMDHeatwave(purnea, state.reading, state.history);
  console.log('Warning Tier:', hw.warningLevel, `(${hw.warningLabelEn})`);
  console.log('Observed / Estimated Max Temp:', hw.maxTemp, '°C');
  console.log('Climatological Normal Maximum:', hw.climatologicalNormal, '°C');
  console.log('Departure from Normal (ΔT):', hw.departure > 0 ? `+${hw.departure}°C` : `${hw.departure}°C`);
  console.log('Bioclimatic Humidex:', hw.humidex, `(${hw.heatStressCategory})`);
  console.log('Warm Night Condition:', hw.isWarmNight ? 'ALERT: Warm Night (Impaired nocturnal cooling)' : 'NORMAL NIGHT COOLING');
  console.log('NDMA Emergency Advisory:', hw.healthAdvisory[0]);
  console.log('================================================================');
}

testPurnea();
