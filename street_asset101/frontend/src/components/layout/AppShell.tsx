'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, MapPin, Phone, Wrench, Package, BarChart3, Bell, Users, Settings, Menu, X, LogOut, ChevronDown, Sun, Moon, Lightbulb,
} from 'lucide-react';
import { useTheme } from 'next-themes';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['DIRECTOR_GENERAL', 'ENGINEERING_REGULATORY_DDG', 'OPERATION_MAINTENANCE_DDG', 'OPERATION_MAINTENANCE_DIRECTOR', 'ICT_DIRECTOR', 'LICENSE_PERMIT_DDG', 'NORTH_REGION_DIRECTOR', 'SOUTH_REGION_DIRECTOR', 'WEST_REGION_DIRECTOR', 'EAST_REGION_DIRECTOR'] },
  { href: '/poles', label: 'Pole Registry', icon: Lightbulb, roles: ['OPERATION_MAINTENANCE_DDG', 'OPERATION_MAINTENANCE_DIRECTOR', 'LICENSE_PERMIT_DDG', 'ICT_DIRECTOR', 'DIRECTOR_GENERAL', 'ENGINEERING_REGULATORY_DDG'] },
  { href: '/poles/gis', label: 'GIS Map View', icon: MapPin, roles: ['OPERATION_MAINTENANCE_DDG', 'LICENSE_PERMIT_DDG', 'ICT_DIRECTOR', 'DIRECTOR_GENERAL'] },
  { href: '/call-center', label: 'Call Center', icon: Phone, roles: ['CALL_CENTER_AGENT', 'LICENSE_CUSTOMER_SERVICE_DIRECTOR', 'DIRECTOR_GENERAL'] },
  { href: '/maintenance', label: 'Maintenance', icon: Wrench, roles: ['OPERATION_MAINTENANCE_DDG', 'OPERATION_MAINTENANCE_DIRECTOR', 'MAINTENANCE_CENTER_DIRECTOR', 'MAINTENANCE_ENGINEER', 'SUPERVISOR', 'NORTH_REGION_DIRECTOR', 'SOUTH_REGION_DIRECTOR', 'WEST_REGION_DIRECTOR', 'EAST_REGION_DIRECTOR', 'DIRECTOR_GENERAL'] },
  { href: '/inventory', label: 'Inventory', icon: Package, roles: ['OPERATION_MAINTENANCE_DIRECTOR', 'OPERATION_MAINTENANCE_DDG', 'NORTH_REGION_DIRECTOR', 'SOUTH_REGION_DIRECTOR', 'WEST_REGION_DIRECTOR', 'EAST_REGION_DIRECTOR'] },
  { href: '/reports', label: 'Reports', icon: BarChart3, roles: ['DIRECTOR_GENERAL', 'OPERATION_MAINTENANCE_DDG', 'ICT_DIRECTOR'] },
  { href: '/users', label: 'Users', icon: Users, roles: ['DIRECTOR_GENERAL', 'ICT_DIRECTOR'] },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  const filteredNav = navItems.filter(item => user && item.roles.includes(user.role));

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950">
      <aside className={cn(
        'fixed inset-y-0 left-0 z-50 w-64 bg-sidebar text-white transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-auto',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full',
      )}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-700">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Lightbulb className="h-6 w-6 text-yellow-400" />
            <span className="font-bold text-lg">StreetLight</span>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden">
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {filteredNav.map((item) => (
            <Link key={item.href} href={item.href}
              className={cn('sidebar-link', pathname.startsWith(item.href) && 'active')}
              onClick={() => setSidebarOpen(false)}>
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-700">
          <div className="flex items-center gap-3 px-3 py-2 text-sm">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{user?.firstName} {user?.lastName}</p>
              <p className="text-xs text-gray-400 truncate">{user?.role}</p>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-4 lg:px-6">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden">
            <Menu className="h-6 w-6" />
          </button>

          <div className="flex items-center gap-4 ml-auto">
            <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            <Link href="/notifications" className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
              <Bell className="h-5 w-5" />
            </Link>

            <div className="relative">
              <button onClick={() => setUserMenuOpen(!userMenuOpen)} className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-semibold">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </div>
                <ChevronDown className="h-4 w-4" />
              </button>
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-900 rounded-lg shadow-lg border dark:border-gray-700 py-1 z-50">
                  <Link href="/settings" className="block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800">
                    <Settings className="h-4 w-4 inline mr-2" />Settings
                  </Link>
                  <button onClick={logout} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 text-red-600">
                    <LogOut className="h-4 w-4 inline mr-2" />Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
