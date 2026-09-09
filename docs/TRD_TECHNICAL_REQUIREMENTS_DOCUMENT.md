# Technical Requirements & Architecture Document (TRD)
## National Automatic Weather Station Quality Management System (NAWS-QMS v4.2.8)
### Problem Statement SIH26073 | Ministry of Earth Sciences (MoES) & India Meteorological Department (IMD)
**Author: Lead Developer | For Team Review: Satyam, Sundram, Khushi, Priti**

---

## 1. System Architecture Overview

```
                                [ EDGE TELEMETRY SOURCES ]
                  ┌─────────────────────────┴─────────────────────────┐
                  ▼                                                   ▼
       [ ESP32 IoT Datalogger ]                           [ Python Mock Streamer ]
      (Physical Sensors / Buttons)                      (20 Simulated Station Nodes)
                  │                                                   │
                  └─────────────────────────┬─────────────────────────┘
                                            ▼
                           [ HTTP POST: /api/telemetry ]
                        JSON Payload: { stationId, T, P, RH }
                                            │
                                            ▼
                      ┌───────────────────────────────────────────┐
                      │    NAWS-QMS SERVERLESS RUNTIME ENGINE     │
                      │   (Node.js Edge / Next.js API Handler)    │
                      └─────────────────────┬─────────────────────┘
                                            │
               ┌────────────────────────────┴────────────────────────────┐
               ▼                                                         ▼
    [ Physical Limits Gate ]                                  [ Temporal Step Check ]
  (-10°C to 55°C, 920-1050 hPa)                             (|ΔT| > 0.3°C/min, |ΔP| > 2.0 hPa)
               │                                                         │
               ├─────────────────────────────────────────────────────────┤
               ▼                                                         ▼
  [ Stuck ADC Register Test ]                               [ Monotonic Drift Detector ]
(Zero variance σ² < 10⁻⁸ over 6 ticks)                     (24-sample regression slope)
               │                                                         │
               └────────────────────────────┬────────────────────────────┘
                                            ▼
                       [ METEOROLOGICAL CONVECTIVE COUPLER ]
                     IsCoupled = (ΔP <= -1.5) ∧ (ΔRH >= +8%) ∧ (ΔT <= -0.5°C)
                                            │
                      ┌─────────────────────┴─────────────────────┐
                      ▼                                           ▼
          [ YES: GENUINE STORM ]                      [ NO: TRANSDUCER FAULT ]
          • Alert Level-2 Yellow                      • Alert Level-4 Red / Level-3 Amber
          • WMO Flag 2 (Severe Storm)                 • WMO Flag 4 / Flag 3 / Flag 5
          • VALIDATED FOR NWP INGESTION               • Quarantined + Work Order Issued
                      │                                           │
                      └─────────────────────┬─────────────────────┘
                                            ▼
                          [ EXPLAINABLE AI (XAI) ATTRIBUTION ]
                      Normalized Weights: W_T + W_P + W_RH = 100%
                                            ▼
                          [ AUTOMATED WMO DATA RECONSTRUCTION ]
                       Weighted Moving Average + Spatial Baseline Imputation
                                            │
                      ┌─────────────────────┴─────────────────────┐
                      ▼                                           ▼
             [ JSON API Response ]                       [ Operator Dashboard ]
          (Latency: < 1.0 ms returned)                 (Recharts, Datasheet, Audit Log)
```

---

## 2. Mathematical Formulations & Quality Control Algorithms

### 2.1 Parameter Operational Boundaries (IMD / WMO Pub No. 8)
Every raw sample $x_t \in \{T, P, RH\}$ is first evaluated against climatological physical envelopes:
- **Temperature ($T$)**: $-10.0^\circ\text{C} \le T \le +55.0^\circ\text{C}$
- **Atmospheric Pressure ($P$)**: $920.0\text{ hPa} \le P \le 1050.0\text{ hPa}$
- **Relative Humidity ($RH$)**: $5.0\% \le RH \le 100.0\%$
Any reading violating these physical thresholds without coupling is immediately quarantined.

### 2.2 Temporal Continuity & Rate-of-Change (RoC)
Instantaneous rate of change between observation ticks $t$ and $t-1$:
$$\Delta T = |T_t - T_{t-1}|, \quad \Delta P = |P_t - P_{t-1}|, \quad \Delta RH = |RH_t - RH_{t-1}|$$

