"use client";

import { useEffect } from "react";
import { useEditor } from "@engine/editor/editorContext";
import { useAssets } from "@engine/assetsContext";
import { BACKGROUND_ID } from "./constants";

export function IntrusoBehavior() {
  const { setGameObjects } = useEditor();
  const { assets } = useAssets();
  const backgroundUrl = assets.background?.url;

  useEffect(() => {
    if (!backgroundUrl) return;
    setGameObjects((prev) =>
      prev.map((go) =>
        go.id === BACKGROUND_ID
          ? {
              ...go,
              components: go.components.map((c) =>
                c.type === "video"
                  ? { ...c, src: backgroundUrl, source: "url" }
                  : c,
              ),
            }
          : go,
      ),
    );
  }, [backgroundUrl, setGameObjects]);

  return null;
}
