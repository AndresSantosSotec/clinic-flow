import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Building2,
  Users,
  UserCircle,
  Calendar,
  Stethoscope,
  CreditCard,
  BarChart3,
  Settings,
  ChevronLeft,
  LogOut,
  Bell,
  Shield,
  Key,
  ChevronDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface NavItem {
  label: string;
  icon: React.ElementType;
  href: string;
  permission?: string;
  children?: NavItem[];
}

const navigation: NavItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/' },
  { label: 'Sedes', icon: Building2, href: '/branches', permission: 'view-branches' },
  {
    label: 'Usuarios',
    icon: Users,
    href: '/users',
    permission: 'view-users',
    children: [
      { label: 'Lista de Usuarios', icon: Users, href: '/users' },
      { label: 'Roles', icon: Shield, href: '/roles', permission: 'view-roles' },
      { label: 'Permisos', icon: Key, href: '/permissions', permission: 'view-roles' },
    ]
  },
  { label: 'Pacientes', icon: UserCircle, href: '/patients', permission: 'view-patients' },
  { label: 'Agenda', icon: Calendar, href: '/appointments', permission: 'view-appointments' },
  { label: 'Consultas', icon: Stethoscope, href: '/encounters', permission: 'view-appointments' },
  { label: 'Cobros', icon: CreditCard, href: '/payments', permission: 'view-payments' },
  { label: 'Reportes', icon: BarChart3, href: '/reports', permission: 'view-payments' },
  { label: 'Recordatorios', icon: Bell, href: '/reminders', permission: 'view-branches' },
  { label: 'Configuración', icon: Settings, href: '/settings', permission: 'view-users' },
];

interface SidebarProps {
  isMobile?: boolean;
}

