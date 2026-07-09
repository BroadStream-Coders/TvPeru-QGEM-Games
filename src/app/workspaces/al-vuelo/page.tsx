"use client";

import { EditorLayout } from "@engine/editor/EditorLayout";
import { alVueloGame } from "./game";

export default function AlVueloPage() {
  return <EditorLayout game={alVueloGame} />;
}
