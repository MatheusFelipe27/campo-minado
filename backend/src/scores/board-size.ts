export const MIN_SECONDS_BY_SIZE = {
  '9x9': 1,
  '16x16': 2,
  '30x16': 3,
} as const;

export type BoardSize = keyof typeof MIN_SECONDS_BY_SIZE;
