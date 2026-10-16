# Rapido MetroMile — Bengaluru Commute Concept

A full-fidelity replica of the [Rapido MetroMile Bengaluru Commute Concept website](https://metromile-bengaluru-commute.tart-cabin-5354.chatgpt.site/?utm_source=chatgpt.com).

## 🚀 Features

1. **3D Isometric Cinematic Journey (Section 1)**:
   - Real-time interactive Canvas projection with 3D camera transforms, orbit rotation (drag & arrow keys), and scroll-driven interpolation.
   - 4-stage commute narrative:
     - `01 / HOME TO METRO`: "Your morning starts with a Captain."
     - `02 / ACROSS THE CITY`: "Let the metro take the long way."
     - `03 / METRO TO OFFICE`: "Your next Captain is already in sync."
     - `04 / YOUR EVERYDAY`: "One commute. Ready for every workday."
   - Dynamic prism buildings (Home, Metro Station, Your Pickup, Office), elevated viaduct pillars with dual metro tracks, connecting road paths, pulsing station halos, animated traveling orb, and progress indicator.
   - "Explore the service" CTA button and animated scroll prompt pill.

2. **Scroll-Driven App Story (Section 2)**:
   - 5-step interactive mobile showcase highlighting the product flow:
     - `01 / DISCOVER`: "A new service. A familiar app." (Rapido Bike, Auto, Cab, and MetroMile banner)
     - `02 / YOUR COMMUTE`: "A connection at both ends." (Daily schedule and route)
     - `03 / YOUR ROUTINE`: "Your shift. Your schedule." (Work hours & office days)
     - `04 / YOUR PLAN`: "One plan. Every workday." (MetroMile 4-week pass & pricing)
     - `05 / YOUR CAPTAIN`: "Allocated. Before you leave." (Reserved Captain allocation card & timeline)
   - "Use the working prototype" shortcut to jump straight to the full interactive dashboard.

3. **Interactive Working Prototype & Dashboard (Section 3)**:
   - **Sidebar**: Rapido service branding, navigation tabs (Services, MetroMile, My subscription, Ride activity, Help & safety), carbon reduction note, and Arjun Kumar profile.
   - **Topbar**: City branding, Purple Line pilot badge, and **Rider / Captain perspective toggle**.
   - **Bengaluru Route & Map**:
     - Stylized SVG map with isometric building pattern, major arterial roads (Old Madras Road, KR Puram, Mahadevapura, Bengaluru East), animated dashed bike paths, solid purple metro line, and station badges (Kasturi Nagar, Baiyappanahalli, Kundalahalli, Brookefield).
     - Stats row: Door-to-desk time (50 min / 62 min on delay), Daily connections (4 bike legs), and Reserved days (20 days).
     - "Small connections. One complete commute." progress leg breakdown.
   - **Interactive Smartphone Device Mockup**:
     - **Services Screen**: Rapido vehicle categories and MetroMile introduction.
     - **Commute Screen**: Shift direction toggle (To Office 08:00 / Back Home 18:00), stops timeline, and multi-stage simulated journey (Captain allocation, ride underway, metro connection, delay simulation, and completion).
     - **Delay Simulation**: Test a 12-minute Namma Metro delay that dynamically reschedules subsequent legs and updates stats.
     - **Subscription Pass Screen**: 4-week pricing breakdown (₹3,200), benefits checklist, and day skip/pause functionality.
     - **Ride Activity Screen**: Persistent log of completed demo commutes with timestamps and delay badges.
     - **Help & Safety Screen**: Simulated captain replacement workflow, journey sharing preview, and emergency guidelines.
     - **Captain Partner Mode**: Guaranteed recurring commute blocks, weekly gross earnings calculator (₹1,200/wk), weekday schedule bar chart, and block acceptance toggle.
   - **Interactive Modals & Validation**:
     - Route customizer with 2 km station catchment checks.
     - Pilot hours validation (08:00–11:00 arrival, 17:00–20:00 departure).
     - Capacity checks (including sold-out demonstration for 08:00 shifts).
     - Toast notifications with automatic dismissal.

## 🛠️ Getting Started

```bash
# Install dependencies
npm install

# Start local development server (runs on port 5555)
npm run dev

# Build for production
npm run build

# Preview production build (runs on port 5555)
npm run preview
```

Open [http://localhost:5555](http://localhost:5555) in your browser.
