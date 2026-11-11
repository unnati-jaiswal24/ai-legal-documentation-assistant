const statusStyles = {
  in_progress: 'bg-[#f2f0e8] text-[#756a48] dark:bg-[#373329] dark:text-[#d4c697]',
  validated: 'bg-[#eaf0e8] text-[#45674c] dark:bg-[#29382b] dark:text-[#c0d3bd]',
  generated: 'bg-[#e8eef0] text-[#496775] dark:bg-[#29363b] dark:text-[#bed1d7]',
  exported: 'bg-[#edf0e9] text-[#596750] dark:bg-[#30382b] dark:text-[#c6d0b1]',
  requested: 'bg-[#f2f0e8] text-[#756a48] dark:bg-[#373329] dark:text-[#d4c697]',
  assigned: 'bg-[#e8eef0] text-[#496775] dark:bg-[#29363b] dark:text-[#bed1d7]',
  answered: 'bg-[#eaf0e8] text-[#45674c] dark:bg-[#29382b] dark:text-[#c0d3bd]',
  closed: 'bg-[#f0f1ee] text-[#687067] dark:bg-[#303530] dark:text-[#b6bdb4]',
};

export default function StatusBadge({ status }) {
  const value = String(status || 'unknown');
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold capitalize ${statusStyles[value] || 'bg-[#f0f1ee] text-[#687067] dark:bg-[#303530] dark:text-[#b6bdb4]'}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-65" aria-hidden="true" />
      {value.replaceAll('_', ' ')}
    </span>
  );
}
