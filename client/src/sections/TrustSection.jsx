import React from 'react';
import SectionHeading from '../components/SectionHeading';
import { ShieldCheck, Lock, Award, HeartHandshake } from 'lucide-react';

export default function TrustSection() {
  return (
    <section className="py-24 max-w-7xl mx-auto px-6">
      <SectionHeading 
        badge="Safety & Ethics"
        title="Privacy & Legal Grounding First 🔒"
        description="Designed to protect everyday Indians from legal exploitation with total data privacy."
      />

      <div className="grid md:grid-cols-4 gap-6">
        {[
          { icon: Lock, title: "Zero Data Retention", desc: "Your document drafts are processed in-memory and discarded upon session completion." },
          { icon: ShieldCheck, title: "Deterministic Rules", desc: "No invented AI facts. Every clause is strictly checked against official Indian Legal Codes." },
          { icon: Award, title: "Public RAG Integration", desc: "Grounded directly in authentic Ministry of Law and Justice public databases." },
          { icon: HeartHandshake, title: "Advocate Escalation", desc: "Complex disputes can be seamlessly transferred to registered Indian lawyers." },
        ].map((item, idx) => (
          <div key={idx} className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 card-hover text-center">
            <div className="w-12 h-12 rounded-2xl bg-brand-indigo/10 text-brand-indigo flex items-center justify-center mx-auto mb-4">
              <item.icon className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white mb-2">{item.title}</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">{item.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}