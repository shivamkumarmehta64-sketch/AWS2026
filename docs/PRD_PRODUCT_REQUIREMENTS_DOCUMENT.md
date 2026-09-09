# Product Requirements Document (PRD)
## National Automatic Weather Station Quality Management System (NAWS-QMS v4.2.8)
### Problem Statement SIH26073 | Ministry of Earth Sciences (MoES) & India Meteorological Department (IMD)
**Author: Lead Developer | For Team Review: Satyam, Sundram, Khushi, Priti**

---

## 1. Document Control & Purpose

| Field | Value |
| :--- | :--- |
| **Product Name** | NAWS-QMS (National Automatic Weather Station Quality Management System) |
| **Target Release** | v4.2.8 (SIH 2026 Production Candidate) |
| **Sponsoring Agency** | Ministry of Earth Sciences (MoES) / India Meteorological Department (IMD) |
| **Problem Statement ID** | SIH26073 |
| **Document Purpose** | Comprehensive product specification defining user personas, functional/non-functional requirements, business rules, and acceptance criteria for team alignment and review. |

---

## 2. Problem Statement & Strategic Vision

### 2.1 The Problem
The India Meteorological Department operates over 1,200+ Automatic Weather Stations (AWS) nationwide, transmitting real-time thermodynamic telemetry via INSAT-3D DCP and cellular links. These observations directly feed India's Numerical Weather Prediction (NWP) forecast and disaster warning models.

Currently, IMD faces two major operational bottlenecks:
1. **Transducer & Telemetry Degenerations**: Sensor wires disconnect, RTD thermistors crack, silicon barometers drift out of calibration, and transmission packet drops corrupt telemetry.
2. **The "Convective Storm" Blind Spot**: Traditional threshold-based QC systems cannot differentiate between a legitimate sudden storm front (which causes abrupt barometric drops and humidity surges) and a broken sensor. This results in:
   - False technician field dispatches to remote locations ($> ₹15,000$ per wasted trip).
   - Erroneous quarantine of real, life-saving severe weather data from NWP storm forecast models.

### 2.2 Product Vision
Build an **autonomous, zero-operating-cost (₹0), edge-compatible quality management portal** that ingests real-time telemetry every 2.5 seconds, detects anomalies (spikes, freezes, drifts, packet drops), discriminates valid convective storms with high confidence, delivers explainable root-cause attribution (XAI), and reconstructs corrupted data using WMO-compliant spatial-temporal imputation.

---

## 3. User Personas & User Journeys

### Persona 1: Dr. Rajesh Sharma — Senior Duty Meteorologist (RMC Division Chief)
- **Role**: Supervises 50+ AWS stations in the Northern Regional Meteorological Centre (New Delhi).
- **Pain Points**: Overwhelmed by false alerts during monsoon squalls; cannot easily tell whether an abrupt pressure drop is a developing cyclone or a failing barometer.
- **Desired Journey**: Logs into the National AWS Console $\to$ Sees green/yellow/red status strip across all stations $\to$ Receives an immediate alert for a convective storm marked as *"Validated for NWP Assimilation"* with zero false alarms.

### Persona 2: Vikas Verma — Senior Field Instrumentation Technician
- **Role**: Dispatched for on-site physical sensor repairs across regional observatories.
- **Pain Points**: Arrives on-site without knowing which sensor probe has failed; spends hours testing PT100 thermistors, barometers, and hygrometers manually.
- **Desired Journey**: Opens the Diagnostic Anomaly Register $\to$ Reads XAI parameter blame ($T=91.5\%$, $P=4.2\%$, $RH=4.3\%$) $\to$ Replaces the exact PT100 RTD sensor probe on first attempt.

### Persona 3: Ananya Sen — NWP Numerical Data Assimilation Engineer
- **Role**: Manages atmospheric data ingestion into WRF/GFS high-resolution weather models.
- **Pain Points**: Missing values (NaN/Null) or quarantined sensor data cause forecast assimilation runs to crash or produce distorted wind/rain predictions.
- **Desired Journey**: Subscribes to the clean telemetry stream $\to$ Receives continuous, gap-free data where faulty values have been seamlessly reconstructed using WMO-compliant weighted moving averages and regional baseline imputation.

### Persona 4: SIH Hackathon Evaluation Jury
- **Role**: Evaluates innovation, accuracy, latency, XAI explainability, and cost-effectiveness.
- **Desired Journey**: Inspects the portal $\to$ Uses the Technician Bench Tool / Python Streamer to inject faults $\to$ Observes instant classification, sub-1ms response, and XAI parameter attribution.

---

## 4. Value Propositions & Problem-Solution Fit

```
[ Traditional Monitoring System ]                      [ NAWS-QMS v4.2.8 ]
• Proprietary, expensive SCADA licenses (₹10L+/yr)  ──► 100% Zero-Cost (₹0) Serverless Architecture
• Static min/max threshold checks                   ──► Multivariate Thermodynamic Convective Coupler
• Storms flagged as hardware faults                 ──► Distinguishes Genuine Squalls (WMO Flag 2)
• Black-box alert outputs                           ──► Shapley-style Explainable AI Attribution (XAI)
• Missing data leaves gaps in NWP models            ──► Automated WMO Spatial-Temporal Data Imputation
```

---

## 5. Functional Requirements (FR)

