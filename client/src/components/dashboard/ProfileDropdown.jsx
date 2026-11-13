import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, CircleUserRound, DoorOpen, Settings } from 'lucide-react';
import { dashboardPath, roleOptions } from './dashboardNavigation';

export default function ProfileDropdown({ role, person }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-label="Open profile menu" className="flex items-center gap-2 rounded-full p-1 pr-2 hover:bg-[#eff2ec] dark:hover:bg-[#29332a]">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#e6eee5] text-[10px] font-semibold text-[#45674c] dark:bg-[#2b3a2d] dark:text-[#c0d3bd]">{person.fullName.split(' ').map((part) => part[0]).slice(0, 2).join('')}</span>
        <span className="hidden max-w-28 truncate text-left text-[10px] font-semibold text-[#536052] sm:block dark:text-[#d4dbd2]">{person.fullName}</span>
        <ChevronDown size={13} className="text-[#879084]" />
      </button>
      {open && (
        <div className="absolute right-0 top-12 z-50 w-64 overflow-hidden rounded-2xl border border-[#e6e7df] bg-white p-2 shadow-xl dark:border-[#303a31] dark:bg-[#1b231c]">
          <div className="border-b border-[#ecece6] px-3 py-2.5 dark:border-[#303a31]">
            <p className="truncate text-xs font-semibold text-[#354136] dark:text-[#e0e6df]">{person.fullName}</p>
            <p className="mt-1 truncate text-[10px] text-[#879084]">{person.email}</p>
          </div>
          <Link to={dashboardPath(role, 'profile')} onClick={() => setOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-[11px] text-[#667067] hover:bg-[#f5f7f3] dark:text-[#b4bdb2] dark:hover:bg-[#252e26]"><CircleUserRound size={14} /> My profile</Link>
          <Link to={dashboardPath(role, 'settings')} onClick={() => setOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-[11px] text-[#667067] hover:bg-[#f5f7f3] dark:text-[#b4bdb2] dark:hover:bg-[#252e26]"><Settings size={14} /> Settings</Link>
          <div className="mt-1 border-t border-[#ecece6] pt-2 dark:border-[#303a31]">
            <p className="px-3 py-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-[#9aa197]">Preview role · mock</p>
            {roleOptions.map((option) => (
              <Link key={option.id} to={option.path} onClick={() => setOpen(false)} className={`flex items-center justify-between rounded-lg px-3 py-2 text-[10px] ${role === option.id ? 'font-semibold text-[#31583b] dark:text-[#b4c8b1]' : 'text-[#667067] hover:bg-[#f5f7f3] dark:text-[#b4bdb2] dark:hover:bg-[#252e26]'}`}>
                {option.label}
                <span className="text-[9px] text-[#9aa197]">{role === option.id ? 'Current' : 'Open'}</span>
              </Link>
            ))}
          </div>
          <Link to="/" onClick={() => setOpen(false)} className="mt-1 flex w-full items-center gap-2 rounded-lg border-t border-[#ecece6] px-3 py-2.5 text-[11px] text-[#6d776c] hover:bg-[#f5f7f3] dark:border-[#303a31] dark:text-[#b4bdb2] dark:hover:bg-[#252e26]"><DoorOpen size={14} /> Exit dashboard preview</Link>
        </div>
      )}
    </div>
  );
}
