import React from 'react';
import SectionHeading from '../components/SectionHeading';
import FeatureCard from '../components/FeatureCard';
import { FileText, Sparkles, Sliders, Database, UserCheck, ShieldCheck } from 'lucide-react';

const features = [
  {
    icon: FileText,
    emoji: "✍️",
    title: "Plain-Language Drafting",
    description: "Converts legal statutory legalese into clear terms anyone can understand without a law degree.",
    gradient: "from-purple-500/10 to-indigo-500/10"
  },
  {
    icon: Sparkles,
    emoji: "🤖",
    title: "Smart Form Assistant",
    description: "Answer a few simple questions about your agreement and let our AI handle the rest.",
    gradient: "from-pink-500/10 to-rose-500/10"
  },
  {
    icon: Sliders,
    emoji: "📝",
    title: "Customizable Rules",
    description: "Set custom deposit amounts, notice periods, and payment milestones with zero effort.",
    gradient: "from-amber-500/10 to-yellow-500/10"
  },
  {
    icon: Database,
    emoji: "🔍",
    title: "Indian Legal RAG Engine",
    description: "Grounded directly in public Indian legal codes like Contract Act 1872 & Rent Acts.",
    gradient: "from-emerald-500/10 to-teal-500/10"
  },
  {
    icon: UserCheck,
    emoji: "🧑‍⚖️",
    title: "Human Legal Expert Escalate",
    description: "Need human eyes? Instantly connect complex cases to verified advocates.",
    gradient: "from-blue-500/10 to-cyan-500/10"
  },
  {
    icon: ShieldCheck,
    emoji: "🔒",
    title: "Privacy & Data Guard",
    description: "Your documents are encrypted end-to-end and deleted after your session unless saved.",
    gradient: "from-violet-500/10 to-purple-500/10"
  }
];

export default function FeaturesSection() {
  return (
    <section id="features" className="py-24 max-w-7xl mx-auto px-6">
      <SectionHeading 
        badge="Superpowers"
        title="No Lawyer Jargon. Promise."
        description="We replaced legal legalese with simple, trustworthy AI tools designed for modern India."
      />
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map((feature, idx) => (
          <FeatureCard key={idx} {...feature} />
        ))}
      </div>
    </section>
  );
}