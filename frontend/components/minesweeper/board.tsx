'use client';

import { useId, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react';
import type { BoardSize, Cell } from '../../lib/minesweeper/board';
import { createGame, playMove } from '../../lib/minesweeper/game';
import { GameControls, type Tool } from './game-controls';
import { remainingMines } from '../../lib/minesweeper/flag';
import { submitWinningMove } from '../../lib/winning-score';

function cellDisplay(cell: Cell) {
  if (cell.flagged) return { text: '⚑', label: 'com bandeira' };
  if (!cell.revealed) return { text: '', label: 'fechada' };
  if (cell.hasMine) return { text: '✹', label: 'mina' };
  if (cell.adjacentMines === 0) return { text: '', label: 'vazia' };
  return { text: cell.adjacentMines, label: `minas ao redor: ${cell.adjacentMines}` };
}

const numbers = ['text-slate-900', 'text-blue-800', 'text-green-800', 'text-red-800', 'text-indigo-900',
  'text-rose-900', 'text-teal-800', 'text-slate-950', 'text-stone-700'];
const raised = 'rounded-[4px] border-slate-950/80 bg-linear-to-b from-[#48627c] to-[#2b4158] shadow-[inset_1px_2px_0_#7190ab,inset_-2px_-3px_0_#203348] hover:brightness-115';
const open = 'rounded-[2px] border-stone-400 bg-[#f4ead6]';

export function Board() {
  const [game, setGame] = useState(() => createGame('9x9'));
  const [tool, setTool] = useState<Tool>('reveal');
  const [activeCell, setActiveCell] = useState({ row: 0, column: 0 });
  const field = useRef<HTMLDivElement>(null);
  const instructionsId = useId();
  const [submission, setSubmission] = useState<{ game: typeof game; message: string } | null>(null);
  const finished = game.status === 'won' || game.status === 'lost';

  function startGame(size: BoardSize) {
    setTool('reveal');
    setSubmission(null);
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
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (!event.repeat) move('reveal', row, column);
        return;
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
    <section className="mx-auto w-full max-w-[90rem] px-3 py-5 sm:px-8 lg:flex lg:flex-1 lg:flex-col" aria-label="Tabuleiro de Campo Minado">
      <GameControls size={game.size} onSizeChange={startGame} startedAt={game.startedAt} finishedAt={game.finishedAt}
        mines={remainingMines(game.size, game.board)} tool={tool} onToolChange={setTool}
        onRestart={() => { startGame(game.size); focusCell(0, 0); }} />
      <p role="status" className="mt-4 rounded-xl border border-slate-600 bg-slate-800 p-4 text-center font-semibold empty:hidden">
        {game.status === 'won' && 'Vitória! Você revelou todas as células seguras.'}
        {game.status === 'lost' && 'Fim de jogo. Você revelou uma mina.'}
        {submission?.game === game && ` ${submission.message}`}
      </p>
      <div
        style={{ '--rows': game.board.length, '--cols': game.board[0].length } as CSSProperties}
        className="mt-5 lg:min-h-[calc(var(--rows)*1.5rem+18px)] lg:flex-1 lg:[container-type:size]"
      >
        <div ref={field} className="mx-auto w-fit max-w-full overflow-x-auto overscroll-x-contain rounded-xl border border-slate-600 bg-[#101e2c] p-1.5 shadow-2xl sm:p-2 lg:[--tile:clamp(1.5rem,min((100cqw_-_18px)/var(--cols),(100cqh_-_18px)/var(--rows)),2.75rem)]" role="grid" aria-label="Campo de minas" aria-describedby={instructionsId}>
          {game.board.map((line, row) => (
            <div className="flex w-max" key={row} role="row">
              {line.map((cell, column) => {
                const { text, label } = cellDisplay(cell);
                const tile = cell.revealed ? open : raised;
                const ink = cell.revealed ? numbers[cell.hasMine ? 3 : cell.adjacentMines] : 'text-[#ff9b82]';
                return (
                  <div key={column} role="gridcell">
                    <button
                      type="button"
                      className={`grid size-9 touch-manipulation select-none place-items-center border p-0 font-display text-xl font-extrabold leading-none focus-visible:relative focus-visible:z-10 focus-visible:outline-3 focus-visible:-outline-offset-3 focus-visible:outline-arcade-amber lg:size-(--tile) ${tile} ${ink} ${finished || cell.revealed ? 'cursor-default' : 'cursor-pointer'}`}
                      aria-disabled={finished}
                      data-cell={`${row}-${column}`}
                      tabIndex={row === activeCell.row && column === activeCell.column ? 0 : -1}
                      onFocus={() => setActiveCell({ row, column })}
                      aria-label={`Linha ${row + 1}, coluna ${column + 1}, ${label}`}
                      onClick={() => move(tool, row, column)}
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
      </div>
      <p id={instructionsId} className="mt-4 text-center text-sm leading-relaxed text-slate-300">
        <span className="pointer-coarse:hidden">Setas para navegar · Enter ou Espaço para revelar · F ou botão direito para marcar</span>
        <span className="hidden pointer-coarse:inline">Escolha Revelar ou Marcar e toque em uma célula.</span>
      </p>
    </section>
  );
}
