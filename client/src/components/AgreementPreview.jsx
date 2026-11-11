import { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Check, ChevronDown, FileText, MessageSquareText, Sparkles } from 'lucide-react';

const clauses = [
  { title: 'Project scope', text: 'Design and build a five-page portfolio website.' },
  { title: 'Payment schedule', text: '50% to begin, with the balance due on delivery.' },
  { title: 'Revisions', text: 'Includes two rounds of revisions after the first draft.' },
];

export default function AgreementPreview() {
  const [activeTab, setActiveTab] = useState('agreement');
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className="relative mx-auto w-full max-w-[610px]"
      initial={reduceMotion ? false : { opacity: 0, y: 48, scale: 0.94, rotate: 1.5 }}
      animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
      transition={{ delay: 0.42, duration: 0.9, type: 'spring', stiffness: 62, damping: 18 }}
    >
      <div
        aria-hidden="true"
        className="absolute -inset-5 rounded-[2rem] bg-[#e8e7dd] opacity-70 blur-2xl dark:bg-[#243027]"
      />
      <div className="relative overflow-hidden rounded-[1.4rem] border border-[#e7e5dc] bg-white shadow-[0_28px_90px_-40px_rgba(27,39,29,0.35)] dark:border-[#303a31] dark:bg-[#181f19]">
        <div className="flex items-center justify-between border-b border-[#efeee9] px-5 py-4 dark:border-[#2b332d] sm:px-7">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#edf3ec] text-[#376248] dark:bg-[#26372b] dark:text-[#a7c7ae]">
              <FileText size={19} strokeWidth={1.7} />
            </div>
            <div>
              <p className="text-sm font-semibold">Freelance agreement</p>
              <p className="mt-0.5 text-xs text-[#81877f] dark:text-[#9ca69c]">Untitled project · Edited just now</p>
            </div>
          </div>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-full border border-[#e8e7e0] px-3 py-1.5 text-xs font-medium text-[#606b61] transition-colors hover:border-[#cbd6c9] hover:bg-[#f7f8f5] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#51745a] dark:border-[#364138] dark:text-[#c0c9bf] dark:hover:bg-[#222b23]"
            aria-label="Draft status"
          >
            Draft <ChevronDown size={13} />
          </button>
        </div>

        <div className="flex gap-1 border-b border-[#efeee9] px-5 dark:border-[#2b332d] sm:px-7">
          {[
            { id: 'agreement', label: 'Agreement', icon: FileText },
            { id: 'review', label: 'Clause review', icon: MessageSquareText },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              aria-pressed={activeTab === id}
              className={`inline-flex items-center gap-2 border-b-2 px-3 py-3 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#51745a] ${
                activeTab === id
                  ? 'border-[#45674c] text-[#35563d] dark:text-[#b2d0b6]'
                  : 'border-transparent text-[#899087] hover:text-[#4c594d] dark:text-[#9aa39a] dark:hover:text-[#e0e6df]'
              }`}
            >
              {activeTab === id && (
                <motion.span
                  layoutId="agreement-preview-tab"
                  className="absolute inset-x-2 bottom-[-1px] h-0.5 rounded-full bg-[#45674c] dark:bg-[#a9c5a9]"
                  transition={{ duration: reduceMotion ? 0 : 0.25, ease: 'easeOut' }}
                />
              )}
              <Icon size={14} strokeWidth={1.8} />
              {label}
            </button>
          ))}
        </div>

        <div className="grid gap-5 p-5 sm:grid-cols-[1.15fr_0.85fr] sm:gap-6 sm:p-7">
          <div className="min-h-[255px] rounded-xl border border-[#eeece5] bg-[#fdfcf9] p-5 dark:border-[#303a31] dark:bg-[#1d241e]">
            <AnimatePresence mode="wait" initial={false}>
              {activeTab === 'agreement' ? (
                <motion.div
                  key="agreement"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: reduceMotion ? 0 : 0.24, ease: 'easeOut' }}
                >
                  <p className="text-center text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8a8d83]">Service agreement</p>
                  <h3 className="mt-3 text-center font-serif text-lg text-[#29332a] dark:text-[#e7e9e3]">A clear start to good work</h3>
                  <p className="mt-4 text-xs leading-5 text-[#6e746c] dark:text-[#b2bab1]">
                    This agreement describes the work, payment, and responsibilities shared by the client and freelancer.
                  </p>
                  <div className="my-4 h-px bg-[#eae8df] dark:bg-[#343d35]" />
                  <div className="space-y-3">
                    {clauses.slice(0, 2).map((clause, index) => (
                      <div key={clause.title} className="flex gap-3">
                        <span className="pt-0.5 text-[10px] font-medium text-[#9a9e94]">0{index + 1}</span>
                        <div>
                          <p className="text-xs font-semibold text-[#465047] dark:text-[#d3d9d1]">{clause.title}</p>
                          <p className="mt-1 text-[11px] leading-4 text-[#7b8179] dark:text-[#aab2a9]">{clause.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="review"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: reduceMotion ? 0 : 0.24, ease: 'easeOut' }}
                >
                  <div className="flex items-center gap-2 text-[#45674c] dark:text-[#b2d0b6]">
                    <Sparkles size={15} />
                    <p className="text-xs font-semibold">Review the important details</p>
                  </div>
                  <p className="mt-3 text-xs leading-5 text-[#70776e] dark:text-[#b2bab1]">
                    A helpful first pass, ready for you to check and adjust before sharing.
                  </p>
                  <div className="mt-4 space-y-2.5">
                    {clauses.map((clause) => (
                      <div key={clause.title} className="rounded-lg border border-[#ebe9e1] bg-white p-3 dark:border-[#343d35] dark:bg-[#202820]">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-[11px] font-semibold">{clause.title}</p>
                          <span className="rounded-full bg-[#f2f1e9] px-2 py-0.5 text-[9px] text-[#74796e] dark:bg-[#323a32] dark:text-[#c3cabc]">Review</span>
                        </div>
                        <p className="mt-1 text-[10px] leading-4 text-[#83877e] dark:text-[#aab2a9]">{clause.text}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex flex-col justify-between rounded-xl bg-[#f4f5f0] p-4 dark:bg-[#202820]">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles size={14} className="text-[#55775d]" />
                <p className="text-xs font-semibold">Your project at a glance</p>
              </div>
              <div className="mt-4 space-y-3">
                {[
                  ['Client', 'Aarav Mehta'],
                  ['Freelancer', 'You'],
                  ['Project fee', '₹48,000'],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between gap-2 border-b border-[#e3e5dd] pb-2.5 text-[11px] dark:border-[#384138]">
                    <span className="text-[#81877d] dark:text-[#aab2a9]">{label}</span>
                    <span className="font-medium text-[#465047] dark:text-[#e0e6df]">{value}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-5 flex items-center gap-2 rounded-lg border border-[#e0e6de] bg-white/70 p-2.5 dark:border-[#38473a] dark:bg-[#263027]">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#e8f0e7] text-[#537557] dark:bg-[#344a37] dark:text-[#b2d0b6]">
                <Check size={12} />
              </span>
              <p className="text-[10px] leading-4 text-[#687267] dark:text-[#c2cbc1]">You can edit every detail before exporting.</p>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between border-t border-[#efeee9] px-5 py-3 text-[10px] text-[#8a9087] dark:border-[#2b332d] dark:text-[#9ca69c] sm:px-7">
          <span>Made for independent work in India</span>
          <span className="inline-flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-[#789879]" /> Your draft</span>
        </div>
      </div>
    </motion.div>
  );
}
