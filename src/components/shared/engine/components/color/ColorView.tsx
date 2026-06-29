import { ColorComponent } from "@engine/components/color/colorComponent";

export function ColorView({ component }: { component: ColorComponent }) {
  return (
    <div
      className="h-full w-full"
      style={{ backgroundColor: component.value }}
    />
  );
}
