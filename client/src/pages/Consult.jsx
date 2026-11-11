import { useCallback, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, MessageSquareText } from 'lucide-react';
import { createConsultation, experts as fetchExperts } from '../api/consultations';
import Button from '../components/Button';
import Card from '../components/Card';
import FormField from '../components/FormField';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import { EmptyState, ErrorState, LoadingState } from '../components/StatePanel';
import useAsyncData from '../hooks/useAsyncData';

function unwrapExperts(response) {
  return Array.isArray(response) ? response : response?.experts || [];
}

export default function Consult() {
  const { id } = useParams();
  const [query, setQuery] = useState('');
  const [expertId, setExpertId] = useState('');
  const [submitted, setSubmitted] = useState(null);
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const loadExperts = useCallback(() => fetchExperts().then(unwrapExperts), []);
  const { data: experts, loading, error, reload } = useAsyncData(loadExperts);
  const availableExperts = (experts || []).filter((expert) => expert.isAvailable ?? expert.is_available);

  async function submit(event) {
    event.preventDefault();
    setSubmitting(true);
    setSubmitError('');
    try {
      const response = await createConsultation({ draftId: id, expertId: expertId || undefined, query });
      setSubmitted(response.consultation || response);
    } catch (requestError) {
      setSubmitError(requestError.message || 'Your question could not be submitted.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader eyebrow="Draft · consultation" title="Ask about your agreement." description="Send a question related to this draft. Availability and status are provided by the service." />
      <Link to={`/drafts/${id}/preview`} className="mb-5 inline-flex items-center gap-2 text-xs font-semibold text-[#55775d] hover:underline dark:text-[#a9c5a9]"><ArrowLeft size={14} /> Return to agreement preview</Link>
      {submitted ? (
        <Card className="p-6 sm:p-8">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#edf3ec] text-[#58765b] dark:bg-[#29352b] dark:text-[#b4c8b1]"><MessageSquareText size={19} /></span>
          <h2 className="mt-5 font-serif text-2xl text-[#29332a] dark:text-[#e8ece6]">Your question is recorded.</h2>
          <p className="mt-2 text-sm leading-6 text-[#747c73] dark:text-[#adb6ab]">Keep the consultation reference to follow its status.</p>
          <div className="mt-5 flex flex-wrap items-center gap-3 rounded-xl bg-[#f6f7f3] p-4 dark:bg-[#202820]">
            <span className="text-xs text-[#737c72] dark:text-[#b4bdb2]">Consultation · {submitted.id}</span>
            <StatusBadge status={submitted.status} />
          </div>
          <Link to="/consultations" className="mt-6 inline-flex items-center gap-2 text-xs font-semibold text-[#55775d] hover:underline dark:text-[#a9c5a9]">View consultations <ArrowRight size={14} /></Link>
        </Card>
      ) : (
        <Card className="p-5 sm:p-8">
          {loading ? <LoadingState label="Checking expert availability…" />
            : error ? <ErrorState message={error} onRetry={reload} />
              : !availableExperts.length ? (
                <EmptyState title="No experts are currently available." description="You can return to your draft and continue reviewing it." />
              ) : (
                <form onSubmit={submit} className="space-y-5">
                  <FormField label="Your question" htmlFor="consultation-question" required hint="Do not include sensitive information you do not need to share.">
                    <textarea id="consultation-question" required rows={6} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="What would you like help understanding?" className="form-control min-h-36 resize-y" />
                  </FormField>
                  <FormField label="Choose an available expert" htmlFor="consultation-expert">
                    <select id="consultation-expert" value={expertId} onChange={(event) => setExpertId(event.target.value)} className="form-control">
                      <option value="">Assign based on availability</option>
                      {availableExperts.map((expert) => (
                        <option key={expert.id} value={expert.id}>{expert.name}{expert.specialization ? ` · ${expert.specialization}` : ''}</option>
                      ))}
                    </select>
                  </FormField>
                  {submitError && <p className="text-xs text-[#a14f3d] dark:text-[#e3a18d]" role="alert">{submitError}</p>}
                  <div className="flex justify-end border-t border-[#ecece6] pt-5 dark:border-[#303a31]">
                    <Button type="submit" disabled={submitting}>{submitting ? 'Sending…' : 'Send question'} <ArrowRight size={14} /></Button>
                  </div>
                </form>
              )}
        </Card>
      )}
    </div>
  );
}
