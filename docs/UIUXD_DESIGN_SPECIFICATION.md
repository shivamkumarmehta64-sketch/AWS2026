# UI/UX Design Specification & Design System Document (UIUXD)
## National Automatic Weather Station Quality Management System (NAWS-QMS v4.2.8)
### Problem Statement SIH26073 | Ministry of Earth Sciences (MoES) & India Meteorological Department (IMD)
**Author: Lead Developer | For Team Review: Satyam, Sundram, Khushi, Priti**

---

## 1. Executive Design Philosophy: The "Dual-DNA" Interface

NAWS-QMS v4.2.8 embodies a sophisticated **"Dual-DNA" Design Philosophy**:

1. **DNA-1: Sovereign Government Authority (GIGW & NIC Guidelines)**:
   - Built to meet the mandatory **Guidelines for Indian Government Websites (GIGW v3.0)**.
   - Features the official Ashoka Blue (`#002147`) and National Saffron (`#FF9933`) identity, bilingual language support (Hindi & English), dynamic font scaling ($A-, A, A+$), and high-contrast accessibility mode.
   - Conveys trust, national meteorological sovereignty, and institutional rigor to ministry officials.

2. **DNA-2: High-Density Cybernetic Surveillance & Live Hackathon Cockpit**:
   - High-density telemetry data tables inspired by modern Bloomberg/NASA mission control consoles.
   - Dynamic real-time Recharts curves animating smoothly every 2.5 seconds.
   - Explainable AI (XAI) parameter attribution bars showing exact blame percentages ($T\%, P\%, RH\%$).
   - Interactive Bench Calibration Drawer for instantaneous fault injection during the jury evaluation.

---

## 2. Design Tokens & Visual Hierarchy

### 2.1 Color Palette
The color system communicates immediate operational status through calibrated contrast ratios:

| Token Name | Hex Code | Purpose & Semantic Meaning |
| :--- | :---: | :--- |
| **Ashoka Blue** | `#002147` | Primary brand color, government header, table headers, and authority accents. |
| **India Saffron** | `#FF9933` | Secondary national accent, active tab underlines, top bar separator. |
| **Canvas Background** | `#F1F5F9` | Neutral slate background reducing eye fatigue during 24/7 watch shifts. |
| **Nominal Green** | `#10B981` | WMO Flag 1 (Verified Good), healthy battery, online station status. |
| **Convective Yellow** | `#F59E0B` | WMO Flag 2 (Convective Storm), NWP validation alert, cautionary state. |
| **Drift Amber** | `#D97706` | WMO Flag 3 (Suspect Calibration Drift), recalibration notice. |
| **Hardware Crimson** | `#EF4444` | WMO Flag 4 (Corrupt Hardware / Spike / Frozen), field maintenance required. |
| **Packet Drop Purple**| `#8B5CF6` | WMO Flag 5 (Telemetry Packet Loss), RF communication fade. |

### 2.2 Typography
- **Primary Body & Headings**: `Inter`, `-apple-system`, `sans-serif` — Modern, neutral, highly legible at small font sizes (10px–13px).
- **Telemetry Digits & Identifiers**: `Roboto Mono`, `ui-monospace`, `monospace` — Tabular figures ensuring numbers don't jump horizontally as values update every 2.5 seconds.

### 2.3 Spacing & Layout Grid
- **Container Max-Width**: `1750px` for high-density multi-pane visibility on widescreen operator monitors.
- **Card Padding**: `16px` (Desktop) / `12px` (Mobile).
- **Border Radius**: Subtly rounded `4px` to `8px`, preserving a clean, functional government software aesthetic.

---

## 3. Screen Layout & Component Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ [GovHeader] Official Emblem | GIGW Accessibility (A- A A+, Contrast, HI/EN) │
├─────────────────────────────────────────────────────────────────────────────┤
│ [GovNetworkStrip] 20 Stations | 98.4% Quality Index | Anomaly Counter Strip  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│ [GovObservationConsole]                                                     │
│ ┌──────────────────────────────────────┬──────────────────────────────────┐ │
│ │ Station Datasheet (Lat/Lon/Sensors)  │ Station Selector Dropdown        │ │
│ ├──────────────────────────────────────┴──────────────────────────────────┤ │
│ │ Incoming 10-Packet Telemetry Table (T, P, RH, RoC, WMO Flag, Status)   │ │
│ ├─────────────────────────────────────────────────────────────────────────┤ │
│ │ Telemetry Curves (Recharts: Temp, Press, Hum, Imputed Curves)           │ │
│ ├─────────────────────────────────────────────────────────────────────────┤ │
│ │ Explainable AI (XAI) Attribution Bar (Temp %, Press %, Hum %)           │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│ [GovAnomalyRegister] Active Work Orders | NWP Validated Storms | Imputed   │
├─────────────────────────────────────────────────────────────────────────────┤
│ [GovTechnicianDrawer] (Floating Restricted Drawer) Live Fault Injections   │
├─────────────────────────────────────────────────────────────────────────────┤
│ [GovFooter] NIC Guidelines | Regional Met Centres | Security Certification  │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 3.1 Component Breakdown & Specifications

