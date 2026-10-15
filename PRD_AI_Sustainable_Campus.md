# PRD: AI-Powered Sustainable Campus (Digital Twin)

**Hackathon Problem Statement 02** | **Time budget:** 24 hours | **Team:** 3 members, 3 laptops
**Tags:** Computer Vision, Digital Twin, GenAI, Campus

---

## 1. Problem Statement

Design a Digital Twin of a college campus that integrates Computer Vision and sensor data to detect issues such as waste accumulation, energy wastage, water leakage, and inefficient resource usage. Generative AI should generate actionable recommendations and sustainability reports.

## 2. Vision & One-Line Pitch

> "A live virtual copy of the campus that *sees* problems (cameras), *feels* them (sensors), and *tells you what to do about them* (GenAI)."

## 3. Goals and Non-Goals

### Goals (must demo in 24h)
1. A visual Digital Twin of the campus (map/3D) with buildings, rooms and zones that show live status.
2. Computer Vision detection of at least **3 issue types**: overflowing waste bins, water leakage / puddles, and lights/appliances on in empty rooms.
3. Sensor data stream (real or simulated) for **energy, water flow, and occupancy**.
4. Anomaly detection that fuses CV + sensor data into **alerts**.
5. GenAI that turns alerts into **actionable recommendations** and generates a downloadable **sustainability report**.

### Non-Goals (explicitly out of scope)
- Accurate 3D CAD modelling of the real campus.
- Production-grade auth, multi-tenant support, or mobile apps.
- Custom-trained models on large datasets (use pretrained or small fine-tunes).
- Real hardware deployment across a campus (we simulate at scale, prove with 1-2 real inputs).

## 4. Target Users

| Persona | Need |
|---|---|
| Campus Facilities Manager | See all issues in one place, know what to fix first |
| Sustainability Officer / Admin | Monthly report, savings, and trends for compliance and decisions |
| Maintenance Staff | Clear task with location and priority |
| Judges (hackathon) | Understand value and see it work in under 3 minutes |

## 5. Core Features

### P0 (Must have, build first)
| # | Feature | Description |
|---|---|---|
| F1 | **Digital Twin Dashboard** | Interactive campus map/3D view; each building/zone is colored green/amber/red by health. Click a zone to see details. |
| F2 | **CV Waste Detection** | Detect overflowing/full bins and litter piles from image/video. Output: zone, confidence, snapshot. |
| F3 | **CV Water Leak Detection** | Detect puddles/wet floors/dripping from image/video. |
| F4 | **Energy Wastage Detection** | Person count via CV (people detection) + simulated/real energy meter: if room is empty and power draw is high, flag "energy wastage". |
| F5 | **Sensor Simulator + Ingestion API** | Generates realistic time-series for energy (kWh), water flow (L/min), occupancy, per building. Includes injected anomalies (e.g., night-time water flow spike). |
| F6 | **Alert Engine** | Rule + statistical (z-score) anomaly detection; merges CV events and sensor anomalies into one alert feed with severity. |
| F7 | **GenAI Recommendations** | For each alert, an LLM generates: probable cause, recommended action, priority, estimated savings. |
| F8 | **GenAI Sustainability Report** | One-click generated report (PDF/Markdown): summary, KPIs, top issues, trends, recommendations, estimated CO2/cost saved. |

### P1 (Should have if time permits)
- Live webcam feed on one laptop running real-time CV detection into the twin.
- "Ask the Campus" chatbot (natural-language queries like "Which block wastes the most water this week?").
- Sustainability score per building (0-100) and leaderboard.
- What-if simulation ("If we fix leak X, projected saving is...").

### P2 (Nice to have, only if ahead of schedule)
- Real hardware sensors (ESP32 + flow/current sensor).
- Push notifications (Telegram/email) to maintenance staff.
- Historical playback slider on the twin.

## 6. User Flow (Demo Story)

1. Open dashboard: campus map, overall sustainability score, live KPIs.
2. Webcam/video shows an overflowing bin, so the CV model flags it and the Library zone turns red.
3. Simulated sensor shows a water-flow spike at 2 AM in Hostel Block B, and a leak alert is triggered.
4. Classroom empty but AC/lights drawing power, so an energy-wastage alert fires.
5. Click an alert: GenAI shows cause, action, priority and savings estimate.
6. Click "Generate Report": a sustainability report is produced and downloaded.

## 7. System Architecture

```
 [Camera feeds / Images / Videos] --> [CV Service (YOLO)] --\
                                                              >--> [Backend API (FastAPI)] --> [DB (SQLite/Postgres)]
 [Sensors / Simulator (MQTT or HTTP)] --> [Ingestion] -------/            |        |
                                                                          |        +--> [Anomaly/Alert Engine]
                                                                          |                    |
                                                                          |                    v
                                                                          |            [GenAI Service (LLM)]
                                                                          v                    |
                                                          [Digital Twin Dashboard (React + map/3D)]
                                                                          ^                    |
                                                                          +---- Reports (PDF) <-+
```

