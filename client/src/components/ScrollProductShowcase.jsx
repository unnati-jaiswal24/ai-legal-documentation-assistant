import { useRef, useState } from 'react';
import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion';
import { Check, Download, FilePenLine, FileText, ShieldCheck, Sparkles } from 'lucide-react';

const stages = [
  {
    eyebrow: '01 / Draft',
    title: 'Start with the work.',
    description: 'Bring the project scope, fee, and people into one clear first draft.',
    icon: FileText,
    status: 'Drafting',
  },
  {
    eyebrow: '02 / Review',
    title: 'See what needs a closer look.',
    description: 'Review important clauses in plain language and make changes before sharing.',
    icon: ShieldCheck,
    status: 'Review in progress',
  },
  {
    eyebrow: '03 / Export',
    title: 'Share when it feels right.',
    description: 'Keep the final wording in your hands, then prepare a clean PDF to share.',
    icon: Download,
    status: 'Ready to export',
  },
];

function DraftCanvas({ stage }) {
  const reduceMotion = useReducedMotion();
  const Icon = stages[stage].icon;

  return (
    <motion.div
      key={stage}
      initial={reduceMotion ? false : { opacity: 0, y: 22, x: 18, rotate: 1.5, scale: 0.975 }}
      animate={{ opacity: 1, y: 0, x: 0, rotate: 0, scale: 1 }}
      exit={reduceMotion ? undefined : { opacity: 0, y: -16, x: -12, rotate: -1, scale: 0.985 }}
      transition={{ duration: reduceMotion ? 0 : 0.48, ease: [0.22, 1, 0.36, 1] }}
      className="relative min-h-[370px] overflow-hidden rounded-2xl border border-[#e5e6df] bg-[#f7f7f2] p-4 dark:border-[#354037] dark:bg-[#151b16] sm:min-h-[430px] sm:p-6"
      aria-live="polite"
    >
      <div className="flex items-center justify-between border-b border-[#e7e8e1] pb-3 dark:border-[#303a31]">
        <div className="flex items-center gap-2 text-[11px] font-medium text-[#576358] dark:text-[#c0c9bf]">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-[#55775d] shadow-sm dark:bg-[#222b23] dark:text-[#b2d0b6]">
            <Icon size={14} />
          </span>
          Freelance service agreement
        </div>
        <span className="rounded-full border border-[#e2e5dc] bg-white px-2.5 py-1 text-[9px] text-[#747d72] dark:border-[#39443a] dark:bg-[#202820] dark:text-[#b7c0b5]">
          {stages[stage].status}
        </span>
      </div>

      <div className="relative mx-auto mt-5 max-w-[410px]">
        <motion.div
          aria-hidden="true"
          className="absolute inset-0 translate-x-2 translate-y-2 rotate-2 rounded-xl border border-[#e8e8e1] bg-[#eeefe9] dark:border-[#303a31] dark:bg-[#202820]"
          animate={reduceMotion ? undefined : { y: [8, 3, 8], rotate: [2, 1.3, 2] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        />
        <div className="relative rounded-xl border border-[#e7e8e1] bg-white px-5 py-6 shadow-[0_14px_38px_-24px_rgba(35,47,37,0.3)] dark:border-[#303a31] dark:bg-[#1b231c] sm:px-8 sm:py-7">
          <p className="text-center text-[8px] font-semibold uppercase tracking-[0.21em] text-[#8b9288]">SaralDocs · Agreement</p>
          <h3 className="mt-3 text-center font-serif text-lg text-[#29332a] dark:text-[#e8ece6]">Freelance services</h3>
          <p className="mt-4 text-[10px] leading-5 text-[#6d766b] dark:text-[#b7c0b5]">
            This agreement sets out the terms for services provided between the client and the freelancer.
          </p>
          <div className="mt-4 rounded-lg bg-[#f4f6f1] p-3 dark:bg-[#222b23]">
            <div className="flex items-center justify-between">
              <p className="text-[8px] font-semibold uppercase tracking-wider text-[#7b867a]">Scope of work</p>
              {stage > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-[#e6f0e5] px-2 py-1 text-[8px] font-medium text-[#486a4e] dark:bg-[#304533] dark:text-[#c4ddc4]">
                  <Check size={9} /> Reviewed
                </span>
              )}
            </div>
            <p className="mt-1.5 text-[10px] leading-4 text-[#4e5a4e] dark:text-[#d3dbd1]">Brand identity and responsive website design</p>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-[#ecece6] p-3 dark:border-[#303a31]">
              <p className="text-[8px] font-semibold uppercase tracking-wider text-[#899187]">Project fee</p>
              <p className="mt-1 text-[10px] font-medium text-[#485449] dark:text-[#d5ddd3]">₹48,000</p>
            </div>
            <div className={`rounded-lg border p-3 transition-colors duration-300 ${stage === 1 ? 'border-[#d5c996] bg-[#fbf8eb] dark:border-[#6a6041] dark:bg-[#2b291e]' : 'border-[#ecece6] dark:border-[#303a31]'}`}>
              <p className="text-[8px] font-semibold uppercase tracking-wider text-[#899187]">Payment terms</p>
              <p className="mt-1 text-[10px] font-medium text-[#485449] dark:text-[#d5ddd3]">50% on start</p>
            </div>
          </div>
          {stage === 1 && (
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: reduceMotion ? 0 : 0.3 }}
              className="mt-3 flex items-start gap-2 rounded-lg border border-[#e4dcbd] bg-[#fbf8eb] p-2.5 text-[9px] leading-4 text-[#70694e] dark:border-[#514b35] dark:bg-[#29271e] dark:text-[#d2c99f]"
            >
              <Sparkles size={12} className="mt-0.5 shrink-0" />
              Confirm when the remaining balance is due.
            </motion.div>
          )}
          {stage === 2 && (
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: reduceMotion ? 0 : 0.3 }}
              className="mt-4 flex items-center justify-center gap-2 rounded-lg bg-[#31583b] py-2.5 text-[9px] font-semibold text-white dark:bg-[#779779] dark:text-[#101a12]"
            >
              <Download size={12} /> Download agreement PDF
            </motion.div>
          )}
          <div className="mt-5 space-y-2">
            <div className="h-1.5 w-full rounded-full bg-[#eceee8] dark:bg-[#303a31]" />
            <div className="h-1.5 w-[91%] rounded-full bg-[#eceee8] dark:bg-[#303a31]" />
            <div className="h-1.5 w-[72%] rounded-full bg-[#eceee8] dark:bg-[#303a31]" />
          </div>
        </div>
      </div>
      <div className="pointer-events-none absolute bottom-4 right-4 hidden items-center gap-2 rounded-xl border border-[#e4e6de] bg-white/95 px-3 py-2 text-[9px] font-medium text-[#697367] shadow-sm dark:border-[#39443a] dark:bg-[#202820] dark:text-[#c0c9bf] sm:flex">
        <FilePenLine size={12} className="text-[#55775d]" />
        {stage === 0 ? 'Structured first draft' : stage === 1 ? 'Clause review' : 'Ready to share'}
      </div>
    </motion.div>
  );
}

