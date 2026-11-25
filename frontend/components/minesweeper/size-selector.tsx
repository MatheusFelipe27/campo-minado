import { BOARD_SIZES, type BoardSize } from '@/lib/minesweeper/board';
import {
  Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';

const options = (Object.keys(BOARD_SIZES) as BoardSize[]).map(value => {
  const { columns, rows, mines } = BOARD_SIZES[value];
  return { value, label: `${columns} × ${rows} (${mines} minas)` };
});

export function SizeSelector({ size, onChange }: {
  size: BoardSize;
  onChange: (size: BoardSize) => void;
}) {
  return (
    <div className="mb-4 grid gap-1">
      <label htmlFor="board-size" className="text-sm font-medium">Dificuldade</label>
      <Select
        items={options}
        value={size}
        onValueChange={value => {
          if (value && value !== size) onChange(value);
        }}
      >
        <SelectTrigger id="board-size">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {options.map(option => (
              <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
