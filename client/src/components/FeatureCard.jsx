import React from 'react';

export default function FeatureCard({ icon: Icon, emoji, title, description, gradient }) {
  return (
    <div className={`p-8 rounded-3xl bg-gradient-to-br ${gradient} text-slate-900 shadow-sm border border-slate-100 dark:border-slate-800/40 card-hover relative overflow-hidden group`}>
      <div className="flex items-center justify-between mb-6">
        <div className="w-14 h-14 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md flex items-center justify-center shadow-md">
          <Icon className="w-7 h-7 text-brand-indigo dark:text-brand-blue" />
        </div>
        <span className="text-3xl transform group-hover:scale-125 group-hover:rotate-12 transition-transform duration-300">
          {emoji}
        </span>
      </div>
      <h3 className="text-2xl font-bold mb-3 text-slate-900 dark:text-white">
        {title}
      </h3>
      <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed font-medium">
        {description}
      </p>
    </div>
  );
}