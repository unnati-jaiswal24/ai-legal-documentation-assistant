import { useState } from 'react';
import { Bell, CheckCheck, X } from 'lucide-react';
import { markNotificationsRead } from '../../services/notificationService';
import { formatDashboardDate } from '../../utils/dashboardFormatters';

export default function NotificationDropdown({ notifications }) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState(notifications);
  const unreadCount = items.filter((item) => !item.read).length;

  async function markAllRead() {
    await markNotificationsRead(items.map((item) => item.id));
    setItems((current) => current.map((item) => ({ ...item, read: true })));
  }

  return (
    <div className="relative">
      <button type="button" onClick={() => setOpen((value) => !value)} aria-label="Notifications" aria-expanded={open} className="relative flex h-9 w-9 items-center justify-center rounded-full text-[#6d776c] hover:bg-[#eff2ec] dark:text-[#c0c8bf] dark:hover:bg-[#29332a]">
        <Bell size={17} />
        {unreadCount > 0 && <span className="absolute right-1 top-1 h-2 w-2 rounded-full border-2 border-[#fbfaf7] bg-[#bd735a] dark:border-[#171e18]" />}
      </button>
      {open && (
        <div className="absolute right-0 top-12 z-50 w-[min(360px,calc(100vw-32px))] overflow-hidden rounded-2xl border border-[#e6e7df] bg-white shadow-xl dark:border-[#303a31] dark:bg-[#1b231c]">
          <div className="flex items-center justify-between border-b border-[#ecece6] px-4 py-3 dark:border-[#303a31]">
            <div>
              <p className="text-xs font-semibold text-[#354136] dark:text-[#e0e6df]">Notifications</p>
              <p className="mt-0.5 text-[10px] text-[#879084]">{unreadCount} unread</p>
            </div>
            <div className="flex items-center gap-1">
              <button type="button" onClick={markAllRead} disabled={!unreadCount} aria-label="Mark all notifications as read" className="flex h-8 w-8 items-center justify-center rounded-full text-[#718472] hover:bg-[#f1f3ee] disabled:opacity-40 dark:hover:bg-[#29332a]"><CheckCheck size={15} /></button>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close notifications" className="flex h-8 w-8 items-center justify-center rounded-full text-[#879084] hover:bg-[#f1f3ee] dark:hover:bg-[#29332a]"><X size={15} /></button>
            </div>
          </div>
          <ul className="max-h-80 divide-y divide-[#eff0eb] overflow-y-auto dark:divide-[#303a31]">
            {items.map((item) => (
              <li key={item.id} className={`px-4 py-3 ${item.read ? '' : 'bg-[#f8faf6] dark:bg-[#202820]'}`}>
                <p className="text-[11px] font-semibold text-[#354136] dark:text-[#e0e6df]">{item.title}</p>
                <p className="mt-1 text-[10px] leading-4 text-[#778075] dark:text-[#aab3a9]">{item.message}</p>
                <p className="mt-1.5 text-[9px] text-[#9aa197]">{formatDashboardDate(item.createdAt, { relative: true })}</p>
              </li>
            ))}
            {!items.length && <li className="px-4 py-8 text-center text-xs text-[#879084]">You’re all caught up.</li>}
          </ul>
        </div>
      )}
    </div>
  );
}
