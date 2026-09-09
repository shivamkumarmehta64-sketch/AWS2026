/*
 * =================================================================================
 * SIH 2026 — PROBLEM SIH26073: Ministry of Earth Sciences (MoES) / IMD
 * ESP32 Physical Hardware Edge AWS Datalogger Demonstration Firmware
 * Team Hardware Leads: Satyam & Sundram
 * =================================================================================
 * 
 * Hardware Target: ESP32 DevKit V1 (30-pin / 38-pin)
 * Optional Sensors: BME280 (I2C: SDA=21, SCL=22) or DHT22 (Pin 4)
 * Push Buttons for Live Jury Fault Injection:
 *   - Button 1 (GPIO 14): Injects Thermistor Open-Circuit Spike (+55°C)
 *   - Button 2 (GPIO 12): Injects Convective Storm Front (Pressure Drop + Humidity Surge)
 * 
 * Target Telemetry Ingestion API:
 *   POST http://<SERVER_IP>:3000/api/telemetry
 *   Cycle: 2.5 seconds (2500ms)
 * =================================================================================
 */

#include <WiFi.h>
#include <HTTPClient.h>

// --- Wi-Fi Configuration ---
const char* WIFI_SSID = "Your_WiFi_SSID";
const char* WIFI_PASS = "Your_WiFi_Password";

// --- Server & Station Details ---
// Replace with your laptop/server IP address or deployed Vercel domain
const char* SERVER_URL = "http://192.168.1.100:3000/api/telemetry";
const char* STATION_ID = "AWS-DEL-04"; // Safdarjung Observatory, New Delhi

// --- Hardware Pins ---
const int PIN_SPIKE_BUTTON = 14;  // Active LOW with internal pull-up
const int PIN_STORM_BUTTON = 12;  // Active LOW with internal pull-up
const int LED_STATUS_PIN   = 2;   // Onboard Blue LED

// --- Telemetry Timing ---
const unsigned long TELEMETRY_INTERVAL_MS = 2500;
unsigned long lastTransmissionTime = 0;
unsigned long packetCounter = 0;

// Synthetic baseline parameters (diurnal baseline if running without physical I2C sensor)
float baseTemp = 32.5;
float basePress = 1008.2;
float baseHum = 62.0;

void setup() {
  Serial.begin(115200);
  delay(1000);

  pinMode(PIN_SPIKE_BUTTON, INPUT_PULLUP);
  pinMode(PIN_STORM_BUTTON, INPUT_PULLUP);
  pinMode(LED_STATUS_PIN, OUTPUT);

  Serial.println("\n========================================================================");
  Serial.println("GOVERNMENT OF INDIA — MoES / IMD / NIC | PROBLEM SIH26073");
  Serial.println("ESP32 Edge Automatic Weather Station Datalogger (v4.2.8)");
  Serial.println("Hardware Leads: Satyam & Sundram");
  Serial.println("========================================================================");

  // Connect to Wi-Fi
  Serial.print("Connecting to Wi-Fi SSID: ");
  Serial.println(WIFI_SSID);
  WiFi.begin(WIFI_SSID, WIFI_PASS);

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 25) {
    delay(500);
    Serial.print(".");
    digitalWrite(LED_STATUS_PIN, !digitalRead(LED_STATUS_PIN));
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n[Wi-Fi Connected]");
    Serial.print("ESP32 IP Address : ");
    Serial.println(WiFi.localIP());
    Serial.print("Target Ingest API: ");
    Serial.println(SERVER_URL);
    digitalWrite(LED_STATUS_PIN, HIGH);
  } else {
    Serial.println("\n[Warning] Wi-Fi Connection Failed. Running in offline test mode.");
    digitalWrite(LED_STATUS_PIN, LOW);
  }
}

void loop() {
  unsigned long currentMillis = millis();

  // Transmit telemetry every 2.5 seconds
  if (currentMillis - lastTransmissionTime >= TELEMETRY_INTERVAL_MS) {
    lastTransmissionTime = currentMillis;
    packetCounter++;

    // Check physical hardware fault injection buttons
    bool isSpikeButtonPressed = (digitalRead(PIN_SPIKE_BUTTON) == LOW);
    bool isStormButtonPressed = (digitalRead(PIN_STORM_BUTTON) == LOW);

    // Compute realistic observations or read from physical sensors
    float temperature = baseTemp + sin(packetCounter * 0.1) * 2.0;
    float pressure    = basePress + cos(packetCounter * 0.05) * 1.5;
    float humidity    = baseHum - sin(packetCounter * 0.1) * 5.0;

    // Inject fault if button pressed
    if (isSpikeButtonPressed) {
      Serial.println("\n[JURY DEMO TRIGGER] Hardware Button GPIO 14 Pressed: Injecting Thermistor Spike!");
      temperature = 54.8; // Exceeds physical operational bounds
    } else if (isStormButtonPressed) {
      Serial.println("\n[JURY DEMO TRIGGER] Hardware Button GPIO 12 Pressed: Injecting Convective Storm Front!");
      pressure -= 4.2;    // Sharp barometric plunge
      humidity = 95.0;    // Humidity saturation
      temperature -= 3.0; // Evaporative cooling
    }

    // Build JSON Payload
    char jsonBuffer[256];
    snprintf(
      jsonBuffer,
      sizeof(jsonBuffer),
      "{\"stationId\":\"%s\",\"temperature\":%.2f,\"pressure\":%.1f,\"humidity\":%.1f,\"timestamp\":%lu}",
      STATION_ID,
      temperature,
      pressure,
      humidity,
      currentMillis
    );

    Serial.print("\n[Packet #");
    Serial.print(packetCounter);
    Serial.print("] Transmitting: ");
    Serial.println(jsonBuffer);

    // Transmit over HTTP to Next.js API
    if (WiFi.status() == WL_CONNECTED) {
      HTTPClient http;
      http.begin(SERVER_URL);
      http.addHeader("Content-Type", "application/json");

      unsigned long requestStart = millis();
      int httpResponseCode = http.POST(jsonBuffer);
      unsigned long requestLatency = millis() - requestStart;

      if (httpResponseCode > 0) {
        String response = http.getString();
        Serial.print("  ↳ HTTP Code: ");
        Serial.print(httpResponseCode);
        Serial.print(" | Latency: ");
        Serial.print(requestLatency);
        Serial.println(" ms");
        Serial.print("  ↳ Response: ");
        Serial.println(response);
      } else {
        Serial.print("  ↳ HTTP POST Error: ");
        Serial.println(httpResponseCode);
      }
      http.end();
    }
  }
}
