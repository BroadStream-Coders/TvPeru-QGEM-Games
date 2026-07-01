"use client";

import { EditorLayout } from "@engine/editor/EditorLayout";
import { sandboxGame } from "./game";

export default function SandboxPage() {
  return <EditorLayout game={sandboxGame} />;
}
