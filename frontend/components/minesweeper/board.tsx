'use client';

import { useId, useRef, useState, type KeyboardEvent } from 'react';
import type { BoardSize, Cell } from '../../lib/minesweeper/board';
import { createGame, playMove } from '../../lib/minesweeper/game';
import styles from './board.module.css';
import { SizeSelector } from './size-selector';
import { Timer } from './timer';
import { remainingMines } from '../../lib/minesweeper/flag';
import { submitWinningMove } from '../../lib/winning-score';

function cellDisplay(cell: Cell) {
  if (cell.flagged) return { text: '⚑', label: 'com bandeira' };
  if (!cell.revealed) return { text: '', label: 'fechada' };
  if (cell.hasMine) return { text: '✹', label: 'mina' };
  if (cell.adjacentMines === 0) return { text: '', label: 'vazia' };
  return { text: cell.adjacentMines, label: `minas ao redor: ${cell.adjacentMines}` };
}

export function Board() {
  const [game, setGame] = useState(() => createGame('9x9'));
  const [activeCell, setActiveCell] = useState({ row: 0, column: 0 });
  const field = useRef<HTMLDivElement>(null);
  const instructionsId = useId();
  const [submission, setSubmission] = useState<{ game: typeof game; message: string } | null>(null);
  const finished = game.status === 'won' || game.status === 'lost';

  function startGame(size: BoardSize) {
    setActiveCell({ row: 0, column: 0 });
    setGame(createGame(size));
  }

  function focusCell(row: number, column: number) {
    field.current?.querySelector<HTMLButtonElement>(`[data-cell="${row}-${column}"]`)?.focus();
  }

  function handleKey(event: KeyboardEvent<HTMLButtonElement>, row: number, column: number) {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    switch (event.key) {
      case 'ArrowUp': row = Math.max(0, row - 1); break;
      case 'ArrowDown': row = Math.min(game.board.length - 1, row + 1); break;
      case 'ArrowLeft': column = Math.max(0, column - 1); break;
      case 'ArrowRight': column = Math.min(game.board[row].length - 1, column + 1); break;
      case 'f':
      case 'F':
        if (!event.repeat) move('flag', row, column);
        return;
      default: return;
    }
    event.preventDefault();
    focusCell(row, column);
  }

  function move(type: 'flag' | 'reveal', row: number, column: number) {
    if (finished) return;
    const next = playMove(game, { type, position: { row, column } }, Math.random, performance.now());
    setGame(next);
    const pending = submitWinningMove(game, next);
    if (!pending) return;

    setSubmission({ game: next, message: 'Salvando pontuação…' });
    function showResult(message: string) {
      setSubmission(current => current?.game === next ? { game: next, message } : current);
    }
    void pending.then(
      () => showResult('Pontuação salva.'),
      (error: unknown) => showResult(error instanceof Error ? error.message : 'Falha ao salvar a pontuação.'),
    );
  }

  return (
    <section className={styles.panel} aria-label="Tabuleiro de Campo Minado">
      <SizeSelector size={game.size} onChange={startGame} />
      <Timer startedAt={game.startedAt} finishedAt={game.finishedAt} />
      <p aria-live="polite" aria-atomic="true">Minas restantes: {remainingMines(game.size, game.board)}</p>
      <p id={instructionsId}>Use Tab para entrar ou sair do campo e as setas para navegar. Clique ou pressione Enter ou Espaço para revelar. Use o botão direito ou F para marcar e desmarcar bandeiras.</p>
      <div ref={field} className={styles.field} role="grid" aria-label="Campo de minas" aria-describedby={instructionsId}>
        {game.board.map((line, row) => (
          <div className={styles.row} key={row} role="row">
            {line.map((cell, column) => {
              const { text, label } = cellDisplay(cell);
              return (
                <div key={column} role="gridcell">
                  <button
                    type="button"
                    className={styles.cell}
                    data-revealed={cell.revealed}
                    aria-disabled={finished}
                    data-cell={`${row}-${column}`}
                    tabIndex={row === activeCell.row && column === activeCell.column ? 0 : -1}
                    onFocus={() => setActiveCell({ row, column })}
                    aria-label={`Linha ${row + 1}, coluna ${column + 1}, ${label}`}
                    onClick={() => move('reveal', row, column)}
                    onContextMenu={event => {
                      event.preventDefault();
                      move('flag', row, column);
                    }}
                    onKeyDown={event => handleKey(event, row, column)}
                  >
                    {text}
                  </button>
                </div>
              );
            })}
          </div>
        ))}
      </div>
      <p role="status">
        {game.status === 'won' && 'Vitória! Você revelou todas as células seguras.'}
        {game.status === 'lost' && 'Fim de jogo. Você revelou uma mina.'}
        {submission?.game === game && ` ${submission.message}`}
      </p>
      {finished && (
        <button type="button" onClick={() => {
          startGame(game.size);
          focusCell(0, 0);
        }}>Jogar novamente</button>
      )}
    </section>
  );
}
