import type { ReactNode } from 'react';
import './globals.css';

export const metadata = { title: 'Campo Minado' };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <main className="mx-auto max-w-6xl space-y-4 px-4 py-6 has-[>[data-full-bleed]]:max-w-none has-[>[data-full-bleed]]:p-0">{children}</main>
      </body>
    </html>
  );
}
