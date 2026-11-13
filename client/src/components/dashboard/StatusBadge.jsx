const styles = {
  active: 'bg-[#eaf2eb] text-[#42694a]',
  accepted: 'bg-[#eaf2eb] text-[#42694a]',
  completed: 'bg-[#eaf2eb] text-[#42694a]',
  verified: 'bg-[#eaf2eb] text-[#42694a]',
  in_review: 'bg-[#fff4df] text-[#956b26]',
  pending: 'bg-[#fff4df] text-[#956b26]',
  in_progress: 'bg-[#edf2f7] text-[#4c6782]',
  draft: 'bg-[#f0f1ed] text-[#657064]',
  rejected: 'bg-[#fbecea] text-[#a35447]',
  suspended: 'bg-[#fbecea] text-[#a35447]',
  unverified: 'bg-[#f0f1ed] text-[#657064]',
  archived: 'bg-[#f0f1ed] text-[#657064]',
};

function labelFor(status) {
  return String(status || 'unknown').replaceAll('_', ' ');
}

export default function StatusBadge({ status }) {
  const key = String(status || '').toLowerCase();
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[10px] font-semibold capitalize ${styles[key] || 'bg-[#f0f1ed] text-[#657064]'}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-75" aria-hidden="true" />
      {labelFor(status)}
    </span>
  );
}
