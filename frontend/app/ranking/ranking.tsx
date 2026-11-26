'use client';

import Image from 'next/image';
import { Medal } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getPersonalBests, getRanking, type PersonalBest, type RankingEntry } from '@/lib/api';
import { BOARD_SIZES, type BoardSize } from '@/lib/minesweeper/board';

type Filter = BoardSize | 'all';
type View = 'global' | 'personal';
const options: { value: Filter; label: string }[] = [
  { value: 'all', label: 'Todos os tamanhos' },
  ...(Object.keys(BOARD_SIZES) as BoardSize[]).map(value => ({
    value, label: value.replace('x', '×'),
  })),
];
const dateFormat = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
const podium = ['text-amber-300', 'text-slate-300', 'text-orange-300'];
const panel = 'rounded-xl border border-slate-600 bg-slate-900 shadow-xl';

function Results({ view, size }: { view: View; size?: BoardSize }) {
  const personal = view === 'personal';
  const [entries, setEntries] = useState<(RankingEntry | PersonalBest)[] | null>(null);
  const [error, setError] = useState('');
  useEffect(() => {
    const controller = new AbortController();
    const results = personal ? getPersonalBests(controller.signal) : getRanking(size, controller.signal);
    results.then(
      data => { if (!controller.signal.aborted) setEntries(data); },
      cause => {
        if (!controller.signal.aborted) {
          setError(cause instanceof Error && !(cause instanceof TypeError)
            ? cause.message : 'Não foi possível conectar à API do ranking.');
        }
      },
    );
    return () => controller.abort();
  }, [personal, size]);

  if (error) return <p role="alert" className={`${panel} p-6 text-orange-200`}>{error}</p>;
  if (!entries?.length) {
    let message = 'Carregando ranking…';
    if (entries) {
      message = personal ? 'Vença uma partida para registrar seu primeiro tempo.'
        : size ? 'Nenhuma pontuação para este tamanho.' : 'Nenhuma pontuação registrada.';
    }
    return <p role="status" className={`${panel} px-4 py-10 text-center text-slate-200`}>{message}</p>;
  }

  return (
    <div className={`${panel} overflow-x-auto`}>
      <table className="w-full text-left text-sm sm:text-base">
        <caption className={personal ? 'px-4 py-3 text-left font-medium text-slate-300' : 'sr-only'}>
          {personal ? 'Seu melhor tempo em cada dificuldade' : 'Até 30 pontuações por menor tempo'}
        </caption>
        <thead className="border-b border-slate-600 bg-slate-800/75 text-xs text-slate-200 sm:text-sm">
          <tr>{(personal ? ['Tempo', 'Campo', 'Data'] : ['Posição', 'Jogador', 'Tempo', 'Campo', 'Data']).map(title =>
            <th scope="col" className={`px-2 py-3 sm:px-5 ${!personal && (title === 'Campo' || title === 'Data') ? 'hidden sm:table-cell' : ''}`} key={title}>{title}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-slate-700">
          {entries.map((entry, index) => (
            <tr key={index} className={!personal && index === 0 ? 'bg-amber-300/5 shadow-[inset_3px_0_0_var(--color-arcade-amber)]' : undefined}>
              {'userName' in entry && <>
                <td className="px-2 py-3 sm:px-5">
                  <span className={`inline-flex items-center gap-1 font-bold tabular-nums ${podium[index] ?? 'text-slate-200'}`}>
                    {index < podium.length && <Medal aria-hidden="true" className="size-4" />}
                    {index + 1}
                  </span>
                </td>
                <td className="px-2 py-3 sm:px-5">
                  <span className="flex items-center gap-2 font-semibold">
                    {entry.userImage && <Image unoptimized src={entry.userImage} alt="" width={32} height={32} className="size-8 shrink-0 rounded-full" />}
                    <span className="[overflow-wrap:anywhere]">{entry.userName}</span>
                  </span>
                  <span className="mt-1 block text-xs text-slate-300 sm:hidden">
                    {entry.boardSize.replace('x', '×')} · <time dateTime={entry.createdAt}>{dateFormat.format(new Date(entry.createdAt))}</time>
                  </span>
                </td>
              </>}
              <td className="whitespace-nowrap px-2 py-3 font-mono font-bold tabular-nums sm:px-5 sm:text-lg">{entry.timeSeconds} s</td>
              <td className={`px-2 py-3 sm:px-5 ${personal ? '' : 'hidden sm:table-cell'}`}>{entry.boardSize.replace('x', '×')}</td>
              <td className={`px-2 py-3 text-slate-300 sm:px-5 ${personal ? '' : 'hidden sm:table-cell'}`}><time dateTime={entry.createdAt}>{dateFormat.format(new Date(entry.createdAt))}</time></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Ranking() {
  const [view, setView] = useState<View>('global');
  const [filter, setFilter] = useState<Filter>('all');
  return (
    <>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4 sm:mb-7">
        <div role="group" aria-label="Escolher ranking" className="flex rounded-xl border border-slate-600 bg-slate-900 p-1">
          {(['global', 'personal'] as const).map(option => (
            <button key={option} type="button" aria-pressed={view === option} onClick={() => setView(option)}
              className="min-h-11 cursor-pointer rounded-lg border-0 px-4 py-2 text-sm font-semibold hover:bg-slate-700 focus-visible:outline-arcade-amber aria-pressed:bg-arcade-amber aria-pressed:text-midnight sm:text-base">
              {option === 'global' ? 'Ranking geral' : 'Meus melhores tempos'}
            </button>
          ))}
        </div>
        {view === 'global' && <div className="flex flex-wrap items-center gap-2">
          <span id="ranking-size-label" className="text-sm font-medium text-slate-200">Tamanho do campo</span>
          <Select items={options} value={filter} onValueChange={value => { if (value) setFilter(value); }}>
            <SelectTrigger aria-labelledby="ranking-size-label ranking-size-value" className="min-h-11 cursor-pointer border-slate-500 bg-slate-900 text-ivory focus-visible:ring-arcade-amber [&_svg]:text-amber-300">
              <SelectValue id="ranking-size-value" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 text-ivory ring-slate-600">
              <SelectGroup>
                {options.map(option => <SelectItem key={option.value} value={option.value} className="cursor-pointer">{option.label}</SelectItem>)}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>}
      </div>
      <Results key={view === 'global' ? filter : view} view={view} size={view === 'global' && filter !== 'all' ? filter : undefined} />
    </>
  );
}
