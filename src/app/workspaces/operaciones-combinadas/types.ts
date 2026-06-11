export interface GridVec2 {
  x: number;
  y: number;
}

export interface OperationSequence {
  values: string[];
  position: GridVec2;
  direction: GridVec2;
}

export interface Operation {
  sequence: OperationSequence;
  hiddenIndexes: number[];
}

export interface Board {
  operations: Operation[];
}

export interface Round {
  boards: Board[];
}

export interface OperacionesCombinadasData {
  rounds: Round[];
}

function isGridVec2(value: unknown): value is GridVec2 {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as GridVec2).x === "number" &&
    typeof (value as GridVec2).y === "number"
  );
}

function isOperation(value: unknown): value is Operation {
  if (typeof value !== "object" || value === null) return false;
  const op = value as Operation;
  const seq = op.sequence;
  return (
    typeof seq === "object" &&
    seq !== null &&
    Array.isArray(seq.values) &&
    seq.values.every((v) => typeof v === "string") &&
    isGridVec2(seq.position) &&
    isGridVec2(seq.direction) &&
    Array.isArray(op.hiddenIndexes) &&
    op.hiddenIndexes.every((i) => typeof i === "number")
  );
}

export function isOperacionesCombinadasData(
  data: unknown,
): data is OperacionesCombinadasData {
  if (typeof data !== "object" || data === null) return false;
  const rounds = (data as OperacionesCombinadasData).rounds;
  return (
    Array.isArray(rounds) &&
    rounds.every(
      (round) =>
        typeof round === "object" &&
        round !== null &&
        Array.isArray(round.boards) &&
        round.boards.every(
          (board) =>
            typeof board === "object" &&
            board !== null &&
            Array.isArray(board.operations) &&
            board.operations.every(isOperation),
        ),
    )
  );
}
