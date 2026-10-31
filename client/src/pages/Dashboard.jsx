import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Scale, 
  FileText, 
  Plus, 
  Search, 
  Folder, 
  Clock, 
  User, 
  Settings 
} from 'lucide-react';

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-white border-r border-slate-200 p-6 flex flex-col justify-between hidden md:flex">
        <div>
          <Link to="/" className="flex items-center gap-2.5 mb-8">
            <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <Scale className="h-4 w-4" />
            </div>
            <span className="font-bold text-lg tracking-tight">SaralDocs</span>
          </Link>

          <nav className="space-y-1">
            <a href="#" className="flex items-center gap-3 px-3 py-2.5 bg-blue-50 text-blue-700 font-semibold rounded-xl text-sm">
              <FileText className="h-4 w-4" /> Recent Drafts
            </a>
            <a href="#" className="flex items-center gap-3 px-3 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl text-sm font-medium">
              <Folder className="h-4 w-4" /> My Templates
            </a>
            <a href="#" className="flex items-center gap-3 px-3 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl text-sm font-medium">
              <Clock className="h-4 w-4" /> Audit History
            </a>
          </nav>
        </div>

        <div className="border-t border-slate-200 pt-4 space-y-1">
          <a href="#" className="flex items-center gap-3 px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-xl text-sm font-medium">
            <Settings className="h-4 w-4" /> Settings
          </a>
          <a href="#" className="flex items-center gap-3 px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-xl text-sm font-medium">
            <User className="h-4 w-4" /> Profile
          </a>
        </div>
      </aside>

      {/* Main Workspace Content */}
      <main className="flex-1 p-8">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Your Workstation</h1>
            <p className="text-sm text-slate-500 mt-1">Manage and draft legal documents with AI verification.</p>
          </div>

          <button className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-xl text-sm shadow-md transition-all">
            <Plus className="h-4 w-4" /> New Document
          </button>
        </div>

        {/* Quick Search */}
        <div className="relative mb-8 max-w-xl">
          <Search className="h-4 w-4 text-slate-400 absolute left-4 top-3.5" />
          <input 
            type="text" 
            placeholder="Search documents, templates, or clauses..." 
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        {/* Recent Files Table Grid */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-200 flex justify-between items-center">
            <h2 className="font-bold text-slate-900">Recent Agreements</h2>
            <span className="text-xs text-slate-500 font-medium">3 active documents</span>
          </div>

          <div className="divide-y divide-slate-100">
            {[
              { title: 'Freelance Service Agreement', date: 'Edited 2 hours ago', status: 'Drafting' },
              { title: 'Non-Disclosure Agreement (NDA)', date: 'Edited yesterday', status: 'Verified' },
              { title: 'Residential Rent Agreement', date: 'Edited 3 days ago', status: 'Completed' },
            ].map((doc, i) => (
              <div key={i} className="p-4 px-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{doc.title}</h3>
                    <p className="text-xs text-slate-500">{doc.date}</p>
                  </div>
                </div>

                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 text-slate-700">
                  {doc.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}