### Priority Definitions:
- **P0 (Must-Have / Core MVP)**: Mandatory for SIH problem statement evaluation.
- **P1 (Should-Have / Highly Differentiating)**: Key features providing competitive advantage.
- **P2 (Nice-to-Have / Polish)**: Usability and operational enhancements.

| ID | Priority | Feature Name | Description & Functional Specification | Acceptance Criteria |
| :--- | :---: | :--- | :--- | :--- |
| **FR-01** | **P0** | **3-Parameter Telemetry Ingestion** | Ingests Temperature ($T, ^\circ\text{C}$), Pressure ($P, \text{hPa}$), and Relative Humidity ($RH, \%$) every 2.5 seconds. | Validates numeric range: $T \in [-10, 55]^\circ\text{C}$, $P \in [920, 1050]\text{ hPa}$, $RH \in [5, 100]\%$. Handles null payloads. |
| **FR-02** | **P0** | **AI Anomaly Detector** | Detects: (1) Sensor spikes, (2) Stuck/frozen ADC registers, (3) Gradual monotonic sensor drift, and (4) Telemetry packet drops. | Flags spikes with $|\Delta T| > 3.2^\circ\text{C}$, freezes with $\sigma^2 < 10^{-8}$ over 6 ticks, and drift over 12 consecutive ticks. |
| **FR-03** | **P0** | **Weather vs. Hardware Classifier** | Distinguishes genuine extreme weather (pressure plunge + humidity surge + evaporative cooling) from a failing transducer. | Severe convective storms assigned **WMO Flag 2 (Level-2 Yellow)** and marked *"Data Validated for NWP Assimilation"*; suppresses technician field dispatch. |
| **FR-04** | **P0** | **Explainable AI (XAI) Attribution** | Quantifies parameter-level contribution to anomalies ($W_T + W_P + W_{RH} = 100\%$). | Outputs visual bar weights and diagnostic text specifying the responsible physical probe. |
| **FR-05** | **P0** | **Automated WMO Data Reconstruction** | Reconstructs missing or quarantined observations using weighted moving averages (WMA) and regional baseline offsets. | Reconstructed observation continuous and bounded; `wasCorrected` flag set to `true`. |
| **FR-06** | **P1** | **Operator Dashboard & Telemetry Visualizer** | Interactive web console displaying live Recharts telemetry curves, station datasheet, recent 10-packet audit table, and anomaly work order register. | Station selector dropdown updates active curves smoothly without page reload. Visual indicators for raw vs. imputed data. |
| **FR-07** | **P1** | **RESTful Ingestion API (`/api/telemetry`)** | Provides `POST /api/telemetry` for live external hardware streaming (ESP32 / Python mock streamer) and `GET` for specs. | Sub-5ms API response time; returns complete WMO flag, alert level, XAI weights, and imputed values. |
| **FR-08** | **P1** | **Bench Test & Fault Injection Tool** | Authorized technician drawer / evaluation desk allowing one-click injection of all 5 fault scenarios for live jury evaluation. | Injected faults take effect on the very next observation cycle (2.5s) across selected station. |
| **FR-09** | **P2** | **GIGW & NIC Accessibility Compliance** | Bilingual English/Hindi toggle, font-size adjustment ($A-, A, A+$), high-contrast accessibility mode, and official GoI footer. | Fully adheres to Guidelines for Indian Government Websites (GIGW v3.0). |

---

## 6. Non-Functional Requirements (NFR)

1. **Latency & Throughput**:
   - Algorithmic evaluation latency must not exceed $5\text{ ms}$ per packet (proven $< 1.0\text{ ms}$).
   - Client UI must render updates at $\ge 60\text{ fps}$ without frame drops.
2. **Cost (100% Zero-Cost)**:
   - Zero commercial software or external cloud API dependencies.
   - Deployable on free-tier infrastructure (Vercel Hobby, GitHub Pages, Render).
3. **Accuracy & Reliability**:
   - Zero false-positive hardware work orders during simulated convective storms.
   - Automated test suite must maintain a 100% pass rate.
4. **Usability & Accessibility**:
   - WCAG 2.1 AA and GIGW compliance for government portals.
   - Keyboard accessible and responsive across mobile, tablet, and 4K desktop screens.

---

## 7. Success Metrics & Scoring Alignment

| Metric | Target | SIH Evaluation Category |
| :--- | :--- | :--- |
| **Severe Storm Discrimination Accuracy** | $\ge 99.0\%$ | Innovation (25%) + Accuracy (20%) |
| **Hardware Fault Detection Accuracy** | $\ge 99.5\%$ | Accuracy (20%) |
| **End-to-End Processing Latency** | $< 5.0\text{ ms}$ | Latency (15%) |
| **Explainable AI Isolation Fidelity** | $> 85.0\%$ attribution to culprit | Explainability (10%) |
| **Operational Licensing Cost** | ₹0.00 | Qualifying / Scalability |

---

## 8. Role Assignments & Review Checkpoints
- **Lead Dev**: Next.js core application, `/api/telemetry`, and PRD/TRD technical review.
- **Satyam & Sundram (Hardware/Edge)**: Review FR-07 and mock streaming scripts for edge datalogger compatibility.
- **Khushi & Priti (Documentation & Evaluation)**: Review FR-01 through FR-05 against presentation slides and test case matrix.
