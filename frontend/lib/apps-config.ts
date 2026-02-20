import {
  LayoutGrid,
  DollarSign,
  ShoppingCart,
  Warehouse,
  Users,
  Building2,
  Factory,
  BarChart3,
  Shield,
  ShoppingBag,
  Cog,
  UserCircle2,
  type LucideIcon,
} from 'lucide-react';

export interface AppConfig {
  id: string;
  label: string;
  moduleName?: string;
  href: string;
  icon: LucideIcon;
  description?: string;
}

export const APP_LAUNCHER_MODULES: AppConfig[] = [
  { id: 'framework', label: 'Framework', href: '/dashboard', icon: LayoutGrid, description: '9 Workspaces' },
  { id: 'accounting', label: 'Accounting', moduleName: 'ACCOUNTING', href: '/dashboard/accounting', icon: DollarSign },
  { id: 'assets', label: 'Assets', href: '/dashboard/assets', icon: BarChart3 },
  { id: 'buying', label: 'Buying', href: '/dashboard/purchase', icon: ShoppingCart },
  { id: 'manufacturing', label: 'Manufacturing', href: '/dashboard/manufacturing', icon: Factory },
  { id: 'projects', label: 'Projects', href: '/dashboard/projects', icon: Building2 },
  { id: 'quality', label: 'Quality', href: '/dashboard/quality', icon: Shield },
  { id: 'selling', label: 'Selling', href: '/dashboard/sales', icon: ShoppingBag },
  { id: 'stock', label: 'Stock', moduleName: 'INVENTORY', href: '/dashboard/inventory', icon: Warehouse },
  { id: 'crm', label: 'CRM', moduleName: 'CRM', href: '/dashboard/crm', icon: Users },
  { id: 'hr', label: 'HR', moduleName: 'HR', href: '/dashboard/hr', icon: UserCircle2 },
  { id: 'pos', label: 'POS', moduleName: 'POS', href: '/pos', icon: LayoutGrid },
  { id: 'settings', label: 'ABMNEXT ERP Settings', href: '/dashboard/settings', icon: Cog },
];