**Step Limit Thresholds**:
- An uncoupled temperature step $\Delta T > 3.2^\circ\text{C}$ in a single 2.5s tick (or $T > 50.0^\circ\text{C}$) triggers a **Thermistor Open-Circuit Spike** (`SENSOR_SPIKE`, WMO Flag 4).

### 2.3 Persistence / Stuck ADC Register Test
Detects frozen analog-to-digital converter (ADC) channels, broken microcontrollers, or signal wire disconnects where the register repeats identical floating-point values:
$$\bar{x} = \frac{1}{N}\sum_{i=0}^{N-1} x_{t-i}, \quad \sigma^2_N = \frac{1}{N}\sum_{i=0}^{N-1} (x_{t-i} - \bar{x})^2$$
Where window length $N = 6$ observation ticks.
$$\text{If } \sigma^2_N < 10^{-8} \implies \text{Classify as } \text{`FROZEN\_VALUE`} \text{ (WMO Flag 4 - Red Alert)}$$

### 2.4 Monotonic Calibration Drift Check
Sensor aging, dust contamination, or barometric capsule degradation leads to slow, monotonic zero-point drift:
Given a sliding buffer of $M = 12$ observations:
$$\text{DriftAmount} = x_t - x_{t-(M-1)}$$
$$\text{MonotonicityRatio} = \frac{\sum_{i=1}^{M-1} \mathbb{I}(\text{sgn}(x_{t-i+1} - x_{t-i}) = \text{sgn}(\text{DriftAmount}))}{M-1}$$
$$\text{If } \text{MonotonicityRatio} \ge 0.75 \land |\text{DriftAmount}| \ge 2.0\text{ hPa} \implies \text{`CALIBRATION\_DRIFT`} \text{ (WMO Flag 3 - Amber)}$$

### 2.5 Meteorological Convective Front Coupler
The key innovation distinguishing genuine atmospheric squalls from sensor failures:
$$\text{IsSevereWeather} = (\Delta P \le -1.5\text{ hPa} \lor \Delta P_{4\text{ticks}} \le -2.5\text{ hPa}) \land (\Delta RH \ge +8\% \lor RH \ge 88\%) \land (\Delta T \le -0.5^\circ\text{C})$$

**Operational Dispatch Rule**:
$$\text{Action} = \begin{cases} 
\text{WMO Flag 2 (Yellow)} \to \text{Data Validated for NWP Assimilation} & \text{if } \text{IsSevereWeather} = \text{True} \\
\text{WMO Flag 4 (Red)} \to \text{Quarantine Data + Issue Maintenance Ticket} & \text{if } \text{Isolated Sensor Jump}
\end{cases}$$

### 2.6 Explainable AI (XAI) Normalized Parameter Attribution
To inform field engineers exactly which physical transducer failed, parameter blame percentages are computed:
$$W_k = \frac{\alpha |Z_k| + \beta |\text{RoC}_k|}{\sum_{j \in \{T, P, RH\}} (\alpha |Z_j| + \beta |\text{RoC}_j|)} \times 100\%$$
Where:
- $Z_k = \frac{x_k - \mu_{k, \text{window}}}{\sigma_{k, \text{window}}}$ (Standardized Z-Score)
- $\sum_{k \in \{T, P, RH\}} W_k = 100.0\%$

### 2.7 Automated WMO Data Reconstruction (Spatial-Temporal Imputation)
Downstream Numerical Weather Prediction (NWP) models crash when receiving `NULL` or quarantined inputs. For invalid observations, reconstructed values $\hat{x}_t$ are generated via Weighted Moving Average (WMA):
$$\hat{x}_t = \frac{\sum_{i=1}^K (K - i + 1) \cdot x_{t-i}}{\sum_{i=1}^K (K - i + 1)}$$
Where $K = 6$ previous valid readings, combined with the station's regional diurnal baseline $\mu_{\text{station}}$.

---

## 3. API Specifications & Data Contracts

### 3.1 Telemetry Ingestion Endpoint: `POST /api/telemetry`

