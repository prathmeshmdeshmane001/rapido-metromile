# Hyperframes Composition Brief: Rapido MetroMile

## Objective
Create a short, polished launch-style brag video for Rapido MetroMile (Bengaluru Commute Concept).

## Output
- Composition directory: `brag-output/composition/`
- Rendered video: `brag-output/brag.mp4`
- Format: `landscape` — 1920x1080
- Duration: 20 seconds (600 frames at 30 fps)

## Source Material
- Project root: `/Users/prathameshdeshmane/Rapido`
- Primary files read: `index.html`, `src/App.tsx`, `src/index.css`, `README.md`
- Product name: Rapido MetroMile
- Tagline / strongest claim: "Your eight o’clock is taken care of. Home, metro and office become one journey."
- Key UI or visual moment to recreate: 
  - 3D Isometric route with glowing yellow nodes and elevated metro viaduct
  - Realistic smartphone app frame with live commute timeline and Captain card
  - Connected leg progress bar with real-time station synchronization
- Copy that must appear verbatim:
  - "rapido MetroMile"
  - "01 / HOME TO METRO — Your morning starts with a Captain."
  - "02 / ACROSS THE CITY — Let the metro take the long way."
  - "08:00 Home Pickup · Ravi Kumar ★ 4.9"
  - "Small connections. One complete commute."
  - "Your city. All connected."

## Creative Direction
- Tone preset: `polished`
- Creative direction: *Urban transit subscription for India's tech capital.*
- Interpretation: Restrained, premium, and rhythmic. High-contrast typography with yellow (#ffd12e) and purple (#7952b3) accents against deep cinema dark (#090b0c) and clean workspace off-white (#f6f7f3).
- Angle: Replacing fragmented peak-hour ride hail chaos with a unified, predictable commute pass.
- Hook: The dark isometric city grid igniting as the 8:00 AM booking anxiety is eliminated.
- Outro / punchline: "Your city. All connected. Home · Metro · Office. One monthly plan."
- Avoid:
  - Generic SaaS language ("streamline your workflow", "revolutionary solution")
  - Abstract filler graphics
  - Cluttered motion that makes text unreadable

## Visual Identity
- Background: `#090b0c` (cinema scenes 1–4), `#f6f7f3` (workspace scene 5)
- Text: `#ffffff` (dark scenes), `#191c1b` (light scenes), `#6e7771` (muted)
- Accent: `#ffd12e` (Rapido Yellow), `#7952b3` (Purple Line Metro), `#1e7049` (Success Green)
- Display font: `-apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif`
- Body font: `-apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif`
- Visual references from the project:
  - Yellow cube 'Home' node with white center dot and floating pill
  - Concrete pillars with elevated viaduct tracks and moving purple metro train
  - Device phone card with 4-stop timeline: Kasturi Nagar → Baiyappanahalli → Kundalahalli → Brookefield
  - Rapido brand mark 'r' in yellow square

## Storyboard
1. **Scene 1 — The 8:00 AM Routine** — 3.5s (0.0s – 3.5s)
   - Dark isometric grid with illuminated Rapido MetroMile title.
   - Yellow 'Home' station block pulses; glowing rider orb sets off on the route.
2. **Scene 2 — Across The City** — 4.5s (3.5s – 8.0s)
   - Elevated Purple Line viaduct with moving metro train.
   - Sequential station badges lock into place on beat: Baiyappanahalli → Kundalahalli.
3. **Scene 3 — Allocated Before You Leave** — 4.5s (8.0s – 12.5s)
   - Realistic smartphone device mockup with confirmed morning schedule.
   - Captain card confirms: Ravi Kumar ★ 4.9, Bajaj Pulsar, Ride PIN 4826.
4. **Scene 4 — Train Delay Immunity** — 4.0s (12.5s – 16.5s)
   - Signal delay test: "+12m Train Delay" triggers auto-reschedule for last-mile Captain at Kundalahalli.
   - Desk arrival stays safe within buffer.
5. **Scene 5 — Your City. All Connected** — 3.5s (16.5s – 20.0s)
   - Overview settles on the complete desk-to-desk routine.
   - Pass card: Everyday 20 · ₹3,200 / 4 weeks.
   - Rapido emblem locks with live link: `https://rapido-metromile.vercel.app`.

## Audio
- Audio role: Warm, confident modern electronic beat with crisp tactile interface accents.
- Audio arc: Ambient morning intro swelling into confident 110 BPM rhythm, settling on clean logo resolution.
- Music: `assets/music/bgm.mp3` (`happy-beats-business-moves-vol-10`), start time 0.0s, fade out starting at 18.2s.
- Music cue guidance: Major reveals at 3.0s, 7.3s, 12.0s, 16.3s, and 18.5s.
- Audio-reactive treatment: Subtle scale/glow resonance on yellow cards and route lines.
- SFX files:
  - `assets/sfx/click_001.ogg` — UI card taps
  - `assets/sfx/select_008.ogg` — Station badge locks
  - `assets/sfx/switch_001.ogg` — Mode switches
  - `assets/sfx/drop_001.ogg` — Final logo settle

## Hyperframes Instructions
- Implement HTML/CSS video composition in `brag-output/composition/index.html`.
- Use GSAP / CSS keyframes with strict `data-frame` or deterministic time-based animations.
- Ensure all text passes WCAG contrast and readability requirements.
- Run `npx hyperframes check` in `brag-output/composition/` to pass all gates before rendering.
- Render to `brag-output/brag.mp4`.
