'use client';

import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/lib/store';
import { toggleDarkMode, toggleMobileSidebar } from '@/lib/slices/uiSlice';
import { useSession } from 'next-auth/react';
import { Moon, Sun, Bell, Menu, Search } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

const breadcrumbMap: Record<string, string> = {
  '/dashboard': 'الرئيسية',
  '/dashboard/vehicles': 'السيارات',
  '/dashboard/drivers': 'السائقون',
  '/dashboard/map': 'خريطة الموقع',
  '/dashboard/revenue': 'الإيرادات',
  '/dashboard/expenses': 'المصروفات',
  '/dashboard/maintenance': 'الصيانة',
  '/dashboard/customers': 'قاعدة العملاء',
  '/dashboard/contracts': 'العقود',
  '/dashboard/reports': 'التقارير',
  '/dashboard/settings': 'الإعدادات',
};

export default function Header() {
  const dispatch = useDispatch<AppDispatch>();
  const { darkMode } = useSelector((state: RootState) => state.ui);
  const { data: session } = useSession();
  const pathname = usePathname();

  // Apply/remove dark class on html element AND save to localStorage
  useEffect(() => {
    const html = document.documentElement;
    if (darkMode) {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
    
    // Save to localStorage
    try {
      localStorage.setItem('darkMode', JSON.stringify(darkMode));
    } catch (error) {
      console.error('Failed to save darkMode to localStorage:', error);
    }
  }, [darkMode]);

  const pageTitle = breadcrumbMap[pathname] ?? 'لوحة التحكم';

  const initials = session?.user?.name
    ? session.user.name.split(' ').map((n) => n[0]).join('').slice(0, 2)
    : 'م';

  return (
    <header className="sticky top-0 z-20 bg-card/80 backdrop-blur-md border-b border-border flex items-center justify-between px-4 md:px-6 h-16 gap-4">
      {/* Right side: Mobile menu + page title */}
      <div className="flex items-center gap-3">
        {/* Mobile menu trigger */}
        <button
          onClick={() => dispatch(toggleMobileSidebar())}
          className="md:hidden p-2 rounded-lg hover:bg-secondary transition-colors text-foreground"
          aria-label="فتح القائمة"
        >
          <Menu size={20} />
        </button>

        {/* Breadcrumbs */}
        <div>
          <div className="text-xs text-muted-foreground hidden sm:block">
            <span>HYPERBOX</span>
            <span className="mx-1.5">›</span>
            <span>{pageTitle}</span>
          </div>
          <h2 className="text-base font-bold leading-tight">{pageTitle}</h2>
        </div>
      </div>

      {/* Left side: actions */}
      <div className="flex items-center gap-2">
        {/* Search (decorative on header) */}
        <button className="hidden md:flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground bg-secondary hover:bg-secondary/80 rounded-xl transition-colors border border-border">
          <Search size={15} />
          <span>بحث سريع...</span>
          <kbd className="hidden lg:inline-flex text-xs bg-background border border-border rounded px-1.5 py-0.5">⌘K</kbd>
        </button>

        {/* Dark mode toggle */}
        <button
          onClick={() => dispatch(toggleDarkMode())}
          className="p-2 rounded-lg hover:bg-secondary transition-colors text-foreground relative group"
          title={darkMode ? 'وضع النهار' : 'الوضع الليلي'}
        >
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Notifications */}
        <button className="p-2 rounded-lg hover:bg-secondary transition-colors text-foreground relative">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        {/* User avatar */}
        {session?.user && (
          <div className="flex items-center gap-2 pr-2 border-r border-border mr-1">
            <div className="text-left hidden sm:block">
              <p className="text-xs font-bold leading-tight">{session.user.name}</p>
              <p className="text-xs text-muted-foreground leading-tight">
                {(session.user as { role?: string }).role === 'ADMIN' ? 'مدير النظام'
                  : (session.user as { role?: string }).role === 'MANAGER' ? 'مدير'
                  : (session.user as { role?: string }).role === 'ACCOUNTANT' ? 'محاسب'
                  : 'مشغّل'}
              </p>
            </div>
            <div className="w-9 h-9 gradient-primary rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
              {initials}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
