import { describe, expect, it } from 'vitest';
import { generateBoard } from './board';
import { toggleFlag } from './flag';
import { revealCell } from './reveal';

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