#### Request Payload:
```json
{
  "stationId": "AWS-DEL-04",
  "temperature": 32.45,
  "pressure": 1008.2,
  "humidity": 62.0,
  "timestamp": 1773238910000
}
```

#### Response Payload (HTTP 200 OK):
```json
{
  "success": true,
  "latencyMs": 0.62,
  "compliance": "WMO Pub No. 8 & IMD Quality Management Standards",
  "data": {
    "packetId": "PKT-DEL-04-238910",
    "stationId": "AWS-DEL-04",
    "timestamp": 1773238910000,
    "timeIST": "19:28:30",
    "raw": {
      "temperature": 32.45,
      "pressure": 1008.2,
      "humidity": 62.0
    },
    "imputed": {
      "temperature": 32.45,
      "pressure": 1008.2,
      "humidity": 62.0,
      "wasCorrected": false
    },
    "ratesOfChange": {
      "tempRoC": 0.05,
      "pressRoC": -0.1,
      "humRoC": 0.4
    },
    "classification": "NOMINAL_OPERATION",
    "wmoFlag": "FLAG_1_VERIFIED_GOOD",
    "alertLevel": "LEVEL_0_NOMINAL",
    "faultProbability": 0.02,
    "xaiAttribution": {
      "tempWeight": 33.3,
      "pressWeight": 33.3,
      "humWeight": 33.4,
      "primaryParameter": "None",
      "diagnosticNote": "All 3 parameters adhere to nominal thermodynamic diurnal curve."
    },
    "operationalAction": "Observation verified compliant with WMO Pub No. 8 & IMD Quality Standards.",
    "ticketId": null
  }
}
```

---

## 4. Core TypeScript Interfaces

```typescript
export type WMOQualityFlag = 
  | 'FLAG_1_VERIFIED_GOOD'
  | 'FLAG_2_CONVECTIVE_STORM'
  | 'FLAG_3_SUSPECT_DRIFT'
  | 'FLAG_4_CORRUPT_HARDWARE'
  | 'FLAG_5_PACKET_LOSS';

export type RootCauseClassification =
  | 'NOMINAL_OPERATION'
  | 'GENUINE_CONVECTIVE_EVENT'
  | 'SENSOR_SPIKE'
  | 'FROZEN_VALUE'
  | 'CALIBRATION_DRIFT'
  | 'TELEMETRY_PACKET_LOSS';

export type GovAlertLevel = 'LEVEL_0_NOMINAL' | 'LEVEL_2_YELLOW' | 'LEVEL_3_AMBER' | 'LEVEL_4_RED';

export interface TelemetryPacket {
  packetId: string;
  stationId: string;
  timestamp: number;
  timeIST: string;
  raw: {
    temperature: number | null;
    pressure: number | null;
    humidity: number | null;
  };
  imputed: {
    temperature: number;
    pressure: number;
    humidity: number;
    wasCorrected: boolean;
  };
  ratesOfChange: {
    tempRoC: number;
    pressRoC: number;
    humRoC: number;
  };
  classification: RootCauseClassification;
  wmoFlag: WMOQualityFlag;
  alertLevel: GovAlertLevel;
  faultProbability: number;
  xaiAttribution: {
    tempWeight: number;
    pressWeight: number;
    humWeight: number;
    primaryParameter: string;
    diagnosticNote: string;
  };
  operationalAction: string;
  ticketId: string | null;
}
```

---

## 5. Technology Stack & Zero-Cost Infrastructure

| Layer | Selected Technology | Zero-Cost Rationale |
| :--- | :--- | :--- |
| **Framework** | Next.js 16 (App Router, Turbopack) | Open-source, high-performance SSR and API route handling. |
| **Language** | TypeScript 5 | Strict static typing, preventing runtime data corruption. |
| **Styling** | Tailwind CSS 4 & Vanilla CSS | Zero runtime bundle overhead; responsive utility styling. |
| **Visualizations** | Recharts 3 | SVG-based responsive rendering with smooth transitions. |
| **Icons** | Lucide React | Lightweight vector iconography. |
| **Edge Compute** | ESP32 DevKit (C++ / Arduino) | Sub-$5 physical microcontroller with native Wi-Fi & ADC. |
| **Hosting** | Vercel Serverless (Hobby Tier) | ₹0 cloud hosting, automatic SSL, worldwide low-latency edge CDN. |
