# AI-Powered Sustainable Campus — Operations Cockpit

An enterprise-grade campus operations cockpit designed with the calm, editorial aesthetic of Linear, Stripe, and Notion. It brings together physical IoT sensors, optical computer vision feeds, and deterministic safety rules, paired with generative AI operational synthesis.

---

## 🎨 Design System & Tokens

The application follows a strict data-forward, desaturated, high-contrast design system with zero neon, zero glow, and zero saturated gradients.

### Color Tokens

All colors are declared in `src/index.css` as CSS Custom Properties and Tailwind theme tokens:

| Token | Hex Value | Usage |
|---|---|---|
| `--color-ink` | `#0F1B2D` | Dark mode background |
| `--color-surface-raised` | `#16263C` | Dark mode cards and elevated panels |
| `--color-border-dark` | `#263A55` | Dark mode subtle borders (1px) |
| `--color-bg-warm` | `#F7F5F0` | Light mode warm editorial background |
| `--color-surface-white` | `#FFFFFF` | Light mode card surfaces |
| `--color-border-light` | `#E4E0D6` | Light mode structural borders |
| `--color-accent` | `#2F6F73` | Deep teal brand accent |
| `--color-accent-hover` | `#285F63` | Deep teal interactive hover |
| `--color-accent-tint` | `#DCEBEA` | Accent light tint for badges/selection |
| `--color-healthy` | `#5E8C6A` | Desaturated sage (Nominal / Healthy status) |
| `--color-watch` | `#B88A3B` | Muted ochre (Elevated / Watch status) |
| `--color-critical` | `#A8483F` | Brick red (Immediate Inspection / Critical) |
| `--color-unknown` | `#7A8797` | Slate grey (Offline / Uncalibrated) |

### Typography

Loaded via Google Fonts in `index.html`:
- **Headings / Display**: `Fraunces` (weights 500–600) — used strictly on landing headlines and printable report titles.
- **UI & Body**: `Manrope` (weights 400, 500, 600, 700) — clean, highly legible interface font with 1.6 body line-height.
- **Data & Numbers**: `IBM Plex Mono` — with `tabular-nums` for all telemetry values, timestamps, sensor units, and IDs.

Type scale: `12px` / `14px` / `16px` / `20px` / `28px` / `40px` / `64px`.

### Motion & Animation

Using Framer Motion (`motion` package):
- Easing: `cubic-bezier(0.22, 1, 0.36, 1)` with durations between `200ms` and `500ms`.
- Respects `prefers-reduced-motion` at all times (disables animations gracefully).
- Strictly animates `opacity` and `transform` for 60fps performance.

---

## 🏛 Architecture & Project Structure

```
frontend/
├── public/
│   └── favicon.svg              # Minimalist brand SVG icon
├── src/
│   ├── api/
│   │   ├── client.ts            # Typed API client with automatic mock fallback
│   │   └── mock-data.ts         # High-fidelity synthetic campus data
│   ├── campus/
│   │   └── CampusSchematic.tsx  # 2D SVG Digital Twin with 6 interactive zones
│   ├── components/
│   │   ├── AIActionPanel.tsx    # Generative action plan & ranked directives
│   │   ├── AlertsList.tsx       # Severity-filtered alerts with acknowledgment
│   │   ├── KPIStrip.tsx         # Animated counting metric cards
│   │   ├── Navbar.tsx           # Sticky slim navigation with theme toggle
│   │   ├── ReportPanel.tsx      # In-cockpit sustainability report compiler
│   │   ├── Skeleton.tsx         # Neutral gray shimmer & AI thinking indicator
│   │   ├── SourceBadge.tsx      # Explicit provenance tags (Simulated/Sensor/etc.)
│   │   ├── StatusBadge.tsx      # Dual-cue status dots + labels (WCAG AA)
│   │   ├── Toast.tsx            # Non-blocking confirmation toast provider
│   │   ├── TopBar.tsx           # Operational top bar & simulation triggers
│   │   ├── VisionObservationCard.tsx # Computer vision camera feed & upload
│   │   └── ZoneDetailPanel.tsx  # Zone telemetry, trends, & active alerts
│   ├── hooks/
│   │   └── useTheme.tsx         # Light / Dark theme management
│   ├── lib/
│   │   └── utils.ts             # Formatting, color mappings, and motion presets
│   ├── pages/
│   │   ├── DashboardPage.tsx    # Full-featured operations cockpit (/app)
│   │   ├── LandingPage.tsx      # Public presentation & explanation page (/)
│   │   └── ReportViewPage.tsx   # Printable editorial audit document (/app/report/:id)
│   ├── types/
│   │   └── index.ts             # Shared TypeScript data models & schemas
│   ├── App.tsx                  # Client-side router configuration
│   ├── index.css                # Tailwind CSS v4 + Design tokens
│   └── main.tsx                 # Application mount
└── vite.config.ts               # Vite configuration with Tailwind v4 & aliases
```

---

## 🛡 Hybrid Intelligence & Honesty Model

1. **Deterministic Rules Detect**: Hardware limits and sensor deltas (e.g., zero occupancy with high power draw) trigger alerts deterministically. The AI does not make safety decisions.
2. **Generative AI Explains**: The LLM synthesizes active alerts into an operational work order with owner teams, estimated effort, and formula-backed savings bounds.
3. **Transparent Provenance**:
   - All simulated data is explicitly tagged with `SIMULATED`.
   - Projected impacts feature hoverable formulas and assumptions.
   - Alerts use calibrated wording: *"Possible leak, needs inspection"*, never premature confirmation.
   - Advisory notice on all views: *"Advisory only. This system recommends actions; people review and execute them."*

---

## 🚀 Running the Project

```bash
# 1. Install dependencies
npm install

# 2. Start Vite development server
npm run dev

# 3. Production build verification
npm run build
```

The application automatically activates **Mock-Data Mode** if the backend API is unreachable, ensuring full interactive functionality (interactive digital twin, anomaly simulation, alert acknowledgments, AI action plans, report compilation, and printable exports).
