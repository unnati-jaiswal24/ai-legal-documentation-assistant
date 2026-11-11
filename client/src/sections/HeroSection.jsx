import { useRef } from 'react';
import { ArrowDown, ArrowRight, Check, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion';
import AgreementPreview from '../components/AgreementPreview';

const headline = ['Good work', 'deserves a', 'clear agreement.'];

const headingVariants = {
  hidden: {},
  visible: {
    transition: { delayChildren: 0.14, staggerChildren: 0.16 },
  },
};

const lineVariants = {
  hidden: { y: '110%', opacity: 0, rotateX: -16 },
  visible: {
    y: '0%',
    opacity: 1,
    rotateX: 0,
    transition: { duration: 0.78, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function HeroSection() {
  const sectionRef = useRef(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 90, damping: 24, mass: 0.35 });
  const documentY = useTransform(smoothProgress, [0, 1], [0, reduceMotion ? 0 : -38]);
  const documentRotate = useTransform(smoothProgress, [0, 1], [0, reduceMotion ? 0 : -2]);
  const backSheetY = useTransform(smoothProgress, [0, 1], [0, reduceMotion ? 0 : -20]);
  const backSheetX = useTransform(smoothProgress, [0, 1], [0, reduceMotion ? 0 : 14]);

  return (
    <section ref={sectionRef} id="top" className="relative isolate overflow-hidden px-5 pb-20 pt-16 sm:px-8 sm:pb-28 sm:pt-24 lg:pt-28">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[680px] opacity-60 dark:opacity-20"
        style={{
          backgroundImage: 'radial-gradient(#d8ddd3 0.8px, transparent 0.8px)',
          backgroundSize: '24px 24px',
          maskImage: 'linear-gradient(to bottom, black, transparent 82%)',
        }}
      />
      <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[0.88fr_1.12fr] lg:gap-10">
        <motion.div
          className="mx-auto max-w-xl lg:mx-0"
          initial={reduceMotion ? false : 'hidden'}
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.12, delayChildren: 0.08 } },
          }}
        >
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 12, scale: 0.97 },
              visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
            }}
            className="inline-flex items-center gap-2 rounded-full border border-[#e1e4dc] bg-white/70 px-3.5 py-2 text-xs font-medium text-[#576358] shadow-sm dark:border-[#354037] dark:bg-[#1b231c] dark:text-[#c0cbbf]"
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#e8f0e7] text-[#45674c] dark:bg-[#314634] dark:text-[#b2d0b6]">
              <Check size={12} />
            </span>
            Thoughtful agreements for independent work
          </motion.div>

          <motion.h1
            className="mt-7 max-w-[660px] font-serif text-[2.8rem] leading-[1.04] tracking-[-0.045em] text-[#202820] dark:text-[#f1f3ee] sm:text-6xl lg:text-[4.35rem]"
            variants={headingVariants}
            aria-label="Good work deserves a clear agreement."
          >
            {headline.map((line, index) => (
              <span key={line} className="block overflow-hidden pb-[0.08em]">
                <motion.span
                  className={`inline-block ${index === 2 ? 'text-[#55775d] dark:text-[#a9c5a9]' : ''}`}
                  variants={lineVariants}
                  aria-hidden="true"
                >
                  {line}
                </motion.span>
              </span>
            ))}
          </motion.h1>

          <motion.p
            variants={{
              hidden: { opacity: 0, y: 14 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: 'easeOut' } },
            }}
            className="mt-6 max-w-lg text-base leading-7 text-[#667067] dark:text-[#b5beb4] sm:text-lg sm:leading-8"
          >
            Create a freelance service agreement for your next project—without starting from a blank page.
          </motion.p>
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 12 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' } },
            }}
            className="mt-8 flex flex-col gap-3 sm:flex-row"
          >
            <Link
              to="/signup"
              className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#31583b] px-6 py-3 text-sm font-semibold text-white shadow-[0_8px_24px_-12px_rgba(49,88,59,0.65)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#284b32] hover:shadow-[0_14px_30px_-14px_rgba(49,88,59,0.65)] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#31583b] dark:bg-[#779779] dark:text-[#101a12] dark:hover:bg-[#8eaa8f]"
            >
              Start your agreement <ArrowRight className="transition-transform duration-200 group-hover:translate-x-1" size={16} />
            </Link>
            <a
              href="#how-it-works"
              className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[#dcdfd7] bg-white/60 px-6 py-3 text-sm font-semibold text-[#465147] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#c5d0c3] hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#55775d] dark:border-[#39443a] dark:bg-[#1b231c] dark:text-[#d4dbd2] dark:hover:bg-[#242d25]"
            >
              See how it works <ArrowDown className="transition-transform duration-200 group-hover:translate-y-0.5" size={15} />
            </a>
          </motion.div>
          <motion.div
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { duration: 0.55, ease: 'easeOut' } },
            }}
            className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-[#818980] dark:text-[#9ca69c]"
          >
            <span>Made for freelancers in India</span>
            <span aria-hidden="true" className="h-1 w-1 rounded-full bg-[#aab2a8]" />
            <span>Drafting support, with you in control</span>
          </motion.div>
        </motion.div>

        <div className="relative mx-auto w-full max-w-[650px]">
          <motion.div
            aria-hidden="true"
            style={{ y: backSheetY, x: backSheetX }}
            initial={reduceMotion ? false : { opacity: 0, x: 34, y: 56, rotate: 7 }}
            animate={{ opacity: 1, x: 0, y: 0, rotate: 4 }}
            transition={{ delay: 0.25, duration: 0.9, type: 'spring', stiffness: 65, damping: 17 }}
            className="absolute -inset-x-2 -inset-y-2 rounded-[1.55rem] border border-[#e7e5dc] bg-[#f1f0e9] shadow-sm dark:border-[#303a31] dark:bg-[#202820] sm:-inset-x-3 sm:-inset-y-3"
          />
          <motion.div
            aria-hidden="true"
            initial={reduceMotion ? false : { opacity: 0, x: -18, y: 35, rotate: -5 }}
            animate={{ opacity: 1, x: 0, y: 0, rotate: -2 }}
            transition={{ delay: 0.38, duration: 0.85, type: 'spring', stiffness: 70, damping: 18 }}
            className="absolute -inset-x-1 -inset-y-1 rounded-[1.5rem] border border-[#e7e5dc] bg-[#f8f7f1] shadow-sm dark:border-[#303a31] dark:bg-[#1d241e]"
          />
          <motion.div style={{ y: documentY, rotate: documentRotate }} className="relative">
            <motion.div
              aria-hidden="true"
              initial={reduceMotion ? false : { opacity: 0, scale: 0.85, y: 25 }}
              animate={{ opacity: 0.8, scale: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8, type: 'spring', stiffness: 80, damping: 18 }}
              className="absolute -right-4 -top-5 z-20 hidden -rotate-3 items-center gap-2 rounded-xl border border-[#e7e5dc] bg-white px-3 py-2 text-[10px] font-medium text-[#667067] shadow-lg dark:border-[#39443a] dark:bg-[#202820] dark:text-[#c0c9bf] sm:flex"
            >
              <FileText size={13} className="text-[#55775d]" />
              <span>Project scope</span>
              <span className="h-1.5 w-1.5 rounded-full bg-[#789879]" />
            </motion.div>
            <AgreementPreview />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
