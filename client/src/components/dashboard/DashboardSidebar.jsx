import { Link, NavLink, useLocation } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Scale, X } from 'lucide-react';
import { dashboardNavigation, dashboardPath, rolePresentation } from './dashboardNavigation';

export default function DashboardSidebar({ role, collapsed, onToggle, mobileOpen, onClose }) {
  const { pathname } = useLocation();
  const nav = dashboardNavigation[role];
  const presentation = rolePresentation[role];

  return (
    <>
      {mobileOpen && <button type="button" aria-label="Close navigation" onClick={onClose} className="fixed inset-0 z-40 bg-[#172018]/35 backdrop-blur-[1px] md:hidden" />}
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-[270px] flex-col border-r border-[#e6e7df] bg-[#fbfaf7] transition-[width,transform] duration-200 md:sticky md:top-0 md:z-30 md:h-screen md:translate-x-0 dark:border-[#303a31] dark:bg-[#171e18] ${collapsed ? 'md:w-[76px]' : 'md:w-[258px]'} ${mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'}`}>
        <div className={`flex h-[72px] shrink-0 items-center border-b border-[#e9e9e2] dark:border-[#303a31] ${collapsed ? 'justify-center px-2' : 'justify-between px-5'}`}>
          <Link to={dashboardPath(role)} onClick={onClose} className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#31583b] text-white dark:bg-[#779779] dark:text-[#101a12]"><Scale size={17} /></span>
            {!collapsed && <span className="text-sm font-bold tracking-tight text-[#29332a] dark:text-[#e8ece6]">Saral<span className="font-normal text-[#78977b]">Docs</span></span>}
          </Link>
          <button type="button" onClick={onClose} aria-label="Close navigation" className="flex h-8 w-8 items-center justify-center rounded-full text-[#879084] hover:bg-[#eff2ec] md:hidden"><X size={16} /></button>
          <button type="button" onClick={onToggle} aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} className="hidden h-7 w-7 items-center justify-center rounded-full border border-[#e5e7df] text-[#879084] hover:bg-white md:flex dark:border-[#39443a] dark:hover:bg-[#202820]">
            {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        </div>
        {!collapsed && (
          <div className="px-5 pb-2 pt-5">
            <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-[#97a092]">{presentation.label} workspace</p>
          </div>
        )}
        <nav aria-label={`${presentation.label} dashboard navigation`} className={`flex-1 overflow-y-auto py-3 ${collapsed ? 'px-2' : 'px-3'}`}>
          {nav.map(({ label, icon: Icon, path }) => {
            const href = dashboardPath(role, path);
            const active = path ? pathname === href || pathname.startsWith(`${href}/`) : pathname === href;
            return (
              <NavLink
                key={path || 'dashboard'}
                to={href}
                onClick={onClose}
                title={collapsed ? label : undefined}
                aria-label={label}
                aria-current={active ? 'page' : undefined}
                className={`group mb-1 flex min-h-10 items-center rounded-xl text-[11px] font-medium transition-colors ${collapsed ? 'justify-center px-2' : 'gap-3 px-3'} ${active ? 'bg-[#eaf0e8] text-[#31583b] dark:bg-[#29382b] dark:text-[#c0d3bd]' : 'text-[#667067] hover:bg-[#f0f2ed] hover:text-[#29332a] dark:text-[#aeb7ad] dark:hover:bg-[#222b23] dark:hover:text-[#e8ece6]'}`}
              >
                <Icon size={16} strokeWidth={1.8} className="shrink-0" />
                {!collapsed && <span className="truncate">{label}</span>}
              </NavLink>
            );
          })}
        </nav>
        {!collapsed && (
          <div className="border-t border-[#e5e6de] p-4 dark:border-[#303a31]">
            <div className="rounded-xl bg-[#f0f3ed] p-3 dark:bg-[#202820]">
              <p className="text-[10px] font-semibold text-[#536052] dark:text-[#c4cdc1]">A clear note</p>
              <p className="mt-1 text-[9px] leading-4 text-[#7b857a] dark:text-[#9ca69c]">Student reviews are educational feedback, not professional legal advice.</p>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
