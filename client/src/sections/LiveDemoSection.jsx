import React, { useState } from 'react';
import SectionHeading from '../components/SectionHeading';
import Button from '../components/Button';
import confetti from 'canvas-confetti';
import { Sparkles, Download, CheckCircle2 } from 'lucide-react';

export default function LiveDemoSection() {
  const [docType, setDocType] = useState('Rent Agreement');
  const [partyA, setPartyA] = useState('Aarav Sharma');
  const [partyB, setPartyB] = useState('Priya Patel');
  const [keyTerm, setKeyTerm] = useState('₹15,000 monthly rent, 11 months term');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [viewMode, setViewMode] = useState('simple');

  const handleGenerate = (e) => {
    e.preventDefault();
    setIsGenerating(true);
    setGenerated(false);
    setTimeout(() => {
      setIsGenerating(false);
      setGenerated(true);
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.7 } });
    }, 1200);
  };

  return (
    <section id="demo" className="py-24 bg-slate-100/60 dark:bg-slate-900/60">
      <div className="max-w-7xl mx-auto px-6">
        <SectionHeading 
          badge="Interactive Sandbox"
          title="Try Drafting in Real-Time ⚡"
          description="See how saralDOCS turns your basic inputs into simple, verified contracts."
        />

        <div className="grid lg:grid-cols-2 gap-12 bg-white dark:bg-slate-900 p-8 rounded-4xl border border-slate-200 dark:border-slate-800 shadow-xl">
          {/* Inputs Form */}
          <form onSubmit={handleGenerate} className="space-y-6">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-brand-indigo" /> 1. Enter Basic Information
            </h3>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Document Type</label>
              <select 
                value={docType}
                onChange={(e) => setDocType(e.target.value)}
                className="w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold text-sm focus:ring-2 focus:ring-brand-indigo outline-none"
              >
                <option>Rent Agreement</option>
                <option>Freelance Work Contract</option>
                <option>Non-Disclosure Agreement (NDA)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-2">First Party</label>
                <input 
                  type="text"
                  value={partyA}
                  onChange={(e) => setPartyA(e.target.value)}
                  className="w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold text-sm focus:ring-2 focus:ring-brand-indigo outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Second Party</label>
                <input 
                  type="text"
                  value={partyB}
                  onChange={(e) => setPartyB(e.target.value)}
                  className="w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold text-sm focus:ring-2 focus:ring-brand-indigo outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Key Deal Terms</label>
              <textarea 
                rows="3"
                value={keyTerm}
                onChange={(e) => setKeyTerm(e.target.value)}
                className="w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold text-sm focus:ring-2 focus:ring-brand-indigo outline-none"
              />
            </div>

            <Button variant="gradient" size="lg" className="w-full" disabled={isGenerating}>
              {isGenerating ? 'AI Agents Drafting...' : 'Generate Legal Document ✨'}
            </Button>
          </form>

          {/* Preview Panel */}
          <div className="flex flex-col justify-between border border-slate-200 dark:border-slate-800 rounded-3xl p-6 bg-slate-50 dark:bg-slate-950">
            <div>
              <div className="flex justify-between items-center mb-6">
                <span className="text-xs font-bold uppercase px-3 py-1 bg-emerald-500/10 text-emerald-600 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> AI Verified Preview
                </span>
                <div className="flex bg-slate-200 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold">
                  <button 
                    onClick={() => setViewMode('simple')}
                    className={`px-3 py-1.5 rounded-lg transition-all ${viewMode === 'simple' ? 'bg-white dark:bg-slate-900 text-brand-indigo shadow-sm' : 'text-slate-500'}`}
                  >
                    Simple Words 😄
                  </button>
                  <button 
                    onClick={() => setViewMode('legal')}
                    className={`px-3 py-1.5 rounded-lg transition-all ${viewMode === 'legal' ? 'bg-white dark:bg-slate-900 text-brand-indigo shadow-sm' : 'text-slate-500'}`}
                  >
                    Legal Jargon 📜
                  </button>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 text-sm space-y-4">
                <h4 className="font-bold text-slate-900 dark:text-white border-b pb-2">{docType}</h4>
                {viewMode === 'simple' ? (
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                    "This agreement is made between <strong>{partyA}</strong> and <strong>{partyB}</strong> under Indian Contract Law. Key agreed terms include: <strong>{keyTerm}</strong>. Both parties promise to give 1 month prior notice before exiting."
                  </p>
                ) : (
                  <p className="text-slate-500 font-mono text-xs leading-relaxed">
                    "NOW THIS INDENTURE WITNESSETH that in consideration of the rent hereinafter reserved by the LESSOR ({partyA}), the LESSEE ({partyB}) doth covenant to observe statutory compliance pursuant to Indian Contract Act 1872..."
                  </p>
                )}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center">
              <span className="text-xs font-bold text-slate-400">Format: PDF / A4 Ready</span>
              <Button variant="primary" size="sm" className="gap-2">
                <Download className="w-4 h-4" /> Export Document
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}