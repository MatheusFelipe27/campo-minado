import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Flag } from 'lucide-react';
import { authOptions } from '../lib/auth';
import { Profile } from './profile';
import { Board } from '../components/minesweeper/board';

export default async function Home() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');
  return (
    <div data-full-bleed className="min-h-svh bg-midnight bg-[radial-gradient(ellipse_at_top,#1a3048,transparent_72%)] font-interface text-ivory lg:flex lg:h-svh lg:flex-col">
      <header className="border-b border-slate-700/80 bg-midnight/90">
        <div className="mx-auto flex max-w-[90rem] flex-wrap items-center justify-between gap-x-6 gap-y-1 px-4 py-3 sm:px-8">
          <h1 className="flex items-center gap-2 font-display text-2xl font-extrabold tracking-tight sm:text-3xl">
            <Flag aria-hidden="true" className="size-6 fill-current text-[#ff8b74]" /> Campo Minado
          </h1>
          <div className="flex flex-wrap items-center gap-x-4 text-sm">
            <Link className="inline-flex min-h-11 items-center font-semibold hover:underline focus-visible:outline-arcade-amber" href="/ranking">Ranking</Link>
            <Profile token={session.apiToken} />
          </div>
        </div>
      </header>
      <Board />
    </div>
  );
}
