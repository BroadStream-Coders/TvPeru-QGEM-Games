import type { Ref } from "react";

export function assignRef<T>(ref: Ref<T> | undefined, node: T | null): void {
  if (!ref) return;
  if (typeof ref === "function") {
    ref(node);
  } else {
    (ref as { current: T | null }).current = node;
  }
}

export function mergeRefs<T>(
  ...refs: (Ref<T> | undefined)[]
): (node: T | null) => void {
  return (node) => {
    for (const ref of refs) assignRef(ref, node);
  };
}
