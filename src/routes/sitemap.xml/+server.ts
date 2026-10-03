import { config } from '$lib/config';
import { sitemapXml } from '$lib/seo';

export const prerender = true;

export function GET() {
  return new Response(sitemapXml(config.siteUrl), {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600'
    }
  });
}