#### 1. `GovHeader` (Guidelines for Indian Government Websites)
- Displays the Government of India National Emblem and Ministry of Earth Sciences banner.
- Houses top-right accessibility utilities:
  - Font Sizing: Decrement ($A-$), Default ($A$), Increment ($A+$).
  - High-Contrast Mode: Toggles high-contrast accessibility classes.
  - Language: Instant English $\leftrightarrow$ Hindi translation toggle.

#### 2. `GovNetworkStrip` (Executive KPI Ribbon)
- Real-time pulse indicator showing continuous 2.5s data ingestion.
- Displays 4 key operational metrics:
  1. Monitored AWS Nodes (e.g. `20 Stations`)
  2. Network Quality Index (e.g. `98.4% WMO Compliant`)
  3. Active Critical Faults (Level-4 Red)
  4. Convective Weather Fronts in Progress (Level-2 Yellow)

#### 3. `GovObservationConsole` (Primary Workstation)
- **Technical Datasheet**: Shows station metadata, coordinates, elevation, WMO block number, sensor makes (PT100 RTD, Vaisala PTB110, Rotronic HC2A), calibration date, and battery voltage.
- **High-Density Packet Register**: Displays the last 10 received packets with exact timestamps, raw values, step rates-of-change, WMO flag badges, and operational action notices.
- **Synchronized Telemetry Charts**: Three stacked Recharts curves for Temperature, Pressure, and Humidity. Shows normal values in solid lines and WMO imputed reconstructions in dashed indicator lines.
- **XAI Attribution Meter**: Visual horizontal percentage bars showing parameter blame distribution.

#### 4. `GovAnomalyRegister` (Maintenance Work-Order Console)
- Auto-generates formal work order tickets (e.g., `IMD-QMS-2026-4102`) for every detected fault or severe storm.
- Clear status badges:
  - `VALIDATED_NWP` (Convective storms validated for weather models)
  - `QUARANTINED` (Faulty sensor data isolated)
  - `DISPATCHED` (Field maintenance ticket issued)

#### 5. `GovTechnicianDrawer` (Evaluation & Bench Calibration Tool)
- Floating, collapsible bottom-right drawer with a `RESTRICTED` security badge.
- Provides one-click triggers for all 5 scenarios:
  1. *Thermistor Open-Circuit Spike*
  2. *Signal Wire Disconnect (Frozen ADC)*
  3. *Barometer Monotonic Drift*
  4. *Convective Squall Storm*
  5. *Packet Loss / RF Fade*
  6. *Reset to Nominal*
- Includes a live terminal audit log showing timestamped actions.

---

## 4. Interaction States & Animation Standards

1. **Data Stream Heartbeat**:
   - A subtle green beacon pulsing every 2.5 seconds in the network strip indicates healthy INSAT-3D DCP telemetry.
2. **Anomaly Alert Flare**:
   - When an observation triggers Level-4 Red, the respective table row flashes with a gentle rose highlight before settling into a persistent badge, drawing immediate operator attention without disorientation.
3. **Recharts Smooth Interpolation**:
   - Chart transitions configured with `isAnimationActive={false}` or `duration={400}` to prevent visual lag on continuous 2.5-second stream ticks.

---

## 5. Accessibility & GIGW Compliance Checklist

- [x] **Color Contrast**: All text elements meet or exceed WCAG 2.1 AA contrast ratio ($> 4.5:1$).
- [x] **Keyboard Navigation**: All interactive elements (station selector, accessibility toggles, technician buttons) are focusable via `Tab` with visible focus rings.
- [x] **Screen Reader Labels**: `aria-label`, `htmlFor`, and semantic HTML (`<header>`, `<main>`, `<aside>`, `<footer>`) implemented throughout.
- [x] **Font Scalability**: Text layout adapts smoothly when font scaling ($A+, A++$) is engaged without overlapping or breaking card borders.
