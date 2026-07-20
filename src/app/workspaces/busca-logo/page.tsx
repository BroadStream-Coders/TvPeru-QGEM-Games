"use client";

import { EditorLayout } from "@engine/editor/EditorLayout";
import { buscaLogoGame } from "./game";

export default function BuscaLogoPage() {
  return <EditorLayout game={buscaLogoGame} />;
}
