import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, Scale } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import Button from '../components/Button';
import FormField from '../components/FormField';

export default function Login() {
  const { login } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [values, setValues] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function update(event) {
    setValues((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function submit(event) {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(values);
      navigate(location.state?.from || '/dashboard', { replace: true });
    } catch (requestError) {
      setError(requestError.message || 'We could not sign you in. Check your details and try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-[65vh] px-5 py-14 sm:px-8 sm:py-20">
      <div className="mx-auto grid max-w-5xl overflow-hidden rounded-[24px] border border-[#e6e7df] bg-white shadow-[0_24px_70px_-48px_rgba(35,47,37,0.35)] dark:border-[#303a31] dark:bg-[#1b231c] md:grid-cols-[0.86fr_1.14fr]">
        <aside className="relative hidden flex-col justify-between overflow-hidden bg-[#263d2c] p-10 text-white md:flex">
          <div>
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10"><Scale size={19} /></span>
            <p className="mt-12 font-serif text-3xl leading-tight">A little more clarity for the work you do.</p>
            <p className="mt-4 max-w-xs text-sm leading-6 text-white/70">Your agreements, drafts, and next steps—together in one calm workspace.</p>
          </div>
          <p className="text-[10px] text-white/55">SaralDocs · Drafting assistance, with you in control</p>
          <span aria-hidden="true" className="absolute -bottom-24 -right-20 h-64 w-64 rounded-full border border-white/10" />
          <span aria-hidden="true" className="absolute -bottom-12 -right-8 h-40 w-40 rounded-full border border-white/10" />
        </aside>

        <div className="p-6 sm:p-10 md:p-12">
          <div className="mx-auto max-w-sm">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#edf3ec] text-[#45674c] dark:bg-[#2b3c2e] dark:text-[#b2d0b6] md:hidden"><Scale size={18} /></span>
            <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#718472] dark:text-[#9eb29e]">Welcome back</p>
            <h1 className="mt-2 font-serif text-3xl tracking-tight text-[#29332a] dark:text-[#e8ece6]">Sign in to SaralDocs</h1>
            <p className="mt-2 text-sm leading-6 text-[#747c73] dark:text-[#adb6ab]">Pick up where you left off.</p>

            <form className="mt-8 space-y-5" onSubmit={submit}>
              <FormField label="Email address" htmlFor="login-email" required>
                <input id="login-email" name="email" type="email" autoComplete="email" required value={values.email} onChange={update} placeholder="you@example.com" className="form-control" />
              </FormField>
              <FormField label="Password" htmlFor="login-password" required>
                <input id="login-password" name="password" type="password" autoComplete="current-password" required value={values.password} onChange={update} placeholder="Enter your password" className="form-control" />
              </FormField>
              {error && <p className="rounded-lg border border-[#ead5cf] bg-[#fbf2ef] p-3 text-xs leading-5 text-[#8d4e3e] dark:border-[#68463d] dark:bg-[#30221f] dark:text-[#e3a18d]" role="alert">{error}</p>}
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? 'Signing in…' : 'Sign in'} <ArrowRight size={15} />
              </Button>
            </form>

            <p className="mt-6 text-center text-xs text-[#778075] dark:text-[#aab3a9]">
              New to SaralDocs? <Link to="/signup" state={location.state} className="font-semibold text-[#45674c] hover:underline dark:text-[#a9c5a9]">Create an account</Link>
            </p>
            <p className="mt-8 border-t border-[#ecece6] pt-5 text-[10px] leading-5 text-[#92998f] dark:border-[#303a31] dark:text-[#899389]">
              By continuing, remember to review all legal documents carefully. SaralDocs is drafting assistance, not legal advice.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
