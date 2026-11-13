import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Moon, Search, Sun } from 'lucide-react';
import NotificationDropdown from './NotificationDropdown';
import ProfileDropdown from './ProfileDropdown';

export default function DashboardNavbar({ role, person, notifications, onMobileMenu }) {
  const [darkMode, setDarkMode] = useState(() => document.documentElement.classList.contains('dark'));
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  function toggleTheme() {
    const next = !document.documentElement.classList.contains('dark');
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('saraldocs-theme', next ? 'dark' : 'light');
    setDarkMode(next);
  }

  function submitSearch(event) {
    event.preventDefault();
    const section = role === 'admin' ? 'users' : role === 'student' ? 'review-requests' : 'documents';
    const query = search.trim();
    navigate(`/dashboard/${role}/${section}${query ? `?q=${encodeURIComponent(query)}` : ''}`);
  }

  return (
    <header className="sticky top-0 z-30 flex h-[72px] items-center justify-between gap-3 border-b border-[#e6e7df] bg-[#fbfaf7]/95 px-4 backdrop-blur sm:px-6 lg:px-8 dark:border-[#303a31] dark:bg-[#171e18]/95">
      <div className="flex min-w-0 items-center gap-3">
        <button type="button" onClick={onMobileMenu} aria-label="Open dashboard navigation" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[#657064] hover:bg-[#eff2ec] md:hidden dark:text-[#c0c8bf] dark:hover:bg-[#29332a]"><Menu size={18} /></button>
        <form onSubmit={submitSearch} className="hidden h-9 min-w-[220px] items-center gap-2 rounded-xl border border-[#e4e6df] bg-white px-3 sm:flex dark:border-[#39443a] dark:bg-[#1d251e]">
          <Search size={14} className="shrink-0 text-[#9aa197]" />
          <input value={search} onChange={(event) => setSearch(event.target.value)} aria-label="Search dashboard" placeholder="Search anything..." className="w-full bg-transparent text-[10px] text-[#465147] outline-none placeholder:text-[#9aa197] dark:text-[#d4dbd2]" />
          <kbd className="rounded border border-[#e5e7df] px-1 py-0.5 text-[8px] text-[#9aa197] dark:border-[#39443a]">⌘ K</kbd>
        </form>
        <span className="truncate text-[10px] font-medium text-[#879084] sm:hidden">{role === 'admin' ? 'Platform admin' : role === 'student' ? 'Student workspace' : 'Client workspace'}</span>
      </div>
      <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
        <span className="hidden rounded-full border border-[#dfe8de] bg-[#f3f7f1] px-2.5 py-1 text-[9px] font-medium text-[#547258] lg:inline-flex dark:border-[#354537] dark:bg-[#202820] dark:text-[#b4c8b1]">Mock dashboard</span>
        <button type="button" onClick={toggleTheme} aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'} className="flex h-9 w-9 items-center justify-center rounded-full text-[#6d776c] hover:bg-[#eff2ec] dark:text-[#c0c8bf] dark:hover:bg-[#29332a]">{darkMode ? <Sun size={16} /> : <Moon size={16} />}</button>
        <NotificationDropdown notifications={notifications} />
        <span className="mx-1 hidden h-7 w-px bg-[#e5e6de] sm:block dark:bg-[#303a31]" />
        <ProfileDropdown role={role} person={person} />
      </div>
    </header>
  );
}