## 8. Recommended Tech Stack (optimized for speed)

| Layer | Choice | Why |
|---|---|---|
| Computer Vision | **YOLOv8 (Ultralytics)** pretrained + small fine-tune (Roboflow datasets) | Fast to set up, runs on laptop CPU/GPU |
| Backend | **FastAPI (Python)** | Same language as CV, quick REST + WebSocket |
| Database | **SQLite** (or Postgres if comfortable) | Zero setup |
| Realtime | **WebSocket** (skip MQTT unless using real hardware) | Simple |
| Frontend | **React + Vite + Tailwind**; Digital Twin via **React-Leaflet/SVG floor plan** (fallback) or **Three.js** (stretch) | Map/SVG is fast and reliable; 3D is optional polish |
| Charts | Recharts | Easy |
| GenAI | **LLM API** (Claude / Gemini / OpenAI) with structured JSON prompts | Reliable quality, no training needed |
| Reports | Markdown to PDF (WeasyPrint / ReportLab) or HTML print | Quick |
| Collaboration | **GitHub** (3 branches, merge often) | Avoid conflicts |

## 9. Detailed Requirements

### 9.1 Digital Twin
- Campus modelled as JSON: `buildings -> floors/zones -> rooms`, each with `id, name, type, coordinates, capacity`.
- Each zone has a live **status** (green/amber/red) derived from active alerts.
- Click a zone to see its sensor charts, latest CV snapshot, and active alerts.
- Layer toggles: Waste / Energy / Water.

### 9.2 Computer Vision
| Issue | Approach | Output |
|---|---|---|
| Waste accumulation | YOLOv8 fine-tuned on garbage/overflowing bin dataset; or classify bin "full vs empty" | `{zone, type: waste, confidence, bbox, image}` |
| Water leakage | Detect puddle/wet floor (segmentation/detection dataset) | `{zone, type: leak, confidence, image}` |
| Occupancy for energy waste | Pretrained YOLO `person` class count | `{zone, people_count}` |
- Run on pre-recorded videos/images per zone (to mimic many cameras) plus **one live webcam**.
- Confidence threshold ~0.5; require N consecutive frames to cut false positives.

### 9.3 Sensor Data (simulated, realistic)
- Per building every 5-10 s: `power_kw`, `water_lpm`, `occupancy`, `temperature`.
- Daily patterns (class hours peak, night low) plus injected anomalies (leak at night, AC left on, etc.).
- API: `POST /sensor-data`, `GET /zones/{id}/timeseries`.

### 9.4 Alert / Fusion Engine
- Rules (examples):
  - `occupancy == 0 AND power_kw > threshold` -> **Energy wastage**
  - `water_lpm > baseline during 00:00-05:00` -> **Probable leak**
  - CV waste detection with confidence > 0.6 for N frames -> **Waste overflow**
  - CV leak detection + water sensor spike in same zone -> **Confirmed leak** (severity High, multi-signal)
- Z-score/rolling-average anomaly detection on time series.
- Alert schema: `id, type, zone, severity, source(cv/sensor/both), timestamp, evidence, status`.

### 9.5 GenAI Layer
- **Recommendation prompt input:** alert JSON + recent sensor stats + zone info.
- **Output (strict JSON):** `probable_cause, recommended_action, priority, est_daily_saving (units/cost), owner_role`.
- **Report generator:** input = last 7/30 days aggregates + top alerts; output = structured report with sections: Executive Summary, KPIs, Issues by Category, Hotspots, Recommendations, Estimated Savings (kWh, liters, kg CO2, INR), Next Steps.
- Guardrails: ground every claim in provided data; no invented numbers; show data source in report.

### 9.6 Dashboard Screens
1. **Overview:** map, KPIs, score, live alert feed.
2. **Zone Detail:** charts, CV snapshot, alerts, recommendations.
3. **Alerts:** filterable list with AI recommendations.
4. **Reports:** generate/download.
5. *(P1)* **Ask the Campus** chat.

## 10. Success Metrics (what we show judges)

| Metric | Target for demo |
|---|---|
| Issue types detected | 3+ (waste, leak, energy) |
| CV detection on demo inputs | Works reliably on prepared demo clips (aim >80% on our test set) |
| Alert to recommendation latency | < 10 seconds |
| Report generation | < 30 seconds, one click |
| Estimated impact shown | kWh, liters, CO2, and cost saved |
| End-to-end demo | Under 3 minutes, no crashes |

## 11. Team Plan (3 people, 3 laptops)

