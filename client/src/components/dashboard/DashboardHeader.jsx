import { ArrowRight, ShieldCheck } from 'lucide-react';

export default function DashboardHeader({ eyebrow, title, description, actions, badge }) {
  return (
    <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          {eyebrow && <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-[#7d8b7b]">{eyebrow}</p>}
          {badge && <span className="inline-flex items-center gap-1 rounded-full bg-[#edf3ec] px-2 py-1 text-[9px] font-semibold text-[#4c7654]"><ShieldCheck size={11} />{badge}</span>}
        </div>
        <h1 className="mt-2 font-serif text-[26px] leading-tight tracking-tight text-[#29332a] sm:text-[30px] dark:text-[#e8ece6]">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-[11px] leading-5 text-[#788176] sm:text-xs dark:text-[#aab3a9]">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function TextLink({ children, href, onClick }) {
  if (href) {
    return <a href={href} className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#55775d] hover:underline dark:text-[#a9c5a9]">{children}<ArrowRight size={12} /></a>;
  }
  return <button type="button" onClick={onClick} className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#55775d] hover:underline dark:text-[#a9c5a9]">{children}<ArrowRight size={12} /></button>;
}
