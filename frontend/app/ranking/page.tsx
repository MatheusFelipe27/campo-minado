import Link from 'next/link';
import { Flag } from 'lucide-react';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Profile } from '../profile';
import { Ranking } from './ranking';

export default async function RankingPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');
  return (
    <div data-full-bleed className="min-h-svh bg-midnight bg-[linear-gradient(to_right,#20334855_1px,transparent_1px),linear-gradient(to_bottom,#20334855_1px,transparent_1px)] bg-size-[4rem_4rem] font-interface text-ivory">
      <header className="border-b border-slate-700 bg-midnight/95">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-4 px-4 py-3 sm:px-8">
          <span className="flex items-center gap-2 font-display text-2xl font-extrabold tracking-tight sm:text-3xl">
            <Flag aria-hidden="true" className="size-6 fill-current text-[#ff8b74]" /> Campo Minado
          </span>
          <div className="flex flex-wrap items-center gap-x-4 text-sm">
            <Link href="/" className="inline-flex min-h-11 items-center font-semibold underline decoration-arcade-amber underline-offset-8 hover:text-amber-200 focus-visible:outline-arcade-amber">Voltar ao jogo</Link>
            <Profile token={session.apiToken} />
          </div>
        </div>
      </header>
      <section aria-labelledby="ranking-title" className="mx-auto max-w-6xl px-4 py-8 sm:px-8 sm:py-12">
        <h1 id="ranking-title" className="mb-6 font-display text-3xl font-extrabold tracking-tight sm:mb-8 sm:text-4xl">Ranking</h1>
        <Ranking />
      </section>
    </div>
  );
}
