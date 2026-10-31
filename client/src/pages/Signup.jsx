import React from 'react';
import { Link } from 'react-router-dom';
import { Scale } from 'lucide-react';

export default function Signup() {
  return (
    <div className="min-h-screen bg-white flex flex-col justify-center items-center px-6">
      <div className="w-full max-w-md border border-slate-200 rounded-3xl p-8 shadow-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center text-white mb-3">
            <Scale className="h-5 w-5" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Create your account</h1>
          <p className="text-sm text-slate-500 mt-1">Start drafting legal documents free</p>
        </div>

        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">Full Name</label>
            <input 
              type="text" 
              placeholder="Rajesh Kumar" 
              className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm" 
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">Email address</label>
            <input 
              type="email" 
              placeholder="name@company.com" 
              className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm" 
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">Password</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm" 
            />
          </div>

          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-all shadow-md">
            Create account
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 font-semibold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}