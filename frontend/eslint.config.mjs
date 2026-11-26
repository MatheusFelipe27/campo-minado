import { FlatCompat } from '@eslint/eslintrc';

const compat = new FlatCompat({ baseDirectory: import.meta.dirname });

const config = [
  { ignores: ['.next*/**', 'coverage/**', 'next-env.d.ts'] },
  { files: ['**/*.{ts,tsx}'] },
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
];

export default config;
