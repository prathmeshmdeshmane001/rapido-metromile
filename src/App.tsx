import React, { useState, useEffect, useRef, useMemo } from "react";

// Icons SVGs
const ICONS: Record<string, string> = {
  auto: "M5 16V9l3-5h9l3 5v7H5 M5 10h15M9 5v5m6-5v5M5 16a2 2 0 1 0 4 0m7 0a2 2 0 1 0 4 0",
  car: "M3 16V9h18v7H3M5 9l2-5h10l2 5M6 16v3m12-3v3M6 12h2m8 0h2",
  home: "M3 10l9-7 9 7v10H3z M9 20v-7h6v7",
  route: "M6 4a3 3 0 1 0 0 6 3 3 0 0 0 0-6 M18 14a3 3 0 1 0 0 6 3 3 0 0 0 0-6 M6 10v5a3 3 0 0 0 3 3h6 M18 14V9a3 3 0 0 0-3-3h-3",
  ticket: "M3 5h18v5a2 2 0 0 0 0 4v5H3v-5a2 2 0 0 0 0-4z M15 5v3m0 3v2m0 3v3",
  calendar: "M4 5h16v16H4z M8 3v4m8-4v4M4 10h16M8 14h2m4 0h2m-8 3h2",
  help: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18 M9 9c0-4 7-3 6 0 0 2-3 2-3 5m0 3v.1",
  leaf: "M20 3C6 2 2 9 6 15s15 5 14-12z M5 20L15 9",
  pin: "M12 22S4 14 4 9a8 8 0 1 1 16 0c0 5-8 13-8 13z M12 6a3 3 0 1 0 0 6 3 3 0 0 0 0-6",
  clock: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18 M12 7v6l4 2",
  shield: "M12 2l8 4v6c0 6-8 10-8 10S4 18 4 12V6z M8 12l3 3 5-6",
  bike: "M5 14a4 4 0 1 0 0 8 4 4 0 0 0 0-8 M19 14a4 4 0 1 0 0 8 4 4 0 0 0 0-8 M5 18l5-10 4 10H5 M10 8h6l3 10M8 5h4m4 0h3l-3 3",
  train: "M6 3h12v15H6z M6 11h12M9 3v8m6-8v8M8 21l2-3m6 3-2-3M9 15h.1m6 0h.1",
  phone: "M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z",
  share: "M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8 M16 6l-4-4-4 4 M12 2v13",
  check: "M20 6L9 17l-5-5",
};

interface IconProps {
  name: string;
  className?: string;
  style?: React.CSSProperties;
}

const Icon: React.FC<IconProps> = ({ name, className = "icon", style }) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    aria-hidden="true"
    style={style}
  >
    <path d={ICONS[name] || ICONS.home} />
  </svg>
);

function addMinutesToTime(timeStr: string, delta: number): string {
  const [h, m] = timeStr.split(":").map(Number);
  const total = (h * 60 + m + delta + 1440) % 1440;
  return (
    String(Math.floor(total / 60)).padStart(2, "0") +
    ":" +
    String(total % 60).padStart(2, "0")
  );
}

function formatMoney(amount: number): string {
  return "₹" + amount.toLocaleString("en-IN");
}

interface RideRecord {
  id: string;
  direction: "out" | "back";
  arrival: string;
  delayed: boolean;
  dateStr: string;
}

interface ModalState {
  isOpen: boolean;
  title: string;
  content: React.ReactNode;
}

