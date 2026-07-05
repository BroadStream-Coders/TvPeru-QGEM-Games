"use client";

import { useEffect } from "react";
import { useSceneRuntime } from "@/hooks/use-scene-runtime";
import { DeletreoComponent } from "./deletreoComponent";

export function DeletreoView({ component }: { component: DeletreoComponent }) {
  const patchComponent = useSceneRuntime((s) => s.patchComponent);
  const ref = component.image;
  const desired =
    component.frame === "error" ? component.errorFrame : component.normalFrame;

  useEffect(() => {
    if (!ref || desired === undefined) return;
    patchComponent(ref.gameObjectId, ref.type, { assetKey: desired });
  }, [ref, desired, patchComponent]);

  return null;
}
