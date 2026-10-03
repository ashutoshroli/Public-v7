import { config } from '$lib/config';

const paths = [
  '/', '/expenses', '/loans', '/committee', '/contributors',
  '/downloads', '/decade', '/donate', '/verify', '/guide',
  '/privacy', '/terms'
];

export function GET() {
  const base = config.siteUrl.replace(/\/+$/, '');
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${paths.map((path) => `  <url><loc>${base}${path}</loc></url>`).join('\n')}
</urlset>`;
  return new Response(body, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600'
    }
  });
}
