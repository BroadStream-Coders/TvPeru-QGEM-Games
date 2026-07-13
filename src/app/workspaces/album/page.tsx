"use client";

import { EditorLayout } from "@engine/editor/EditorLayout";
import { albumGame } from "./game";

export default function AlbumPage() {
  return <EditorLayout game={albumGame} />;
}
