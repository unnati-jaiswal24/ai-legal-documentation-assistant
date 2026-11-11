import { useCallback, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Download, FileText } from 'lucide-react';
import { api } from '../api/client';
import Button from '../components/Button';
import Card from '../components/Card';
import ClauseCard from '../components/ClauseCard';
import LimitationsNotice from '../components/LimitationsNotice';
import PageHeader from '../components/PageHeader';
import StepBar from '../components/StepBar';
import { EmptyState, ErrorState, LoadingState } from '../components/StatePanel';
import useAsyncData from '../hooks/useAsyncData';

function unwrapClauses(response) {
  return Array.isArray(response) ? response : response?.clauses || [];
}

export default function Preview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState('');
  const loadClauses = useCallback(() => api.clauses(id).then(unwrapClauses), [id]);
  const { data: clauses, loading, error, reload } = useAsyncData(loadClauses);

  async function generate() {
    setGenerating(true);
    setGenerateError('');
    try {
      await api.generate(id);
      navigate(`/drafts/${id}/documents`);
    } catch (requestError) {
      setGenerateError(requestError.message || 'The document could not be generated.');
    } finally {
      setGenerating(false);
    }
  }

  if (loading) return <LoadingState label="Loading agreement clauses…" />;
  if (error) return <ErrorState message={error} onRetry={reload} />;
  const items = clauses || [];

  return (
    <div>
      <StepBar id={id} active="preview" />
      <PageHeader
        eyebrow="Agreement preview"
        title="Read through the clauses."
        description="Review the wording and available source details returned for this draft’s template."
        actions={<Button onClick={generate} disabled={generating}><Download size={14} /> {generating ? 'Preparing…' : 'Generate document'}</Button>}
      />
      <LimitationsNotice />
      {generateError && <div className="my-4"><ErrorState message={generateError} /></div>}
      <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_300px]">
        <Card className="overflow-hidden">
          <div className="flex items-center gap-3 border-b border-[#ecece6] px-5 py-4 dark:border-[#303a31] sm:px-7">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#eff3ed] text-[#58765b] dark:bg-[#29352b] dark:text-[#b4c8b1]"><FileText size={17} /></span>
            <div>
              <h2 className="text-sm font-semibold text-[#354136] dark:text-[#e0e6df]">Draft clauses</h2>
              <p className="mt-1 text-[10px] text-[#858c82] dark:text-[#9ca69c]">{items.length} {items.length === 1 ? 'clause' : 'clauses'} from this template</p>
            </div>
          </div>
          {items.length ? (
            <div className="px-5 sm:px-7">
              {items.map((clause, index) => <ClauseCard key={clause.id} clause={clause} index={index} />)}
            </div>
          ) : (
            <div className="p-4"><EmptyState title="No clauses are available yet." description="Check that this draft uses an active template with associated clauses." /></div>
          )}
        </Card>
        <Card className="h-fit p-5">
          <h2 className="text-sm font-semibold text-[#354136] dark:text-[#e0e6df]">Before you generate</h2>
          <ul className="mt-4 space-y-3 text-xs leading-5 text-[#747c73] dark:text-[#adb6ab]">
            <li>Review every clause, party detail, amount, and date.</li>
            <li>Make sure the agreement reflects what both parties discussed.</li>
            <li>Ask a qualified advocate if you are uncertain about a term.</li>
          </ul>
          <div className="mt-5 flex flex-col gap-3 border-t border-[#ecece6] pt-4 dark:border-[#303a31]">
            <Link to={`/drafts/${id}/review`} className="inline-flex items-center gap-2 text-xs font-semibold text-[#55775d] hover:underline dark:text-[#a9c5a9]"><ArrowLeft size={13} /> Back to review</Link>
            <Link to={`/drafts/${id}/consult`} className="text-xs text-[#778075] underline underline-offset-3 hover:text-[#45674c] dark:text-[#aab3a9] dark:hover:text-[#a9c5a9]">Ask about this draft</Link>
          </div>
        </Card>
      </div>
      <div className="mt-5 flex justify-end">
        <Link to={`/drafts/${id}/documents`} className="inline-flex items-center gap-2 text-xs font-semibold text-[#55775d] hover:underline dark:text-[#a9c5a9]">View generated versions <ArrowRight size={14} /></Link>
      </div>
    </div>
  );
}