export default function App() {
  // Navigation & role
  const [view, setView] = useState<"services" | "commute" | "plan" | "activity" | "help">("commute");
  const [role, setRole] = useState<"rider" | "captain">("rider");

  // Subscription & commute state
  const [isActive, setIsActive] = useState(false);
  const [direction, setDirection] = useState<"out" | "back">("out");
  const [days, setDays] = useState<number[]>([0, 1, 2, 3, 4]);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("18:00");
  const [homeArea, setHomeArea] = useState("Kasturi Nagar");
  const [officeArea, setOfficeArea] = useState("Brookefield");
  const [stage, setStage] = useState(0);
  const [delayed, setDelayed] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [captainAccepted, setCaptainAccepted] = useState(false);
  const [planTier, setPlanTier] = useState<"everyday" | "flex">("everyday");
  const [hoveredMapStation, setHoveredMapStation] = useState<string | null>(null);
  const [activeLegHighlight, setActiveLegHighlight] = useState<string | null>(null);

  // History of completed rides
  const [history, setHistory] = useState<RideRecord[]>([
    {
      id: "ride-1",
      direction: "out",
      arrival: "08:50",
      delayed: false,
      dateStr: "Yesterday · Morning shift",
    },
    {
      id: "ride-0",
      direction: "back",
      arrival: "18:48",
      delayed: false,
      dateStr: "Yesterday · Evening return",
    },
  ]);

  // Setup dialog state
  const [isSetupOpen, setIsSetupOpen] = useState(false);
  const [setupHome, setSetupHome] = useState("Kasturi Nagar");
  const [setupOffice, setSetupOffice] = useState("Brookefield");
  const [setupStart, setSetupStart] = useState("09:00");
  const [setupEnd, setSetupEnd] = useState("18:00");
  const [setupDays, setSetupDays] = useState<number[]>([0, 1, 2, 3, 4]);
  const [setupError, setSetupError] = useState("");
  const [setupReview, setSetupReview] = useState(false);

  // Generic modal
  const [modal, setModal] = useState<ModalState>({
    isOpen: false,
    title: "",
    content: null,
  });

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = (msg: string) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToastMessage(msg);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  const dayMultiplier = planTier === "everyday" ? days.length : Math.min(3, days.length);
  const dayCount = dayMultiplier * 4;
  const fare = dayCount * 4 * 40;

  // Timings calculation
  const calculatedTimes = useMemo(() => {
    if (direction === "out") {
      return [
        addMinutesToTime(startTime, -60),
        addMinutesToTime(startTime, -47),
        addMinutesToTime(startTime, -18 + (delayed ? 12 : 0)),
        addMinutesToTime(startTime, -10 + (delayed ? 12 : 0)),
      ];
    } else {
      return [
        addMinutesToTime(endTime, 10),
        addMinutesToTime(endTime, 23),
        addMinutesToTime(endTime, 52 + (delayed ? 12 : 0)),
        addMinutesToTime(endTime, 60 + (delayed ? 12 : 0)),
      ];
    }
  }, [direction, startTime, endTime, delayed]);

  // Story scroll state
  const [storyIndex, setStoryIndex] = useState(0);

  // Tour step for 3D canvas
  const [tourStep, setTourStep] = useState(0);
  const [tourPrompt, setTourPrompt] = useState("Scroll to begin");
  const [tourProgress, setTourProgress] = useState(0);

  // Canvas ref
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const introRef = useRef<HTMLElement | null>(null);
  const storyRef = useRef<HTMLElement | null>(null);

  // 3D Canvas rendering & interaction
  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const cx = cv.getContext("2d");
    if (!cx) return;

    let animId: number;
    let angle = -0.36;
    let targetAngle = -0.36;
    let tilt = 0.68;
    let targetTilt = 0.68;
    let camX = -110;
    let camY = 20;
    let zoom = 1.22;
    let lastFrame = 0;
    let manualUntil = 0;
    let drag: { x: number; y: number; a: number; t: number } | null = null;

    const shots = [
      { x: -125, y: 38, a: -0.32, t: 0.68, z: 1.28 },
      { x: 0, y: 25, a: -0.12, t: 0.61, z: 1.45 },
      { x: 155, y: -10, a: 0.23, t: 0.7, z: 1.32 },
      { x: 0, y: 0, a: -0.38, t: 0.68, z: 1.0 },
    ];

    const nodes = [
      [-250, 80, 0],
      [-110, 25, 30],
      [115, 25, 30],
      [253, -70, 0],
    ];

    const resize = () => {
      const r = cv.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      cv.width = Math.round(r.width * dpr);
      cv.height = Math.round(r.height * dpr);
      cx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(cv);

    const onPointerDown = (e: PointerEvent) => {
      drag = { x: e.clientX, y: e.clientY, a: targetAngle, t: targetTilt };
      manualUntil = performance.now() + 7000;
      cv.setPointerCapture(e.pointerId);
    };

    const onPointerMove = (e: PointerEvent) => {
      if (drag) {
        targetAngle = drag.a + (e.clientX - drag.x) * 0.004;
        targetTilt = Math.max(0.35, Math.min(0.95, drag.t + (e.clientY - drag.y) * 0.003));
        manualUntil = performance.now() + 7000;
      }
    };

    const onPointerUp = () => {
      drag = null;
    };

    cv.addEventListener("pointerdown", onPointerDown);
    cv.addEventListener("pointermove", onPointerMove);
    cv.addEventListener("pointerup", onPointerUp);
    cv.addEventListener("pointercancel", onPointerUp);

    const project = (x: number, y: number, z = 0) => {
      const w = cv.getBoundingClientRect().width;
      const h = cv.getBoundingClientRect().height;
      const scale = Math.min(w / 800, h / 400) * zoom;
      x -= camX;
      y -= camY;
      const xx = x * Math.cos(angle) - y * Math.sin(angle);
      const yy = x * Math.sin(angle) + y * Math.cos(angle);
      return [w * 0.5 + xx * scale, h * 0.58 + yy * Math.sin(tilt) * scale - z * scale];
    };

    const line3 = (points: number[][], color: string, width = 1, dash: number[] = []) => {
      cx.beginPath();
      points.forEach((p, i) => {
        const q = project(p[0], p[1], p[2] || 0);
        i ? cx.lineTo(q[0], q[1]) : cx.moveTo(q[0], q[1]);
      });
      cx.strokeStyle = color;
      cx.lineWidth = width;
      cx.setLineDash(dash);
      cx.stroke();
      cx.setLineDash([]);
    };

    const plane = (x: number, y: number, w: number, d: number, z: number, fill: string, stroke?: string) => {
      const pts = [
        [x - w / 2, y - d / 2, z],
        [x + w / 2, y - d / 2, z],
        [x + w / 2, y + d / 2, z],
        [x - w / 2, y + d / 2, z],
      ];
      cx.beginPath();
      pts.forEach((p, i) => {
        const q = project(p[0], p[1], p[2]);
        i ? cx.lineTo(q[0], q[1]) : cx.moveTo(q[0], q[1]);
      });
      cx.closePath();
      cx.fillStyle = fill;
      cx.fill();
      if (stroke) {
        cx.strokeStyle = stroke;
        cx.lineWidth = 1;
        cx.stroke();
      }
    };

    const prism = (x: number, y: number, w: number, d: number, h: number, highlight: boolean) => {
      const face = (pts: number[][], fill: string) => {
        cx.beginPath();
        pts.forEach((p, i) => {
          const q = project(p[0], p[1], p[2]);
          i ? cx.lineTo(q[0], q[1]) : cx.moveTo(q[0], q[1]);
        });
        cx.closePath();
        cx.fillStyle = fill;
        cx.fill();
        cx.strokeStyle = highlight ? "#bfa32b" : "#373e44";
        cx.lineWidth = 1;
        cx.stroke();
      };
      face(
        [
          [x - w / 2, y + d / 2, 0],
          [x + w / 2, y + d / 2, 0],
          [x + w / 2, y + d / 2, h],
          [x - w / 2, y + d / 2, h],
        ],
        highlight ? "#786414" : "#22272c"
      );
      face(
        [
          [x + w / 2, y - d / 2, 0],
          [x + w / 2, y + d / 2, 0],
          [x + w / 2, y + d / 2, h],
          [x + w / 2, y - d / 2, h],
        ],
        highlight ? "#b59419" : "#2d353c"
      );
      plane(x, y, w, d, h, highlight ? "#ffd12e" : "#455057", highlight ? "#ffe991" : "#6c7b86");
    };

    const label = (x: number, y: number, z: number, title: string, active: boolean, currentStep: number) => {
      if (!active && currentStep !== 3) return;
      const p = project(x, y, z);
      cx.textAlign = "center";
      cx.font = "700 13px -apple-system, sans-serif";
      const w = cx.measureText(title).width + 28;
      cx.fillStyle = active ? "#ffd12e" : "#1a1f23";
      cx.strokeStyle = active ? "#ffe894" : "#475159";
      cx.lineWidth = 1.5;
      cx.beginPath();
      cx.roundRect(p[0] - w / 2, p[1] - 22, w, 32, 8);
      cx.fill();
      cx.stroke();
      cx.fillStyle = active ? "#141718" : "#dce3e7";
      cx.fillText(title, p[0], p[1] - 1);
    };

    const orb = (x: number, y: number, z: number, active: boolean) => {
      const p = project(x, y, z);
      cx.beginPath();
      cx.arc(p[0], p[1], active ? 7.5 : 5, 0, Math.PI * 2);
      cx.fillStyle = active ? "#fff5bd" : "#ffcf26";
      cx.shadowColor = "#ffd12e";
      cx.shadowBlur = active ? 22 : 8;
      cx.fill();
      cx.shadowBlur = 0;
    };

    const renderFrame = (ms: number) => {
      animId = requestAnimationFrame(renderFrame);
      const dt = lastFrame ? Math.min(ms - lastFrame, 60) : 0;
      lastFrame = ms;

      const introEl = introRef.current;
      if (!introEl) return;
      const rect = introEl.getBoundingClientRect();
      const range = introEl.offsetHeight - window.innerHeight;
      const progress = Math.max(0, Math.min(1, -rect.top / Math.max(1, range)));

      setTourProgress(progress);
      setTourPrompt(progress < 0.02 ? "Scroll to begin" : progress > 0.94 ? "Scroll into the app" : "Keep scrolling");

      const currentTourStep = Math.min(3, Math.floor(progress * 4));
      setTourStep(currentTourStep);

      const f = (progress * 27999 % 7000) / 7000;
      const k = progress * 3;
      const si = Math.min(2, Math.floor(k));
      const mix = k - si;
      const sm = mix * mix * (3 - 2 * mix);
      const one = shots[si];
      const two = shots[si + 1];
      const shot = {
        x: one.x + (two.x - one.x) * sm,
        y: one.y + (two.y - one.y) * sm,
        a: one.a + (two.a - one.a) * sm,
        t: one.t + (two.t - one.t) * sm,
        z: one.z + (two.z - one.z) * sm,
      };

      const ease = 1 - Math.exp(-dt / 320);
      if (ms > manualUntil && !drag) {
        targetAngle = shot.a;
        targetTilt = shot.t;
      }
      angle += (targetAngle - angle) * ease;
      tilt += (targetTilt - tilt) * ease;
      camX += (shot.x - camX) * ease;
      camY += (shot.y - camY) * ease;
      zoom += (shot.z - zoom) * ease;

      const canvasW = cv.getBoundingClientRect().width;
      const canvasH = cv.getBoundingClientRect().height;
      if (rect.bottom < 0 || rect.top > window.innerHeight) return;

      cx.clearRect(0, 0, canvasW, canvasH);
      const glow = cx.createRadialGradient(canvasW * 0.5, canvasH * 0.56, 5, canvasW * 0.5, canvasH * 0.56, canvasW * 0.48);
      glow.addColorStop(0, "rgba(255, 209, 46, 0.08)");
      glow.addColorStop(1, "rgba(9, 11, 12, 0)");
      cx.fillStyle = glow;
      cx.fillRect(0, 0, canvasW, canvasH);

      // Floor grid
      plane(0, 0, 720, 380, -12, "#101518", "#252d33");
      for (let i = -350; i <= 350; i += 25) line3([[i, -180, -11], [i, 180, -11]], "#242a30", 0.5);
      for (let i = -175; i <= 175; i += 25) line3([[-360, i, -11], [360, i, -11]], "#242a30", 0.5);

      // Station halos
      [-110, 115].forEach((x) => {
        const pts: number[][] = [];
        for (let a = 0; a <= Math.PI * 2 + 0.1; a += 0.08) {
          pts.push([x + Math.cos(a) * 90, 25 + Math.sin(a) * 90, -8]);
        }
        line3(pts, "rgba(255, 209, 46, 0.25)", 1, [3, 7]);
      });

      // Metro bridge viaduct & tracks
      for (let x = -100; x <= 110; x += 35) prism(x, 25, 7, 8, 35, false);
      plane(2.5, 25, 255, 27, 38, "#636d72", "#9ca8ad");
      line3([[-110, 18, 40], [115, 18, 40]], "#ffdb51", 1.5);
      line3([[-110, 32, 40], [115, 32, 40]], "#ffdb51", 1.5);

      // Stylized Metro Train moving on the viaduct
      const trainProgress = (ms * 0.0003) % 1;
      const trainX = -90 + trainProgress * 180;
      prism(trainX, 25, 36, 12, 46, false);
      line3([[trainX - 16, 25, 46], [trainX + 16, 25, 46]], "#8b5ad2", 2);

      // Routes
      line3([nodes[0], [-198, 80, 0], [-150, 25, 0], [-110, 25, 0]], currentTourStep === 0 ? "#ffd12e" : "#5a5024", 5);
      line3([[115, 25, 0], [176, 25, 0], [220, -70, 0], nodes[3]], currentTourStep === 2 ? "#ffd12e" : "#5a5024", 5);

      // Prisms
      prism(-250, 80, 54, 54, 22, currentTourStep === 0);
      prism(-110, 25, 52, 52, 43, currentTourStep === 1);
      prism(115, 25, 52, 52, 43, currentTourStep === 2);
      prism(253, -70, 54, 54, 30, currentTourStep === 3);

      // Labels
      label(-250, 80, 65, "Home", currentTourStep === 0, currentTourStep);
      label(-110, 25, 88, "Metro", currentTourStep === 1, currentTourStep);
      label(115, 25, 88, "Your pickup", currentTourStep === 2, currentTourStep);
      label(253, -70, 75, "Office", currentTourStep === 3, currentTourStep);

      // Moving Orb
      const legs = [
        [[-250, 80, 25], [-198, 80, 5], [-150, 25, 5], [-110, 25, 47]],
        [[-110, 25, 48], [115, 25, 48]],
        [[115, 25, 47], [176, 25, 5], [220, -70, 5], [253, -70, 35]],
      ];

      if (currentTourStep < 3) {
        const pts = legs[currentTourStep];
        const t = Math.min(0.999, f * 1.15);
        const seg = Math.min(pts.length - 2, Math.floor(t * (pts.length - 1)));
        const u = t * (pts.length - 1) - seg;
        const a = pts[seg];
        const b = pts[seg + 1];
        orb(a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u, a[2] + (b[2] - a[2]) * u, true);
      } else {
        orb(253, -70, 36, true);
      }
    };

    animId = requestAnimationFrame(renderFrame);

    return () => {
      cancelAnimationFrame(animId);
      ro.disconnect();
      cv.removeEventListener("pointerdown", onPointerDown);
      cv.removeEventListener("pointermove", onPointerMove);
      cv.removeEventListener("pointerup", onPointerUp);
      cv.removeEventListener("pointercancel", onPointerUp);
    };
  }, []);

  // Scroll listener for Section 2 (App Story)
  useEffect(() => {
    const handleScroll = () => {
      const storyEl = storyRef.current;
      if (!storyEl) return;
      const r = storyEl.getBoundingClientRect();
      if (r.top > window.innerHeight || r.bottom < 0) return;
      const p = Math.max(0, Math.min(0.999, -r.top / (storyEl.offsetHeight - window.innerHeight)));
      const n = Math.floor(p * 5);
      setStoryIndex(n);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const tourInfo = [
    ["01 / HOME TO METRO", "Your morning starts with a Captain."],
    ["02 / ACROSS THE CITY", "Let the metro take the long way."],
    ["03 / METRO TO OFFICE", "Your next Captain is already in sync."],
    ["04 / YOUR EVERYDAY", "One commute. Ready for every workday."],
  ];

  const storyCopy = [
    ["01 / DISCOVER", "A new service.\n A familiar app.", "Find MetroMile alongside Bike, Auto and Cab."],
    ["02 / YOUR COMMUTE", "A connection\n at both ends.", "Home, metro and office become one journey."],
    ["03 / YOUR ROUTINE", "Your shift.\n Your schedule.", "Choose your office days and when you need to arrive."],
    ["04 / YOUR PLAN", "One plan.\n Every workday.", "Capacity is checked before your subscription is confirmed."],
    ["05 / YOUR CAPTAIN", "Allocated.\n Before you leave.", "Your morning pickup is part of your routine."],
  ];

  const scrollToAppStory = () => {
    storyRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToPrototype = () => {
    document.getElementById("workingApp")?.scrollIntoView({ behavior: "smooth" });
  };

  const jumpToTourStep = (stepIdx: number) => {
    const introEl = introRef.current;
    if (!introEl) return;
    const range = introEl.offsetHeight - window.innerHeight;
    const targetScrollY = introEl.offsetTop + (stepIdx / 3.9) * range;
    window.scrollTo({ top: targetScrollY, behavior: "smooth" });
  };

  // Actions
  const handleOpenSetup = () => {
    setSetupHome(homeArea);
    setSetupOffice(officeArea);
    setSetupStart(startTime);
    setSetupEnd(endTime);
    setSetupDays([...days]);
    setSetupError("");
    setSetupReview(false);
    setIsSetupOpen(true);
  };

  const handleValidateSetup = (e: React.FormEvent) => {
    e.preventDefault();
    if (setupHome === "Outside catchment" || setupOffice === "Outside catchment") {
      setSetupError("This address is outside the 2 km pilot area. Choose a covered area to explore this demo.");
      return;
    }
    if (!setupDays.length) {
      setSetupError("Choose at least one office day.");
      return;
    }
    if (!setupStart || !setupEnd || setupStart < "08:00" || setupStart > "11:00" || setupEnd < "17:00" || setupEnd > "20:00") {
      setSetupError("Choose a shift within the pilot hours (08:00–11:00 arrival, 17:00–20:00 departure).");
      return;
    }
    if (setupStart === "08:00") {
      setModal({
        isOpen: true,
        title: "This slot is currently full.",
        content: (
          <div>
            <p className="subtext">
              The 08:00 arrival slot has no remaining reserved capacity in this demo. Your existing commute is unchanged.
            </p>
            <div className="notice">
              💡 <strong>Capacity Tip:</strong> Try 08:30 or 09:00 for an immediately available guaranteed slot.
            </div>
            <button
              className="btn"
              onClick={() => {
                setModal({ isOpen: false, title: "", content: null });
                setSetupStart("08:30");
                setIsSetupOpen(true);
              }}
            >
              Choose 08:30 instead
            </button>
          </div>
        ),
      });
      return;
    }
    setHomeArea(setupHome);
    setOfficeArea(setupOffice);
    setStartTime(setupStart);
    setEndTime(setupEnd);
    setDays([...setupDays].sort());
    setStage(0);
    setDelayed(false);
    setSetupReview(true);
  };

  const handleActivatePass = () => {
    setIsActive(true);
    setIsPaused(false);
    setView("commute");
    setRole("rider");
    setIsSetupOpen(false);
    setSetupReview(false);
    showToast("🎉 Demo pass activated. Your Captain capacity is reserved.");
  };

  const advanceStage = () => {
    const next = Math.min(5, stage + 1);
    setStage(next);
    if (next === 5) {
      const newRide: RideRecord = {
        id: `ride-${Date.now()}`,
        direction,
        arrival: calculatedTimes[3],
        delayed,
        dateStr: `Today · ${direction === "out" ? "Morning commute" : "Evening return"}`,
      };
      setHistory((prev) => [newRide, ...prev]);
      showToast("✅ Commute complete! Recorded in Ride Activity.");
    }
  };

  // Interactive screens rendered inside the phone mockup
  const renderServicesScreen = (isStory = false) => (
    <div>
      <div className="greeting">Hi Arjun 👋</div>
      <h2 className="title-large">
        Your ride.
        <br /> Your way.
      </h2>
      <button
        className="service-search"
        onClick={() =>
          setModal({
            isOpen: true,
            title: "Where to? — Rapido",
            content: (
              <div>
                <p className="subtext">
                  This prototype focuses on <strong>MetroMile</strong>, Rapido's multimodal subscription service.
                </p>
                <div className="notice">
                  MetroMile pairs first and last-mile bike rides with Namma Metro on one daily schedule.
                </div>
                <button
                  className="btn"
                  onClick={() => {
                    setModal({ isOpen: false, title: "", content: null });
                    setView("commute");
                  }}
                >
                  Explore MetroMile
                </button>
              </div>
            ),
          })
        }
      >
        <Icon name="pin" /> Where to in Bengaluru?
      </button>

      <div className="service-grid">
        <button
          className="service-tile"
          onClick={() =>
            setModal({
              isOpen: true,
              title: "Rapido Bike",
              content: (
                <div>
                  <p className="subtext">
                    Fastest way to beat Bengaluru traffic. Standard on-demand booking.
                  </p>
                  <button
                    className="btn"
                    onClick={() => {
                      setModal({ isOpen: false, title: "", content: null });
                      setView("commute");
                    }}
                  >
                    See MetroMile (Subscribed Bike)
                  </button>
                </div>
              ),
            })
          }
        >
          <Icon name="bike" />
          Bike
        </button>
        <button
          className="service-tile"
          onClick={() =>
            setModal({
              isOpen: true,
              title: "Rapido Auto",
              content: (
                <div>
                  <p className="subtext">
                    Metered, hassle-free doorstep auto rickshaw rides.
                  </p>
                  <button
                    className="btn"
                    onClick={() => {
                      setModal({ isOpen: false, title: "", content: null });
                      setView("commute");
                    }}
                  >
                    Explore MetroMile
                  </button>
                </div>
              ),
            })
          }
        >
          <Icon name="auto" />
          Auto
        </button>
        <button
          className="service-tile"
          onClick={() =>
            setModal({
              isOpen: true,
              title: "Rapido Cabs",
              content: (
                <div>
                  <p className="subtext">
                    AC comfort with no surge pricing surprises.
                  </p>
                  <button
                    className="btn"
                    onClick={() => {
                      setModal({ isOpen: false, title: "", content: null });
                      setView("commute");
                    }}
                  >
                    Explore MetroMile
                  </button>
                </div>
              ),
            })
          }
        >
          <Icon name="car" />
          Cab
        </button>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: "14px" }}>
        <h3>For your everyday</h3>
        <span className="tag" style={{ background: "#f2f5ed", color: "#4d574f" }}>PILOT</span>
      </div>

      <button
        className="service-metro"
        onClick={() => {
          setView("commute");
          if (isStory) scrollToPrototype();
        }}
      >
        <div className="row">
          <Icon name="train" />
          <span className="tag" style={{ borderColor: "#282d2250", color: "#373c2b", background: "#ffffffaa" }}>
            NEW CONCEPT
          </span>
        </div>
        <h3>MetroMile</h3>
        <p>Home · Metro · Office. One monthly plan.</p>
        <span className="service-enter">Explore MetroMile →</span>
      </button>

      {!isStory && (
        <button className="saved-place" onClick={() => setView("commute")}>
          <Icon name="home" />
          <div>
            <strong>Daily office commute</strong>
            <small>
              {homeArea} ⇄ {officeArea}
            </small>
          </div>
        </button>
      )}
    </div>
  );

  const renderTimeline = () => {
    const isOut = direction === "out";
    const stopsData = [
      [calculatedTimes[0], isOut ? homeArea : officeArea, "Allocated Bike · 8 min door-to-station"],
      [calculatedTimes[1], isOut ? "Baiyappanahalli" : "Kundalahalli", "Purple Line · 26 min ride + platform access"],
      [calculatedTimes[2], isOut ? "Kundalahalli" : "Baiyappanahalli", "Connected pickup · 8 min guaranteed leg"],
      [calculatedTimes[3], isOut ? officeArea : homeArea, isOut ? "At your desk by " + startTime : "Back home safe"],
    ];

    return (
      <div className="timeline">
        {stopsData.map(([timeStr, nameStr, detailStr], i) => (
          <div key={i} className="stop">
            <time>{timeStr}</time>
            <div className="stop-mark">
              <i />
            </div>
            <div>
              <b>{nameStr}</b>
              <small>{detailStr}</small>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderJourneySimulation = () => {
    const stagesText = [
      "",
      "Your Captain is allocated.",
      "First mile, underway.",
      "Next stop: Namma Metro.",
      "Your last mile is ready.",
      "You’ve arrived at office.",
    ];
    const descriptions = [
      "",
      "Your morning pickup is confirmed. Meet at the saved entrance.",
      "Your first connection is moving. Metro transfer is right on track.",
      "The office-side pickup Captain is synchronised with train schedule.",
      "Your second Captain is waiting at Kundalahalli Gate B exit.",
      "A complete seamless commute, without the everyday booking anxiety.",
    ];

    const n = stage;

    return (
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span className="badge">{n === 5 ? "Commute complete" : `Connection ${Math.min(n, 4)} of 4`}</span>
          <span style={{ fontSize: "11px", color: "var(--muted)", fontWeight: 600 }}>LIVE DEMO</span>
        </div>
        <h2 className="title-large">{stagesText[n]}</h2>
        <p className="subtext">{descriptions[n]}</p>
        <div className="progress">
          <span style={{ width: `${n * 20}%` }} />
        </div>

        {delayed && (
          <div className="notice">
            ⚠️ <strong>Namma Metro Signal Delay:</strong> +12 minutes. Last-mile Captain re-allocated at Kundalahalli; arrival adjusted to {calculatedTimes[3]}.
          </div>
        )}

        {n === 1 || n === 4 ? (
          <div className="captain-card">
            <div className="profile" style={{ padding: 0 }}>
              <div className="avatar">{n === 1 ? "RK" : "SM"}</div>
              <div>
                <strong>{n === 1 ? "Ravi Kumar" : "Suresh M."}</strong>
                <small>Rapido Captain · ★ 4.9 · 1,420 trips</small>
              </div>
            </div>
            <hr className="divider" />
            <div className="row">
              <span>Vehicle</span>
              <strong style={{ fontSize: "12px" }}>{n === 1 ? "Bajaj Pulsar · KA 04 EV 4829" : "Honda Activa · KA 03 XX 2011"}</strong>
            </div>
            <div className="row">
              <span>Start PIN</span>
              <span className="badge yellow" style={{ fontSize: "13px", fontWeight: 800 }}>4826</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginTop: "12px" }}>
              <button
                className="btn secondary"
                style={{ minHeight: "38px", padding: "8px" }}
                onClick={() =>
                  setModal({
                    isOpen: true,
                    title: "Calling Captain...",
                    content: (
                      <div style={{ textAlign: "center", padding: "10px 0" }}>
                        <div style={{ width: "60px", height: "60px", borderRadius: "50%", background: "#ffd12e", display: "grid", placeItems: "center", margin: "0 auto 14px" }}>
                          <Icon name="phone" style={{ width: "26px", height: "26px", color: "#111" }} />
                        </div>
                        <h3>{n === 1 ? "Ravi Kumar" : "Suresh M."}</h3>
                        <p className="subtext">"Namaskara Arjun! I am 2 minutes away near the main entrance."</p>
                        <button className="btn" style={{ marginTop: "16px" }} onClick={() => setModal({ isOpen: false, title: "", content: null })}>
                          End call
                        </button>
                      </div>
                    ),
                  })
                }
              >
                <Icon name="phone" style={{ width: "16px", height: "16px" }} /> Call
              </button>
              <button
                className="btn secondary"
                style={{ minHeight: "38px", padding: "8px" }}
                onClick={() =>
                  setModal({
                    isOpen: true,
                    title: "Pickup Instructions",
                    content: (
                      <div>
                        <p className="subtext">
                          <strong>Pickup location:</strong> Saved apartment gate. Helmet will be provided as per Bengaluru safety norms.
                        </p>
                        <div className="notice">
                          Captain has completed daily safety checks. Free sanitised hairnet included.
                        </div>
                        <button className="btn" onClick={() => setModal({ isOpen: false, title: "", content: null })}>
                          Understood
                        </button>
                      </div>
                    ),
                  })
                }
              >
                Instructions
              </button>
            </div>
          </div>
        ) : (
          renderTimeline()
        )}

        {n < 5 ? (
          <button className="btn" onClick={advanceStage}>
            {["", "Simulate pickup → Underway", "Arrive at Metro station", "Meet last-mile Captain", "Complete commute & arrive"][n]}
          </button>
        ) : (
          <button
            className="btn"
            onClick={() => {
              setStage(0);
              setDelayed(false);
            }}
          >
            ← Back to commute dashboard
          </button>
        )}

        {n === 3 && !delayed && (
          <button
            className="btn secondary"
            style={{ marginTop: "8px" }}
            onClick={() => {
              setDelayed(true);
              showToast("⚠️ Simulated 12-minute train delay! Last-mile Captain rescheduled.");
            }}
          >
            ⚡ Test: Simulate 12-minute metro delay
          </button>
        )}

        <p className="footnote">Interactive simulation · No live dispatch or charges</p>
      </div>
    );
  };

  const renderCommuteScreen = (isStory = false) => {
    if (isPaused) {
      return (
        <div>
          <span className="badge yellow">Next office day skipped</span>
          <h2 className="title-large">A day off the road.</h2>
          <p className="subtext">
            Your next scheduled office commute is paused. Your 4 bike-leg credits remain safely in your monthly pass.
          </p>
          <div className="notice">
            Paused before 9:00 PM cutoff. Credits can be used for any extra office day this month.
          </div>
          <button
            className="btn"
            onClick={() => {
              setIsPaused(false);
              showToast("✅ Commute restored for tomorrow!");
            }}
          >
            Restore commute
          </button>
        </div>
      );
    }

    if (stage > 0) {
      return renderJourneySimulation();
    }

    return (
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <div className="greeting">Your next office day</div>
          <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--green)" }}>● CONNECTED</span>
        </div>
        <h2 className="title-large">
          Less planning.
          <br /> More living.
        </h2>
        <p className="subtext">First mile, metro connection and last mile. All locked on the same schedule.</p>

        <div className="day-switch">
          <button
            className={direction === "out" ? "active" : ""}
            onClick={() => {
              setDirection("out");
              setDelayed(false);
            }}
          >
            To office · {startTime}
          </button>
          <button
            className={direction === "back" ? "active" : ""}
            onClick={() => {
              setDirection("back");
              setDelayed(false);
            }}
          >
            Back home · {endTime}
          </button>
        </div>

        <div className="allocation">
          <Icon name="shield" />
          <div>
            <strong>{isActive ? "Captain capacity reserved" : "A seat on your daily schedule"}</strong>
            <small>{isActive ? "Allocation confirmed for morning & evening legs" : "Subscribe to reserve both connections"}</small>
          </div>
        </div>

        {renderTimeline()}

        <button
          className="btn"
          onClick={() => {
            if (isActive) {
              setStage(1);
            } else {
              handleOpenSetup();
            }
          }}
        >
          {isActive ? "Start demo commute" : "Build my commute"}
        </button>

        <p className="footnote">
          {isActive ? "Advance the journey to experience the live handoff" : "Within 2 km of a Purple Line station · Capacity-limited pilot"}
        </p>
      </div>
    );
  };

  const renderPlanScreen = () => (
    <div>
      <div className="eyebrow">METROMILE PASS</div>
      <h2 className="title-large">
        Your month.
        <br /> Already connected.
      </h2>
      <p className="subtext">Two bike connections each way. One predictable, guaranteed routine.</p>

      {/* Plan Tier Switch */}
      <div className="day-switch" style={{ margin: "14px 0" }}>
        <button
          className={planTier === "everyday" ? "active" : ""}
          onClick={() => setPlanTier("everyday")}
        >
          Everyday 20 (5 days)
        </button>
        <button
          className={planTier === "flex" ? "active" : ""}
          onClick={() => setPlanTier("flex")}
        >
          Flex 12 (3 days)
        </button>
      </div>

      <div className="price-card">
        <div className="row">
          <strong>{planTier === "everyday" ? "Everyday 20" : "Flex 12"}</strong>
          <span className="badge yellow">{isActive ? "Demo active" : "Monthly pass"}</span>
        </div>
        <div className="price">
          {formatMoney(fare)} <small>/ 4 weeks</small>
        </div>
        <p className="helper">
          {dayCount} office days · {dayCount * 4} bike legs · ₹40 / leg
        </p>
        <ul className="check-list">
          <li>Reserved Captain capacity, both ends guaranteed</li>
          <li>First & last mile, morning and evening sync</li>
          <li>Pause a day before 9 PM the night before with full credit</li>
          <li>Credits valid within this 4-week pass cycle</li>
        </ul>
      </div>

      <div className="row muted">
        <span>Metro tickets</span>
        <span>Paid separately via Namma Metro QR / Smart Card</span>
      </div>
      <div className="row muted">
        <span>Station catchment</span>
        <span>Up to 2 km per end</span>
      </div>
      <p className="helper">
        Illustrative pricing. Allocation is reserved only after capacity checks. If a replacement cannot be allocated within 4 minutes, the leg is credited.
      </p>

      {isActive ? (
        <>
          <button className="btn" onClick={handleOpenSetup}>
            Manage commute routine
          </button>
          <button
            className="btn secondary"
            onClick={() => {
              setIsPaused(!isPaused);
              showToast(isPaused ? "Commute restored for next day" : "Next office day skipped; 4 credits preserved");
            }}
          >
            {isPaused ? "Restore next office day" : "Skip next office day"}
          </button>
        </>
      ) : (
        <button className="btn" onClick={handleOpenSetup}>
          Check availability & Subscribe
        </button>
      )}
    </div>
  );

  const renderActivityScreen = () => (
    <div>
      <div className="eyebrow">YOUR COMMUTES</div>
      <h2 className="title-large">
        Every connection,
        <br /> in one place.
      </h2>
      {!history.length ? (
        <div className="empty">
          <Icon name="calendar" className="icon" />
          <h3>No completed demo rides yet.</h3>
          <p className="subtext">Activate a pass and finish a demo commute to see your journey history here.</p>
          <button className="btn" onClick={() => setView("commute")}>
            Go to my commute
          </button>
        </div>
      ) : (
        history.map((r, i) => (
          <div key={r.id || i} className="schedule-item">
            <div className="row">
              <strong>{r.direction === "out" ? "Home to Office" : "Office to Home"}</strong>
              <span className="badge" style={{ background: "#e8f5e9", color: "#2e7d32" }}>
                ✓ Completed
              </span>
            </div>
            <small>
              {r.dateStr || "Commute record"} · Arrived {r.arrival}
              {r.delayed ? " · ⚠️ Delay handled (+12m)" : " · On schedule"}
            </small>
            <div className="row" style={{ marginTop: "4px" }}>
              <span style={{ color: "var(--muted)" }}>2 bike legs + Purple Line</span>
              <strong style={{ color: "var(--green)" }}>Covered by Pass</strong>
            </div>
          </div>
        ))
      )}
    </div>
  );

  const renderHelpScreen = () => (
    <div>
      <span className="badge">Ride with confidence</span>
      <h2 className="title-large">
        Help at every
        <br /> connection.
      </h2>
      <p className="subtext">
        This is a prototype. These controls demonstrate the proposed proactive rider support experience.
      </p>

      <div className="captain-card">
        <h3>My Captain hasn’t arrived</h3>
        <p className="subtext">
          Instant replacement dispatch from station reserve pool, or automatic credit to your pass.
        </p>
        <button
          className="btn secondary"
          onClick={() =>
            setModal({
              isOpen: true,
              title: "Backup Captain Dispatched",
              content: (
                <div>
                  <div className="notice" style={{ background: "#eaf3e7", borderColor: "#c8e6c9", color: "#255d28" }}>
                    ✅ <strong>Backup Captain Allocated:</strong> Suresh M. is 2.5 minutes away from your location.
                  </div>
                  <p className="subtext">
                    In a live scenario, reserve standby Captains stationed at Purple Line hubs automatically take over within 3–4 minutes. If unfulfilled, your leg is refunded as credit.
                  </p>
                  <button className="btn" onClick={() => setModal({ isOpen: false, title: "", content: null })}>
                    Close
                  </button>
                </div>
              ),
            })
          }
        >
          Explore allocation support
        </button>
      </div>

      <button
        className="btn secondary"
        onClick={() =>
          setModal({
            isOpen: true,
            title: "Live Trip Sharing",
            content: (
              <div>
                <p className="subtext">
                  Share your end-to-end commute status with your family or colleagues.
                </p>
                <div style={{ background: "#f5f6f1", padding: "12px", borderRadius: "10px", wordBreak: "break-all", fontSize: "12px", margin: "10px 0" }}>
                  https://rapido.bike/trip/share?token=mm-blr-8934
                </div>
                <button
                  className="btn"
                  onClick={() => {
                    showToast("📋 Live sharing link copied!");
                    setModal({ isOpen: false, title: "", content: null });
                  }}
                >
                  Copy sharing link
                </button>
              </div>
            ),
          })
        }
      >
        <Icon name="share" style={{ width: "16px", height: "16px" }} /> Preview journey sharing
      </button>

      <button
        className="btn dark"
        onClick={() =>
          setModal({
            isOpen: true,
            title: "Safety Assistance — Prototype",
            content: (
              <div>
                <p className="subtext">
                  Rapido 24x7 Safety Response Center: helmet safety tracking, emergency SOS, and live ride monitoring.
                </p>
                <div className="notice">
                  ⚠️ In an actual real-world emergency, always dial 112 for Bengaluru police & ambulance first.
                </div>
                <button className="btn" onClick={() => setModal({ isOpen: false, title: "", content: null })}>
                  Close
                </button>
              </div>
            ),
          })
        }
      >
        <Icon name="shield" style={{ width: "16px", height: "16px" }} /> Safety help & SOS
      </button>
    </div>
  );

  const renderCaptainPerspective = () => (
    <div>
      <div className="greeting">Captain partner · Guaranteed Schedule</div>
      <h2 className="title-large">
        Start your day
        <br /> with a plan.
      </h2>
      <span className="badge" style={{ background: "#e8f0e8", color: "#255d28" }}>
        Station pool · Baiyappanahalli Hub
      </span>

      <div className="price-card">
        <div className="row">
          <strong>Recurring commute block</strong>
          <span className="tag" style={{ background: "#ffffff", borderColor: "#ffd12e" }}>
            {captainAccepted ? "RESERVED" : "AVAILABLE"}
          </span>
        </div>
        <div className="price">
          ₹1,200 <small>/ week gross</small>
        </div>
        <p className="helper">
          8 scheduled legs/day × ₹30 base payout × 5 days.
          <br /> Predictable earnings before other on-demand rides.
        </p>
      </div>

      <div className="schedule-item">
        <div className="row">
          <strong>Morning connections</strong>
          <b style={{ color: "var(--purple)" }}>07:00–10:00</b>
        </div>
        <small>4 spaced pickup slots · 2 km station catchment · Guaranteed riders</small>
      </div>

      <div className="schedule-item">
        <div className="row">
          <strong>Evening connections</strong>
          <b style={{ color: "var(--purple)" }}>17:00–20:00</b>
        </div>
        <small>4 spaced pickup slots · Return commuters · Zero wait time</small>
      </div>

      <div className="chart">
        {[80, 80, 80, 80, 80].map((h, i) => (
          <div key={i} className="bar" style={{ height: `${h}%` }}>
            <span>{["MON", "TUE", "WED", "THU", "FRI"][i]}</span>
          </div>
        ))}
      </div>

      <p className="section-note">
        ₹240/day guaranteed gross when completing the 8 scheduled connection slots. Free to accept normal on-demand rides in between 10:00 and 17:00!
      </p>

      <button
        className="btn"
        style={{ background: captainAccepted ? "#191c1b" : "var(--yellow)", color: captainAccepted ? "#fff" : "var(--ink)" }}
        onClick={() => {
          const next = !captainAccepted;
          setCaptainAccepted(next);
          showToast(next ? "🎉 Recurring block accepted! Slots reserved." : "Block released to backup pool.");
        }}
      >
        {captainAccepted ? "Release this recurring block" : "Accept recurring block"}
      </button>

      <p className="footnote">
        {captainAccepted ? "✅ Your daily slots are confirmed in station pool" : "Opt in to a recurring daily shift. Plan other rides around it."}
      </p>
    </div>
  );

  // App story slides screens
  const renderStoryScreen = (idx: number) => {
    switch (idx) {
      case 0:
        return renderServicesScreen(true);
      case 1:
        return renderCommuteScreen(true);
      case 2:
        return (
          <div>
            <div className="greeting">MetroMile / Set your routine</div>
            <h2 className="title-large">
              Work starts at nine.
              <br /> We start at eight.
            </h2>
            <div className="story-step-time">
              <small>At your desk by</small>
              <strong>09:00</strong>
            </div>
            <div className="story-step-time">
              <small>Leave office at</small>
              <strong>18:00</strong>
            </div>
            <label className="form-label">Office days</label>
            <div className="day-picks">
              {["M", "T", "W", "T", "F"].map((d, i) => (
                <span key={i} className="badge yellow">
                  {d}
                </span>
              ))}
            </div>
            <div className="allocation">
              <Icon name="shield" />
              <div>
                <strong>Both connections available</strong>
                <small>Within the 2 km pilot catchment</small>
              </div>
            </div>
            <button className="btn" onClick={handleOpenSetup}>
              Set my own shift
            </button>
            <p className="footnote">Example routine</p>
          </div>
        );
      case 3:
        return renderPlanScreen();
      case 4:
        return (
          <div>
            <span className="badge">Captain allocated · Demo</span>
            <h2 className="title-large">
              Your eight o’clock
              <br /> is taken care of.
            </h2>
            <div className="captain-card">
              <div className="profile" style={{ padding: 0 }}>
                <div className="avatar">RK</div>
                <div>
                  <strong>Ravi Kumar</strong>
                  <small>Demo Captain · ★ 4.9</small>
                </div>
              </div>
              <hr className="divider" />
              <div className="row">
                <span>Home pickup</span>
                <strong>08:00</strong>
              </div>
              <div className="row">
                <span>Ride PIN</span>
                <strong>4826</strong>
              </div>
            </div>
            <div className="timeline">
              <div className="stop">
                <time>08:00</time>
                <div className="stop-mark">
                  <i />
                </div>
                <div>
                  <b>Home pickup</b>
                  <small>Your first-mile Captain</small>
                </div>
              </div>
              <div className="stop">
                <time>08:13</time>
                <div className="stop-mark">
                  <i />
                </div>
                <div>
                  <b>Namma Metro</b>
                  <small>Across the city (Purple Line)</small>
                </div>
              </div>
              <div className="stop">
                <time>08:42</time>
                <div className="stop-mark">
                  <i />
                </div>
                <div>
                  <b>Station pickup</b>
                  <small>Your last-mile Captain at Kundalahalli</small>
                </div>
              </div>
              <div className="stop">
                <time>08:50</time>
                <div className="stop-mark">
                  <i />
                </div>
                <div>
                  <b>Office</b>
                  <small>10 minutes before your shift starts</small>
                </div>
              </div>
            </div>
            <button className="btn" onClick={scrollToPrototype}>
              Try the complete flow →
            </button>
          </div>
        );
      default:
        return renderServicesScreen(true);
    }
  };

  return (
    <>
      {/* SECTION 1: 3D Isometric Cinematic Journey */}
      <section id="intro" ref={introRef} className="intro" aria-label="Scroll through the MetroMile journey">
        <div className="intro-stage">
          <header className="intro-nav">
            <div className="wordmark">
              rapido<span>MetroMile</span>
            </div>
            <span className="intro-concept">Service concept · Bengaluru</span>
          </header>

          <div
            className="intro-scene"
            id="scene"
            tabIndex={0}
            role="group"
            aria-label="Scroll to move the camera from home through the metro to the office. Drag or use arrow keys to explore."
          >
            <canvas ref={canvasRef} id="route3d" aria-label="Three-dimensional commute route" />
          </div>

          <div className="cinema-bottom">
            <div className="cinema-caption">
              <small id="sceneLabel">{tourInfo[tourStep][0]}</small>
              <h1 id="sceneStatus">{tourInfo[tourStep][1]}</h1>
              <div className="cinema-progress" aria-label="Journey progress">
                {[0, 1, 2, 3].map((stepIdx) => {
                  const f = (tourProgress * 27999 % 7000) / 7000;
                  const w = stepIdx < tourStep ? 100 : stepIdx === tourStep ? f * 100 : 0;
                  return (
                    <div
                      key={stepIdx}
                      className="cinema-progress-step"
                      title={tourInfo[stepIdx][0]}
                      onClick={() => jumpToTourStep(stepIdx)}
                    >
                      <span style={{ width: `${w}%` }} />
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="cinema-actions">
              <button className="btn" onClick={scrollToAppStory}>
                Explore the service ↓
              </button>
            </div>
          </div>

          <div className="scroll-prompt" aria-hidden="true">
            <span className="scroll-mouse">
              <i />
            </span>
            <strong id="scrollPromptText">{tourPrompt}</strong>
            <span className="scroll-arrow">↓</span>
          </div>
        </div>
      </section>

      {/* SECTION 2: App Story Scroll Flow */}
      <section id="appStory" ref={storyRef} className="app-story" aria-label="Scroll through the Rapido service flow">
        <div className="story-stage">
          <div className="story-copy">
            <div className="wordmark">
              rapido<span>MetroMile</span>
            </div>
            <small id="storyNumber">{storyCopy[storyIndex][0]}</small>
            <h2 id="storyTitle">
              {storyCopy[storyIndex][1].split("\n").map((line, i) => (
                <React.Fragment key={i}>
                  {line}
                  <br />
                </React.Fragment>
              ))}
            </h2>
            <p id="storyDescription">{storyCopy[storyIndex][2]}</p>
            <div className="story-dots" aria-hidden="true">
              {[0, 1, 2, 3, 4].map((dot) => (
                <div
                  key={dot}
                  className={`story-dots-step ${dot === storyIndex ? "active" : ""}`}
                  onClick={() => setStoryIndex(dot)}
                  title={storyCopy[dot][0]}
                />
              ))}
            </div>
            <button className="story-skip" onClick={scrollToPrototype}>
              Use the working prototype →
            </button>
          </div>

          <div className="phone story-phone">
            {/* Status bar */}
            <div className="phone-status-bar">
              <span>08:00</span>
              <div className="phone-status-icons">
                <span>5G</span>
                <span>●●●</span>
                <span>100%</span>
              </div>
            </div>

            <div className="phone-top">
              <strong>rapido</strong>
              <span className="badge yellow" style={{ fontSize: "10.5px", padding: "4px 8px" }}>
                Service concept
              </span>
            </div>
            <div className="phone-body">{renderStoryScreen(storyIndex)}</div>
          </div>

          <div className="scroll-prompt story-scroll" aria-hidden="true">
            <span className="scroll-mouse">
              <i />
            </span>
            <strong>Keep scrolling</strong>
            <span className="scroll-arrow">↓</span>
          </div>
        </div>
      </section>

      {/* SECTION 3: Working Prototype Shell */}
      <div className="shell" id="workingApp">
        {/* Sidebar */}
        <aside className="sidebar">
          <div className="brand" onClick={() => jumpToTourStep(0)}>
            <div className="brand-mark">r</div>
            <div>
              rapido<small>SERVICE CONCEPT</small>
            </div>
          </div>
          <div className="rail-label">YOUR EVERYDAY</div>
          <nav className="nav" aria-label="Main navigation">
            <button
              className={view === "services" && role === "rider" ? "active" : ""}
              onClick={() => {
                setRole("rider");
                setView("services");
              }}
            >
              <Icon name="home" />
              <span>Services</span>
            </button>
            <button
              className={view === "commute" && role === "rider" ? "active" : ""}
              onClick={() => {
                setRole("rider");
                setView("commute");
              }}
            >
              <Icon name="route" />
              <span>MetroMile</span>
            </button>
            <button
              className={view === "plan" && role === "rider" ? "active" : ""}
              onClick={() => {
                setRole("rider");
                setView("plan");
              }}
            >
              <Icon name="ticket" />
              <span>My subscription</span>
            </button>
            <button
              className={view === "activity" && role === "rider" ? "active" : ""}
              onClick={() => {
                setRole("rider");
                setView("activity");
              }}
            >
              <Icon name="calendar" />
              <span>Ride activity</span>
            </button>
            <button
              className={view === "help" && role === "rider" ? "active" : ""}
              onClick={() => {
                setRole("rider");
                setView("help");
              }}
            >
              <Icon name="help" />
              <span>Help & safety</span>
            </button>
          </nav>
          <div className="sidebar-bottom">
            <div className="mini-card">
              <Icon name="leaf" style={{ color: "var(--green)" }} />
              <strong>A little ride. A bigger change.</strong>
              <p>Connect to the metro. Keep your everyday moving and reduce city emissions.</p>
            </div>
            <div className="profile">
              <div className="avatar">AK</div>
              <div>
                <strong>Arjun Kumar</strong>
                <small>Demo commuter · Bengaluru</small>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="main">
          <div className="mobile-brand">
            <div className="brand">
              <div className="brand-mark">r</div>rapido
            </div>
            <span className="badge yellow">Concept demo</span>
          </div>

          <header className="topbar">
            <div>
              <div className="eyebrow">Bengaluru / The everyday, reimagined</div>
              <h1 id="pageTitle">
                {role === "captain"
                  ? "A more predictable working day."
                  : view === "services"
                  ? "Where are we headed?"
                  : "Your city. All connected."}
              </h1>
            </div>
            <div className="top-actions">
              <span className="badge">
                <Icon name="pin" /> Purple Line pilot
              </span>
              <div className="view-switch" aria-label="Choose perspective">
                <button
                  id="riderSwitch"
                  className={role === "rider" ? "active" : ""}
                  onClick={() => setRole("rider")}
                >
                  Rider
                </button>
                <button
                  id="captainSwitch"
                  className={role === "captain" ? "active" : ""}
                  onClick={() => setRole("captain")}
                >
                  Captain
                </button>
              </div>
            </div>
          </header>

          <div className="workspace">
            {/* Left Stack */}
            <section className="left-stack">
              <div className="route-header">
                <div>
                  <h3 id="mapTitle">Home to office, without the guesswork.</h3>
                  <p id="mapSubtitle">
                    {homeArea} to {officeArea} · via Namma Metro
                  </p>
                </div>
                <button className="inline-button" onClick={handleOpenSetup}>
                  Edit route ⚙
                </button>
              </div>

              {/* Map SVG */}
              <div
                className="map"
                aria-label="Schematic commute route from Kasturi Nagar through Baiyappanahalli and Kundalahalli metro stations to Brookefield"
              >
                <div className="map-top">
                  <span className="map-pill">BENGALURU</span>
                  <span className="map-pill" style={{ color: "#73549f" }}>
                    ● Purple Line
                  </span>
                  {hoveredMapStation && (
                    <span className="map-pill" style={{ background: "#ffd12e", color: "#111" }}>
                      📍 {hoveredMapStation}
                    </span>
                  )}
                </div>

                <svg className="route-map" viewBox="0 0 740 430" role="img" aria-label="Illustrative route map, not for navigation">
                  <defs>
                    <pattern id="blocks" width="96" height="85" patternUnits="userSpaceOnUse" patternTransform="rotate(-18)">
                      <rect width="96" height="85" fill="#e9ede5" />
                      <rect x="7" y="7" width="35" height="32" rx="5" fill="#dce3d8" />
                      <rect x="49" y="7" width="38" height="32" rx="5" fill="#e0e6dc" />
                      <rect x="7" y="46" width="80" height="29" rx="5" fill="#dfe5db" />
                      <path d="M0 42H96M45 0V42" stroke="#f6f7f2" strokeWidth="5" />
                    </pattern>
                    <filter id="shadow">
                      <feDropShadow dx="0" dy="3" stdDeviation="4" floodOpacity="0.12" />
                    </filter>
                  </defs>

                  <rect width="740" height="430" fill="url(#blocks)" />

                  {/* Water canals & roads */}
                  <path
                    d="M510 -30C470 70 560 75 567 129S527 208 579 245 625 329 564 464"
                    fill="none"
                    stroke="#c5dcd5"
                    strokeWidth="25"
                  />
                  <path
                    d="M-20 303Q124 254 227 276T452 235 780 252M117 -30Q167 96 295 151T780 71"
                    fill="none"
                    stroke="#f9faf6"
                    strokeWidth="20"
                  />
                  <path
                    d="M-20 303Q124 254 227 276T452 235 780 252M117 -30Q167 96 295 151T780 71"
                    fill="none"
                    stroke="#cfd7c8"
                    strokeWidth="1"
                  />
                  <path d="M16 390L678 34M310 460L225 -30" stroke="#f8faf4" strokeWidth="12" fill="none" />
                  <path d="M49 74Q103 32 134 78L116 133 54 146Z" fill="#cbdcbf" />
                  <path d="M399 324l71-18 25 38-45 36-69-15Z" fill="#cbdcbf" />

                  <text x="41" y="218" className="map-label small" transform="rotate(-19 41 218)">
                    OLD MADRAS ROAD
                  </text>
                  <text x="426" y="69" className="map-label small">
                    KR PURAM
                  </text>
                  <text x="443" y="360" className="map-label small">
                    MAHADEVAPURA
                  </text>
                  <text x="248" y="394" className="map-label small">
                    BENGALURU EAST
                  </text>

                  {/* Route lines */}
                  {/* First mile: Home to Baiyappanahalli */}
                  <path d="M152 110L178 156 217 196" stroke="#fff" strokeWidth={activeLegHighlight === "first" ? 14 : 10} fill="none" />
                  <path
                    d="M152 110L178 156 217 196"
                    stroke="#d3a500"
                    strokeWidth={activeLegHighlight === "first" ? 7 : 5}
                    fill="none"
                    className="map-route"
                  />

                  {/* Metro Purple Line */}
                  <path
                    d="M217 196C280 191 296 215 352 215S445 194 492 223 518 254 548 272"
                    fill="none"
                    stroke="white"
                    strokeWidth={activeLegHighlight === "metro" ? 17 : 13}
                  />
                  <path
                    d="M217 196C280 191 296 215 352 215S445 194 492 223 518 254 548 272"
                    fill="none"
                    stroke="#9362ca"
                    strokeWidth={activeLegHighlight === "metro" ? 9 : 7}
                  />

                  {/* Metro Stations on track */}
                  <circle cx="317" cy="211" r="5" fill="white" stroke="#9362ca" strokeWidth="3" />
                  <circle cx="397" cy="210" r="5" fill="white" stroke="#9362ca" strokeWidth="3" />
                  <circle cx="478" cy="216" r="5" fill="white" stroke="#9362ca" strokeWidth="3" />

                  {/* Last mile: Kundalahalli to Brookefield */}
                  <path d="M548 272L594 294 638 340" fill="none" stroke="white" strokeWidth={activeLegHighlight === "last" ? 14 : 10} />
                  <path
                    d="M548 272L594 294 638 340"
                    fill="none"
                    stroke="#d3a500"
                    strokeWidth={activeLegHighlight === "last" ? 7 : 5}
                    className="map-route"
                  />

                  {/* Location pins & interactive nodes */}
                  <g
                    className="map-interactive-node"
                    onMouseEnter={() => setHoveredMapStation(`${homeArea} (First-mile pickup · 8 min bike)`)}
                    onMouseLeave={() => setHoveredMapStation(null)}
                  >
                    <circle cx="152" cy="110" r="28" fill="#ffd12e" opacity="0.25" className="pulse" />
                    <circle cx="152" cy="110" r="12" fill="#fff" stroke="#263e2a" strokeWidth="4" />
                    <circle cx="152" cy="110" r="4" fill="#263e2a" />
                  </g>

                  <g
                    className="map-interactive-node"
                    onMouseEnter={() => setHoveredMapStation("Baiyappanahalli Metro (Purple Line Entry · Platform 1)")}
                    onMouseLeave={() => setHoveredMapStation(null)}
                  >
                    <circle cx="217" cy="196" r="10" fill="#fff" stroke="#9362ca" strokeWidth="4" />
                  </g>

                  <g
                    className="map-interactive-node"
                    onMouseEnter={() => setHoveredMapStation("Kundalahalli Metro (Purple Line Exit · Gate B · Captain waiting)")}
                    onMouseLeave={() => setHoveredMapStation(null)}
                  >
                    <circle cx="548" cy="272" r="10" fill="#fff" stroke="#9362ca" strokeWidth="4" />
                  </g>

                  <g
                    className="map-interactive-node"
                    onMouseEnter={() => setHoveredMapStation(`${officeArea} (Office drop-off · Desk arrival 08:50)`)}
                    onMouseLeave={() => setHoveredMapStation(null)}
                  >
                    <circle cx="638" cy="340" r="12" fill="#263e2a" stroke="white" strokeWidth="4" />
                  </g>

                  {/* Location text boxes */}
                  <rect x="84" y="58" width="140" height="29" rx="7" fill="white" filter="url(#shadow)" />
                  <text x="96" y="77" className="map-label bold" id="homeMapLabel">
                    ⌂ {homeArea}
                  </text>

                  <rect x="132" y="220" width="155" height="29" rx="7" fill="white" filter="url(#shadow)" />
                  <text x="144" y="239" className="map-label bold">
                    Baiyappanahalli
                  </text>

                  <rect x="501" y="229" width="113" height="29" rx="7" fill="white" filter="url(#shadow)" />
                  <text x="514" y="248" className="map-label bold">
                    Kundalahalli
                  </text>

                  <rect x="565" y="361" width="130" height="29" rx="7" fill="white" filter="url(#shadow)" />
                  <text x="579" y="380" className="map-label bold" id="officeMapLabel">
                    ▣ {officeArea}
                  </text>

                  <rect x="295" y="160" width="104" height="28" rx="14" fill="#f8f1ff" stroke="#d7c5ec" />
                  <text x="313" y="179" style={{ fontSize: "11px", fill: "#8454b7", fontWeight: 700 }}>
                    METRO · 26 MIN
                  </text>
                </svg>

                <div className="map-bottom">
                  <div className="legend">
                    <span>
                      <i className="dot bike" />
                      Rapido Bike
                    </span>
                    <span>
                      <i className="dot" />
                      Namma Metro
                    </span>
                  </div>
                  <span>Hover pins for details · Schematic Bangalore route</span>
                </div>
              </div>

              {/* Stats */}
              <div className="stats">
                <div className="stat">
                  <div className="label">
                    <Icon name="clock" />
                    Door to desk
                  </div>
                  <strong id="durationStat">
                    {delayed ? 62 : 50} <span style={{ fontSize: "14px", fontWeight: 500 }}>min</span>
                  </strong>
                  <small>{delayed ? "⚠️ 12 min train delay included" : "Includes station access & buffer"}</small>
                </div>
                <div className="stat">
                  <div className="label">
                    <Icon name="ticket" />
                    Daily connections
                  </div>
                  <strong>
                    4 <span style={{ fontSize: "14px", fontWeight: 500 }}>bike legs</span>
                  </strong>
                  <small>Home & office, both ways synced</small>
                </div>
                <div className="stat">
                  <div className="label">
                    <Icon name="shield" />
                    Reserved for you
                  </div>
                  <strong id="daysStat">
                    {dayCount} <span style={{ fontSize: "14px", fontWeight: 500 }}>days</span>
                  </strong>
                  <small>Per 4-week subscription</small>
                </div>
              </div>

              {/* Connected Commute Progress */}
              <div className="connected">
                <div className="connected-head">
                  <h3 style={{ fontSize: "14px" }}>Small connections. One complete commute.</h3>
                  <small id="arrivalLabel">At your desk by {startTime}</small>
                </div>
                <div className="leg-row">
                  <div
                    className="leg"
                    onMouseEnter={() => setActiveLegHighlight("first")}
                    onMouseLeave={() => setActiveLegHighlight(null)}
                  >
                    <div className="leg-line" />
                    <b>First mile</b>
                    <span>Bike · 8 min</span>
                  </div>
                  <div className="leg walk">
                    <div className="leg-line" />
                    <b>Enter</b>
                    <span>5 min</span>
                  </div>
                  <div
                    className="leg metro"
                    onMouseEnter={() => setActiveLegHighlight("metro")}
                    onMouseLeave={() => setActiveLegHighlight(null)}
                  >
                    <div className="leg-line" />
                    <b>Purple Line</b>
                    <span>Metro · 26 min</span>
                  </div>
                  <div className="leg walk">
                    <div className="leg-line" />
                    <b>Exit</b>
                    <span>3 min</span>
                  </div>
                  <div
                    className="leg"
                    onMouseEnter={() => setActiveLegHighlight("last")}
                    onMouseLeave={() => setActiveLegHighlight(null)}
                  >
                    <div className="leg-line" />
                    <b>Last mile</b>
                    <span>Bike · 8 min</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Right Phone Prototype */}
            <section className="phone" aria-label="MetroMile app">
              {/* Phone Status bar */}
              <div className="phone-status-bar">
                <span>08:00</span>
                <div className="phone-status-icons">
                  <span>5G</span>
                  <span>●●●</span>
                  <span>98%</span>
                </div>
              </div>

              <div className="phone-top">
                <strong>
                  rapido <span style={{ fontWeight: 400, color: "#798274" }}>/ metromile</span>
                </strong>
                <span className="badge yellow" style={{ fontSize: "10px", padding: "3px 8px" }}>
                  PROTOTYPE
                </span>
              </div>

              <div className="phone-body">
                {role === "captain"
                  ? renderCaptainPerspective()
                  : view === "services"
                  ? renderServicesScreen()
                  : view === "commute"
                  ? renderCommuteScreen()
                  : view === "plan"
                  ? renderPlanScreen()
                  : view === "activity"
                  ? renderActivityScreen()
                  : renderHelpScreen()}
              </div>

              <nav className="phone-bottom" aria-label="App navigation">
                <button
                  className={view === "services" && role === "rider" ? "active" : ""}
                  onClick={() => {
                    setRole("rider");
                    setView("services");
                  }}
                >
                  <div className="icon-wrap">
                    <Icon name="home" />
                  </div>
                  Home
                </button>
                <button
                  className={view === "commute" && role === "rider" ? "active" : ""}
                  onClick={() => {
                    setRole("rider");
                    setView("commute");
                  }}
                >
                  <div className="icon-wrap">
                    <Icon name="train" />
                  </div>
                  MetroMile
                </button>
                <button
                  className={view === "plan" && role === "rider" ? "active" : ""}
                  onClick={() => {
                    setRole("rider");
                    setView("plan");
                  }}
                >
                  <div className="icon-wrap">
                    <Icon name="ticket" />
                  </div>
                  My pass
                </button>
                <button
                  className={view === "activity" && role === "rider" ? "active" : ""}
                  onClick={() => {
                    setRole("rider");
                    setView("activity");
                  }}
                >
                  <div className="icon-wrap">
                    <Icon name="calendar" />
                  </div>
                  Activity
                </button>
                <button
                  className={view === "help" && role === "rider" ? "active" : ""}
                  onClick={() => {
                    setRole("rider");
                    setView("help");
                  }}
                >
                  <div className="icon-wrap">
                    <Icon name="shield" />
                  </div>
                  Safety
                </button>
              </nav>
            </section>
          </div>

          <footer className="app-footer">
            <span>Independent Rapido concept · All fares, timings & allocations are simulated for Bengaluru Purple Line.</span>
            <button
              onClick={() =>
                setModal({
                  isOpen: true,
                  title: "Built around your everyday.",
                  content: (
                    <div>
                      <p className="subtext">
                        <strong>MetroMile</strong> is a comprehensive product concept for Rapido, bridging first and last-mile connectivity with Namma Metro.
                      </p>
                      <ul className="check-list">
                        <li>Automated morning & evening Captain allocation</li>
                        <li>Dynamic rescheduling during Namma Metro train delays</li>
                        <li>Guaranteed driver capacity with standby pool at hub stations</li>
                        <li>Flexible workday passes with single-tap pause functionality</li>
                        <li>Predictable recurring shift blocks for Rapido Captains</li>
                      </ul>
                      <p className="subtext" style={{ marginTop: "14px" }}>
                        Try picking <strong>08:00</strong> in the shift customizer to test the capacity sold-out scenario, or choose <strong>Outside catchment</strong> to view eligibility verification.
                      </p>
                      <button className="btn" onClick={() => setModal({ isOpen: false, title: "", content: null })}>
                        Got it
                      </button>
                    </div>
                  ),
                })
              }
            >
              How this demo works →
            </button>
          </footer>
        </main>
      </div>

      {/* Setup Modal */}
      {isSetupOpen && (
        <div className="modal-overlay" onClick={() => setIsSetupOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <h2>{setupReview ? "Your connections fit." : "Make it your everyday."}</h2>
              <button className="close" onClick={() => setIsSetupOpen(false)} aria-label="Close dialog">
                ×
              </button>
            </div>
            <div className="modal-body">
              {!setupReview ? (
                <>
                  <p className="subtext">
                    Start with our Purple Line pilot. Both endpoints must be within 2 km of a participating station.
                  </p>
                  <form onSubmit={handleValidateSetup}>
                    <label className="form-label" htmlFor="homeInput">
                      Home pickup area
                    </label>
                    <select id="homeInput" value={setupHome} onChange={(e) => setSetupHome(e.target.value)}>
                      <option value="Kasturi Nagar">Kasturi Nagar · 1.4 km to Baiyappanahalli</option>
                      <option value="Benniganahalli">Benniganahalli · 0.8 km to Baiyappanahalli</option>
                      <option value="Outside catchment">Outside pilot catchment · 3.5 km (Ineligible)</option>
                    </select>

                    <label className="form-label" htmlFor="officeInput">
                      Office drop area
                    </label>
                    <select id="officeInput" value={setupOffice} onChange={(e) => setSetupOffice(e.target.value)}>
                      <option value="Brookefield">Brookefield · 1.2 km from Kundalahalli</option>
                      <option value="EPIP Zone">EPIP Zone · 1.8 km from Kundalahalli</option>
                      <option value="Outside catchment">Outside pilot catchment · 4 km (Ineligible)</option>
                    </select>

                    <div className="form-grid">
                      <div>
                        <label className="form-label" htmlFor="shiftStart">
                          At my desk by
                        </label>
                        <input
                          required
                          type="time"
                          id="shiftStart"
                          value={setupStart}
                          onChange={(e) => setSetupStart(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="form-label" htmlFor="shiftEnd">
                          Leave office at
                        </label>
                        <input
                          required
                          type="time"
                          id="shiftEnd"
                          value={setupEnd}
                          onChange={(e) => setSetupEnd(e.target.value)}
                        />
                      </div>
                    </div>

                    <label className="form-label">Office days</label>
                    <div className="day-picks">
                      {["M", "T", "W", "T", "F"].map((d, i) => {
                        const isSelected = setupDays.includes(i);
                        return (
                          <button
                            key={i}
                            type="button"
                            className={isSelected ? "selected" : ""}
                            onClick={() => {
                              setSetupDays(isSelected ? setupDays.filter((x) => x !== i) : [...setupDays, i]);
                            }}
                          >
                            {d}
                          </button>
                        );
                      })}
                    </div>

                    <p className="helper">Pilot shifts: arrival 08:00–11:00 · departure 17:00–20:00.</p>
                    {setupError && <p className="error">{setupError}</p>}

                    <button className="btn" type="submit" style={{ marginTop: "16px" }}>
                      Check my connections →
                    </button>
                  </form>
                </>
              ) : (
                <>
                  <span className="badge" style={{ background: "#e8f5e9", color: "#2e7d32" }}>
                    ✓ Both ends verified within pilot catchment
                  </span>
                  <p className="subtext" style={{ margin: "10px 0" }}>
                    <strong>{setupHome}</strong> → Baiyappanahalli Metro → Kundalahalli Metro → <strong>{setupOffice}</strong>
                  </p>
                  <div className="capacity">
                    <Icon name="shield" style={{ color: "var(--green)" }} />
                    <div>
                      <strong>Captain capacity confirmed</strong>
                      <br /> Morning & evening reserved · {setupDays.length} days/week
                    </div>
                  </div>
                  <div className="row">
                    <span>Recommended departure from home</span>
                    <strong>{addMinutesToTime(setupStart, -60)}</strong>
                  </div>
                  <div className="row">
                    <span>Expected arrival at desk</span>
                    <strong>{addMinutesToTime(setupStart, -10)} (10 min safety buffer)</strong>
                  </div>
                  <hr className="divider" />
                  <div className="row">
                    <span>
                      {setupDays.length * 4} office days · {setupDays.length * 4 * 4} bike legs
                    </span>
                    <strong style={{ fontSize: "16px" }}>{formatMoney(setupDays.length * 4 * 4 * 40)}</strong>
                  </div>
                  <p className="helper">
                    Metro ticket fare is separate. ₹40/leg is the pilot flat subscription rate.
                  </p>
                  <button className="btn" onClick={handleActivatePass} style={{ marginTop: "14px" }}>
                    {isActive ? "Save changes to subscription" : "Activate MetroMile pass"}
                  </button>
                  <p className="footnote">Simulation only · No real credit card or booking required</p>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Generic Modal */}
      {modal.isOpen && (
        <div
          className="modal-overlay"
          onClick={() => setModal({ isOpen: false, title: "", content: null })}
        >
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <h2>{modal.title}</h2>
              <button
                className="close"
                onClick={() => setModal({ isOpen: false, title: "", content: null })}
                aria-label="Close dialog"
              >
                ×
              </button>
            </div>
            <div className="modal-body">{modal.content}</div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div id="toast" className="toast" role="status">
          {toastMessage}
        </div>
      )}
    </>
  );
}
