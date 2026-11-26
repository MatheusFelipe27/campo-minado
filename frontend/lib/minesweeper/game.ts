import { createEmptyBoard, generateBoard, type BoardSize, type Cell, type Position } from './board';
import { toggleFlag } from './flag';
import { revealCell } from './reveal';
import { checkVictory } from './victory';

export interface Game {
  size: BoardSize;
  board: Cell[][];
  status: 'idle' | 'playing' | 'won' | 'lost';
  startedAt: number | null;
  finishedAt: number | null;
  detonatedMine: Position | null;
}

export function createGame(size: BoardSize): Game {
  return { size, board: createEmptyBoard(size), status: 'idle', startedAt: null, finishedAt: null, detonatedMine: null };
}

export function elapsedSeconds(startedAt: number | null, end: number): number {
  if (startedAt === null) return 0;
  return Math.max(0, Math.floor((end - startedAt) / 1000));
}

type Move = { type: 'flag' | 'reveal'; position: Position };

export function playMove(game: Game, move: Move, random: () => number, now: number): Game {
  if (game.status === 'won' || game.status === 'lost') return game;
  const { position } = move;
  if (move.type === 'flag') {
    const board = toggleFlag(game.board, position);
    return board === game.board ? game : { ...game, board };
  }

  const selected = game.board[position.row]?.[position.column];
  if (!selected) throw new RangeError('Célula fora do tabuleiro');
  if (selected.flagged || selected.revealed) return game;

  let board = game.board;
  if (game.status === 'idle') {
    board = generateBoard(game.size, position, random);
    game.board.forEach((line, row) => line.forEach((cell, column) => {
      board[row][column].flagged = cell.flagged;
    }));
  }
  const result = revealCell(board, position);
  const startedAt = game.startedAt ?? now;
  if (result.hitMine) {
    const exposed = result.board.map(line => line.map(cell =>
      cell.hasMine ? { ...cell, revealed: true, flagged: false } : cell,
    ));
    return { ...game, board: exposed, status: 'lost', startedAt, finishedAt: now, detonatedMine: position };
  }
  const won = checkVictory(result.board);
  return { ...game, board: result.board, status: won ? 'won' : 'playing', startedAt, finishedAt: won ? now : null };
}
