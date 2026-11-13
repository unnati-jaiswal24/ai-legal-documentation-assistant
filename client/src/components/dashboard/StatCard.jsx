export default function StatCard({ label, value, icon: Icon, trend, tone = 'green', helper }) {
  const tones = {
    green: 'bg-[#edf3ec] text-[#45674c]',
    amber: 'bg-[#fbf2df] text-[#9a7433]',
    blue: 'bg-[#edf2f7] text-[#54718d]',
    rose: 'bg-[#f8ece8] text-[#a76250]',
    purple: 'bg-[#f1edf6] text-[#75628c]',
  };
  return (
    <article className="rounded-2xl border border-[#e6e7df] bg-white p-4 shadow-[0_8px_24px_-22px_rgba(35,47,37,0.3)] sm:p-5 dark:border-[#303a31] dark:bg-[#1b231c]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-medium text-[#788176] dark:text-[#aab3a9]">{label}</p>
          <p className="mt-2 text-[26px] font-semibold leading-none tracking-tight text-[#29332a] dark:text-[#e8ece6]">{value}</p>
        </div>
        {Icon && <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tones[tone] || tones.green}`}><Icon size={18} strokeWidth={1.8} /></span>}
      </div>
      {(trend || helper) && (
        <p className="mt-3 flex items-center gap-1 text-[10px] text-[#879084] dark:text-[#9ca69c]">
          {trend && <span className="font-semibold text-[#4b7953]">{trend}</span>}
          {helper}
        </p>
      )}
    </article>
  );
}
