import React from 'react';

export default function SectionHeading({ title, badge, description, centered = true }) {
  return (
    <div className={`mb-16 ${centered ? 'text-center' : ''}`}>
      {badge && (
        <span className="inline-block px-4 py-1.5 mb-4 text-xs font-bold uppercase tracking-widest text-brand-indigo bg-brand-indigo/10 rounded-full dark:bg-brand-indigo/20 dark:text-brand-blue">
          {badge}
        </span>
      )}
      <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
        {title}
      </h2>
      {description && (
        <p className="mt-4 text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          {description}
        </p>
      )}
    </div>
  );
}