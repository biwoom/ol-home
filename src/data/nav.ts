export interface NavItem {
  href: string;
  label: string;
}

export const navItems: NavItem[] = [
  { href: '/', label: 'HOME' },
  { href: '/atlas', label: 'ATLAS' },
  { href: '/text', label: 'TEXT' },
  { href: '/story', label: 'STORY' },
  { href: '/design', label: 'DESIGN' },
  { href: '/ai', label: 'AI' },
];
