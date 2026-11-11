import { useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, FileText, ShieldAlert } from 'lucide-react';
import { api } from '../api/client';
import Button from '../components/Button';
import Card from '../components/Card';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import { EmptyState, ErrorState, LoadingState } from '../components/StatePanel';
import useAsyncData from '../hooks/useAsyncData';

function unwrapDrafts(result) {
  return Array.isArray(result) ? result : result?.drafts || [];
}

function ReviewDraftRow({ draft }) {
  return (
    <li className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:px-6">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#eff3ed] text-[#58765b] dark:bg-[#29352b] dark:text-[#b4c8b1]">
        <FileText size={16} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-xs font-semibold text-[#354136] dark:text-[#e0e6df]">
          {draft.template?.title || draft.title || 'Freelance service agreement'}
        </span>
        <span className="mt-1 block truncate text-[10px] text-[#858c82] dark:text-[#9ca69c]">ID · {draft.id}</span>
      </span>
      <StatusBadge status={draft.status} />
      <Button as={Link} to={`/documents/${draft.id}/review`} variant="outline" size="sm">
        Open checklist <ArrowRight size={13} />
      </Button>
    </li>
  );
}

export default function LegalReview() {
  const loadDrafts = useCallback(() => api.drafts().then(unwrapDrafts), []);
  const { data: drafts, loading, error, reload } = useAsyncData(loadDrafts);
  const items = drafts || [];

  return (
    <div>
      <PageHeader
        eyebrow="Document workspace"
        title="Review your draft."
        description="Continue to the available required-field checklist for one of your saved agreements."
      />

      <div className="mb-5 flex items-start gap-3 rounded-xl border border-[#e7dcc6] bg-[#fbf8f0] p-4 text-[#63583f] dark:border-[#4a4332] dark:bg-[#29261f] dark:text-[#d4c7a6]" role="note">
        <ShieldAlert size={17} className="mt-0.5 shrink-0" />
        <p className="text-xs leading-5">
          This application does not currently have an AI legal-review service. The linked draft review is a questionnaire validation checklist, not legal advice or an assessment of legal risk. Have important agreements reviewed by a qualified legal professional.
        </p>
      </div>

      {loading ? <LoadingState label="Loading your drafts…" />
        : error ? <ErrorState message={error} onRetry={reload} />
          : !items.length ? (
            <EmptyState
              title="No documents are available to review."
              description="Only agreements returned by the connected drafts service appear here."
              action={<Button as={Link} to="/documents/new">Start an agreement</Button>}
            />
          ) : (
            <Card className="overflow-hidden">
              <ul className="divide-y divide-[#ecece6] dark:divide-[#303a31]">
                {items.map((draft) => <ReviewDraftRow key={draft.id} draft={draft} />)}
              </ul>
            </Card>
          )}
    </div>
  );
}
