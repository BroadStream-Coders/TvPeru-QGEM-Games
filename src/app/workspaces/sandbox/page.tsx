"use client";

import { useEffect, useState } from "react";
import { FlaskConical } from "lucide-react";
import { useWorkspaceHeader } from "@/hooks/use-workspace-header";
import { Scene, SceneBackground } from "@/components/shared/engine/Scene";

export default function SandboxPage() {
  const setHeader = useWorkspaceHeader((s) => s.setHeader);
  const resetHeader = useWorkspaceHeader((s) => s.resetHeader);

  const [background] = useState<SceneBackground>({
    type: "color",
    value: "#01FF02",
  });

  useEffect(() => {
    setHeader({
      title: "Sandbox",
      icon: <FlaskConical className="h-3 w-3" />,
    });
  }, [setHeader]);

  useEffect(() => {
    return () => resetHeader();
  }, [resetHeader]);

  return (
    <main className="flex-1 p-3 overflow-auto flex flex-col gap-3">
      <Scene background={background} hideCursorOnFullscreen>
        <div className="absolute inset-0" />
      </Scene>
    </main>
  );
}
