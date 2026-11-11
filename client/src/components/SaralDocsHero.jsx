import { useRef } from 'react';
import { ArrowDown, ArrowRight, Check, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion';
import FloatingLegalObject from './FloatingLegalObject';
import { floatingLegalObjects } from './saralDocsHeroObjects';

function AgreementReveal({ progress }) {
  const reduceMotion = useReducedMotion();
  const opacity = useTransform(progress, [0.46, 0.64, 0.92], [0, 1, 1]);
  const y = useTransform(progress, [0.46, 0.66], [38, 0]);
  const scale = useTransform(progress, [0.46, 0.68], [0.9, 1]);
  const pointerEvents = useTransform(progress, (value) => value > 0.64 ? 'auto' : 'none');

  return (
    <motion.div
      aria-hidden="true"
      data-agreement-reveal
      style={{ opacity: reduceMotion ? 0 : opacity, y: reduceMotion ? 0 : y, scale: reduceMotion ? 1 : scale, pointerEvents: reduceMotion ? 'none' : pointerEvents }}
      className="absolute left-1/2 top-[59%] z-20 w-[min(82vw,410px)] -translate-x-1/2 -translate-y-1/2"
    >
      <div className="rounded-2xl border border-[#e4e3da] bg-[#fffefa]/95 p-4 shadow-[0_24px_70px_-35px_rgba(45,54,44,0.32)] backdrop-blur-sm dark:border-[#354037] dark:bg-[#1b231c]/95 sm:p-5">
        <div className="flex items-center justify-between border-b border-[#ebe9e0] pb-3 dark:border-[#303a31]">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#edf3ec] text-[#45674c] dark:bg-[#2b3c2e] dark:text-[#b2d0b6]">
              <FileText size={15} />
            </span>
            <div>
              <p className="text-[10px] font-semibold text-[#344035] dark:text-[#e0e6df]">Freelance Service Agreement</p>
              <p className="mt-0.5 text-[8px] text-[#858c82] dark:text-[#a3ada2]">Draft · updated just now</p>
            </div>
          </div>
          <span className="rounded-full bg-[#edf3ec] px-2.5 py-1 text-[8px] font-medium text-[#55775d] dark:bg-[#2b3c2e] dark:text-[#b2d0b6]">
            In review
          </span>
        </div>
        <div className="py-4">
          <p className="text-center text-[8px] font-semibold uppercase tracking-[0.2em] text-[#92968d]">Service agreement</p>
          <p className="mt-2 text-center font-serif text-lg text-[#29332a] dark:text-[#e8ece6]">Freelance services</p>
          <p className="mx-auto mt-2 max-w-[280px] text-center text-[9px] leading-4 text-[#747c73] dark:text-[#adb6ab]">
            A clear starting point for the work, payment and terms you agree together.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-lg bg-[#f5f6f1] p-2.5 dark:bg-[#222b23]">
            <p className="text-[7px] font-semibold uppercase tracking-wider text-[#838b81]">Project scope</p>
            <p className="mt-1 text-[9px] font-medium text-[#485449] dark:text-[#d5ddd3]">Design services</p>
          </div>
          <div className="rounded-lg bg-[#f5f6f1] p-2.5 dark:bg-[#222b23]">
            <p className="text-[7px] font-semibold uppercase tracking-wider text-[#838b81]">Payment</p>
            <p className="mt-1 text-[9px] font-medium text-[#485449] dark:text-[#d5ddd3]">₹48,000 · milestone</p>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2 rounded-lg border border-[#e8e4d7] bg-[#faf8f0] p-2.5 text-[8px] leading-4 text-[#76766b] dark:border-[#494537] dark:bg-[#28271e] dark:text-[#c0bca9]">
          <Check size={11} className="shrink-0 text-[#789879]" />
          Review each clause and make it your own before sharing.
        </div>
      </div>
    </motion.div>
  );
}

export default function SaralDocsHero() {
  const sectionRef = useRef(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  });
  const progress = useSpring(scrollYProgress, { stiffness: 72, damping: 23, mass: 0.5 });
  const titleY = useTransform(progress, [0, 0.52, 0.76, 1], [0, 0, -38, -54]);
  const titleScale = useTransform(progress, [0, 0.5, 0.76, 1], [1, 1, 0.78, 0.72]);
  const titleOpacity = useTransform(progress, [0, 0.7, 0.98], [1, 1, 0.3]);
  const subtitleOpacity = useTransform(progress, [0, 0.48, 0.66, 1], [1, 0.8, 0, 0]);
  const ctaOpacity = useTransform(progress, [0, 0.34, 0.48], [1, 0.75, 0]);
  const scrollCueOpacity = useTransform(progress, [0, 0.1, 0.24], [1, 0.7, 0]);
  const trackHeight = reduceMotion ? '100svh' : '220svh';

  return (
    <section
      ref={sectionRef}
      id="top"
      data-saral-hero
      aria-label="SaralDocs introduction"
      className="saral-hero-track relative"
      style={{ minHeight: trackHeight }}
    >
      <div className="saral-hero-sticky sticky top-[68px] h-[calc(100svh-68px)] min-h-[480px] overflow-hidden">
        <div className="saral-hero-canvas absolute inset-0 overflow-hidden bg-[#fffefa] dark:bg-[#101410]">
          <div className="saral-hero-dots pointer-events-none absolute inset-0 opacity-80 dark:opacity-15" aria-hidden="true" />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#fffefa]/85 to-transparent dark:from-[#101410]/85" aria-hidden="true" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#fffefa]/65 to-transparent dark:from-[#101410]/65" aria-hidden="true" />

          {floatingLegalObjects.map((object, index) => (
            <FloatingLegalObject key={object.id} object={object} progress={progress} index={index} />
          ))}

          <div className="pointer-events-none absolute left-1/2 top-[47%] z-20 w-full -translate-x-1/2 -translate-y-1/2 px-5 text-center sm:px-8">
            <motion.div style={{ y: reduceMotion ? 0 : titleY, scale: reduceMotion ? 1 : titleScale, opacity: reduceMotion ? 1 : titleOpacity }}>
              <motion.h1
                initial={reduceMotion ? false : { opacity: 0, y: 18, letterSpacing: '0.04em' }}
                animate={{ opacity: 1, y: 0, letterSpacing: '-0.055em' }}
                transition={{ duration: reduceMotion ? 0 : 0.9, ease: [0.22, 1, 0.36, 1] }}
                className="font-sans text-[clamp(3.2rem,10vw,8.5rem)] font-semibold leading-[0.95] text-[#202820] dark:text-[#f1f3ee]"
              >
                SaralDocs
              </motion.h1>
              <motion.p
                style={{ opacity: reduceMotion ? 1 : subtitleOpacity }}
                initial={reduceMotion ? false : { y: 12 }}
                animate={{ y: 0 }}
                transition={{ delay: 0.18, duration: reduceMotion ? 0 : 0.65, ease: 'easeOut' }}
                className="mt-4 font-serif text-lg tracking-[-0.015em] text-[#6b7469] dark:text-[#b5beb4] sm:mt-5 sm:text-2xl"
              >
                Legal documentation, simplified.
              </motion.p>
            </motion.div>

            <motion.div style={{ opacity: reduceMotion ? 1 : ctaOpacity }} className="pointer-events-auto mt-7 sm:mt-9">
              <Link
                to="/signup"
                className="group inline-flex min-h-11 items-center gap-2 rounded-full border border-[#dfe3da] bg-white/85 px-5 py-2.5 text-xs font-semibold text-[#3d5941] shadow-[0_8px_30px_-20px_rgba(38,61,44,0.45)] backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[#c5d0c3] hover:bg-white hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#55775d] dark:border-[#39443a] dark:bg-[#1b231c]/90 dark:text-[#c6dbc4] dark:hover:bg-[#242d25]"
              >
                Start your agreement <ArrowRight className="transition-transform duration-200 group-hover:translate-x-1" size={14} />
              </Link>
            </motion.div>
          </div>

          <AgreementReveal progress={progress} />

          <motion.div
            style={{ opacity: reduceMotion ? 0 : scrollCueOpacity }}
            className="absolute bottom-5 left-1/2 z-30 flex -translate-x-1/2 items-center gap-2 text-[9px] font-medium uppercase tracking-[0.17em] text-[#8b9288] dark:text-[#9ca69c] sm:bottom-7"
          >
            <span>Scroll to explore</span>
            <motion.span
              animate={reduceMotion ? undefined : { y: [0, 4, 0] }}
              transition={{ duration: 1.7, repeat: Infinity, ease: 'easeInOut' }}
              className="flex h-5 w-5 items-center justify-center rounded-full border border-[#e1e4dc] bg-white/70 dark:border-[#39443a] dark:bg-[#1b231c]/80"
            >
              <ArrowDown size={10} />
            </motion.span>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