| Member | Role | Owns |
|---|---|---|
| **A: CV/ML Engineer** (GPU laptop if any) | Computer Vision | Datasets, YOLO models, detection service, webcam demo, exposing `/detect` + pushing events to backend |
| **B: Backend + AI Engineer** | Data and GenAI | FastAPI, DB, sensor simulator, alert engine, LLM prompts, report generator |
| **C: Frontend/Twin Engineer** | UI/UX | Dashboard, digital twin map/3D, charts, alert feed, report page, demo polish |

**Laptop setup:** Laptop 1 runs CV service (best GPU), Laptop 2 runs backend + DB + simulator, Laptop 3 runs frontend. All on same Wi-Fi/hotspot using static IPs or ngrok. Use a shared **API contract** (Section 12) so everyone can mock each other from hour 1. Keep a backup of the demo running fully on one laptop.

## 12. API Contract (agree in first hour)

```
POST /api/cv-events        { zone_id, type: "waste|leak|people", confidence, count?, image_url, ts }
POST /api/sensor-data      { zone_id, power_kw, water_lpm, occupancy, ts }
GET  /api/zones            -> list + status
GET  /api/zones/{id}       -> detail + timeseries + alerts
GET  /api/alerts?status=   -> alert list (with ai_recommendation)
POST /api/alerts/{id}/recommend   -> triggers GenAI recommendation
POST /api/reports/generate?range=7d -> returns report (md/pdf url)
WS   /ws/live              -> pushes new alerts and status updates
```

## 13. 24-Hour Timeline

| Hours | A: CV | B: Backend/AI | C: Frontend |
|---|---|---|---|
| **0-2** | Collect datasets, test pretrained YOLO | Repo, FastAPI skeleton, DB schema, API contract | Vite app, campus JSON, map/SVG layout |
| **2-6** | Fine-tune waste + leak detection; person counting | Sensor simulator + ingestion + timeseries | Overview page, zone colors, KPI cards |
| **6-10** | Detection service + `/cv-events` integration; prep demo clips | Alert/fusion engine + WebSocket | Zone detail page + charts + alert feed |
| **10-14** | Webcam live demo; reduce false positives | GenAI recommendations (JSON prompts) | Alerts page + AI recommendation UI |
| **14-18** | Improve accuracy, record demo footage | Report generator (PDF) + savings calc | Reports page, filters, layer toggles |
| **18-21** | **Integration and bug fixing (all)** | | |
| **21-23** | **P1 features only if stable** (chatbot/score), polish UI, seed demo data | | |
| **23-24** | **Pitch deck, demo rehearsal x3, backup video, final commit** | | |

**Rule:** by hour 12 there must be a working end-to-end slice (one CV event leading to an alert, then a recommendation, shown on the map). Freeze new features at hour 21.

## 14. Risks and Mitigations

| Risk | Mitigation |
|---|---|
| CV accuracy is poor | Use curated demo clips, consecutive-frame confirmation, lower scope to "bin full/empty" |
| No real sensors | Simulator with injected anomalies; clearly label as simulated, show real-hardware-ready ingestion API |
| LLM API slow/fails during demo | Cache sample responses, retry, pre-generated fallback report |
| Wi-Fi issues at venue | Run everything on one laptop as fallback; phone hotspot; offline demo video |
| Integration chaos | API contract in hour 1, mocks, merge at least every 2 hours |
| Scope creep | P0 first; P1/P2 only after hour 18 |
| 3D twin takes too long | Use 2D map/SVG floor plan with strong visuals |

## 15. Differentiators (to stand out)

- **Multi-signal fusion:** CV + sensor agreement raises confidence ("confirmed leak").
- **Actionable, not just analytical:** each alert has an owner, action, and savings estimate.
- **Quantified impact:** kWh, liters, CO2 and rupees saved.
- **Scalable story:** same pipeline works for any campus; plug in real cameras/IoT via the same APIs.
- **Auto sustainability report** ready for green-campus audits (e.g., NAAC/green ratings).

## 16. Demo and Pitch Checklist

- [ ] Problem hook: statistics on campus resource waste (prepare 1-2 cited facts)
- [ ] Live demo script rehearsed (under 3 min)
- [ ] Backup recorded video of the full flow
- [ ] Architecture slide and impact numbers slide
- [ ] Future scope: real IoT rollout, predictive maintenance, student engagement/gamification
- [ ] Clear split of who speaks and who drives the demo

## 17. Open Questions (decide in the first hour)

1. Which real campus (or a fictional one) is modelled, and how many zones (suggest 5-8)?
2. Which LLM API key will the team use, and who owns the budget/limits?
3. Do we have any hardware (ESP32, sensors, webcam) at the venue?
4. Which hackathon judging criteria are published (innovation, impact, feasibility, demo)? Adjust priorities accordingly.
