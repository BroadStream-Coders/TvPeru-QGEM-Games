"use client";

import { EditorLayout } from "@engine/editor/EditorLayout";
import { operacionesCombinadasGame } from "./game";

export default function OperacionesCombinadasPage() {
  return <EditorLayout game={operacionesCombinadasGame} />;
}
