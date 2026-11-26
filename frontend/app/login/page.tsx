import Image from 'next/image';
import { GitHubButton } from './github-button';
import boardArt from './tabuleiro.jpg';

export default async function Login({ searchParams }: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return (
    <section
      data-full-bleed
      aria-labelledby="login-title"
      className="relative isolate grid min-h-svh grid-rows-[clamp(9rem,29svh,18rem)_auto] content-start items-center bg-midnight font-interface text-ivory md:grid-rows-none md:content-normal"
    >
      <div className="relative -z-10 self-stretch md:absolute md:inset-0">
        <Image src={boardArt} alt="" fill sizes="100vw" priority className="object-cover object-[right_38%] md:object-center" />
        <div className="absolute inset-0 bg-linear-to-t from-midnight to-transparent to-42% md:bg-linear-to-r md:via-midnight/94 md:via-26% md:to-56%" />
      </div>
      <div className="mx-auto w-full max-w-lg px-6 pt-4 pb-12 md:ms-[clamp(2rem,7vw,9rem)] md:w-[35vw] md:px-0 md:py-16">
        <h1 id="login-title" className="font-display text-[clamp(3.5rem,13vw,5rem)] leading-[0.96] font-extrabold tracking-[-0.05em] md:text-[clamp(4.5rem,7.5vw,8.5rem)]">
          Campo<br />Minado
        </h1>
        <p className="mt-5 mb-7 max-w-[27ch] text-[clamp(1.125rem,1.8vw,1.75rem)] leading-[1.45] text-pretty md:mt-7 md:mb-9">
          Entre para jogar e registrar seus melhores tempos.
        </p>
        {error && <p className="mb-5 border-s-3 border-[#ff8b74] ps-3.5 text-[#ffccbd]" role="alert">{error === 'VerifiedEmailRequired'
          ? 'Verifique seu e-mail principal no GitHub para entrar.'
          : 'Não foi possível concluir o login. Tente novamente.'}</p>}
        <GitHubButton />
      </div>
    </section>
  );
}
