'use client';

import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/lib/store';
import { toggleMobileSidebar, setMobileSidebarOpen } from '@/lib/slices/uiSlice';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import {
  LayoutDashboard,
  Truck,
  Users,
  MapPin,
  DollarSign,
  TrendingDown,
  Wrench,
  UsersRound,
  FileText,
  BarChart3,
  LogOut,
  X,
  Package2,
  ChevronRight,
} from 'lucide-react';

const navGroups = [
  {
    title: 'الأسطول',
    items: [
      { href: '/dashboard/vehicles', label: 'السيارات', icon: Truck },
      { href: '/dashboard/drivers', label: 'السائقون', icon: Users },
      { href: '/dashboard/map', label: 'خريطة الموقع', icon: MapPin },
    ],
  },
  {
    title: 'المالية',
    items: [
      { href: '#1', label: 'الإيرادات', icon: DollarSign },
      { href: '#2', label: 'المصروفات', icon: TrendingDown },
      { href: '#3', label: 'الصيانة', icon: Wrench },
    ],
  },
  {
    title: 'العملاء',
    items: [
      { href: '#4', label: 'قاعدة العملاء', icon: UsersRound },
      { href: '#5', label: 'العقود', icon: FileText },
      { href: '#6', label: 'التقارير', icon: BarChart3 },
    ],
  },
];


// ,
//   {
//     title: 'المالية',
//     items: [
//       { href: '/dashboard/revenue', label: 'الإيرادات', icon: DollarSign },
//       { href: '/dashboard/expenses', label: 'المصروفات', icon: TrendingDown },
//       { href: '/dashboard/maintenance', label: 'الصيانة', icon: Wrench },
//     ],
//   },
//   {
//     title: 'العملاء',
//     items: [
//       { href: '/dashboard/customers', label: 'قاعدة العملاء', icon: UsersRound },
//       { href: '/dashboard/contracts', label: 'العقود', icon: FileText },
//       { href: '/dashboard/reports', label: 'التقارير', icon: BarChart3 },
//     ],
//   },
function SidebarContent({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    pathname === href || (href !== '/dashboard' && pathname.startsWith(href));

  return (
    <div className="flex flex-col h-full sidebar-gradient">
      {/* Logo */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-sidebar-border">
        <Link href="/dashboard" className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center shadow-lg">
              <Package2 size={18} className="text-white" />
            </div>
            <span className="text-xl font-black tracking-tight">
              <span style={{ color: 'oklch(0.72 0.22 264)' }}>HYPER</span>
              <span style={{ color: 'oklch(0.72 0.19 55)' }}>BOX</span>
            </span>
          </div>
          <span className="text-xs text-sidebar-foreground/60 font-medium mr-10">
            إدارة تأجير الحاويات
          </span>
        </Link>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-sidebar-accent text-sidebar-foreground/60 hover:text-sidebar-foreground transition-colors"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Dashboard link */}
      <div className="px-4 pt-4 pb-2">
        <Link
          href="/dashboard"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group
            ${pathname === '/dashboard'
              ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-lg shadow-primary/20'
              : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'
            }`}
        >
          <LayoutDashboard size={18} />
          <span className="text-sm font-semibold">الرئيسية</span>
          {pathname === '/dashboard' && (
            <ChevronRight size={14} className="mr-auto opacity-70" />
          )}
        </Link>
      </div>

      {/* Nav groups */}
      <nav className="flex-1 overflow-y-auto px-4 pb-4 space-y-5">
        {navGroups.map((group) => (
          <div key={group.title}>
            <p className="text-xs font-bold text-sidebar-foreground/40 uppercase tracking-widest px-3 mb-2">
              {group.title}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group
                      ${active
                        ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-lg shadow-primary/20'
                        : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'
                      }`}
                  >
                    <Icon size={18} className="flex-shrink-0" />
                    <span className="text-sm font-medium">{item.label}</span>
                    {active && (
                      <ChevronRight size={14} className="mr-auto opacity-70" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-4 pb-6 border-t border-sidebar-border pt-4">
        <button
          onClick={() => signOut({ redirect: true, callbackUrl: '/auth/signin' })}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sidebar-foreground/60 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200 w-full"
        >
          <LogOut size={18} />
          <span className="text-sm font-medium">تسجيل الخروج</span>
        </button>
      </div>
    </div>
  );
}

export default function Sidebar() {
  const dispatch = useDispatch<AppDispatch>();
  const { mobileSidebarOpen } = useSelector((state: RootState) => state.ui);

  const closeMobile = () => dispatch(setMobileSidebarOpen(false));

  return (
    <>
      {/* Desktop sidebar — fixed on right */}
      <aside className="hidden md:flex w-64 flex-col h-screen sticky top-0 right-0 z-30 border-l border-sidebar-border overflow-hidden shadow-2xl flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          onClick={closeMobile}
        />
      )}

      {/* Mobile drawer — slides in from right */}
      <aside
        className={`fixed top-0 right-0 h-full w-72 z-50 md:hidden
          transition-transform duration-300 shadow-2xl border-l border-sidebar-border
          ${mobileSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <SidebarContent onClose={closeMobile} />
      </aside>
    </>
  );
}
