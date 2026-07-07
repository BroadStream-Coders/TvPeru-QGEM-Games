"use client";

import { useState } from "react";
import {
  AnimatePresence,
  motion,
  useAnimate,
  useMotionTemplate,
  useMotionValue,
  useSpring,
  type Transition,
} from "motion/react";

/* ===========================================================================
 * Lab: motion (ex-framer-motion). Cuatro juguetes:
 *   1. Pantallas  → transición entre escenas (magic move / slide / fade / pop)
 *   2. Repartir   → cartas que vuelan del mazo a la mesa, escalonadas
 *   3. Camera shake → sacudida de "cámara" para impacto
 *   4. Carta shiny → tilt 3D + brillo que barre + holo, siguiendo el mouse
 * ========================================================================= */

type Tab = "screens" | "deal" | "shake" | "shiny";

const TABS: { id: Tab; label: string }[] = [
  { id: "screens", label: "Pantallas" },
  { id: "deal", label: "Repartir cartas" },
  { id: "shake", label: "Camera shake" },
  { id: "shiny", label: "Carta shiny" },
];

export default function MotionLab() {
  const [tab, setTab] = useState<Tab>("screens");

  return (
    <div className="flex h-screen flex-col bg-bg text-ink">
      <div className="flex items-center gap-2 border-b border-edge bg-head px-3 py-2">
        <span className="mr-2 text-xs font-bold tracking-tight">motion · playground</span>
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`rounded-md border px-2.5 py-1 text-2xs font-medium transition-colors ${
              tab === t.id
                ? "border-acc/60 bg-acc-bg text-acc"
                : "border-line bg-elev text-dim hover:bg-elev-2"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "screens" && <ScreenTransitions />}
      {tab === "deal" && <DealCards />}
      {tab === "shake" && <CameraShake />}
      {tab === "shiny" && <ShinyCard />}
    </div>
  );
}

/* ===========================================================================
 * 1. TRANSICIÓN ENTRE PANTALLAS
 * ========================================================================= */

interface Obj {
  id: string;
  label: string;
  color: string;
  x: number;
  y: number;
  w: number;
  h: number;
  font?: number;
}

interface Scene {
  name: string;
  bg: string;
  objects: Obj[];
}

const BLUE = "#2563eb";
const AMBER = "#d97706";
const GREEN = "#16a34a";
const RED = "#dc2626";
const SLATE = "#334155";

const SCENES: Scene[] = [
  {
    name: "Portada",
    bg: "#0b1120",
    objects: [
      { id: "logo", label: "LOGO", color: BLUE, x: 35, y: 16, w: 30, h: 36, font: 5 },
      { id: "titulo", label: "Que Gane el Mejor", color: AMBER, x: 18, y: 60, w: 64, h: 18, font: 4 },
      { id: "hint", label: "▶ Jugar", color: GREEN, x: 40, y: 82, w: 20, h: 10, font: 2.6 },
    ],
  },
  {
    name: "Ronda",
    bg: "#0a0f1a",
    objects: [
      { id: "logo", label: "LOGO", color: BLUE, x: 3, y: 5, w: 13, h: 16, font: 2.2 },
      { id: "marcador", label: "12 — 08", color: AMBER, x: 70, y: 5, w: 26, h: 16, font: 3.4 },
      { id: "pregunta", label: "¿Capital del Perú?", color: SLATE, x: 10, y: 28, w: 80, h: 24, font: 4 },
      { id: "opA", label: "A · Lima", color: BLUE, x: 10, y: 60, w: 38, h: 15, font: 3 },
      { id: "opB", label: "B · Cusco", color: BLUE, x: 52, y: 60, w: 38, h: 15, font: 3 },
      { id: "timer", label: "00:15", color: RED, x: 42, y: 80, w: 16, h: 14, font: 3 },
    ],
  },
  {
    name: "Ganador",
    bg: "#071a10",
    objects: [
      { id: "logo", label: "LOGO", color: BLUE, x: 43, y: 6, w: 14, h: 16, font: 2.2 },
      { id: "ganador", label: "¡GANADOR!", color: GREEN, x: 15, y: 30, w: 70, h: 30, font: 6 },
      { id: "marcador", label: "12 — 08", color: AMBER, x: 35, y: 66, w: 30, h: 18, font: 4 },
    ],
  },
];

type Mode = "magic" | "slide" | "fade" | "pop";

const MODES: { id: Mode; label: string; hint: string }[] = [
  { id: "magic", label: "Magic move", hint: "objetos compartidos vuelan y se transforman (layoutId)" },
  { id: "slide", label: "Slide", hint: "la pantalla entra empujando a la anterior" },
  { id: "fade", label: "Fade", hint: "crossfade suave entre pantallas" },
  { id: "pop", label: "Pop escalonado", hint: "cada objeto entra con un rebote, uno tras otro" },
];

function ScreenTransitions() {
  const [idx, setIdx] = useState(0);
  const [dir, setDir] = useState(1);
  const [mode, setMode] = useState<Mode>("magic");
  const [bounce, setBounce] = useState(0.35);
  const [duration, setDuration] = useState(0.5);

  const scene = SCENES[idx];
  const spring: Transition = { type: "spring", visualDuration: duration, bounce };

  function go(next: number) {
    setDir(next > idx ? 1 : -1);
    setIdx((next + SCENES.length) % SCENES.length);
  }

  const screenLevel = mode === "slide" || mode === "fade";

  return (
    <>
      <div className="flex flex-wrap items-center gap-2 border-b border-edge bg-panel px-3 py-2">
        <button
          onClick={() => go(idx - 1)}
          className="rounded-md border border-line bg-elev px-2.5 py-1 text-2xs font-medium text-ink hover:bg-elev-2"
        >
          ← Anterior
        </button>
        <div className="flex items-center gap-1">
          {SCENES.map((s, i) => (
            <button
              key={s.name}
              onClick={() => go(i)}
              title={s.name}
              className={`h-2 w-2 rounded-full transition-colors ${
                i === idx ? "bg-acc" : "bg-line hover:bg-dim"
              }`}
            />
          ))}
        </div>
        <button
          onClick={() => go(idx + 1)}
          className="rounded-md border border-line bg-elev px-2.5 py-1 text-2xs font-medium text-ink hover:bg-elev-2"
        >
          Siguiente →
        </button>
        <span className="w-20 text-2xs font-mono text-dim">{scene.name}</span>

        <span className="mx-1 h-4 w-px bg-line" />

        {MODES.map((m) => (
          <button
            key={m.id}
            onClick={() => setMode(m.id)}
            title={m.hint}
            className={`rounded-md border px-2.5 py-1 text-2xs font-medium transition-colors ${
              mode === m.id
                ? "border-acc/60 bg-acc-bg text-acc"
                : "border-line bg-elev text-dim hover:bg-elev-2"
            }`}
          >
            {m.label}
          </button>
        ))}

        <span className="mx-1 h-4 w-px bg-line" />

        <Slider label="Rebote" min={0} max={0.8} step={0.05} value={bounce} onChange={setBounce} fmt={(v) => v.toFixed(2)} />
        <Slider label="Duración" min={0.2} max={1.2} step={0.05} value={duration} onChange={setDuration} fmt={(v) => `${v.toFixed(2)}s`} />

        <span className="ml-auto text-2xs text-faint">{MODES.find((m) => m.id === mode)?.hint}</span>
      </div>

      <div className="grid min-h-0 flex-1 place-items-center overflow-hidden p-6">
        <div
          className="relative aspect-video w-full max-w-5xl overflow-hidden rounded-xl border border-line shadow-2xl [container-type:size]"
          style={{ transition: "background-color .5s", backgroundColor: scene.bg }}
        >
          {screenLevel ? (
            <AnimatePresence mode="wait" custom={dir}>
              <motion.div
                key={idx}
                custom={dir}
                variants={mode === "slide" ? slideVariants : fadeVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={spring}
                className="absolute inset-0"
              >
                {scene.objects.map((o) => (
                  <StaticBox key={o.id} o={o} />
                ))}
              </motion.div>
            </AnimatePresence>
          ) : (
            <AnimatePresence>
              {scene.objects.map((o, i) => (
                <motion.div
                  key={mode === "magic" ? o.id : `${idx}-${o.id}`}
                  layout={mode === "magic"}
                  layoutId={mode === "magic" ? o.id : undefined}
                  initial={{ opacity: 0, scale: 0.55 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.55 }}
                  transition={mode === "pop" ? { ...spring, delay: i * 0.06 } : spring}
                  className="absolute grid place-items-center rounded-lg text-center font-bold text-white shadow-lg"
                  style={boxStyle(o)}
                >
                  <span style={{ fontSize: `${o.font ?? 3}cqi` }}>{o.label}</span>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>
    </>
  );
}

function StaticBox({ o }: { o: Obj }) {
  return (
    <div
      className="absolute grid place-items-center rounded-lg text-center font-bold text-white shadow-lg"
      style={boxStyle(o)}
    >
      <span style={{ fontSize: `${o.font ?? 3}cqi` }}>{o.label}</span>
    </div>
  );
}

function boxStyle(o: Obj): React.CSSProperties {
  return { left: `${o.x}%`, top: `${o.y}%`, width: `${o.w}%`, height: `${o.h}%`, backgroundColor: o.color };
}

const slideVariants = {
  enter: (d: number) => ({ x: d > 0 ? "55%" : "-55%", opacity: 0 }),
  center: { x: "0%", opacity: 1 },
  exit: (d: number) => ({ x: d > 0 ? "-55%" : "55%", opacity: 0 }),
};

const fadeVariants = {
  enter: { opacity: 0, scale: 1.05 },
  center: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.97 },
};

/* ===========================================================================
 * 2. REPARTIR CARTAS
 * ========================================================================= */

const DEAL_FACES = [
  { v: "A", s: "♠", red: false },
  { v: "K", s: "♥", red: true },
  { v: "Q", s: "♦", red: true },
  { v: "J", s: "♣", red: false },
  { v: "10", s: "♥", red: true },
];

function DealCards() {
  const [dealt, setDealt] = useState(false);
  const [bounce, setBounce] = useState(0.4);
  const n = DEAL_FACES.length;
  const mid = (n - 1) / 2;

  return (
    <>
      <div className="flex items-center gap-3 border-b border-edge bg-panel px-3 py-2">
        <button
          onClick={() => setDealt((d) => !d)}
          className="rounded-md border border-acc/60 bg-acc-bg px-3 py-1 text-2xs font-bold text-acc hover:bg-acc-bg/70"
        >
          {dealt ? "Recoger" : "Repartir"}
        </button>
        <Slider label="Rebote" min={0} max={0.8} step={0.05} value={bounce} onChange={setBounce} fmt={(v) => v.toFixed(2)} />
        <span className="ml-auto text-2xs text-faint">
          las cartas salen del mazo escalonadas (stagger) y aterrizan con spring
        </span>
      </div>

      <div className="grid min-h-0 flex-1 place-items-center overflow-hidden bg-[#0a1a12] p-6">
        <div className="relative h-full w-full max-w-4xl">
          {/* fieltro de mesa */}
          <div className="pointer-events-none absolute inset-8 rounded-[40px] bg-[radial-gradient(ellipse_at_center,#12402a,#0a2418)] shadow-inner ring-1 ring-emerald-900/40" />

          {DEAL_FACES.map((f, i) => {
            const off = i - mid;
            const target = { x: off * 160, y: -Math.abs(off) * 10, rotate: off * 8 };
            const deck = { x: 0, y: 150, rotate: (i - mid) * 1.2 };
            return (
              <motion.div
                key={i}
                initial={false}
                animate={dealt ? { ...target, opacity: 1, scale: 1 } : { ...deck, opacity: 1, scale: 0.96 }}
                transition={{
                  type: "spring",
                  visualDuration: 0.5,
                  bounce,
                  delay: dealt ? i * 0.09 : (n - 1 - i) * 0.05,
                }}
                className="absolute left-1/2 top-1/2 flex h-40 w-28 flex-col justify-between rounded-xl border border-black/10 bg-white p-2 shadow-[0_10px_30px_rgba(0,0,0,.45)]"
                style={{ marginLeft: -56, marginTop: -80 }}
              >
                <span className={`text-lg font-black leading-none ${f.red ? "text-red-600" : "text-slate-900"}`}>
                  {f.v}
                  <br />
                  {f.s}
                </span>
                <span className={`self-center text-4xl ${f.red ? "text-red-600" : "text-slate-900"}`}>{f.s}</span>
                <span className={`rotate-180 self-end text-lg font-black leading-none ${f.red ? "text-red-600" : "text-slate-900"}`}>
                  {f.v}
                  <br />
                  {f.s}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </>
  );
}

/* ===========================================================================
 * 3. CAMERA SHAKE
 * ========================================================================= */

function CameraShake() {
  const [scope, animate] = useAnimate();
  const [amp, setAmp] = useState(14);

  function shake() {
    const a = amp;
    animate(
      scope.current,
      {
        x: [0, -a, a * 0.8, -a * 0.6, a * 0.4, 0],
        y: [0, a * 0.5, -a * 0.7, a * 0.4, -a * 0.2, 0],
        rotate: [0, -a * 0.12, a * 0.1, -a * 0.06, a * 0.03, 0],
        scale: [1, 1.02, 1, 1.01, 1],
      },
      { duration: 0.5, ease: "easeOut" },
    );
  }

  return (
    <>
      <div className="flex items-center gap-3 border-b border-edge bg-panel px-3 py-2">
        <button
          onClick={shake}
          className="rounded-md border border-red-500/60 bg-red-500/15 px-3 py-1 text-2xs font-bold text-red-400 hover:bg-red-500/25"
        >
          ¡Impacto!
        </button>
        <Slider label="Fuerza" min={4} max={40} step={2} value={amp} onChange={setAmp} fmt={(v) => `${v}px`} />
        <span className="ml-auto text-2xs text-faint">
          sacude el contenedor entero = sensación de cámara golpeada (keyframes)
        </span>
      </div>

      <div className="grid min-h-0 flex-1 place-items-center overflow-hidden bg-black p-6">
        <div
          ref={scope}
          className="relative grid aspect-video w-full max-w-4xl place-items-center overflow-hidden rounded-xl border border-line bg-[#0b1120] shadow-2xl [container-type:size]"
        >
          <div className="grid gap-[3cqi] text-center">
            <span className="text-[9cqi] font-black text-amber-400">¡CORRECTO!</span>
            <span className="text-[4cqi] font-bold text-white/80">+500 puntos</span>
          </div>
          <div className="absolute left-[8cqi] top-[10cqi] h-[16cqi] w-[16cqi] rounded-xl bg-blue-600 shadow-lg" />
          <div className="absolute bottom-[10cqi] right-[8cqi] h-[16cqi] w-[16cqi] rounded-xl bg-emerald-600 shadow-lg" />
        </div>
      </div>
    </>
  );
}

/* ===========================================================================
 * 4. CARTA SHINY (tilt 3D + glare + brillo que barre + holo)
 * ========================================================================= */

function ShinyCard() {
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const gx = useMotionValue(50);
  const gy = useMotionValue(50);

  const srx = useSpring(rx, { stiffness: 180, damping: 14 });
  const sry = useSpring(ry, { stiffness: 180, damping: 14 });

  const glare = useMotionTemplate`radial-gradient(circle at ${gx}% ${gy}%, rgba(255,255,255,.55), rgba(255,255,255,0) 45%)`;
  const holo = useMotionTemplate`linear-gradient(115deg, transparent 20%, rgba(255,0,132,.35) ${gx}%, rgba(0,231,255,.35) ${gy}%, transparent 80%)`;

  function onMove(e: React.MouseEvent<HTMLDivElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    ry.set((px - 0.5) * 28);
    rx.set(-(py - 0.5) * 22);
    gx.set(px * 100);
    gy.set(py * 100);
  }

  function onLeave() {
    rx.set(0);
    ry.set(0);
    gx.set(50);
    gy.set(50);
  }

  return (
    <>
      <div className="flex items-center gap-3 border-b border-edge bg-panel px-3 py-2">
        <span className="text-2xs font-medium text-dim">Mové el mouse sobre la carta →</span>
        <span className="ml-auto text-2xs text-faint">
          tilt 3D (spring) + glare que sigue el cursor + brillo que barre + capa holo
        </span>
      </div>

      <div className="grid min-h-0 flex-1 place-items-center overflow-hidden bg-[#0a0a12] p-6">
        <motion.div
          onMouseMove={onMove}
          onMouseLeave={onLeave}
          style={{ rotateX: srx, rotateY: sry, transformPerspective: 900 }}
          className="relative h-[420px] w-[300px] overflow-hidden rounded-2xl shadow-[0_30px_60px_rgba(0,0,0,.6)]"
        >
          {/* arte base */}
          <div className="absolute inset-0 bg-[linear-gradient(160deg,#2b1055,#7597de)]" />
          <div className="absolute inset-0 grid place-items-center">
            <div className="grid gap-3 text-center text-white">
              <span className="text-6xl drop-shadow-lg">★</span>
              <span className="text-2xl font-black tracking-wide drop-shadow">JOKER</span>
              <span className="text-xs font-semibold text-white/70">foil · edición shiny</span>
            </div>
          </div>

          {/* capa holográfica que reacciona al cursor */}
          <motion.div className="absolute inset-0 mix-blend-color-dodge" style={{ background: holo }} />

          {/* brillo puntual que sigue el cursor */}
          <motion.div className="absolute inset-0 mix-blend-soft-light" style={{ background: glare }} />

          {/* brillo diagonal que barre en loop, esquina a esquina */}
          <motion.div
            className="pointer-events-none absolute inset-0"
            initial={{ x: "-130%" }}
            animate={{ x: "130%" }}
            transition={{ duration: 2.6, repeat: Infinity, repeatDelay: 1.2, ease: "easeInOut" }}
            style={{
              background:
                "linear-gradient(105deg, transparent 35%, rgba(255,255,255,.65) 50%, transparent 65%)",
            }}
          />

          <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-white/25" />
        </motion.div>
      </div>
    </>
  );
}

/* ===========================================================================
 * util
 * ========================================================================= */

function Slider({
  label,
  min,
  max,
  step,
  value,
  onChange,
  fmt,
}: {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (v: number) => void;
  fmt: (v: number) => string;
}) {
  return (
    <label className="flex items-center gap-1.5 text-2xs text-dim">
      {label}
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} />
      <span className="w-10 font-mono">{fmt(value)}</span>
    </label>
  );
}
