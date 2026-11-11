import { useRef } from 'react';
import { FileCheck2, FilePenLine, FileText, MessagesSquare } from 'lucide-react';
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion';
import Reveal from '../components/Reveal';
import SectionHeading from '../components/SectionHeading';

const steps = [
  {
    number: '01',
    title: 'Share the project basics',
    description: 'Add the people involved, what you are delivering, and how you will be paid.',
    icon: FileText,
  },
  {
    number: '02',
    title: 'Get an AI-assisted draft',
    description: 'Use a structured first draft as a starting point for the terms you need.',
    icon: MessagesSquare,
  },
  {
    number: '03',
    title: 'Review every clause',
    description: 'Read the details in plain language and adjust the agreement to fit your work.',
    icon: FilePenLine,
  },
  {
    number: '04',
    title: 'Export when it feels right',
    description: 'Save a PDF to share once you have reviewed the final wording.',
    icon: FileCheck2,
  },
];

export default function HowItWorksSection() {
  const sectionRef = useRef(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start end', 'end start'] });
  const lineScale = useSpring(useTransform(scrollYProgress, [0.2, 0.78], [0, 1]), { stiffness: 80, damping: 24 });

  return (
    <section ref={sectionRef} id="how-it-works" className="scroll-mt-24 px-5 py-20 sm:px-8 sm:py-28">
      <div className="mx-auto max-w-7xl">
        <Reveal>
          <SectionHeading
            badge="A calmer process"
            title="A clear path from idea to agreement."
            description="A guided way to put the important parts of your freelance project in writing."
          />
        </Reveal>
        <div className="relative grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div aria-hidden="true" className="absolute left-[12%] right-[12%] top-5 hidden h-px bg-[#e4e6df] dark:bg-[#303a31] lg:block">
            <motion.div style={{ scaleX: reduceMotion ? 1 : lineScale }} className="h-full origin-left bg-[#829b80] dark:bg-[#829c82]" />
          </div>
          {steps.map(({ number, title, description, icon: Icon }, index) => (
            <motion.article
              key={number}
              initial={reduceMotion ? false : { opacity: 0, x: index % 2 === 0 ? -22 : 22, y: 12, scale: 0.97 }}
              whileInView={{ opacity: 1, x: 0, y: 0, scale: 1 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: reduceMotion ? 0 : 0.55, delay: reduceMotion ? 0 : index * 0.1, ease: [0.22, 1, 0.36, 1] }}
              whileHover={reduceMotion ? undefined : { y: -4, transition: { duration: 0.2 } }}
              className="group relative h-full rounded-2xl border border-[#e7e7df] bg-white p-6 transition-colors duration-300 hover:border-[#ccd8cb] hover:shadow-[0_18px_42px_-30px_rgba(41,63,43,0.35)] dark:border-[#303a31] dark:bg-[#181f19] dark:hover:border-[#4a5b4b] sm:p-7"
            >
                <div className="flex items-center justify-between">
                  <span className="font-serif text-2xl text-[#8a9b88] dark:text-[#91aa92]">{number}</span>
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f1f4ef] text-[#527257] transition-all duration-300 group-hover:rotate-[-4deg] group-hover:bg-[#e8f0e7] dark:bg-[#283329] dark:text-[#b2d0b6] dark:group-hover:bg-[#344a37]">
                    <Icon size={18} strokeWidth={1.7} />
                  </span>
                </div>
                <h3 className="mt-7 text-base font-semibold tracking-tight text-[#29332a] dark:text-[#e8ece6]">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#747c73] dark:text-[#adb6ab]">{description}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
