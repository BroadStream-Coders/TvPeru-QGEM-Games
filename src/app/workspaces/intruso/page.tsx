"use client";

import { EditorLayout } from "@engine/editor/EditorLayout";
import { intrusoGame } from "./game";

export default function IntrusoPage() {
  return <EditorLayout game={intrusoGame} />;
}
