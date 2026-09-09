# Dataset Curation & Synthetic Anomaly Synthesis Guide (SIH26073)
## Ministry of Earth Sciences (MoES) & India Meteorological Department (IMD)
### Prepared for Documentation & Curation Leads: Khushi & Priti

---

### 1. Primary Data Sources (100% Free & Open-Source)

To ensure zero-cost development while maintaining meteorological rigor, the following datasets are curated:

| Data Source | Provider | Temporal Resolution | Description | Access Protocol |
| :--- | :--- | :--- | :--- | :--- |
| **IMD AWS Pune Archive** | India Meteorological Department | 15-minute / Hourly | Real surface observations from across Indian climatic zones. | Open access via IMD Data Supply Portal |
| **ECMWF ERA5 Reanalysis** | Copernicus Climate Change Service | Hourly | High-resolution global atmospheric reanalysis for surface parameters. | Free Copernicus Open Access Hub API |
| **NOAA ISD (Integrated Surface Database)** | NOAA / NCEI | Hourly / Sub-hourly | Quality-controlled surface weather observations from Indian WMO stations. | Public AWS S3 Bucket / NOAA FTP |

---

### 2. Physical Parameter Schema

The dataset pipeline ingests exactly the three parameters prescribed under SIH26073:

```json
{
  "stationId": "AWS-DEL-04",
  "timestamp": 1773238910000,
  "temperature": 32.45,
  "pressure": 1008.2,
  "humidity": 64.8,
  "wmoBlockNo": "42182"
}
```

#### Physical Validation Boundaries
- **Temperature ($T$)**: $-10.0^\circ\text{C}$ to $+55.0^\circ\text{C}$
- **Atmospheric Pressure ($P$)**: $920.0\text{ hPa}$ to $1050.0\text{ hPa}$
- **Relative Humidity ($RH$)**: $5.0\%$ to $100.0\%$

---

### 3. Synthetic Anomaly Generation Parameters

Because real hardware failures and extreme convective storms are rare in standard baseline datasets, synthetic fault injection is applied to create robust test matrices:

#### 1. Thermistor Open-Circuit Spike (`SENSOR_SPIKE`)
- **Physics**: Broken RTD platinum lead causes instantaneous infinite resistance, decoded by ADC as maximum full-scale voltage.
- **Formula**:
  $$T_t = 54.5 + \mathcal{U}(0, 3.0) \quad \text{where } |T_t - T_{t-1}| > 3.2^\circ\text{C}$$
- **Coupling**: Pressure and Humidity remain unchanged ($\Delta P \approx 0, \Delta RH \approx 0$).

#### 2. Stuck ADC Register / Disconnected Signal Line (`FROZEN_VALUE`)
- **Physics**: Microcontroller I2C/SPI bus locks up or ADC register hangs, repeating the identical floating-point value.
- **Formula**:
  $$T_t = T_{t-1} = \dots = T_{t-5} \implies \sigma^2_{N=6} = 0.0$$

#### 3. Barometer Gradual Calibration Drift (`CALIBRATION_DRIFT`)
- **Physics**: Silicon capacitive sensor diaphragm aging or particulate ingress causing linear zero-point drift.
- **Formula**:
  $$P_t = P_{t,\text{nominal}} - (k \times \delta t) \quad \text{where } k = 0.45\text{ hPa/hr}$$

#### 4. Severe Convective Squall Storm (`GENUINE_CONVECTIVE_EVENT`)
- **Physics**: Pre-cyclonic or monsoonal convective downdraft causing simultaneous barometric plunge, humidity saturation, and evaporative cooling.
- **Coupled Formula**:
  $$\Delta P_t \le -2.5\text{ hPa}, \quad \Delta RH_t \ge +15.0\%, \quad \Delta T_t \le -1.5^\circ\text{C}$$
- **Distinction**: Marked as **WMO Flag 2 (Validated for NWP)**, suppressing false technician work orders.

#### 5. Telemetry Packet Drop / Transmission Error (`TELEMETRY_PACKET_LOSS`)
- **Physics**: Rain fade on INSAT-3D UHF/S-band link or battery undervoltage shutdown.
- **Formula**:
  $$\{T, P, RH\} = \text{NULL}$$

---

### 4. Verification & Benchmarking Script
To verify datasets and algorithmic classification across all scenarios, run:
```bash
npx tsx scripts/verify-detector.ts
```
