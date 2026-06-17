import { BorderComponent } from "./borderComponent";

export function BorderView({ component }: { component: BorderComponent }) {
  if (component.width <= 0) return null;
  return (
    <div
      className="absolute inset-0"
      style={{
        border: `${component.width}cqi solid ${component.color}`,
        borderRadius: `${component.radius}cqi`,
      }}
    />
  );
}
