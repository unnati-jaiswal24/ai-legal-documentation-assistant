import { BookOpenText, Sparkles, ShieldCheck } from 'lucide-react';

export default function ClauseCard({ clause, index, onExplain }) {
  const source = clause.source || clause.legalSource;
  const plainText = clause.plainText || clause.plain_text;
  const legalText = clause.legalText || clause.legal_text;
  const sourceName = typeof source === 'string' ? source : (source?.actName || source?.act_name);
  const clauseId = clause.id || (index !== undefined ? `clause-${index + 1}` : 'template-clause');

  return (
    <article className="border-b border-[#e9e9e2] py-5 last:border-0 dark:border-[#303a31]">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-semibold text-[#354136] dark:text-[#e0e6df]">{clause.title}</h3>
            <span className="inline-flex items-center gap-1 rounded bg-[#f0f3ed] px-2 py-0.5 font-mono text-[10px] text-[#556956] dark:bg-[#253226] dark:text-[#a6bca7]">
              <ShieldCheck size={11} />
              {clauseId}
            </span>
          </div>
          {plainText && <p className="mt-1.5 text-xs leading-5 text-[#6f796f] dark:text-[#b4bdb2]">{plainText}</p>}
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {sourceName && (
            <span className="rounded-full bg-[#f0f3ed] px-2 py-1 text-[9px] font-medium text-[#617762] dark:bg-[#29352b] dark:text-[#b4c8b1]">
              <BookOpenText size={12} className="mr-1 inline" />
              Source
            </span>
          )}
          {onExplain && (
            <button
              type="button"
              onClick={() => onExplain(clause)}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#d2ded2] bg-[#f8fbf7] px-2.5 py-1 text-xs font-medium text-[#335d3d] transition-colors hover:border-[#40714c] hover:bg-[#edf5ee] focus-visible:outline-[#31583b] dark:border-[#364939] dark:bg-[#1a251c] dark:text-[#a7d8ad] dark:hover:border-[#40714c]"
              aria-label={`Explain clause ${clause.title} in plain language`}
            >
              <Sparkles size={12} className="text-[#3c6b46] dark:text-[#a7d8ad]" />
              Explain this clause
            </button>
          )}
        </div>
      </div>

      {legalText && (
        <details className="mt-3 rounded-lg bg-[#f7f7f3] px-3.5 py-3 dark:bg-[#202820]">
          <summary className="cursor-pointer text-[11px] font-medium text-[#637263] dark:text-[#b9c9b8]">
            View reviewed agreement wording
          </summary>
          <div className="mt-2 text-xs leading-5 text-[#626c62] dark:text-[#c0c8bf]">
            <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-[#798377] dark:text-[#95a093]">
              Reviewed Legal Template Text:
            </span>
            <p className="font-serif italic">{legalText}</p>
          </div>
        </details>
      )}

      {sourceName && (
        <p className="mt-2 text-[10px] text-[#8a9087] dark:text-[#9ca69c]">
          {sourceName}{source?.section ? `, ${source.section}` : ''}
        </p>
      )}
    </article>
  );
}
