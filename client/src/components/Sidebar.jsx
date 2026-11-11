import { useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import {
  Bot,
  FilePlus2,
  Files,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Scale,
  Settings,
  ShieldCheck,
  Sun,
  FileStack,
  UserRound,
  X,
} from 'lucide-react';
import { useAuth } from '../auth/AuthContext';

const navigation = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/assistant', label: 'AI Assistant', icon: Bot },
  { to: '/documents', label: 'My Documents', icon: Files },
  { to: '/documents/new', label: 'Create Document', icon: FilePlus2 },
  { to: '/templates', label: 'Templates', icon: FileStack },
  { to: '/legal-review', label: 'Legal Review', icon: ShieldCheck },
  { to: '/consultations', label: 'Consultations', icon: Scale },
  { to: '/profile', label: 'Profile', icon: UserRound },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar() {
  const { logout, user } = useAuth();
  const { pathname } = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => document.documentElement.classList.contains('dark'));

  function toggleTheme() {
    const next = !document.documentElement.classList.contains('dark');
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('saraldocs-theme', next ? 'dark' : 'light');
    setDarkMode(next);
  }

  const closeMenu = () => setMobileOpen(false);

  return (
    <>
      <header className="sticky top-0 z-40 flex h-[68px] items-center justify-between border-b border-[#e6e7df] bg-[#fbfaf7]/95 px-5 backdrop-blur md:hidden dark:border-[#303a31] dark:bg-[#171e18]/95">
        <Link to="/dashboard" onClick={closeMenu} className="inline-flex items-center gap-2 text-sm font-semibold text-[#29332a] dark:text-[#e8ece6]">
          <span className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-[#31583b] text-white dark:bg-[#779779] dark:text-[#101a12]"><Scale size={16} /></span>
          SaralDocs
        </Link>
        <button
          type="button"
          onClick={() => setMobileOpen((open) => !open)}
          className="flex h-10 w-10 items-center justify-center rounded-full text-[#465147] hover:bg-[#eff0ea] dark:text-[#d4dbd2] dark:hover:bg-[#222b23]"
          aria-label={mobileOpen ? 'Close dashboard navigation' : 'Open dashboard navigation'}
          aria-expanded={mobileOpen}
          aria-controls="dashboard-sidebar"
        >
          {mobileOpen ? <X size={19} /> : <Menu size={19} />}
        </button>
      </header>

      <aside
        id="dashboard-sidebar"
        className={`${mobileOpen ? 'block' : 'hidden'} fixed inset-x-0 top-[68px] z-40 max-h-[calc(100vh-68px)] overflow-y-auto border-b border-[#e6e7df] bg-[#fbfaf7] p-4 shadow-xl md:sticky md:top-0 md:block md:h-screen md:w-[248px] md:shrink-0 md:border-b-0 md:border-r md:p-5 md:shadow-none dark:border-[#303a31] dark:bg-[#171e18]`}
      >
        <Link to="/dashboard" onClick={closeMenu} className="mb-9 hidden items-center gap-2.5 px-2 text-sm font-semibold text-[#29332a] dark:text-[#e8ece6] md:inline-flex">
          <span className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-[#31583b] text-white dark:bg-[#779779] dark:text-[#101a12]"><Scale size={16} /></span>
          SaralDocs
        </Link>

        <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#949b91] dark:text-[#879287]">Workspace</p>
        <nav aria-label="Dashboard navigation" className="flex flex-col gap-1">
          {navigation.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={closeMenu}
              className={({ isActive }) => {
                let active = isActive;
                if (to === '/documents') {
                  active = pathname === '/documents'
                    || (pathname.startsWith('/documents/') && pathname !== '/documents/new')
                    || pathname === '/drafts'
                    || (pathname.startsWith('/drafts/') && pathname !== '/drafts/new');
                } else if (to === '/documents/new') {
                  active = pathname === '/documents/new' || pathname === '/drafts/new';
                } else if (['/assistant', '/templates', '/legal-review'].includes(to)) {
                  active = pathname === to;
                }
                return `flex min-h-10 items-center gap-3 rounded-lg px-3 text-[13px] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#55775d] ${
                active
                  ? 'bg-[#eaf0e8] text-[#31583b] dark:bg-[#29382b] dark:text-[#c0d3bd]'
                  : 'text-[#667067] hover:bg-[#f0f2ed] hover:text-[#29332a] dark:text-[#aeb7ad] dark:hover:bg-[#222b23] dark:hover:text-[#e8ece6]'
              }`;
              }}
            >
              <Icon size={16} strokeWidth={1.8} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-8 border-t border-[#e5e6de] pt-4 dark:border-[#303a31]">
          <Link to="/limitations" onClick={closeMenu} className="flex min-h-10 items-center rounded-lg px-3 text-xs text-[#778075] transition-colors hover:bg-[#f0f2ed] dark:text-[#a3ada2] dark:hover:bg-[#222b23]">
            About legal limitations
          </Link>
        </div>

        <div className="mt-8 flex items-center gap-3 border-t border-[#e5e6de] pt-4 dark:border-[#303a31]">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#e8eee6] text-xs font-semibold text-[#45674c] dark:bg-[#2b3a2d] dark:text-[#c0d3bd]">
            {(user?.fullName || user?.full_name || user?.email || 'S').slice(0, 1).toUpperCase()}
          </span>
          <span className="min-w-0 flex-1 truncate text-xs font-medium text-[#465147] dark:text-[#d4dbd2]">
            {user?.fullName || user?.full_name || user?.email || 'Your account'}
          </span>
          <button type="button" onClick={toggleTheme} className="flex h-8 w-8 items-center justify-center rounded-full text-[#778075] hover:bg-[#eff0ea] dark:text-[#aeb7ad] dark:hover:bg-[#222b23]" aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}>
            {darkMode ? <Sun size={15} /> : <Moon size={15} />}
          </button>
          <button type="button" onClick={logout} className="flex h-8 w-8 items-center justify-center rounded-full text-[#778075] hover:bg-[#eff0ea] hover:text-[#9b5545] dark:text-[#aeb7ad] dark:hover:bg-[#222b23]" aria-label="Sign out">
            <LogOut size={15} />
          </button>
        </div>
      </aside>
    </>
  );
}
