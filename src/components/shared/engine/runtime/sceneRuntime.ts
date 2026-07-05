import type { GameObject, GameObjectComponent } from "@engine/gameObject";
import type { RectTransformValues } from "@engine/RectTransform";

export interface RuntimeOverride {
  active?: boolean;
  transform?: Partial<RectTransformValues>;
  components?: Record<string, Record<string, unknown>>;
}

export type RuntimeState = Record<string, RuntimeOverride>;

export function mergeRuntime(
  design: GameObject[],
  runtime: RuntimeState,
  opts?: { transform?: boolean },
): GameObject[] {
  const withTransform = opts?.transform ?? true;
  return design.map((go) => {
    const ov = runtime[go.id];
    if (!ov) return go;
    return {
      ...go,
      active: ov.active ?? go.active,
      transform:
        withTransform && ov.transform
          ? { ...go.transform, ...ov.transform }
          : go.transform,
      components: ov.components
        ? go.components.map((c) => {
            const patch = ov.components![c.type];
            return patch ? ({ ...c, ...patch } as GameObjectComponent) : c;
          })
        : go.components,
    };
  });
}
