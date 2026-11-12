import { useState, useEffect, useRef } from 'react';
import {
  X,
  Sparkles,
  ShieldCheck,
  Scale,
  AlertTriangle,
  RotateCcw,
  BookOpen,
} from 'lucide-react';
import Button from '../Button';
import SafeMarkdown from './SafeMarkdown';
import { explainClause } from '../../api/ai/client';
import { isAiEnabled, hasUserConsented } from '../../api/ai/config';

export default function ClauseExplanationPanel({
  isOpen,
  clause,
  onClose,
  onRequestConsent,
}) {
  const [loading, setLoading] = useState(false);
  const [explanation, setExplanation] = useState(null);
  const [error, setError] = useState(null);
  const panelRef = useRef(null);

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      panelRef.current?.focus();
    }
  }, [isOpen]);

  const loadExplanation = async () => {
    if (!clause) return;

    if (!isAiEnabled()) {
      setError('AI clause explanations are currently not configured.');
      return;
    }

    if (!hasUserConsented()) {
      onRequestConsent?.();
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await explainClause({
        clauseId: clause.id,
        clauseTitle: clause.title,
        legalText: clause.legalText || clause.legal_text || clause.plainText || clause.plain_text,
        consent: true,
      });
      setExplanation(result);
    } catch (err) {
      setError(err.message || 'Unable to load clause explanation. Please retry.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && clause) {
      loadExplanation();
    } else {
      setExplanation(null);
      setError(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, clause?.id]);

  if (!isOpen || !clause) return null;

  const legalText = clause.legalText || clause.legal_text;
  const sourceName = clause.source?.actName || clause.source?.act_name || clause.source;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs transition-opacity"
      role="dialog"
      aria-modal="true"
      aria-labelledby="explanation-panel-title"
    >
      <div
        ref={panelRef}
        tabIndex={-1}
        className="flex h-full w-full max-w-xl flex-col bg-[#fcfbf8] shadow-2xl outline-none dark:bg-[#161d17]"
      >
        {/* Panel Header */}
        <header className="flex items-center justify-between border-b border-[#e5e7df] px-6 py-4 dark:border-[#2f3930]">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#eff3ed] text-[#31583b] dark:bg-[#233125] dark:text-[#a8dcae]">
              <BookOpen size={17} />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="explanation-panel-title" className="text-sm font-semibold text-[#29332a] dark:text-[#e8ece6]">
                  Clause Breakdown
                </h2>
                <span className="rounded bg-[#ecefe9] px-1.5 py-0.5 font-mono text-[10px] text-[#636c62] dark:bg-[#253126] dark:text-[#adb8ac]">
                  ID: {clause.id}
                </span>
              </div>
              <p className="text-xs text-[#788177] dark:text-[#9ea89d] truncate max-w-xs sm:max-w-md">
                {clause.title}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-[#788177] hover:bg-[#eff1ec] dark:text-[#a4ada3] dark:hover:bg-[#242f26]"
            aria-label="Close clause explanation panel"
          >
            <X size={18} />
          </button>
        </header>

        {/* Panel Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Sourced Template Clause Section */}
          <section className="rounded-xl border border-[#dfe3da] bg-white p-4 dark:border-[#313c32] dark:bg-[#1c241d]">
            <div className="flex items-center justify-between mb-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#eef3ec] px-2.5 py-0.5 text-[10px] font-semibold text-[#325a3d] dark:bg-[#253828] dark:text-[#b4deb9]">
                <ShieldCheck size={12} />
                Reviewed Template Clause
              </span>
              {sourceName && (
                <span className="text-[10px] text-[#7e877c] dark:text-[#9ca69b]">
                  Source: {typeof sourceName === 'string' ? sourceName : 'Curated Library'}
                </span>
              )}
            </div>
            <p className="text-xs font-medium text-[#747e73] dark:text-[#9ca69c] mb-1">
              Agreement Wording (from verified template):
            </p>
            <div className="rounded-lg bg-[#f8f9f6] p-3 text-xs leading-5 text-[#3b453c] dark:bg-[#212922] dark:text-[#cbd4ca] font-serif">
              {legalText || clause.plainText || clause.plain_text || 'Clause text not available.'}
            </div>
            <p className="mt-2 text-[10px] text-[#868f84] dark:text-[#919c90]">
              Note: The legal wording above originates directly from the lawyer-reviewed template, not generated by AI.
            </p>
          </section>

          {/* AI Plain-Language Explanation Section */}
          <section className="rounded-xl border border-[#d6e2d6] bg-[#f7f9f6] p-4.5 dark:border-[#2f4232] dark:bg-[#1a251c]">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5">
                <span className="inline-flex items-center gap-1 rounded-full bg-[#e3ecdf] px-2 py-0.5 text-[10px] font-semibold text-[#30593b] dark:bg-[#273d2a] dark:text-[#bfe2c3]">
                  <Sparkles size={11} />
                  AI-generated
                </span>
                <span className="text-xs font-semibold text-[#2d372e] dark:text-[#e4e9e2]">
                  Plain-Language Meaning
                </span>
              </div>
            </div>

            {loading ? (
              <div className="py-8 text-center" aria-live="polite">
                <Sparkles size={22} className="mx-auto mb-2 animate-spin text-[#456d4e]" />
                <p className="text-xs text-[#6e786d] dark:text-[#a2aca1]">Generating plain-language breakdown...</p>
              </div>
            ) : error ? (
              <div className="rounded-lg border border-[#f0c3be] bg-[#fff5f4] p-3.5 text-xs text-[#8c2b22] dark:border-[#532b27] dark:bg-[#2e1715] dark:text-[#f29f98]" aria-live="assertive">
                <p className="font-semibold mb-1">Could not load explanation</p>
                <p className="mb-2">{error}</p>
                <Button size="sm" variant="outline" onClick={loadExplanation}>
                  <RotateCcw size={13} /> Retry
                </Button>
              </div>
            ) : explanation ? (
              <div className="space-y-4">
                <SafeMarkdown
                  content={explanation.plain_explanation}
                  className="text-xs leading-relaxed text-[#3a443a] dark:text-[#d3ddd2]"
                />

                {explanation.key_considerations?.length > 0 && (
                  <div className="mt-3 border-t border-[#d8e0d6] pt-3 dark:border-[#2f3f31]">
                    <h4 className="text-[11px] font-semibold uppercase tracking-wider text-[#697468] dark:text-[#9ea99d] mb-1.5">
                      Key Practical Takeaways:
                    </h4>
                    <ul className="space-y-1.5">
                      {explanation.key_considerations.map((point, index) => (
                        <li key={index} className="flex items-start gap-2 text-xs text-[#4c564c] dark:text-[#bdc7bc]">
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#40714c]" />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {explanation.needs_legal_review && (
                  <div className="rounded-lg border border-[#e7c28c] bg-[#fef8ed] p-3 text-xs text-[#82521e] dark:border-[#523b20] dark:bg-[#2d2215] dark:text-[#f3caa1]">
                    <div className="flex items-center gap-1.5 font-semibold mb-1">
                      <AlertTriangle size={14} className="shrink-0" />
                      Consult an Advocate Recommended
                    </div>
                    <p className="leading-5">
                      This clause involves higher legal sensitivity under Indian jurisdiction (such as liability caps or restrictive covenants). We recommend having an advocate review these terms.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-6 text-center">
                <p className="text-xs text-[#717b70] dark:text-[#9fa99e]">
                  Ready to explain this clause in clear, simple terms.
                </p>
                <Button size="sm" variant="outline" onClick={loadExplanation} className="mt-3">
                  <Sparkles size={13} /> Explain this clause
                </Button>
              </div>
            )}
          </section>

          {/* Persistent Legal Disclaimer */}
          <div className="rounded-lg bg-[#f0f2ed] p-3 text-[11px] leading-5 text-[#6c766b] dark:bg-[#1f2820] dark:text-[#9ba59a]">
            <p className="flex items-start gap-1.5">
              <Scale size={13} className="shrink-0 mt-0.5 text-[#527457]" />
              <span>
                <strong>Persistent Notice:</strong> AI explanations provide drafting assistance and educational context only, not legal representation or individualized legal advice.
              </span>
            </p>
          </div>
        </div>

        {/* Panel Footer */}
        <footer className="border-t border-[#e5e7df] px-6 py-3.5 dark:border-[#2f3930] flex justify-end">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </footer>
      </div>
    </div>
  );
}
