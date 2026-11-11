import { FileDown, FilePenLine, MessageSquareText, Sparkles } from 'lucide-react';
import FeatureCard from '../components/FeatureCard';
import Reveal from '../components/Reveal';
import ScrollProductShowcase from '../components/ScrollProductShowcase';
import SectionHeading from '../components/SectionHeading';

const features = [
  {
    icon: Sparkles,
    title: 'AI-assisted drafting',
    description: 'Turn project details into a structured first draft, with the final wording always yours to review.',
  },
  {
    icon: MessageSquareText,
    title: 'Clause-by-clause review',
    description: 'See key terms in plain language so you can spot questions and understand what needs attention.',
  },
  {
    icon: FilePenLine,
    title: 'Make it your own',
    description: 'Edit project scope, payment details, timelines, and other terms to reflect how you work.',
  },
  {
    icon: FileDown,
    title: 'PDF export',
    description: 'Download a clean, shareable PDF after reviewing the details and making your changes.',
  },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="scroll-mt-24 bg-[#f0f1eb] dark:bg-[#171e18]">
      <ScrollProductShowcase />
      <div className="px-5 pb-20 pt-10 sm:px-8 sm:pb-28 sm:pt-16">
        <div className="mx-auto max-w-7xl">
        <Reveal>
          <SectionHeading
            badge="Made for the details"
            title="The essentials, without the noise."
            description="Useful tools for getting a freelance service agreement into shape—and keeping you in control."
          />
        </Reveal>
        <div className="grid gap-4 sm:grid-cols-2">
          {features.map((feature, index) => (
            <Reveal key={feature.title} delay={index * 0.05}>
              <FeatureCard {...feature} />
            </Reveal>
          ))}
        </div>
        </div>
      </div>
    </section>
  );
}
