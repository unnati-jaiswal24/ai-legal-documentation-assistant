import { Check, FilePlus2, MessageSquareText, Sparkles } from 'lucide-react';
import { formatDashboardDate } from '../../utils/dashboardFormatters';

const icons = {
  document_created: FilePlus2,
  review_requested: MessageSquareText,
  review_accepted: Check,
  review_completed: Sparkles,
};

export default function RecentActivity({ items }) {
  return (
    <ol className="divide-y divide-[#eff0eb] px-4 dark:divide-[#303a31]">
      {items.map((item) => {
        const Icon = icons[item.type] || Sparkles;
        return (
          <li key={item.id} className="flex gap-3 py-3.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#edf3ec] text-[#58765b] dark:bg-[#29352b] dark:text-[#b4c8b1]"><Icon size={14} /></span>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] leading-5 text-[#566257] dark:text-[#c0c8bf]"><span className="font-semibold text-[#354136] dark:text-[#e0e6df]">{item.actorName}</span> {item.action} <span className="font-medium">{item.entityTitle}</span></p>
              <p className="mt-1 text-[9px] text-[#92998f]">{formatDashboardDate(item.createdAt, { relative: true })}</p>
            </div>
          </li>
        );
      })}
      {!items.length && <li className="py-8 text-center text-xs text-[#879084]">No recent activity yet.</li>}
    </ol>
  );
}
