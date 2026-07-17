import { HoloComponent } from "./holoComponent";

export function HoloView({ component }: { component: HoloComponent }) {
  if (!component.enabled) return null;
  const period = component.period > 0 ? component.period : 4;
  const i = component.intensity;
  const glow = component.glow ?? 0;
  const radius = `${component.radius}cqw`;
  if (i <= 0 && glow <= 0) return null;
  return (
    <div className="pointer-events-none absolute inset-0 z-10">
      {glow > 0 && (
        <div
          className="absolute inset-0"
          style={{
            borderRadius: radius,
            boxShadow: `0 0 3.5cqw 0.3cqw oklch(0.85 0.16 90 / ${glow})`,
            animation: `engine-holo-pulse ${period * 0.56}s ease-in-out infinite`,
          }}
        />
      )}
      {i > 0 && (
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ borderRadius: radius }}
        >
          <div
            className="absolute"
            style={{
              top: "-60%",
              left: "-120%",
              width: "70%",
              height: "220%",
              mixBlendMode: "color-dodge",
              background: `linear-gradient(100deg, transparent 0%, oklch(0.9 0.16 95 / ${i}) 30%, oklch(0.92 0.14 150 / ${i * 0.55}) 42%, oklch(0.88 0.18 55 / ${i}) 55%, oklch(0.9 0.15 320 / ${i * 0.5}) 68%, transparent 100%)`,
              animation: `engine-holo-sweep ${period}s ease-in-out infinite`,
            }}
          />
        </div>
      )}
    </div>
  );
}
