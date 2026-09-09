# Smart India Hackathon (SIH 2026) — Presentation Pitch Blueprint
## Problem Statement: SIH26073 | Ministry of Earth Sciences (MoES) & IMD
### Project Title: NAWS-QMS v4.2.8 — National Automatic Weather Station Quality Management System
**Prepared for Documentation & Presentation Leads: Khushi & Priti**

---

### Rubric Mapping & Competitive Edge Overview

| Rubric Component | Evaluation Weight | Our Solution's Concrete Proof Point |
| :--- | :--- | :--- |
| **Innovation** | **25%** | **Atmospheric Convective Front Discriminator**: Solves the #1 industry problem—distinguishing real pre-cyclonic weather from sensor faults. Plus, WMO Pub No. 8 automated data reconstruction. |
| **Accuracy** | **20%** | **100% Verification Test Suite Pass Rate (21/21 assertions)**. Compliant with WMO Step Limits, Rate-of-Change, and Persistence variance checks. |
| **Latency** | **15%** | **Sub-1.0 ms pipeline processing time** per telemetry packet (benchmarked via Node.js high-resolution timer). Easily handles 2.5-second ingestion for 10,000+ national nodes. |
| **Explainability (XAI)** | **10%** | **Normalized Parameter Attribution ($T\%, P\%, RH\%$)**: Field technicians immediately see which sensor failed without guessing. |
| **Cost & Sustainability** | **Qualifying** | **100% Zero-Cost (₹0)**: Zero proprietary software licenses, open-source tech stack, edge-compatible on sub-$5 ESP32 microcontrollers, free hosting on Vercel. |

---

### 10-Slide Pitch Presentation Structure

#### Slide 1: Cover & Mission Alignment
- **Title**: National Automatic Weather Station Quality Management System (NAWS-QMS v4.2.8)
- **Subtitle**: Autonomous, Real-Time Telemetry Validation & Convective Front Discrimination for Surface Meteorology
- **Organization**: Ministry of Earth Sciences (MoES) & India Meteorological Department (IMD)
- **Problem Statement ID**: SIH26073
- **Team**: Lead Dev, Hardware/Edge (Satyam & Sundram), Documentation & Evaluation (Khushi & Priti)

#### Slide 2: The Ground Reality & The Problem
- India has over 1,200+ AWS units reporting across diverse terrains (coastal, desert, Himalayan).
- **The Core Dilemma**:
  1. *Hardware Probe Failures*: RTD thermistors crack, barometers drift, sensor lines disconnect, leading to corrupted data fed into Numerical Weather Prediction (NWP) forecast models.
  2. *False Alarms & Huge Costs*: Severe pre-cyclonic squalls cause sudden temperature drops and barometric plunges. Traditional static threshold checks flag these as "defective sensors," triggering false technician field dispatches while throwing out valid extreme weather warnings!

#### Slide 3: Our Solution — NAWS-QMS v4.2.8
- An enterprise-grade, edge-compatible telemetry quality assurance and diagnostic platform.
- Follows **GIGW (Guidelines for Indian Government Websites)** and **WMO Pub No. 8** standards.
- Ingests 3 core parameters every 2.5 seconds:
  1. Ambient Temperature ($T$)
  2. Atmospheric Pressure ($P$)
  3. Relative Humidity ($RH$)

#### Slide 4: Algorithmic Quality Control Pipeline
- *Step 1: Physical Limits Gate* ($-10^\circ\text{C}$ to $55^\circ\text{C}$, $920$ to $1050\text{ hPa}$, $5\%$ to $100\%$).
- *Step 2: Temporal Rate-of-Change (RoC) Step Check* ($|\Delta T| \le 0.3^\circ\text{C}/\text{min}$).
- *Step 3: Persistence / Stuck ADC Register Check* ($\sigma^2 < 10^{-8}$ over 6 ticks).
- *Step 4: Rolling Linear Drift Check* (24-sample monotonic regression slope).

#### Slide 5: The "Showstopper" Feature — Convective Storm Separation
- **The Innovation**: Solves the biggest challenge in automated meteorology.
- **Physical Law**: A genuine convective storm couples three thermodynamic phenomena:
  $$\Delta P \le -1.5\text{ hPa} \quad \text{AND} \quad \Delta RH \ge +8.0\% \quad \text{AND} \quad \Delta T \le -0.5^\circ\text{C}$$
- **Operational Verdict**:
  - If coupled: **WMO Flag 2 (Severe Storm)** $\to$ Validated for NWP assimilation, no false dispatch!
  - If isolated step: **WMO Flag 4 (Corrupt Hardware)** $\to$ Quarantined, field ticket issued.

#### Slide 6: Explainable AI (XAI) & Automated WMO Imputation
- **Explainability**:
  - Calculates exact fault attribution weights: $W_T + W_P + W_{RH} = 100\%$.
  - Example: Thermistor spike gives $91.5\%$ blame to PT100 probe, immediately pinpointing the broken sensor.
- **Automated Reconstruction**:
  - Downstream NWP models cannot tolerate gaps in data.
  - NAWS-QMS uses weighted historical moving averages + spatial baseline to impute clean data in real-time.

#### Slide 7: Live Operator Dashboard & Government Compliance
- High-density telemetry console with real-time Recharts visualizations.
- Interactive bilingual support (Hindi & English).
- Full accessibility compliance (GIGW font scaling, high-contrast dark mode).
- Automated work order dispatch register with status tracking.

#### Slide 8: Hardware & Edge Integration (Satyam & Sundram Demo)
- Live dual demonstration:
  1. *Python Mock Streaming Simulator*: Simulates 20 stations simultaneously with scenario toggles.
  2. *ESP32 Physical IoT Datalogger*: Transmits real telemetry over Wi-Fi with physical buttons for live fault injection during the presentation.

#### Slide 9: 100% Zero-Cost & Extreme Low-Latency
- **Hosting**: Vercel Serverless (Free Tier).
- **ML / Algorithmic Engine**: Client-side & Node.js edge execution without external API billing.
- **Latency Benchmark**: Sub-1.0 ms per packet (5,000x faster than the 2.5s telemetry window).
- **Zero Ongoing Operational Licensing Cost (₹0)**.

#### Slide 10: Impact, Scalability & Roadmap for IMD
- Ready for immediate plug-and-play integration with INSAT-3D DCP telemetry ground receivers.
- Eliminates up to 70% of unnecessary technician field trips.
- Preserves continuous NWP data assimilation accuracy during critical monsoon cyclonic events.
- Concluding call to action: "Autonomous Quality Assurance for a Weather-Resilient India."
