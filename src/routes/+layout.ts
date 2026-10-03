// Public routes are prerendered so search crawlers and the PWA cache receive real HTML.
// All public records load client-side from the existing read-only Worker API.
export const prerender = true;
export const ssr = true;
export const trailingSlash = 'ignore';
