import { ArrowUpRight, Eye, HandHeart, LockKeyhole, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import Reveal from '../components/Reveal';
import SectionHeading from '../components/SectionHeading';

const principles = [
  {
    icon: Eye,
    title: 'You stay in control',
    description: 'Review and edit each part of the draft before you decide what to share.',
  },
  {
    icon: ShieldCheck,
    title: 'Clarity over certainty',
    description: 'Understand what a clause says, and make room to ask questions when something is unclear.',
  },
  {
    icon: LockKeyhole,
    title: 'Handle details thoughtfully',
    description: 'Only add the information needed for your draft, and review the platform’s privacy details before use.',
  },
  {
    icon: HandHeart,
    title: 'Know when to get advice',
    description: 'For complex, high-value, or disputed matters, consult a qualified legal professional.',
  },
];

export default function TrustSection() {
  const reduceMotion = useReducedMotion();
  return (
    <section id="trust" className="scroll-mt-24 px-5 py-20 sm:px-8 sm:py-28">
      <div className="mx-auto max-w-7xl">
        <Reveal>
          <SectionHeading
            badge="Built with care"
            title="Important work deserves a thoughtful process."
            description="SaralDocs helps you prepare and understand a draft. It does not replace advice from a qualified advocate."
          />
        </Reveal>
        <motion.div
          initial={reduceMotion ? false : 'hidden'}
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          variants={{ hidden: {}, visible: { transition: { staggerChildren: reduceMotion ? 0 : 0.1 } } }}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          {principles.map(({ icon: Icon, title, description }, index) => (
            <motion.article
              key={title}
              variants={{
                hidden: { opacity: 0, x: index % 2 ? 18 : -18, y: 10, scale: 0.98 },
                visible: { opacity: 1, x: 0, y: 0, scale: 1 },
              }}
              transition={{ duration: reduceMotion ? 0 : 0.5, ease: [0.22, 1, 0.36, 1] }}
              whileHover={reduceMotion ? undefined : { y: -3, transition: { duration: 0.2 } }}
              className="h-full rounded-2xl border border-[#e7e7df] bg-white p-6 dark:border-[#303a31] dark:bg-[#181f19]"
            >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f1f4ef] text-[#527257] dark:bg-[#283329] dark:text-[#b2d0b6]">
                  <Icon size={18} strokeWidth={1.7} />
                </span>
                <h3 className="mt-5 text-sm font-semibold text-[#29332a] dark:text-[#e8ece6]">{title}</h3>
                <p className="mt-2 text-xs leading-5 text-[#747c73] dark:text-[#adb6ab]">{description}</p>
            </motion.article>
          ))}
        </motion.div>
        <Reveal className="mt-7 text-center">
          <Link
            to="/limitations"
            className="inline-flex items-center gap-1 text-xs font-medium text-[#55775d] underline decoration-[#bccabb] underline-offset-4 transition-colors hover:text-[#31583b] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#55775d] dark:text-[#a9c5a9] dark:hover:text-[#c6dbc4]"
          >
            Read about the limitations <ArrowUpRight size={13} />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
