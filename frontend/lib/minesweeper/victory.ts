import type { Cell } from './board';

export function checkVictory(board: Cell[][]): boolean {
  return board.length > 0 && board.every(row =>
    row.length > 0 && row.every(cell => cell.hasMine ? !cell.revealed : cell.revealed),
  );
}
