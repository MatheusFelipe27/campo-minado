import type { ReactNode } from 'react';

export const metadata = { title: 'Campo Minado' };

export default function RootLayout({ children }: { children: ReactNode }) {
  return <html lang="pt-BR"><body><main>{children}</main></body></html>;
}
