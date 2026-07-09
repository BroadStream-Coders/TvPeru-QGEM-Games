"use client";

import { EditorLayout } from "@engine/editor/EditorLayout";
import { laSabesGame } from "./game";

export default function LaSabesPage() {
  return <EditorLayout game={laSabesGame} />;
}
