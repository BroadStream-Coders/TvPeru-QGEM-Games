"use client";

import { EditorLayout } from "@engine/editor/EditorLayout";
import { calculoMentalGame } from "./game";

export default function CalculoMentalPage() {
  return <EditorLayout game={calculoMentalGame} />;
}
