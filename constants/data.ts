import { NavItem } from '@/types';

export const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    url: '/dashboard/overview',
    icon: 'dashboard',
    isActive: false,
    shortcut: ['d', 'd'],
    items: [] 
  },
  {
    title: 'Usuários',
    url: '/dashboard/employee',
    icon: 'user',
    shortcut: ['e', 'e'],
    isActive: false,
    items: []
  },
  {
    title: 'Clientes',
    url: '/dashboard/clients',
    icon: 'user',
    shortcut: ['c', 'c'],
    isActive: false,
    items: []
  },
];
