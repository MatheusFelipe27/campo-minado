import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { authOptions } from '../lib/auth';
import { Profile } from './profile';
import { Board } from '../components/minesweeper/board';

export default async function Home() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');
  return (
    <>
      <h1>Campo Minado</h1>
      <Link className="text-primary underline underline-offset-4" href="/ranking">Ver ranking</Link>
      <Profile token={session.apiToken} />
      <Board />
    </>
  );
}
