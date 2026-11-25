'use client';

import { useState } from 'react';
import type { Cell } from '../../lib/minesweeper/board';
import { createGame, playMove } from '../../lib/minesweeper/game';
import styles from './board.module.css';
import { SizeSelector } from './size-selector';
import { Timer } from './timer';
import { remainingMines } from '../../lib/minesweeper/flag';

function cellDisplay(cell: Cell) {
  if (cell.flagged) return { text: '⚑', label: 'com bandeira' };
  if (!cell.revealed) return { text: '', label: 'fechada' };
  if (cell.hasMine) return { text: '✹', label: 'mina' };
  if (cell.adjacentMines === 0) return { text: '', label: 'vazia' };
  return { text: cell.adjacentMines, label: `minas ao redor: ${cell.adjacentMines}` };
}

export function Board() {
  const [game, setGame] = useState(() => createGame('9x9'));
  const finished = game.status === 'won' || game.status === 'lost';

  function move(type: 'flag' | 'reveal', row: number, column: number) {
    setGame(playMove(game, { type, position: { row, column } }, Math.random, performance.now()));
  }

  return (
    <section className={styles.panel} aria-label="Tabuleiro de Campo Minado">
      <SizeSelector size={game.size} onChange={size => setGame(createGame(size))} />
      <Timer startedAt={game.startedAt} finishedAt={game.finishedAt} />
      <p aria-live="polite" aria-atomic="true">Minas restantes: {remainingMines(game.size, game.board)}</p>
      <p>Clique para revelar. Use o botão direito ou a tecla F para marcar e desmarcar bandeiras.</p>
      <div className={styles.field}>
        {game.board.map((line, row) => (
          <div className={styles.row} key={row}>
            {line.map((cell, column) => {
              const { text, label } = cellDisplay(cell);
              return (
                <button
                  key={column}
                  type="button"
                  className={styles.cell}
                  data-revealed={cell.revealed}
                  disabled={finished}
                  aria-label={`Linha ${row + 1}, coluna ${column + 1}, ${label}`}
                  onClick={() => move('reveal', row, column)}
                  onContextMenu={event => {
                    event.preventDefault();
                    move('flag', row, column);
                  }}
                  onKeyDown={event => {
                    if (event.key.toLowerCase() === 'f' && !event.repeat) move('flag', row, column);
                  }}
                >
                  {text}
                </button>
              );
            })}
          </div>
        ))}
      </div>
      <p role="status">
        {game.status === 'won' && 'Vitória! Você revelou todas as células seguras.'}
        {game.status === 'lost' && 'Fim de jogo. Você revelou uma mina.'}
      </p>
      {finished && (
        <button type="button" onClick={() => setGame(createGame(game.size))}>Jogar novamente</button>
      )}
    </section>
  );
}
