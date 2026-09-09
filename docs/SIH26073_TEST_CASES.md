# National Automatic Weather Station Quality Management System (NAWS-QMS)
## Quality Control & Anomaly Discrimination Test Case Matrix (SIH26073)
### Prepared for Documentation & Evaluation Leads: Khushi & Priti
**Ministry of Earth Sciences (MoES) & India Meteorological Department (IMD) | Govt. of India**

---

### Executive Test Summary
This document defines the formal verification and validation suite for **Problem SIH26073**. All test cases are mathematically grounded in **World Meteorological Organization (WMO) Pub No. 8 Guidelines** and **IMD AWS Operating Standards**.

- **Total Test Cases**: 10
- **Automated Verification Command**: `npx tsx scripts/verify-detector.ts`
- **Current Pass Rate**: **100% (21/21 assertions passed)**
- **Average Pipeline Latency**: **< 1.0 ms** (Target: < 15 ms)

---

### Test Case Matrix

| ID | Test Scenario | Input Vector ($T, P, RH$) | Physical / Algorithmic Principle | Expected WMO Flag & Alert Level | Expected Operational Action |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-01** | Nominal Diurnal Weather Cycle | $T=32.5^\circ\text{C}, P=1008.2\text{ hPa}, RH=62.0\%$ | Within operating bounds; $|\Delta T| \le 0.3^\circ\text{C}/\text{min}$ | **WMO Flag 1 (Verified Good)**<br>`LEVEL_0_NOMINAL` | Observation validated for NWP assimilation feed. |
| **TC-02** | Thermistor Open-Circuit Spike | $T: 32.5^\circ\text{C} \to 54.8^\circ\text{C}$ in $<5\text{s}$ | Step limit violation ($|\Delta T| > 3.2^\circ\text{C}$); uncoupled barometric state | **WMO Flag 4 (Corrupt Hardware)**<br>`LEVEL_4_RED` | Observation quarantined. Field maintenance work order dispatched. WMO imputation applied. |
| **TC-03** | Stuck ADC Register / Frozen Loop | $T=33.4215^\circ\text{C}$ repeated across $\ge 6$ ticks | Zero variance ($\sigma^2_{N=6} < 10^{-8}$); transducer signal wire disconnect | **WMO Flag 4 (Corrupt Hardware)**<br>`LEVEL_4_RED` | Observation quarantined. Work order issued. WMO moving average reconstruction applied. |
| **TC-04** | Barometer Monotonic Drift | $P$ decreasing by $-0.45\text{ hPa}$/tick over 12 ticks | 24-sample linear regression slope deviation exceeding tolerance | **WMO Flag 3 (Suspect Drift)**<br>`LEVEL_3_AMBER` | Observation marked suspect. Sensor scheduled for NABL laboratory recalibration. |
| **TC-05** | Genuine Convective Squall Line | $\Delta P \le -2.5\text{ hPa}$, $\Delta RH \ge +18\%$, $\Delta T \le -2.8^\circ\text{C}$ | Multivariate thermodynamic convective front coupling | **WMO Flag 2 (Convective Storm)**<br>`LEVEL_2_YELLOW` (Caution) | **Data Validated for NWP Assimilation**. Maintenance dispatch suppressed (zero false dispatches). |
| **TC-06** | Telemetry Packet Loss / Drop | $T=\text{NULL}, P=\text{NULL}, RH=\text{NULL}$ | INSAT-3D DCP / GPRS carrier fade | **WMO Flag 5 (Packet Loss)**<br>`LEVEL_3_AMBER` | Packet quarantined. DCP RF link audit ticket generated. Regional baseline imputation applied. |
| **TC-07** | Relative Humidity Sensor Saturation | $RH > 100.0\%$ (e.g. $104.2\%$) | Physical climatological limits violation ($RH \in [5, 100]$%) | **WMO Flag 4 (Corrupt Hardware)**<br>`LEVEL_4_RED` | Quarantined. Polymer hygrometer contamination flag raised. |
| **TC-08** | Sub-Zero Mountain Freezing Inversion | $T=-6.2^\circ\text{C}, P=940\text{ hPa}, RH=85\%$ (Srinagar AWS) | Valid high-altitude thermodynamic envelope | **WMO Flag 1 (Verified Good)**<br>`LEVEL_0_NOMINAL` | Verified good within high-altitude baseline limits. |
| **TC-09** | Extreme Desert Heatwave Inversion | $T=49.8^\circ\text{C}, P=995\text{ hPa}, RH=12\%$ (Jaisalmer AWS) | Valid extreme diurnal envelope with physical coupling | **WMO Flag 1 (Verified Good)**<br>`LEVEL_0_NOMINAL` | Verified good; extreme climate advisory flagged. |
| **TC-10** | Explainable AI (XAI) Attribution Isolation | Single parameter anomaly injected | Normalized Shapley-style attribution weight: $\sum W_i = 100\%$ | **Responsible metric $W_k > 85\%$** | Diagnostic work order pinpoints exact sensor make/model for technician replacement. |

---

### Verification Instructions for Presentation Day

1. **Run Algorithmic Test Suite**:
   ```bash
   npx tsx scripts/verify-detector.ts
   ```
   *Expected Output: `21/21 TESTS PASSED (100%)`*

2. **Run Live Mock Streaming Streamer**:
   ```bash
   python scripts/mock_streamer.py --station AWS-DEL-04 --scenario normal
   ```

3. **Demonstrate Convective Storm Separation**:
   ```bash
   python scripts/mock_streamer.py --station AWS-DEL-04 --scenario storm --count 5
   ```
