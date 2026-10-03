export interface NavItem {
  href: string;
  label: string;
}

export const navItems: NavItem[] = [
  { href: '/', label: 'Home' },
  { href: '/contributors/', label: 'Contributors' },
  { href: '/expenses/', label: 'Expenses' },
  { href: '/loans/', label: 'Loans' },
  { href: '/committee/', label: 'Committee' },
  { href: '/decade/', label: 'Our Journey' },
  { href: '/downloads/', label: 'Downloads' },
  { href: '/donate/', label: 'Donate' }
];
