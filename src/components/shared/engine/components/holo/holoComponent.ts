import { GameObjectComponent } from "@engine/gameObject";

export interface HoloComponent extends GameObjectComponent {
  type: "holo";
  enabled: boolean;
  period: number;
  intensity: number;
  radius: number;
}

export function createHoloComponent(
  init?: Partial<Omit<HoloComponent, "type">>,
): HoloComponent {
  return {
    type: "holo",
    enabled: init?.enabled ?? false,
    period: init?.period ?? 5,
    intensity: init?.intensity ?? 0.55,
    radius: init?.radius ?? 1,
  };
}
