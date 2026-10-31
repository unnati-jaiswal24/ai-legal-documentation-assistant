import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Scale, 
  ArrowRight, 
  FileText, 
  ShieldCheck, 
  Sparkles, 
  Zap, 
  CheckCircle2 
} from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm">
                <Scale className="h-4 w-4" />
              </div>
              <span className="font-bold text-lg tracking-tight text-slate-900">SaralDocs</span>
            </Link>
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
              <a href="#tools" className="hover:text-blue-600 transition-colors">Tools</a>
              <a href="#features" className="hover:text-blue-600 transition-colors">Features</a>
              <a href="#solutions" className="hover:text-blue-600 transition-colors">Solutions</a>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm font-semibold text-slate-700 hover:text-slate-900">
              Sign in
            </Link>
            <Link to="/signup" className="text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full transition-all shadow-sm">
              Free trial
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* Adobe-Style Hero Section */}
        <section className="max-w-7xl mx-auto px-6 pt-16 pb-20 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold uppercase tracking-wider mb-6">
              <Sparkles className="h-3.5 w-3.5" /> Next-Gen AI Legal Engine
            </span>
            <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.1]">
              Legal clarity. <br /><span className="text-blue-600">Powered by AI.</span>
            </h1>
            <p className="mt-6 text-lg text-slate-600 leading-relaxed">
              Create, analyze, and sign legally verified agreements in plain Indian language. Trusted compliance without complex jargon.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Link to="/signup" className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-full shadow-md transition-all">
                Get started free <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/dashboard" className="inline-flex items-center justify-center gap-2 px-6 py-3.5 border border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-800 font-semibold rounded-full transition-all">
                Open App Dashboard
              </Link>
            </div>
          </div>

          <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-2xl">
            <img 
              src="https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=1000&q=80" 
              alt="Adobe-Style Legal Workspace" 
              className="w-full h-[420px] object-cover"
            />
          </div>
        </section>

        {/* Feature Tools Grid */}
        <section id="tools" className="border-t border-slate-200 bg-slate-50/50 py-20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-slate-900">Quick Legal Actions</h2>
              <p className="text-slate-600 text-sm mt-2">Everything you need to manage your business contracts.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                { title: 'AI Drafting Assistant', desc: 'Generate customized NDAs and agreements in minutes.', icon: FileText },
                { title: 'Plain-Language Review', desc: 'Translate complex legalese into clear, understandable summaries.', icon: Sparkles },
                { title: 'India Compliance Check', desc: 'Deterministic checks for GST, TDS, and stamp duty statutory rules.', icon: ShieldCheck },
              ].map((tool, idx) => (
                <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group">
                  <tool.icon className="h-8 w-8 text-blue-600 mb-4 group-hover:scale-110 transition-transform" />
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{tool.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed mb-4">{tool.desc}</p>
                  <Link to="/dashboard" className="text-sm font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1">
                    Try now <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-8 text-sm text-slate-500">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <p>© 2026 SaralDocs Inc. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-slate-900">Privacy</a>
            <a href="#" className="hover:text-slate-900">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
