'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getRanking, type RankingEntry } from '@/lib/api';
import { BOARD_SIZES, type BoardSize } from '@/lib/minesweeper/board';

type Filter = BoardSize | 'all';
const options: { value: Filter; label: string }[] = [
  { value: 'all', label: 'Todos os tamanhos' },
  ...(Object.keys(BOARD_SIZES) as BoardSize[]).map(value => ({
    value, label: value.replace('x', '×'),
  })),
];
const dateFormat = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' });

function Results({ size }: { size?: BoardSize }) {
  const [entries, setEntries] = useState<RankingEntry[] | null>(null);
  const [error, setError] = useState('');
  useEffect(() => {
    const controller = new AbortController();
    getRanking(size, controller.signal).then(
      data => { if (!controller.signal.aborted) setEntries(data); },
      cause => {
        if (!controller.signal.aborted) {
          setError(cause instanceof Error && !(cause instanceof TypeError)
            ? cause.message : 'Não foi possível conectar à API do ranking.');
        }
      },
    );
    return () => controller.abort();
  }, [size]);

  if (error) return <p role="alert">{error}</p>;
  if (!entries) return <p role="status">Carregando ranking…</p>;
  if (!entries.length) return <p role="status">{size ? 'Nenhuma pontuação para este tamanho.' : 'Nenhuma pontuação registrada.'}</p>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <caption className="sr-only">Até 30 pontuações por menor tempo</caption>
        <thead className="border-b text-muted-foreground">
          <tr>{['Posição', 'Jogador', 'Tempo', 'Campo', 'Data'].map(title =>
            <th scope="col" className="px-3 py-2" key={title}>{title}</th>)}</tr>
        </thead>
        <tbody>
          {entries.map((entry, index) => (
            <tr key={index} className="border-b">
              <td className="px-3 py-2 tabular-nums">{index + 1}</td>
              <td className="px-3 py-2">
                <span className="flex items-center gap-2">
                  {entry.userImage && <Image unoptimized src={entry.userImage} alt="" width={28} height={28} className="rounded-full" />}
                  {entry.userName}
                </span>
              </td>
              <td className="whitespace-nowrap px-3 py-2 tabular-nums">{entry.timeSeconds} s</td>
              <td className="px-3 py-2">{entry.boardSize.replace('x', '×')}</td>
              <td className="whitespace-nowrap px-3 py-2"><time dateTime={entry.createdAt}>{dateFormat.format(new Date(entry.createdAt))}</time></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Ranking() {
  const [filter, setFilter] = useState<Filter>('all');
  return (
    <>
      <div className="grid gap-1">
        <label htmlFor="ranking-size" className="text-sm font-medium">Tamanho do campo</label>
        <Select items={options} value={filter} onValueChange={value => { if (value) setFilter(value); }}>
          <SelectTrigger id="ranking-size"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {options.map(option => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      <Results key={filter} size={filter === 'all' ? undefined : filter} />
    </>
  );
}
