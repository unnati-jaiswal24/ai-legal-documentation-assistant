import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export default function FAQItem({ question, answer }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-slate-200 dark:border-slate-800 py-5">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center text-left text-lg font-bold text-slate-900 dark:text-white focus:outline-none"
      >
        <span>{question}</span>
        <ChevronDown className={`w-5 h-5 text-brand-indigo transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <p className="mt-3 text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
          {answer}
        </p>
      )}
    </div>
  );
}