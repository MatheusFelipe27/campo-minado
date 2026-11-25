import { GitHubButton } from './github-button';

export default async function Login({ searchParams }: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return <>
    <h1>Campo Minado</h1>
    {error && <p role="alert">{error === 'VerifiedEmailRequired'
      ? 'Verifique seu e-mail principal no GitHub para entrar.'
      : 'Não foi possível concluir o login. Tente novamente.'}</p>}
    <GitHubButton />
  </>;
}
