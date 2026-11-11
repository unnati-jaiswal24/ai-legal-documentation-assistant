import { BookOpenText } from 'lucide-react';

export default function ClauseCard({ clause }) {
  const source = clause.source || clause.legalSource;
  const plainText = clause.plainText || clause.plain_text;
  const legalText = clause.legalText || clause.legal_text;
  const sourceName = source?.actName || source?.act_name;

  return (
    <article className="border-b border-[#e9e9e2] py-5 last:border-0 dark:border-[#303a31]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-[#354136] dark:text-[#e0e6df]">{clause.title}</h3>
          {plainText && <p className="mt-1.5 text-xs leading-5 text-[#6f796f] dark:text-[#b4bdb2]">{plainText}</p>}
        </div>
        {sourceName && <span className="shrink-0 rounded-full bg-[#f0f3ed] px-2 py-1 text-[9px] font-medium text-[#617762] dark:bg-[#29352b] dark:text-[#b4c8b1]"><BookOpenText size={12} className="mr-1 inline" />Source</span>}
      </div>
      {legalText && (
        <details className="mt-3 rounded-lg bg-[#f7f7f3] px-3.5 py-3 dark:bg-[#202820]">
          <summary className="cursor-pointer text-[11px] font-medium text-[#637263] dark:text-[#b9c9b8]">View agreement wording</summary>
          <p className="mt-2 text-xs leading-5 text-[#626c62] dark:text-[#c0c8bf]">{legalText}</p>
        </details>
      )}
      {sourceName && (
        <p className="mt-2 text-[10px] text-[#8a9087] dark:text-[#9ca69c]">
          {sourceName}{source.section ? `, ${source.section}` : ''}
        </p>
      )}
    </article>
  );
}
