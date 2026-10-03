/** Only allow same-origin paths for notification navigation. */
export function sameOriginPath(raw: unknown, origin: string): string {
  if (typeof raw !== 'string' || !raw.trim() || raw.trim().startsWith('//')) return '/';
  try {
    const url = new URL(raw.trim(), origin);
    if (!['http:', 'https:'].includes(url.protocol) || url.origin !== new URL(origin).origin) return '/';
    return url.pathname + url.search + url.hash;
  } catch { return '/'; }
}
