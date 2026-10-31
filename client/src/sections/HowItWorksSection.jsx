import React from 'react';
import SectionHeading from '../components/SectionHeading';

const steps = [
  { step: "01", title: "Tell Us What You Need", desc: "Select document type (Rent, NDA, Freelance) & enter basic party names.", emoji: "💬" },
  { step: "02", title: "AI Classifies & RAG Check", desc: "Our agent validates terms against Indian laws and statutory guidelines.", emoji: "⚖️" },
  { step: "03", title: "Review Simple Words", desc: "Read side-by-side explanations of clauses in plain English or Hindi.", emoji: "📖" },
  { step: "04", title: "Download & Sign", desc: "Export clean, ready-to-sign PDF or Word documents instantly.", emoji: "⚡" }
];

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-24 bg-slate-100/50 dark:bg-slate-900/50">
      <div className="max-w-7xl mx-auto px-6">
        <SectionHeading 
          badge="4-Step Flow"
          title="How saralDOCS Works"
          description="From zero to ready legal document in under two human interactions."
        />
        <div className="grid md:grid-cols-4 gap-6">
          {steps.map((s, idx) => (
            <div key={idx} className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 relative card-hover">
              <div className="flex justify-between items-center mb-6">
                <span className="text-3xl font-black text-brand-indigo">{s.step}</span>
                <span className="text-3xl">{s.emoji}</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{s.title}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}