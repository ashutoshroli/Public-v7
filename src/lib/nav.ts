export interface NavItem { href: string; key: string; }
export const navItems: NavItem[] = [
  { href: '/', key: 'nav_home' },
  { href: '/contributors/', key: 'contributors_list' },
  { href: '/expenses/', key: 'nav_expenses' },
  { href: '/loans/', key: 'nav_loans' },
  { href: '/committee/', key: 'nav_committee' },
  { href: '/decade/', key: 'decade_title' },
  { href: '/downloads/', key: 'download_center' },
  { href: '/donate/', key: 'donate_title' },
  { href: '/verify/', key: 'verify_title' },
  { href: '/guide/', key: 'guide_title' },
  { href: '/privacy/', key: 'footer_privacy' },
  { href: '/terms/', key: 'footer_terms' }
];
