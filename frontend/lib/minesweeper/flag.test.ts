import { describe, expect, it } from 'vitest';
import { createEmptyBoard, generateBoard } from './board';
import { remainingMines, toggleFlag } from './flag';
import { revealCell } from './reveal';

describe('remainingMines', () => {
  it('começa com o total da dificuldade escolhida', () => {
    expect(remainingMines('9x9', createEmptyBoard('9x9'))).toBe(10);
    expect(remainingMines('16x16', createEmptyBoard('16x16'))).toBe(40);
    expect(remainingMines('30x16', createEmptyBoard('30x16'))).toBe(99);
  });

  it('desconta cada bandeira e devolve uma unidade ao retirá-la', () => {
    const position = { row: 0, column: 0 };
    const marked = toggleFlag(createEmptyBoard('9x9'), position);
    expect(remainingMines('9x9', marked)).toBe(9);
    expect(remainingMines('9x9', toggleFlag(marked, position))).toBe(10);
  });

  it('mostra saldo negativo quando há mais bandeiras do que minas', () => {
    let board = createEmptyBoard('9x9');
    for (let i = 0; i < 11; i++) {
      board = toggleFlag(board, { row: Math.floor(i / 9), column: i % 9 });
    }
    expect(remainingMines('9x9', board)).toBe(-1);
  });
});

describe('toggleFlag', () => {
  const position = { row: 0, column: 0 };

  it('marca e desmarca uma célula fechada preservando os estados anteriores', () => {
    const original = generateBoard('9x9', position, () => 0);
    const marked = toggleFlag(original, position);
    const cleared = toggleFlag(marked, position);
    expect(original[0][0].flagged).toBe(false);
    expect(marked[0][0].flagged).toBe(true);
    expect(cleared).toEqual(original);
  });

  it('ignora a marcação em uma célula aberta', () => {
    const original = generateBoard('9x9', position, () => 0);
    const { board } = revealCell(original, position);
    expect(toggleFlag(board, position)).toBe(board);
  });
});
