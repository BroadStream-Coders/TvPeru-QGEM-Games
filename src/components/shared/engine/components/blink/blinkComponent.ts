import { GameObjectComponent } from "@engine/gameObject";

export interface BlinkComponent extends GameObjectComponent {
  type: "blink";
  pulseScale: number;
  pulseDuration: number;
  blinkCount: number;
  blinkDuration: number;
}

export function createBlinkComponent(
  init?: Partial<Omit<BlinkComponent, "type">>,
): BlinkComponent {
  return {
    type: "blink",
    pulseScale: init?.pulseScale ?? 1.25,
    pulseDuration: init?.pulseDuration ?? 0.12,
    blinkCount: init?.blinkCount ?? 3,
    blinkDuration: init?.blinkDuration ?? 0.08,
  };
}
