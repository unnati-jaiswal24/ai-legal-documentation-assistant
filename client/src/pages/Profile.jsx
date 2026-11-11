import { useState } from 'react';
import { Check, Save, UserRound } from 'lucide-react';
import * as authApi from '../api/auth';
import { useAuth } from '../auth/AuthContext';
import Button from '../components/Button';
import Card from '../components/Card';
import FormField from '../components/FormField';
import PageHeader from '../components/PageHeader';
import { ErrorState } from '../components/StatePanel';

function getProfile(user) {
  return {
    fullName: user?.fullName || user?.full_name || '',
    email: user?.email || '',
    preferredLanguage: user?.preferredLanguage || user?.preferred_language || 'en',
  };
}

export default function Profile() {
  const { user, setUser } = useAuth();
  const [edits, setEdits] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const values = { ...getProfile(user), ...(edits || {}) };

  function update(event) {
    setEdits((current) => ({ ...(current || {}), [event.target.name]: event.target.value }));
    setSaved(false);
  }

  async function submit(event) {
    event.preventDefault();
    setSaving(true);
    setSaved(false);
    setError('');
    try {
      const response = await authApi.updateMe(values);
      setUser(response.user || { ...user, ...values });
      setEdits(null);
      setSaved(true);
    } catch (requestError) {
      setError(requestError.message || 'Your profile could not be updated.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader eyebrow="Account" title="Profile" description="Manage the account details associated with your SaralDocs workspace." />
      {error && <div className="mb-5"><ErrorState message={error} /></div>}
      <Card className="overflow-hidden">
        <div className="flex items-center gap-3 border-b border-[#ecece6] px-5 py-4 dark:border-[#303a31] sm:px-7">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#eff3ed] text-[#58765b] dark:bg-[#29352b] dark:text-[#b4c8b1]"><UserRound size={17} /></span>
          <div>
            <h2 className="text-sm font-semibold text-[#354136] dark:text-[#e0e6df]">Personal information</h2>
            <p className="mt-1 text-[10px] text-[#858c82] dark:text-[#9ca69c]">Keep your account details up to date.</p>
          </div>
        </div>
        <form onSubmit={submit} className="space-y-5 p-5 sm:p-7">
          <FormField label="Full name" htmlFor="profile-name" required>
            <input id="profile-name" name="fullName" type="text" autoComplete="name" required value={values.fullName} onChange={update} className="form-control" />
          </FormField>
          <FormField label="Email address" htmlFor="profile-email" required>
            <input id="profile-email" name="email" type="email" autoComplete="email" required value={values.email} onChange={update} className="form-control" />
          </FormField>
          <FormField label="Preferred language" htmlFor="profile-language" hint="This preference is saved with your account.">
            <select id="profile-language" name="preferredLanguage" value={values.preferredLanguage} onChange={update} className="form-control">
              <option value="en">English</option>
              <option value="hi">Hindi</option>
            </select>
          </FormField>
          <div className="flex flex-col-reverse gap-3 border-t border-[#ecece6] pt-5 dark:border-[#303a31] sm:flex-row sm:items-center sm:justify-between">
            <span className="text-xs text-[#55775d] dark:text-[#a9c5a9]" role="status">{saved && <span className="inline-flex items-center gap-1.5"><Check size={14} /> Changes saved</span>}</span>
            <Button type="submit" disabled={saving}><Save size={14} /> {saving ? 'Saving…' : 'Save changes'}</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
