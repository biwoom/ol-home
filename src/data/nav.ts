export interface NavItem {
  href: string;
  label: string;
}

export const navItems: NavItem[] = [
  { href: '/', label: 'HOME' },
  { href: '/atlas', label: 'ATLAS' },
  { href: '/book', label: 'BOOK' },
  { href: '/design', label: 'DESIGN' },
  { href: '/ai', label: 'AI' },
];
