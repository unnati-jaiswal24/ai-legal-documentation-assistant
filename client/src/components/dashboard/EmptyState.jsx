import { FileText } from 'lucide-react';

export default function EmptyState({ title, description, action }) {
  return (
    <div className="flex flex-col items-center px-6 py-10 text-center">
      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#eff3ed] text-[#728a72] dark:bg-[#29352b] dark:text-[#b4c8b1]"><FileText size={18} /></span>
      <h3 className="mt-3 text-xs font-semibold text-[#4c594c] dark:text-[#d4dbd2]">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-[10px] leading-5 text-[#879084]">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
