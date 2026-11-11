import { Link } from 'react-router-dom';
import { ArrowUpRight, FileText } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';

export default function TemplateCard({ template }) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.article
      whileHover={reduceMotion ? undefined : { y: -5, rotate: 0.35, transition: { duration: 0.22, ease: 'easeOut' } }}
      className="surface-card card-hover flex h-full flex-col p-5 hover:border-[#cbd7c9] sm:p-6"
    >
      <div className="flex items-start justify-between gap-4">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eff3ed] text-[#58765b] dark:bg-[#29352b] dark:text-[#b4c8b1]"><FileText size={18} /></span>
        <span className="text-[9px] font-medium text-[#858c82] dark:text-[#9ca69c]">v{template.version || '—'}</span>
      </div>
      <h3 className="mt-5 text-sm font-semibold text-[#354136] dark:text-[#e0e6df]">{template.title}</h3>
      {template.description && <p className="mt-2 text-xs leading-5 text-[#747c73] dark:text-[#adb6ab]">{template.description}</p>}
      {template.documentType?.name && <p className="mt-3 text-[10px] text-[#858c82] dark:text-[#9ca69c]">{template.documentType.name}</p>}
      <Link to="/drafts/new" className="mt-auto inline-flex min-h-10 items-center gap-1.5 pt-4 text-xs font-semibold text-[#55775d] hover:underline focus-visible:rounded dark:text-[#a9c5a9]">
        Start a draft <ArrowUpRight size={14} />
      </Link>
    </motion.article>
  );
}
