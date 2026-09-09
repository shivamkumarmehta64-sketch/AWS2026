import { NICWMOAnomalyEngine } from '../lib/anomalyLogic';

function runNICWMOTests() {
  console.log('================================================================');
  console.log('GOVERNMENT OF INDIA - MoES / IMD / NIC');
  console.log('NAWS-QMS v4.2.8 WMO PUB NO. 8 QUALITY CONTROL ALGORITHMIC TEST SUITE');
  console.log('================================================================\n');

  const engine = new NICWMOAnomalyEngine();
  const stationId = 'AWS-DEL-04';
  let now = Date.now();

  let passed = 0;
  let total = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    total++;
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName}`);
      if (detail) console.error(`       Detail: ${detail}`);
    }
  }

  // 1. Nominal Operation Check (WMO Flag 1 - Good Data)
  console.log('--- Test 1: Nominal Diurnal Operation (WMO Flag 1) ---');
  let lastNominal: any;
  for (let i = 0; i < 20; i++) {
    now += 2500;
    lastNominal = engine.generatePacket(stationId, now, i);
  }
  assert(lastNominal.classification === 'NOMINAL_OPERATION', 'Nominal data classified as NOMINAL_OPERATION');
  assert(lastNominal.wmoFlag === 'FLAG_1_VERIFIED_GOOD', 'WMO flag is FLAG_1_VERIFIED_GOOD');
  assert(lastNominal.alertLevel === 'LEVEL_0_NOMINAL', 'Alert level is LEVEL_0_NOMINAL');

  // 2. Thermistor Open-Circuit Spike (>50°C in <5s)
  console.log('\n--- Test 2: Thermistor Open-Circuit Spike (Hardware Instrument Fault) ---');
  engine.triggerThermistorSpike(stationId);
  now += 2500;
  const spikePkt = engine.generatePacket(stationId, now, 21);
  assert(spikePkt.classification === 'SENSOR_SPIKE', 'Erratic spike classified as SENSOR_SPIKE');
  assert(spikePkt.wmoFlag === 'FLAG_4_CORRUPT_HARDWARE', 'WMO flag is FLAG_4_CORRUPT_HARDWARE');
  assert(spikePkt.alertLevel === 'LEVEL_4_RED', 'Spike triggers LEVEL_4_RED');
  assert(spikePkt.xaiAttribution.tempWeight > 85, `XAI temperature attribution > 85% (Actual: ${spikePkt.xaiAttribution.tempWeight}%)`);
  assert(spikePkt.operationalAction.includes('Field Maintenance Work Order'), 'Action generates Field Maintenance Work Order');
  assert(spikePkt.imputed.wasCorrected === true, 'Data was reconstructed via WMO imputation');

  // Reset to nominal
  engine.resetToNominal(stationId);
  for (let i = 0; i < 5; i++) {
    now += 2500;
    engine.generatePacket(stationId, now, 25 + i);
  }

  // 3. Signal Wire Disconnect / Frozen ADC Loop
  console.log('\n--- Test 3: Signal Wire Disconnect / Frozen ADC Sensor Test ---');
  engine.triggerWireDisconnectFreeze(stationId);
  let frozenPkt: any;
  for (let i = 0; i < 7; i++) {
    now += 2500;
    frozenPkt = engine.generatePacket(stationId, now, 31 + i);
  }
  assert(frozenPkt.classification === 'FROZEN_VALUE', 'Zero variance >= 6 ticks classified as FROZEN_VALUE');
  assert(frozenPkt.wmoFlag === 'FLAG_4_CORRUPT_HARDWARE', 'WMO flag is FLAG_4_CORRUPT_HARDWARE');
  assert(frozenPkt.alertLevel === 'LEVEL_4_RED', 'Frozen loop triggers LEVEL_4_RED');

  // Reset to nominal
  engine.resetToNominal(stationId);
  for (let i = 0; i < 5; i++) {
    now += 2500;
    engine.generatePacket(stationId, now, 40 + i);
  }

  // 4. Barometer Calibration Drift
  console.log('\n--- Test 4: Barometer Calibration Drift Test (-0.4 hPa/hr) ---');
  engine.triggerBarometerDrift(stationId);
  let driftPkt: any;
  for (let i = 0; i < 8; i++) {
    now += 2500;
    driftPkt = engine.generatePacket(stationId, now, 46 + i);
  }
  assert(driftPkt.classification === 'CALIBRATION_DRIFT', 'Monotonic drift classified as CALIBRATION_DRIFT');
  assert(driftPkt.wmoFlag === 'FLAG_3_SUSPECT_DRIFT', 'WMO flag is FLAG_3_SUSPECT_DRIFT');
  assert(driftPkt.alertLevel === 'LEVEL_3_AMBER', 'Drift triggers LEVEL_3_AMBER');
  assert(driftPkt.xaiAttribution.pressWeight > 75, `XAI pressure attribution > 75% (Actual: ${driftPkt.xaiAttribution.pressWeight}%)`);

  // Reset to nominal
  engine.resetToNominal(stationId);
  for (let i = 0; i < 5; i++) {
    now += 2500;
    engine.generatePacket(stationId, now, 55 + i);
  }

  // 5. Severe Convective Storm vs. Probe Malfunction Discrimination
  console.log('\n--- Test 5: Severe Convective Storm Discrimination (Valid Severe Weather) ---');
  engine.triggerConvectiveStorm(stationId);
  let stormPkt: any;
  for (let i = 0; i < 4; i++) {
    now += 2500;
    stormPkt = engine.generatePacket(stationId, now, 61 + i);
  }
  assert(stormPkt.classification === 'GENUINE_CONVECTIVE_EVENT', 'Coupled pressure drop and humidity surge classified as GENUINE_CONVECTIVE_EVENT');
  assert(stormPkt.wmoFlag === 'FLAG_2_CONVECTIVE_STORM', 'WMO flag is FLAG_2_CONVECTIVE_STORM');
  assert(stormPkt.alertLevel === 'LEVEL_2_YELLOW', 'Convective storm triggers Alert Level-2 Yellow (NOT Red)');
  assert(stormPkt.operationalAction.includes('Data Validated for NWP Assimilation'), 'Action marks Data Validated for NWP Assimilation');
  assert(!stormPkt.operationalAction.includes('Field Maintenance'), 'Action does NOT dispatch maintenance');

  console.log('\n================================================================');
  console.log(`VERIFICATION SUMMARY: ${passed}/${total} TESTS PASSED (${((passed / total) * 100).toFixed(0)}%)`);
  console.log('================================================================\n');

  if (passed !== total) {
    process.exit(1);
  }
}

runNICWMOTests();
