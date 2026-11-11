import { useId, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

export default function FAQItem({ question, answer }) {
  const [isOpen, setIsOpen] = useState(false);
  const answerId = useId();
  const reduceMotion = useReducedMotion();

  return (
    <div className="border-b border-[#e9e9e2] py-4 last:border-0 dark:border-[#303a31]">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        aria-controls={answerId}
        className="flex w-full items-center justify-between gap-5 py-1 text-left text-sm font-medium text-[#354136] focus-visible:rounded dark:text-[#e0e6df]"
      >
        <span>{question}</span>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.2, ease: 'easeOut' }}
          className="shrink-0 text-[#718472]"
        >
          <ChevronDown size={16} />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={answerId}
            initial={reduceMotion ? false : { height: 0, opacity: 0, y: -4 }}
            animate={{ height: 'auto', opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { height: 0, opacity: 0, y: -3 }}
            transition={{ duration: reduceMotion ? 0 : 0.24, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <p className="max-w-3xl pb-1 pt-3 text-xs leading-6 text-[#747c73] dark:text-[#adb6ab]">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
