import type { Cell, Position } from './board';

export function revealCell(board: Cell[][], position: Position) {
  const { row, column } = position;
  const selected = board[row]?.[column];
  if (!selected) throw new RangeError('Célula fora do tabuleiro');
  if (selected.revealed) return { board, hitMine: selected.hasMine };

  const next = board.map(line => line.slice());
  next[row][column] = { ...selected, revealed: true };
  if (selected.hasMine || selected.adjacentMines > 0) {
    return { board: next, hitMine: selected.hasMine };
  }

  const queue = [position];
  for (let index = 0; index < queue.length; index++) {
    const current = queue[index];
    for (let r = current.row - 1; r <= current.row + 1; r++) {
      for (let c = current.column - 1; c <= current.column + 1; c++) {
        const neighbor = next[r]?.[c];
        if (!neighbor || neighbor.revealed || neighbor.hasMine) continue;
        next[r][c] = { ...neighbor, revealed: true };
        if (neighbor.adjacentMines === 0) queue.push({ row: r, column: c });
      }
    }
  }
  return { board: next, hitMine: false };
}
