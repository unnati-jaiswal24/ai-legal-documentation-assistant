import React, { useState } from 'react';
import SectionHeading from '../components/SectionHeading';
import TemplateCard from '../components/TemplateCard';

const templatesData = [
  { emoji: "🏠", title: "House Rent Agreement", category: "Housing", tag: "Popular", description: "Standard residential rental agreement compliant with state rent control acts." },
  { emoji: "🤝", title: "Freelance Work Contract", category: "Freelance", tag: "Essential", description: "Protects payment milestones, scope creep, and copyright for freelancers." },
  { emoji: "🔒", title: "Non-Disclosure Agreement", category: "Business", tag: "Popular", description: "Bilateral NDA for small businesses and founders sharing confidential ideas." },
  { emoji: "🎓", title: "Internship Offer Letter", category: "Students", tag: "Student Pick", description: "Clear internship duration, stipend terms, and non-disclosure clauses." },
  { emoji: "📝", title: "General Affidavit", category: "Housing", tag: "Fast", description: "Standard legal sworn statement for address proof or name correction." },
  { emoji: "💼", title: "Partnership Deed", category: "Business", tag: "Business", description: "Define profit shares, duties, and exit terms between business co-founders." },
];

const categories = ["All", "Housing", "Freelance", "Business", "Students"];

export default function TemplatesSection() {
  const [activeCategory, setActiveCategory] = useState("All");

  const filtered = activeCategory === "All" 
    ? templatesData 
    : templatesData.filter(t => t.category === activeCategory);

  return (
    <section id="templates" className="py-24 max-w-7xl mx-auto px-6">
      <SectionHeading 
        badge="Ready Templates"
        title="Popular Legal Documents"
        description="Pick a template to start custom plain-language legal drafting."
      />

      {/* Filter Chips */}
      <div className="flex flex-wrap justify-center gap-3 mb-12">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all ${
              activeCategory === cat
                ? 'bg-brand-indigo text-white shadow-lg shadow-brand-indigo/30'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filtered.map((tmpl, idx) => (
          <TemplateCard key={idx} {...tmpl} />
        ))}
      </div>
    </section>
  );
}