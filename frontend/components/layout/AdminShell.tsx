'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import {
  LayoutDashboard,
  Calendar,
  Users,
  User,
  Sparkles,
  Settings,
  BarChart3,
  Menu,
  ChevronRight,
  LogOut,
  Building,
} from 'lucide-react';

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

interface AdminShellProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
  user?: {
    name?: string | null;
    email?: string | null;
  } | null;
  salons?: Array<{
    id: string;
    name: string;
  }>;
  currentSalonId?: string | null;
  onSignOut?: () => void;
  onSalonChange?: (salonId: string) => void;
}

const navItems = [
  { href: '/salons', label: 'Salon Yönetimi', icon: Building },
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/appointments', label: 'Randevular', icon: Calendar },
  { href: '/customers', label: 'Müşteriler', icon: Users },
  { href: '/employees', label: 'Çalışanlar', icon: User },
  { href: '/services', label: 'Hizmetler', icon: Sparkles },
  { href: '/reports', label: 'Raporlar', icon: BarChart3 },
  { href: '/settings', label: 'Ayarlar', icon: Settings },
];

export function AdminShell({
  children,
  title,
  subtitle,
  actions,
  user,
  salons,
  currentSalonId,
  onSignOut,
  onSalonChange,
}: AdminShellProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isSalonMenuOpen, setIsSalonMenuOpen] = useState(false);
  const salonMenuRef = useRef<HTMLDivElement | null>(null);

  const initials = useMemo(() => {
    const value = user?.name || user?.email || '';
    if (!value) return 'AD';
    const parts = value.trim().split(' ');
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }, [user]);

  const showSalonSelector = !!salons?.length;
  const selectedSalonId = currentSalonId ?? salons?.[0]?.id ?? '';
  const currentSalonName = useMemo(
    () => salons?.find((salon) => salon.id === selectedSalonId)?.name,
    [salons, selectedSalonId]
  );
  const displaySubtitle = subtitle;

  useEffect(() => {
    if (!isSalonMenuOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (!salonMenuRef.current) return;
      if (!salonMenuRef.current.contains(event.target as Node)) {
        setIsSalonMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSalonMenuOpen]);

  const handleSalonPick = (salonId: string) => {
    if (!salonId || salonId === selectedSalonId) {
      setIsSalonMenuOpen(false);
      return;
    }

    onSalonChange?.(salonId);
    setIsSalonMenuOpen(false);
  };

  const renderNavItems = (asMobile = false) => (
    <nav className="mt-6 space-y-1">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => {
              if (asMobile) setIsMobileNavOpen(false);
            }}
            className={cx(
              'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              isActive ? 'bg-blue-500/15 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            )}
          >
            <Icon className="h-4 w-4" />
            <span className={cx('truncate', isCollapsed && !asMobile && 'hidden')}>{item.label}</span>
            {isCollapsed && !asMobile && (
              <ChevronRight className="ml-auto h-4 w-4 opacity-0 transition-opacity group-hover:opacity-60" />
            )}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="flex min-h-screen">
        {/* Desktop Sidebar */}
        <aside
          className={cx(
            'hidden lg:flex flex-col border-r border-slate-800 bg-slate-900/60 backdrop-blur-sm transition-all duration-200 ease-out',
            isCollapsed ? 'w-20' : 'w-64'
          )}
        >
          <div className="flex items-center gap-3 px-4 py-5 border-b border-slate-800">
            <button
              onClick={() => setIsCollapsed((prev) => !prev)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-700 text-slate-300 hover:bg-slate-800"
            >
              <Menu className="h-4 w-4" />
            </button>
            {!isCollapsed && (
              <div>
                <p className="text-sm font-semibold text-white">Randevuasistan</p>
                <p className="text-xs text-slate-400">Salon Yönetim Paneli</p>
              </div>
            )}
          </div>
          <div className="flex-1 overflow-y-auto px-3 pb-6">
            {renderNavItems()}
          </div>
          <div className="border-t border-slate-800 px-3 py-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/20 text-sm font-semibold text-blue-200">
                {initials}
              </div>
              {!isCollapsed && (
                <div className="flex-1">
                  <p className="text-sm font-medium text-white truncate">{user?.name || 'Admin Kullanıcı'}</p>
                  <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                </div>
              )}
              {!isCollapsed && (
                <button
                  onClick={onSignOut}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-700 text-slate-300 hover:bg-slate-800"
                  title="Çıkış Yap"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </aside>

        {/* Mobile Sidebar */}
        <div
          className={cx(
            'fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm transition-opacity lg:hidden',
            isMobileNavOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
          )}
          onClick={() => setIsMobileNavOpen(false)}
        />
        <aside
          className={cx(
            'fixed inset-y-0 left-0 z-50 w-64 transform border-r border-slate-800 bg-slate-900/80 backdrop-blur-lg transition-transform lg:hidden',
            isMobileNavOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          <div className="flex items-center justify-between px-4 py-5 border-b border-slate-800">
            <div>
              <p className="text-sm font-semibold text-white">Randevuasistan</p>
              <p className="text-xs text-slate-400">Salon Yönetim Paneli</p>
            </div>
            <button
              onClick={() => setIsMobileNavOpen(false)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-700 text-slate-300 hover:bg-slate-800"
            >
              <Menu className="h-4 w-4" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-4 pb-10">
            {renderNavItems(true)}
            <div className="mt-8 rounded-lg border border-slate-800 bg-slate-800/40 p-4 text-sm text-slate-300">
              <p className="font-medium text-white">{user?.name || 'Admin Kullanıcı'}</p>
              <p className="text-xs text-slate-400">{user?.email}</p>
              <button
                onClick={onSignOut}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md bg-slate-700 px-3 py-2 text-sm font-medium text-slate-200 hover:bg-slate-600"
              >
                <LogOut className="h-4 w-4" />
                Çıkış Yap
              </button>
            </div>
          </div>
        </aside>

        {/* Content */}
        <div className="flex min-h-screen flex-1 flex-col">
          <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-800 bg-slate-950/80 px-4 py-3 backdrop-blur-lg lg:px-8">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsMobileNavOpen(true)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-800 text-slate-300 hover:bg-slate-900 lg:hidden"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div className="flex flex-col gap-1 lg:flex-row lg:items-center lg:gap-3">
                {title && <h1 className="text-lg font-semibold text-white lg:text-xl">{title}</h1>}
                {displaySubtitle && (
                  <p className="text-xs text-slate-400 lg:text-sm">{displaySubtitle}</p>
                )}
                {showSalonSelector && (
                  <div className="relative lg:ml-2" ref={salonMenuRef}>
                    <button
                      type="button"
                      onClick={() => setIsSalonMenuOpen((prev) => !prev)}
                      className="flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/70 px-3 py-1 text-xs text-slate-300 transition hover:border-blue-500/40 hover:text-white lg:text-sm"
                    >
                      <Building className="h-4 w-4 text-blue-300" />
                      <span className="truncate">{currentSalonName || 'Salon seç'}</span>
                    </button>
                    {isSalonMenuOpen && (
                      <div className="absolute left-0 top-full z-40 mt-2 w-60 rounded-lg border border-slate-800 bg-slate-900/95 p-2 shadow-lg shadow-slate-950/40">
                        <p className="px-2 text-xs font-medium uppercase tracking-wide text-slate-500">Salonlar</p>
                        <div className="mt-2 space-y-1">
                          {salons?.map((salon) => {
                            const isActive = salon.id === selectedSalonId;
                            return (
                              <button
                                key={salon.id}
                                onClick={() => handleSalonPick(salon.id)}
                                className={cx(
                                  'w-full rounded-md px-3 py-2 text-left text-sm transition',
                                  isActive
                                    ? 'bg-blue-500/20 text-blue-200'
                                    : 'text-slate-200 hover:bg-slate-800/80'
                                )}
                              >
                                {salon.name}
                                {isActive && <span className="ml-2 text-xs text-blue-300">• aktif</span>}
                              </button>
                            );
                          })}
                        </div>
                        <div className="mt-3 border-t border-slate-800 pt-2">
                          <Link
                            href="/salons"
                            className="flex items-center justify-between rounded-md px-3 py-2 text-sm text-slate-300 transition hover:bg-slate-800/80 hover:text-white"
                            onClick={() => setIsSalonMenuOpen(false)}
                          >
                            Salon Yönetimi
                            <ChevronRight className="h-4 w-4 text-slate-500" />
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            {actions && <div className="flex items-center gap-2">{actions}</div>}
          </header>

          <main className="flex-1 bg-slate-950 px-4 pb-10 pt-6 lg:px-8 lg:pt-8">
            <div className="mx-auto w-full max-w-7xl space-y-6">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}

export default AdminShell;

