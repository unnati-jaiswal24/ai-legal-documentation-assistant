import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Scale, ArrowLeft } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate authentication and redirect to dashboard
    if (email && password) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center items-center px-6 relative selection:bg-blue-600 selection:text-white">
      {/* Back to Home Link */}
      <Link 
        to="/" 
        className="absolute top-6 left-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to home
      </Link>

      <div className="w-full max-w-md border border-slate-200 rounded-3xl p-8 shadow-sm bg-white">
        <div className="flex flex-col items-center mb-8">
          <Link to="/" className="h-12 w-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white mb-3 shadow-md shadow-blue-600/20">
            <Scale className="h-6 w-6" />
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Sign in to SaralDocs</h1>
          <p className="text-sm text-slate-500 mt-1">Access your AI legal workstation</p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Email address
            </label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com" 
              className="w-full px-4 py-3 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm transition-all" 
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Password
              </label>
              <a href="#" className="text-xs font-semibold text-blue-600 hover:underline">
                Forgot?
              </a>
            </div>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••" 
              className="w-full px-4 py-3 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm transition-all" 
            />
          </div>

          <button 
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-all shadow-md shadow-blue-600/10 active:scale-[0.99]"
          >
            Continue
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          Don't have an account?{' '}
          <Link to="/signup" className="text-blue-600 font-semibold hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}