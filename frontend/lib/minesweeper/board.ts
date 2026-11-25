export const BOARD_SIZES = {
  '9x9': { columns: 9, rows: 9, mines: 10 },
  '16x16': { columns: 16, rows: 16, mines: 40 },
  '30x16': { columns: 30, rows: 16, mines: 99 },
} as const;

export type BoardSize = keyof typeof BOARD_SIZES;

export interface Position {
  row: number;
  column: number;
}

export interface Cell {
  hasMine: boolean;
  adjacentMines: number;
}

/** Called on the first reveal. Coordinates are zero-based; random returns a value in [0, 1). */
export function generateBoard(size: BoardSize, firstReveal: Position, random: () => number): Cell[][] {
  const { columns, rows, mines } = BOARD_SIZES[size];
  const { row, column } = firstReveal;
  if (!Number.isInteger(row) || row < 0 || row >= rows ||
      !Number.isInteger(column) || column < 0 || column >= columns) {
    throw new RangeError('Primeira célula fora do tabuleiro');
  }

  const board = Array.from({ length: rows }, () =>
    Array.from({ length: columns }, () => ({ hasMine: false, adjacentMines: 0 })),
  );
  const safeIndex = row * columns + column;
  const candidates = Array.from({ length: rows * columns }, (_, index) => index)
    .filter(index => index !== safeIndex);

  // Draw without replacement by moving each selected index into the used prefix.
  for (let i = 0; i < mines; i++) {
    const pick = i + Math.floor(random() * (candidates.length - i));
    [candidates[i], candidates[pick]] = [candidates[pick], candidates[i]];
    const mineRow = Math.floor(candidates[i] / columns);
    const mineColumn = candidates[i] % columns;
    board[mineRow][mineColumn].hasMine = true;
    for (let r = Math.max(0, mineRow - 1); r <= Math.min(rows - 1, mineRow + 1); r++) {
      for (let c = Math.max(0, mineColumn - 1); c <= Math.min(columns - 1, mineColumn + 1); c++) {
        if (r !== mineRow || c !== mineColumn) board[r][c].adjacentMines++;
      }
    }
  }
  return board;
}
