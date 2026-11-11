import { useCallback, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ClipboardCheck, Download, FileText, MessageSquare, RefreshCw } from 'lucide-react';
import { versions as fetchVersions } from '../api/drafts';
import Card from '../components/Card';
import LimitationsNotice from '../components/LimitationsNotice';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import StepBar from '../components/StepBar';
import { EmptyState, ErrorState, LoadingState } from '../components/StatePanel';
import useAsyncData from '../hooks/useAsyncData';

const checklist = [
  'Check names, dates, amounts, and the scope of work.',
  'Confirm state-specific requirements before signing.',
  'Make sure both parties agree to the final wording.',
  'Each party keeps a signed copy.',
];

function unwrapVersions(response) {
  return Array.isArray(response) ? response : response?.versions || [];
}

function formatDateTime(value) {
  if (!value) return 'Date unavailable';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Date unavailable';
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export default function Documents() {
  const { id } = useParams();
  const [checked, setChecked] = useState({});
  const loadVersions = useCallback(() => fetchVersions(id).then(unwrapVersions), [id]);
  const { data: versions, loading, error, reload } = useAsyncData(loadVersions);
  const items = [...(versions || [])].sort((a, b) => (b.versionNo ?? b.version_no ?? 0) - (a.versionNo ?? a.version_no ?? 0));
  const latestId = items[0]?.id;
  const doneCount = checklist.filter((_, index) => checked[index]).length;

  return (
    <div>
      <StepBar id={id} active="documents" />
      <PageHeader
        eyebrow="Your agreement"
        title="Generated versions"
        description="Review available exports and finish the agreement checklist before sharing."
        actions={
          <>
            <Link to={`/drafts/${id}/consult`} className="inline-flex min-h-10 items-center gap-2 rounded-full border border-[#dfe2d9] bg-white px-4 text-xs font-semibold text-[#465147] hover:bg-[#f8f9f6] dark:border-[#39443a] dark:bg-[#1b231c] dark:text-[#d4dbd2] dark:hover:bg-[#242d25]"><MessageSquare size={14} /> Ask a lawyer</Link>
            <Link to={`/drafts/${id}/fill`} className="inline-flex min-h-10 items-center gap-2 rounded-full bg-[#31583b] px-4 text-xs font-semibold text-white hover:bg-[#284b32] dark:bg-[#779779] dark:text-[#101a12]"><RefreshCw size={14} /> Edit answers</Link>
          </>
        }
      />
      <LimitationsNotice />

      <div className="mt-6 grid items-start gap-5 lg:grid-cols-[1fr_320px]">
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-[#ecece6] px-5 py-4 dark:border-[#303a31] sm:px-6">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#eff3ed] text-[#58765b] dark:bg-[#29352b] dark:text-[#b4c8b1]"><FileText size={17} /></span>
              <div>
                <h2 className="text-sm font-semibold text-[#354136] dark:text-[#e0e6df]">Available exports</h2>
                <p className="mt-1 text-[10px] text-[#858c82] dark:text-[#9ca69c]">{items.length} {items.length === 1 ? 'version' : 'versions'}</p>
              </div>
            </div>
          </div>
          {loading ? <div className="p-4"><LoadingState label="Loading document versions…" /></div>
            : error ? <div className="p-4"><ErrorState message={error} onRetry={reload} /></div>
              : !items.length ? (
                <div className="p-4">
                  <EmptyState title="No export yet." description="Review the clauses and generate your first document when you are ready." action={<Link to={`/drafts/${id}/preview`} className="app-link text-xs font-semibold">Go to preview</Link>} />
                </div>
              ) : (
                <ul className="divide-y divide-[#ecece6] dark:divide-[#303a31]">
                  {items.map((version) => {
                    const versionNo = version.versionNo ?? version.version_no;
                    const fileUrl = version.fileUrl || version.file_url;
                    const generatedAt = version.generatedAt || version.generated_at;
                    const format = version.format || 'document';
                    return (
                      <li key={version.id} className="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                        <div className="flex min-w-0 items-center gap-3">
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#f0f3ed] text-[#58765b] dark:bg-[#29352b] dark:text-[#b4c8b1]"><FileText size={16} /></span>
                          <div className="min-w-0">
                            <p className="flex items-center gap-2 text-xs font-semibold text-[#354136] dark:text-[#e0e6df]">
                              Version {versionNo}
                              {version.id === latestId && <StatusBadge status="generated" />}
                            </p>
                            <p className="mt-1 text-[10px] text-[#858c82] dark:text-[#9ca69c]">{formatDateTime(generatedAt)}</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between gap-3 sm:justify-end">
                          <span className="rounded-full bg-[#f0f1ee] px-2.5 py-1 text-[9px] font-semibold uppercase tracking-wide text-[#687067] dark:bg-[#303530] dark:text-[#b6bdb4]">{format}</span>
                          {fileUrl && fileUrl !== '#' ? (
                            <a href={fileUrl} download className="inline-flex min-h-9 items-center gap-2 rounded-full bg-[#31583b] px-4 text-[11px] font-semibold text-white hover:bg-[#284b32] dark:bg-[#779779] dark:text-[#101a12]"><Download size={13} /> Download</a>
                          ) : (
                            <span className="text-[10px] text-[#92998f]">Download unavailable</span>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
          <p className="border-t border-[#ecece6] px-5 py-3 text-[10px] leading-5 text-[#858c82] dark:border-[#303a31] dark:text-[#9ca69c] sm:px-6">
            Generating after editing creates a new version. Earlier versions remain available.
          </p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#eff3ed] text-[#58765b] dark:bg-[#29352b] dark:text-[#b4c8b1]"><ClipboardCheck size={17} /></span>
            <div>
              <h2 className="text-sm font-semibold text-[#354136] dark:text-[#e0e6df]">Before you share</h2>
              <p className="mt-1 text-[10px] text-[#858c82] dark:text-[#9ca69c]">{doneCount} of {checklist.length} reviewed</p>
            </div>
          </div>
          <ul className="mt-5 space-y-3">
            {checklist.map((item, index) => (
              <li key={item}>
                <label className="flex cursor-pointer gap-2.5 text-xs leading-5 text-[#626c62] dark:text-[#b4bdb2]">
                  <input type="checkbox" checked={Boolean(checked[index])} onChange={() => setChecked((current) => ({ ...current, [index]: !current[index] }))} className="mt-0.5 h-4 w-4 shrink-0 rounded border-[#cbd3c9] accent-[#45674c]" />
                  <span className={checked[index] ? 'text-[#92998f] line-through' : ''}>{item}</span>
                </label>
              </li>
            ))}
          </ul>
          <p className="mt-5 border-t border-[#ecece6] pt-4 text-[10px] leading-5 text-[#858c82] dark:border-[#303a31] dark:text-[#9ca69c]">
            Legal requirements can vary by state and situation. Consult a qualified advocate where needed.
          </p>
        </Card>
      </div>
    </div>
  );
}
