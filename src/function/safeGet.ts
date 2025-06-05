export const safeGet = (source: any, key: string, cur: string): number =>
  source?.[key]?.[cur] ?? 0;