export function Sidebar({ isMobile = false }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});
  const location = useLocation();
  const { hasPermission, logout } = useAuth();

  const filteredNav = navigation.filter(
    (item) => !item.permission || hasPermission(item.permission)
  );

  const handleLogout = () => {
    window.location.href = '/login';
  };

  const toggleMenu = (href: string) => {
    setOpenMenus(prev => ({ ...prev, [href]: !prev[href] }));
  };

  // Mobile sidebar version
  if (isMobile) {
    return (
      <aside className="flex h-full flex-col bg-sidebar">
        {/* Logo */}
        <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary">
            <Stethoscope className="h-5 w-5 text-sidebar-primary-foreground" />
          </div>
          <span className="font-semibold text-sidebar-foreground">ClínicaAdmin</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-3 overflow-y-auto">
          {filteredNav.map((item) => {
            const isActive = location.pathname === item.href ||
              (item.href !== '/' && location.pathname.startsWith(item.href));

            if (item.children) {
              const hasActiveChild = item.children.some(child =>
                location.pathname === child.href ||
                (child.href !== '/' && location.pathname.startsWith(child.href))
              );

              return (
                <Collapsible key={item.href} open={openMenus[item.href] || hasActiveChild}>
                  <CollapsibleTrigger
                    onClick={() => toggleMenu(item.href)}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                      'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                      hasActiveChild && 'bg-sidebar-accent text-sidebar-accent-foreground',
                      !hasActiveChild && 'text-sidebar-foreground/70'
                    )}
                  >
                    <item.icon className={cn('h-5 w-5 shrink-0', hasActiveChild && 'text-sidebar-primary')} />
                    <span className="flex-1 text-left">{item.label}</span>
                    <ChevronDown className={cn(
                      'h-4 w-4 transition-transform',
                      (openMenus[item.href] || hasActiveChild) && 'rotate-180'
                    )} />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pl-4 space-y-1">
                    {item.children.map((child) => {
                      const isChildActive = location.pathname === child.href;
                      return (
                        <NavLink
                          key={child.href}
                          to={child.href}
                          className={cn(
                            'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                            'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                            isChildActive && 'bg-sidebar-accent text-sidebar-accent-foreground',
                            !isChildActive && 'text-sidebar-foreground/60'
                          )}
                        >
                          <child.icon className={cn('h-4 w-4 shrink-0', isChildActive && 'text-sidebar-primary')} />
                          <span>{child.label}</span>
                        </NavLink>
                      );
                    })}
                  </CollapsibleContent>
                </Collapsible>
              );
            }

            return (
              <NavLink
                key={item.href}
                to={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                  isActive && 'bg-sidebar-accent text-sidebar-accent-foreground',
                  !isActive && 'text-sidebar-foreground/70'
                )}
              >
                <item.icon className={cn('h-5 w-5 shrink-0', isActive && 'text-sidebar-primary')} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-sidebar-border p-3">
          <button
            onClick={handleLogout}
            className={cn(
              'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/70 transition-colors',
              'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
            )}
          >
            <LogOut className="h-5 w-5 shrink-0" />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>
    );
  }

  // Desktop sidebar
  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen bg-sidebar transition-all duration-300 ease-in-out',
        collapsed ? 'w-[var(--sidebar-collapsed)]' : 'w-[var(--sidebar-width)]'
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary">
              <Stethoscope className="h-5 w-5 text-sidebar-primary-foreground" />
            </div>
            <span className="font-semibold text-sidebar-foreground">ClínicaAdmin</span>
          </div>
        )}
        {collapsed && (
          <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary">
            <Stethoscope className="h-5 w-5 text-sidebar-primary-foreground" />
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-3 overflow-y-auto">
        {filteredNav.map((item) => {
          const isActive = location.pathname === item.href ||
            (item.href !== '/' && location.pathname.startsWith(item.href));

          if (item.children && !collapsed) {
            const hasActiveChild = item.children.some(child =>
              location.pathname === child.href ||
              (child.href !== '/' && location.pathname.startsWith(child.href))
            );

            return (
              <Collapsible key={item.href} open={openMenus[item.href] || hasActiveChild}>
                <CollapsibleTrigger
                  onClick={() => toggleMenu(item.href)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                    hasActiveChild && 'bg-sidebar-accent text-sidebar-accent-foreground',
                    !hasActiveChild && 'text-sidebar-foreground/70'
                  )}
                >
                  <item.icon className={cn('h-5 w-5 shrink-0', hasActiveChild && 'text-sidebar-primary')} />
                  <span className="flex-1 text-left">{item.label}</span>
                  <ChevronDown className={cn(
                    'h-4 w-4 transition-transform',
                    (openMenus[item.href] || hasActiveChild) && 'rotate-180'
                  )} />
                </CollapsibleTrigger>
                <CollapsibleContent className="pl-4 space-y-1">
                  {item.children.map((child) => {
                    const isChildActive = location.pathname === child.href;
                    return (
                      <NavLink
                        key={child.href}
                        to={child.href}
                        className={cn(
                          'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                          'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                          isChildActive && 'bg-sidebar-accent text-sidebar-accent-foreground',
                          !isChildActive && 'text-sidebar-foreground/60'
                        )}
                      >
                        <child.icon className={cn('h-4 w-4 shrink-0', isChildActive && 'text-sidebar-primary')} />
                        <span>{child.label}</span>
                      </NavLink>
                    );
                  })}
                </CollapsibleContent>
              </Collapsible>
            );
          }

          const linkContent = (
            <NavLink
              key={item.href}
              to={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                isActive && 'bg-sidebar-accent text-sidebar-accent-foreground',
                !isActive && 'text-sidebar-foreground/70',
                collapsed && 'justify-center px-2'
              )}
            >
              <item.icon className={cn('h-5 w-5 shrink-0', isActive && 'text-sidebar-primary')} />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          );

          if (collapsed) {
            return (
              <Tooltip key={item.href} delayDuration={0}>
                <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                <TooltipContent side="right" className="font-medium">
                  {item.label}
                </TooltipContent>
              </Tooltip>
            );
          }

          return linkContent;
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-sidebar-border p-3">
        <button
          onClick={handleLogout}
          className={cn(
            'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/70 transition-colors',
            'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
            collapsed && 'justify-center px-2'
          )}
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {!collapsed && <span>Cerrar sesión</span>}
        </button>
      </div>

      {/* Collapse toggle */}
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          'absolute -right-3 top-20 h-6 w-6 rounded-full border bg-card shadow-sm',
          'hover:bg-muted'
        )}
        onClick={() => setCollapsed(!collapsed)}
      >
        <ChevronLeft
          className={cn('h-4 w-4 transition-transform', collapsed && 'rotate-180')}
        />
      </Button>
    </aside>
  );
}
