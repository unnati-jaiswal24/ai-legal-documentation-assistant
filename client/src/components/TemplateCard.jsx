import React from 'react';
import { ArrowUpRight } from 'lucide-react';

export default function TemplateCard({ emoji, title, tag, description, category }) {
  return (
    <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 flex flex-col justify-between card-hover">
      <div>
        <div className="flex justify-between items-start mb-4">
          <span className="text-4xl p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl inline-block">{emoji}</span>
          <span className="text-xs font-bold px-3 py-1 bg-brand-indigo/10 text-brand-indigo dark:text-brand-blue rounded-full">
            {tag}
          </span>
        </div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{title}</h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-6">{description}</p>
      </div>

      <button className="w-full py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-slate-800 dark:text-slate-200 hover:bg-brand-indigo hover:text-white hover:border-brand-indigo transition-all flex items-center justify-center gap-2 group text-sm">
        Use Template
        <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
      </button>
    </div>
  );
}