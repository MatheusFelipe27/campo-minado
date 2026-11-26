import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Ranking } from './ranking';

export default async function RankingPage() {
  if (!await getServerSession(authOptions)) redirect('/login');
  return (
    <>
      <Link href="/" className="text-primary underline underline-offset-4">Voltar ao jogo</Link>
      <h1>Ranking</h1>
      <Ranking />
    </>
  );
}