export default function ScrollProductShowcase() {
  const sectionRef = useRef(null);
  const [activeStage, setActiveStage] = useState(0);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  });
  const progress = useSpring(scrollYProgress, { stiffness: 85, damping: 24, mass: 0.45 });
  const cardY = useTransform(progress, [0, 0.5, 1], [20, 0, -20]);
  const cardRotate = useTransform(progress, [0, 0.5, 1], [-1.6, 0, 1.6]);
  const backX = useTransform(progress, [0, 0.5, 1], [0, 8, -8]);
  const lineScale = useTransform(progress, [0, 1], [0, 1]);

  useMotionValueEvent(progress, 'change', (value) => {
    const nextStage = value < 0.34 ? 0 : value < 0.68 ? 1 : 2;
    setActiveStage((current) => current === nextStage ? current : nextStage);
  });

  return (
    <section
      ref={sectionRef}
      aria-labelledby="product-story-heading"
      className="relative scroll-mt-24 px-5 py-16 sm:px-8 sm:py-20 lg:min-h-[255vh] lg:px-8 lg:py-0"
    >
      <div className="mx-auto max-w-7xl lg:sticky lg:top-[68px] lg:flex lg:min-h-[calc(100vh-68px)] lg:items-center lg:py-10">
        <div className="grid w-full items-center gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <div className="max-w-lg">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#728272] dark:text-[#9aaf99]">A draft, in motion</p>
            <h2 id="product-story-heading" className="mt-3 font-serif text-3xl leading-tight tracking-[-0.035em] text-[#29332a] dark:text-[#e8ece6] sm:text-4xl">
              From a blank page to a clearer next step.
            </h2>
            <p className="mt-4 text-sm leading-6 text-[#747c73] dark:text-[#adb6ab]">
              Follow an agreement as it takes shape. Scroll to move from the first draft through review and into a shareable document.
            </p>
            <div className="relative mt-8 space-y-2 pl-4">
              <motion.span
                aria-hidden="true"
                style={{ scaleY: reduceMotion ? 1 : lineScale }}
                className="absolute bottom-4 left-[5px] top-4 w-px origin-top bg-[#c4d2c2] dark:bg-[#526553]"
              />
              {stages.map((item, index) => {
                const active = activeStage === index;
                const Icon = item.icon;
                return (
                  <motion.div
                    key={item.eyebrow}
                    animate={reduceMotion ? undefined : { x: active ? 5 : 0, opacity: active ? 1 : 0.62 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    className="relative flex min-h-[70px] items-start gap-3 py-2"
                  >
                    <span className={`relative z-10 mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-colors duration-300 ${active ? 'border-[#6f8d70] bg-[#e9f0e8] text-[#45674c] dark:border-[#829c82] dark:bg-[#2d3b2e] dark:text-[#c4ddc4]' : 'border-[#e1e4dc] bg-[#faf9f6] text-[#8d958a] dark:border-[#39443a] dark:bg-[#101410] dark:text-[#899489]'}`}>
                      <Icon size={13} />
                    </span>
                    <div className="pt-0.5">
                      <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[#8a9388]">{item.eyebrow}</p>
                      <AnimatePresence mode="wait" initial={false}>
                        {active && (
                          <motion.div
                            key={item.title}
                            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={reduceMotion ? undefined : { opacity: 0, y: -5 }}
                            transition={{ duration: reduceMotion ? 0 : 0.25 }}
                          >
                            <h3 className="mt-1 text-sm font-semibold text-[#354136] dark:text-[#e0e6df]">{item.title}</h3>
                            <p className="mt-1 max-w-sm text-xs leading-5 text-[#747c73] dark:text-[#adb6ab]">{item.description}</p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                );
              })}
            </div>
            <p className="mt-4 hidden items-center gap-2 text-[10px] text-[#8a9188] dark:text-[#9ca69c] lg:flex">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#789879]" />
              Scroll to explore the agreement
            </p>
          </div>

          <motion.div
            style={{ y: reduceMotion ? 0 : cardY, rotate: reduceMotion ? 0 : cardRotate }}
            className="relative mx-auto w-full max-w-[650px]"
          >
            <motion.div
              aria-hidden="true"
              style={{ x: reduceMotion ? 0 : backX }}
              className="absolute -inset-x-2 -inset-y-2 rounded-[1.4rem] border border-[#e8e8e1] bg-[#eeefe9] shadow-sm dark:border-[#303a31] dark:bg-[#202820] sm:-inset-x-3 sm:-inset-y-3"
            />
            <div className="relative rounded-[1.4rem] border border-[#e2e4dc] bg-white p-3 shadow-[0_28px_90px_-42px_rgba(27,39,29,0.35)] dark:border-[#303a31] dark:bg-[#1b231c] sm:p-5">
              <div className="mb-3 flex items-center justify-between px-1">
                <div className="flex items-center gap-1.5" aria-hidden="true">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#e9a29a]" />
                  <span className="h-1.5 w-1.5 rounded-full bg-[#e9d39a]" />
                  <span className="h-1.5 w-1.5 rounded-full bg-[#a9c7a6]" />
                </div>
                <p className="text-[9px] font-medium text-[#8a9188]">saraldocs.in / drafts</p>
                <span className="w-8" />
              </div>
              <AnimatePresence mode="wait" initial={false}>
                <DraftCanvas stage={activeStage} />
              </AnimatePresence>
              <div className="mt-3 flex items-center gap-1.5 px-1" aria-label={`Step ${activeStage + 1} of ${stages.length}`}>
                {stages.map((item, index) => (
                  <span
                    key={item.eyebrow}
                    className={`h-1 flex-1 rounded-full transition-colors duration-300 ${index <= activeStage ? 'bg-[#799579]' : 'bg-[#e6e8e1] dark:bg-[#303a31]'}`}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
