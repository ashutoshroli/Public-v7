export interface RouteMeta {
  path: string;
  titleKey: string;
  description: string;
  changefreq: 'daily' | 'weekly' | 'monthly' | 'yearly';
  priority: string;
}

export const ROUTES: RouteMeta[] = [
  { path: '', titleKey: 'app_title', description: 'Every contribution visible, every expense accountable. Live financial transparency for Navyuvak Chhath Puja Samiti, Shaharpura, Gardih.', changefreq: 'daily', priority: '1.0' },
  { path: '/contributors', titleKey: 'contributors_list', description: 'The full list of contributors to Navyuvak Chhath Puja Samiti, with amounts and years, exactly as recorded in the committee ledger.', changefreq: 'daily', priority: '0.8' },
  { path: '/expenses', titleKey: 'expenses_ledger', description: 'Every rupee spent by Navyuvak Chhath Puja Samiti, itemised by category and year, open for anyone in the village to check.', changefreq: 'weekly', priority: '0.7' },
  { path: '/loans', titleKey: 'loan_distribution', description: 'Loans issued from the committee fund: amount, guarantors, status and repayment, published so lending stays accountable.', changefreq: 'weekly', priority: '0.7' },
  { path: '/committee', titleKey: 'active_committee', description: 'The people responsible for Navyuvak Chhath Puja Samiti this year, with the role each of them holds.', changefreq: 'monthly', priority: '0.6' },
  { path: '/decade', titleKey: 'decade_title', description: 'Ten years of Chhath Puja at Shaharpura: contributions, spending and participation, year by year.', changefreq: 'monthly', priority: '0.6' },
  { path: '/downloads', titleKey: 'download_center', description: 'Download receipts, certificates and the committee’s published statements for any year.', changefreq: 'weekly', priority: '0.6' },
  { path: '/donate', titleKey: 'donate_title', description: 'How to contribute to Navyuvak Chhath Puja Samiti — UPI, bank transfer, or in person with the committee.', changefreq: 'monthly', priority: '0.6' },
  { path: '/verify', titleKey: 'verify_title', description: 'Check a receipt against the committee ledger and confirm the contribution was recorded.', changefreq: 'monthly', priority: '0.5' },
  { path: '/guide', titleKey: 'guide_title', description: 'How to use the transparency portal: finding a contribution, reading the ledgers, and installing the app.', changefreq: 'monthly', priority: '0.4' },
  { path: '/privacy', titleKey: 'privacy_subtitle', description: 'What this portal publishes, what it stores, what it does not collect, and how long anything is kept.', changefreq: 'yearly', priority: '0.3' },
  { path: '/terms', titleKey: 'terms_subtitle', description: 'Terms for using the Navyuvak Chhath Puja Samiti transparency portal.', changefreq: 'yearly', priority: '0.3' }
];

export function normalisePath(pathname: string): string {
  const p = pathname.replace(/\/+$/, '');
  return p === '' ? '' : p;
}
export function metaFor(pathname: string): RouteMeta | undefined {
  const key = normalisePath(pathname);
  return ROUTES.find((r) => r.path === key);
}
export function canonicalFor(siteUrl: string, pathname: string): string {
  const base = siteUrl.replace(/\/+$/, '');
  const key = normalisePath(pathname);
  return key === '' ? `${base}/` : `${base}${key}`;
}
export function sitemapXml(siteUrl: string): string {
  const urls = ROUTES.map((r) => {
    const loc = canonicalFor(siteUrl, r.path).replace(/&/g, '&amp;');
    return `  <url><loc>${loc}</loc><changefreq>${r.changefreq}</changefreq><priority>${r.priority}</priority></url>`;
  }).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}
export function organisationJsonLd(siteUrl: string): string {
  const base = siteUrl.replace(/\/+$/, '');
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'NGO',
    name: 'Navyuvak Chhath Puja Samiti',
    alternateName: 'Chhath Puja Transparency Portal',
    url: `${base}/`,
    logo: `${base}/logo.svg`,
    description: 'A village welfare committee publishing contribution, expense and loan records for public scrutiny.',
    address: { '@type': 'PostalAddress', addressLocality: 'Shaharpura, Gardih', addressCountry: 'IN' }
  });
}
export function websiteJsonLd(siteUrl: string): string {
  const base = siteUrl.replace(/\/+$/, '');
  return JSON.stringify({ '@context': 'https://schema.org', '@type': 'WebSite', name: 'Chhath Puja Transparency Portal', url: `${base}/`, inLanguage: ['en', 'hi'] });
}
