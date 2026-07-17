import { ShimmerComponent } from "./shimmerComponent";

export function ShimmerView({ component }: { component: ShimmerComponent }) {
  const { period, intensity } = component;
  if (period <= 0 || intensity <= 0) return null;

  const sweep = component.sweep > 0 ? component.sweep : 1;
  let outFrac = sweep / period;
  let backFrac = (sweep * 1.2) / period;
  const total = outFrac + backFrac;
  if (total > 1) {
    outFrac /= total;
    backFrac /= total;
  }
  const restEnd = Math.round((1 - outFrac - backFrac) * 1000) / 10;
  const outEnd = Math.round((restEnd + outFrac * 100) * 10) / 10;
  const name = `engine-shimmer-${restEnd}-${outEnd}`.replace(/\./g, "_");

  return (
    <div
      className="pointer-events-none absolute inset-0 z-10 overflow-hidden"
      style={{ borderRadius: `${component.radius}cqw` }}
    >
      <style>{`@keyframes ${name} {
  0%, ${restEnd}%, 100% { transform: translateX(0) rotate(8deg); }
  ${outEnd}% { transform: translateX(400%) rotate(8deg); }
}`}</style>
      <div
        className="absolute"
        style={{
          top: "-60%",
          left: "-120%",
          width: "70%",
          height: "220%",
          background: `linear-gradient(100deg, transparent 0%, transparent 35%, rgba(255, 255, 255, ${intensity}) 50%, transparent 65%, transparent 100%)`,
          animation: `${name} ${period}s ease-in-out infinite`,
          animationDelay: `${-component.phase}s`,
        }}
      />
    </div>
  );
}
