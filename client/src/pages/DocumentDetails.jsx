import { useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, FileText, PencilLine } from 'lucide-react';
import { api } from '../api/client';
import Button from '../components/Button';
import Card from '../components/Card';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import { ErrorState, LoadingState } from '../components/StatePanel';
import useAsyncData from '../hooks/useAsyncData';

function unwrapDraft(response) {
  return response?.draft || response;
}

function dateLabel(value) {
  if (!value) return 'Not provided by the service';
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? 'Not provided by the service'
    : new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium' }).format(date);
}

export default function DocumentDetails() {
  const { id } = useParams();
  const loadDraft = useCallback(() => api.draft(id).then(unwrapDraft), [id]);
  const { data: draft, loading, error, reload } = useAsyncData(loadDraft);

  if (loading) return <LoadingState label="Loading document details…" />;
  if (error) return <ErrorState message={error} onRetry={reload} />;
  if (!draft) return <ErrorState message="The service did not return this document." />;

  const title = draft.template?.title || draft.title || 'Freelance service agreement';
  return (
    <div>
      <PageHeader
        eyebrow="Document details"
        title={title}
        description={`Document ID · ${draft.id}`}
        actions={
          <>
            <Button as={Link} to="/documents" variant="outline"><ArrowLeft size={14} /> All documents</Button>
            <Button as={Link} to={`/documents/${draft.id}/edit`}><PencilLine size={14} /> Edit questionnaire</Button>
          </>
        }
      />

      <Card className="p-5 sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#ecece6] pb-5 dark:border-[#303a31]">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eff3ed] text-[#58765b] dark:bg-[#29352b] dark:text-[#b4c8b1]"><FileText size={17} /></span>
            <div>
              <h2 className="text-sm font-semibold text-[#354136] dark:text-[#e0e6df]">Agreement status</h2>
              <p className="mt-1 text-xs text-[#858c82] dark:text-[#9ca69c]">Status supplied by the drafts service</p>
            </div>
          </div>
          <StatusBadge status={draft.status} />
        </div>
        <dl className="grid gap-5 pt-5 sm:grid-cols-2">
          <div>
            <dt className="text-[10px] font-semibold uppercase tracking-wide text-[#858c82] dark:text-[#9ca69c]">Created</dt>
            <dd className="mt-1 text-sm text-[#354136] dark:text-[#e0e6df]">{dateLabel(draft.createdAt || draft.created_at)}</dd>
          </div>
          <div>
            <dt className="text-[10px] font-semibold uppercase tracking-wide text-[#858c82] dark:text-[#9ca69c]">Last updated</dt>
            <dd className="mt-1 text-sm text-[#354136] dark:text-[#e0e6df]">{dateLabel(draft.updatedAt || draft.updated_at)}</dd>
          </div>
        </dl>
        <div className="mt-6 flex flex-wrap gap-2 border-t border-[#ecece6] pt-5 dark:border-[#303a31]">
          <Button as={Link} to={`/documents/${draft.id}/questions`} variant="outline">Questionnaire</Button>
          <Button as={Link} to={`/documents/${draft.id}/preview`} variant="outline">Preview</Button>
          <Button as={Link} to={`/documents/${draft.id}/versions`} variant="outline">Versions</Button>
          <Button as={Link} to={`/documents/${draft.id}/review`}>Review checklist <ArrowRight size={14} /></Button>
        </div>
      </Card>
      <p className="mt-4 text-xs leading-5 text-[#858c82] dark:text-[#9ca69c]">
        This document view displays only details returned by the service. Important agreements should be reviewed by a qualified legal professional.
      </p>
    </div>
  );
}
