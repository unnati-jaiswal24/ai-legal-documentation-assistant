import React from 'react';
import Button from '../components/Button';
import { Sparkles, ArrowRight, CheckCircle } from 'lucide-react';

export default function HeroSection() {
  return (
    <section className="relative pt-12 pb-24 md:py-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-pink/10 text-brand-pink font-bold text-xs uppercase tracking-wider mb-6">
            <Sparkles className="w-4 h-4" /> Ministry of Law & Justice Hackathon Entry
          </span>
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white leading-[1.08] tracking-tight">
            Legal docs, minus the <span className="gradient-text">legal headache.</span> 😮‍💨
          </h1>
          <p className="mt-6 text-lg text-slate-600 dark:text-slate-300 max-w-xl leading-relaxed">
            No expensive lawyer jargon. Answer simple questions and generate verified Indian agreements in plain language in under 2 minutes! 🇮🇳✨
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <Button variant="gradient" size="lg" onClick={() => document.getElementById('demo').scrollIntoView({ behavior: 'smooth' })}>
              Draft My Document 📄
            </Button>
            <Button variant="secondary" size="lg" onClick={() => document.getElementById('how-it-works').scrollIntoView({ behavior: 'smooth' })}>
              See How It Works <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
          <div className="mt-8 flex items-center gap-6 text-sm font-semibold text-slate-500">
            <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-brand-mint" /> 100% Free</span>
            <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-brand-mint" /> No Lawyer Needed</span>
            <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-brand-mint" /> Private & Safe</span>
          </div>
        </div>

        {/* Floating Mock Graphic */}
        <div className="relative">
          <div className="w-full h-[440px] bg-gradient-to-tr from-brand-indigo via-brand-pink to-brand-yellow rounded-4xl p-1 shadow-2xl rotate-1 hover:rotate-0 transition-transform duration-500">
            <div className="w-full h-full bg-white dark:bg-slate-900 rounded-[1.9rem] p-6 flex flex-col justify-between">
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                </div>
                <span className="text-xs font-bold text-slate-400">Rent_Agreement_Draft.pdf</span>
              </div>
              <div className="space-y-4 my-auto">
                <div className="p-4 rounded-2xl bg-brand-indigo/10 border border-brand-indigo/20">
                  <span className="text-xs font-bold text-brand-indigo uppercase">Legal Jargon ❌</span>
                  <p className="text-xs text-slate-500 line-through mt-1">"The Lessee covenants with the Lessor to yield up the Demised Premises..."</p>
                </div>
                <div className="p-4 rounded-2xl bg-brand-mint/10 border border-brand-mint/20">
                  <span className="text-xs font-bold text-emerald-600 uppercase">Saral Plain Language ✅</span>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 mt-1">"You agree to hand back the house in clean condition when leaving."</p>
                </div>
              </div>
              <div className="flex justify-between items-center text-xs font-bold text-slate-400 pt-4 border-t border-slate-100 dark:border-slate-800">
                <span>Status: Compliant 🇮🇳</span>
                <span className="text-brand-pink">Verified by AI Agent</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}