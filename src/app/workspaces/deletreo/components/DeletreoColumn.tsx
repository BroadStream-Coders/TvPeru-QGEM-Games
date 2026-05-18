"use client";

import { GroupColumn } from "@/components/shared/group-column/layout/GroupColumn";
import { GroupFooter } from "@/components/shared/group-column/layout/GroupFooter";
import { RowsContainer } from "@/components/shared/group-column/components/RowsContainer";
import { AddRowButton } from "@/components/shared/group-column/components/AddRowButton";
import { QuickLoad } from "@/components/shared/group-column/components/QuickLoad";
import { DeletreoRow } from "./DeletreoRow";

const MAX_CAPACITY = 30;

interface DeletreoColumnProps {
  index: number;
  words: string[];
  onWordChange: (wordIndex: number, value: string) => void;
  onAddWord: () => void;
  onRemoveWord: (wordIndex: number) => void;
  onRemoveColumn: () => void;
  onQuickLoad: (data: string[][]) => void;
}

export function DeletreoColumn({
  index,
  words,
  onWordChange,
  onAddWord,
  onRemoveWord,
  onRemoveColumn,
  onQuickLoad,
}: DeletreoColumnProps) {
  const handleAddWord = () => {
    if (words.length >= MAX_CAPACITY) return;
    onAddWord();
  };

  return (
    <GroupColumn
      index={index}
      onRemove={onRemoveColumn}
      currentCapacity={words.length}
      maxCapacity={MAX_CAPACITY}
    >
      <RowsContainer>
        {words.map((word, wordIndex) => (
          <DeletreoRow
            key={wordIndex}
            index={wordIndex}
            value={word}
            onChange={(val) => onWordChange(wordIndex, val)}
            onRemove={() => onRemoveWord(wordIndex)}
          />
        ))}
      </RowsContainer>

      <AddRowButton onClick={handleAddWord} label="Agregar Palabra" />

      <GroupFooter>
        <QuickLoad onLoad={onQuickLoad} />
      </GroupFooter>
    </GroupColumn>
  );
}
