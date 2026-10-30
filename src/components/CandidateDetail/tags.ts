export function parseTags(value: string): string[] {
  const seen = new Set<string>();
  for (const raw of value.split(',')) {
    const tag = raw.trim();
    if (tag) seen.add(tag);
  }
  return [...seen];
}
