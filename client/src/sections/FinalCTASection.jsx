import { ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import Reveal from '../components/Reveal';

export default function FinalCTASection() {
  const reduceMotion = useReducedMotion();
  return (
    <section className="px-5 pb-20 pt-10 sm:px-8 sm:pb-24">
      <Reveal className="mx-auto max-w-6xl">
        <div className="relative overflow-hidden rounded-[1.75rem] bg-[#263d2c] px-6 py-14 text-center text-white sm:px-12 sm:py-20">
          <div aria-hidden="true" className="absolute -right-20 -top-32 h-80 w-80 rounded-full border border-white/10" />
          <div aria-hidden="true" className="absolute -right-8 -top-20 h-56 w-56 rounded-full border border-white/10" />
          <motion.div
            className="relative mx-auto max-w-2xl"
            initial={reduceMotion ? false : 'hidden'}
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={{ hidden: {}, visible: { transition: { staggerChildren: reduceMotion ? 0 : 0.12 } } }}
          >
            <motion.span
              variants={{ hidden: { opacity: 0, scale: 0.7, rotate: -10 }, visible: { opacity: 1, scale: 1, rotate: 0 } }}
              transition={{ duration: reduceMotion ? 0 : 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="mx-auto inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-[#d7e5d6]"
            >
              <Sparkles size={17} />
            </motion.span>
            <motion.h2
              variants={{ hidden: { opacity: 0, y: 20, clipPath: 'inset(0 0 100% 0)' }, visible: { opacity: 1, y: 0, clipPath: 'inset(0 0 0% 0)' } }}
              transition={{ duration: reduceMotion ? 0 : 0.65, ease: [0.22, 1, 0.36, 1] }}
              className="mt-6 font-serif text-3xl leading-tight tracking-tight sm:text-5xl"
            >
              Make space for the work you love.
            </motion.h2>
            <motion.p
              variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }}
              transition={{ duration: reduceMotion ? 0 : 0.5, ease: 'easeOut' }}
              className="mx-auto mt-4 max-w-lg text-sm leading-6 text-white/75 sm:text-base"
            >
              Start with the project details. Shape a clear agreement that feels like yours.
            </motion.p>
            <motion.div
              variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
              transition={{ duration: reduceMotion ? 0 : 0.5, ease: 'easeOut' }}
            >
            <Link
              to="/signup"
              className="group mt-8 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#f6f5ee] px-6 py-3 text-sm font-semibold text-[#263d2c] transition-all duration-200 hover:-translate-y-0.5 hover:bg-white hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
            >
              Create your agreement <ArrowRight className="transition-transform duration-200 group-hover:translate-x-1" size={16} />
            </Link>
            </motion.div>
          </motion.div>
        </div>
      </Reveal>
    </section>
  );
}
