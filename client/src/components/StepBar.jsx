import { NavLink } from 'react-router-dom';
import { Check } from 'lucide-react';

const steps = [
  ['fill', 'Details'],
  ['review', 'Review'],
  ['preview', 'Preview'],
  ['documents', 'Export'],
];

export default function StepBar({ id, active }) {
  const activeIndex = Math.max(0, steps.findIndex(([path]) => path === active));

  return (
    <nav aria-label="Agreement workflow" className="mb-8">
      <ol className="flex items-center">
        {steps.map(([path, label], index) => {
          const complete = index < activeIndex;
          const current = index === activeIndex;
          return (
            <li key={path} className="flex min-w-0 flex-1 items-center last:flex-none">
              <NavLink
                to={`/drafts/${id}/${path}`}
                aria-current={current ? 'step' : undefined}
                className={`group flex items-center gap-2 rounded-full py-1 pr-2 text-[11px] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#55775d] ${
                  current ? 'text-[#31583b] dark:text-[#c0d3bd]' : complete ? 'text-[#5b765d] dark:text-[#a9c5a9]' : 'text-[#92998f] dark:text-[#879287]'
                }`}
              >
                <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-[10px] ${
                  current ? 'border-[#45674c] bg-[#45674c] text-white dark:border-[#779779] dark:bg-[#779779] dark:text-[#101a12]'
                    : complete ? 'border-[#c9d8c8] bg-[#eaf0e8] text-[#45674c] dark:border-[#4a634a] dark:bg-[#29382b] dark:text-[#c0d3bd]'
                      : 'border-[#dfe2d9] bg-white text-[#92998f] dark:border-[#39443a] dark:bg-[#1b231c] dark:text-[#879287]'
                }`}>
                  {complete ? <Check size={12} /> : `0${index + 1}`}
                </span>
                <span className="hidden sm:inline">{label}</span>
              </NavLink>
              {index < steps.length - 1 && <span aria-hidden="true" className={`mx-2 h-px flex-1 ${complete ? 'bg-[#b8cbb7]' : 'bg-[#e2e4dd] dark:bg-[#343e35]'}`} />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
