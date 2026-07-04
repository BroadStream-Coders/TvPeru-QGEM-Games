"use client";

import { useEffect } from "react";
import { useEditor } from "@engine/editor/editorContext";
import { ImageComponent } from "@engine/components/image/imageComponent";
import { DeletreoComponent } from "./deletreoComponent";

export function DeletreoView({ component }: { component: DeletreoComponent }) {
  const { setGameObjects } = useEditor();
  const ref = component.image;
  const desired =
    component.frame === "error" ? component.errorFrame : component.normalFrame;

  useEffect(() => {
    if (!ref || desired === undefined) return;
    setGameObjects((prev) => {
      let changed = false;
      const next = prev.map((go) => {
        if (go.id !== ref.gameObjectId) return go;
        return {
          ...go,
          components: go.components.map((c) => {
            if (c.type !== ref.type) return c;
            if ((c as ImageComponent).assetKey === desired) return c;
            changed = true;
            return { ...c, assetKey: desired };
          }),
        };
      });
      return changed ? next : prev;
    });
  }, [ref, desired, setGameObjects]);

  return null;
}
