"use client";

import { useEffect } from "react";
import { FlaskConical } from "lucide-react";
import { useWorkspaceHeader } from "@/hooks/use-workspace-header";
import { EditorDock } from "./EditorDock";

export default function SandboxPage() {
  const setHeader = useWorkspaceHeader((s) => s.setHeader);
  const resetHeader = useWorkspaceHeader((s) => s.resetHeader);

  useEffect(() => {
    return () => resetHeader();
  }, [resetHeader]);

  useEffect(() => {
    setHeader({
      title: "Sandbox",
      icon: <FlaskConical className="h-3 w-3" />,
    });
  }, [setHeader]);

  return <EditorDock />;
}
