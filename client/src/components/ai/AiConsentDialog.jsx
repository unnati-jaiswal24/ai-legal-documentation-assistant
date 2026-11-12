import { useEffect, useRef } from 'react';
import { ShieldCheck, Lock, X } from 'lucide-react';
import Button from '../Button';

export default function AiConsentDialog({ isOpen, onConsent, onCancel }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      dialogRef.current?.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ai-consent-title"
      aria-describedby="ai-consent-description"
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        className="w-full max-w-lg rounded-2xl border border-[#e2e5dc] bg-white p-6 shadow-2xl outline-none dark:border-[#344236] dark:bg-[#1a231c] sm:p-7"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#edf5ee] text-[#31583b] dark:bg-[#253628] dark:text-[#a8dcae]">
              <ShieldCheck size={20} />
            </span>
            <div>
              <h2 id="ai-consent-title" className="text-base font-semibold text-[#29332a] dark:text-[#e8ece6]">
                AI Drafting Assistance Consent
              </h2>
              <p className="text-xs text-[#737c72] dark:text-[#a8b2a7]">
                Privacy & Data Processing Notice
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg p-1 text-[#788177] hover:bg-[#eff1ec] dark:text-[#a4ada3] dark:hover:bg-[#242f26]"
            aria-label="Close consent dialog"
          >
            <X size={18} />
          </button>
        </div>

        <div id="ai-consent-description" className="mt-4 space-y-3 text-xs leading-5 text-[#596358] dark:text-[#c4cec3]">
          <p>
            To assist you with drafting and explaining contract clauses, the platform uses an AI model. Under the{' '}
            <strong>Digital Personal Data Protection Act, 2023 (DPDPA)</strong> and our data minimization principles:
          </p>
          <ul className="space-y-2 rounded-xl bg-[#f8f9f6] p-3.5 dark:bg-[#212b23]">
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#40714c]" />
              <span><strong>What is sent:</strong> Non-sensitive agreement terms (e.g. project deliverables, timelines, payment schedules) and clause identifiers.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#40714c]" />
              <span><strong>What is never sent:</strong> Aadhaar numbers, PAN numbers, bank accounts, or identity documents.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#40714c]" />
              <span><strong>Legal disclaimer:</strong> AI outputs provide drafting assistance and general guidance only; they do not constitute legal advice or legal representation.</span>
            </li>
          </ul>
          <p className="flex items-center gap-1.5 text-[11px] text-[#788177] dark:text-[#a3ada2]">
            <Lock size={12} className="shrink-0" />
            Your inputs are processed in-session and not used to train public models.
          </p>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="outline" size="sm" onClick={onCancel}>
            Do not allow
          </Button>
          <Button variant="primary" size="sm" onClick={onConsent}>
            I consent & continue
          </Button>
        </div>
      </div>
    </div>
  );
}
