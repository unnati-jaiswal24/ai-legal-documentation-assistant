import { useCallback, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Download, FileText, Sparkles } from 'lucide-react';
import { api } from '../api/client';
import { draft as fetchDraft } from '../api/drafts';
import { generateDraftReport } from '../api/ai';
import Button from '../components/Button';
import Card from '../components/Card';
import ClauseCard from '../components/ClauseCard';
import LimitationsNotice from '../components/LimitationsNotice';
import PageHeader from '../components/PageHeader';
import StepBar from '../components/StepBar';
import { EmptyState, ErrorState, LoadingState } from '../components/StatePanel';
import ClauseExplanationPanel from '../components/ai/ClauseExplanationPanel';
import AiConsentDialog from '../components/ai/AiConsentDialog';
import AiStatusIndicator from '../components/ai/AiStatusIndicator';
import { hasUserConsented, setUserConsent } from '../api/ai/config';
import useAsyncData from '../hooks/useAsyncData';

function unwrapClauses(response) {
  return Array.isArray(response) ? response : response?.clauses || [];
}

function unwrapDraft(response) {
  return response?.draft || response;
}

function reportFields(draft) {
  const template = draft?.template || {};
  const fields = template.fields || template.templateFields || template.template_fields || [];
  const values = draft?.values || draft?.fieldValues || draft?.field_values || [];
  return fields.flatMap((field) => {
    const saved = values.find((item) => (item.fieldId || item.field_id) === field.id);
    const value = saved?.value;
    if (value === undefined || value === null || value === '') return [];
    const label = field.labelPlain || field.label_plain || field.fieldKey || field.field_key;
    const key = field.fieldKey || field.field_key || field.id;
    if (!label || !key || !['string', 'number', 'boolean'].includes(typeof value)) return [];
    return [{ key, label, value }];
  });
}

export default function Preview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState('');
  const [reportConsent, setReportConsent] = useState(false);
  const [explainingClause, setExplainingClause] = useState(null);
  const [consentOpen, setConsentOpen] = useState(false);

  const loadPreview = useCallback(async () => {
    const [draftResponse, clausesResponse] = await Promise.all([fetchDraft(id), api.clauses(id)]);
    return { draft: unwrapDraft(draftResponse), clauses: unwrapClauses(clausesResponse) };
  }, [id]);
  const { data: preview, loading, error, reload } = useAsyncData(loadPreview);

  const handleExplain = (clause) => {
    if (!hasUserConsented()) {
      setExplainingClause(clause);
      setConsentOpen(true);
      return;
    }
    setExplainingClause(clause);
  };

  const handleConsentGranted = () => {
    setUserConsent(true);
    setConsentOpen(false);
  };

  async function generate() {
    if (!reportConsent) return;
    setGenerating(true);
    setGenerateError('');
    try {
      const reportInput = {
        templateTitle: preview.draft?.template?.title || 'Freelance service agreement',
        fields: reportFields(preview.draft),
      };
      const result = await generateDraftReport(reportInput);
      navigate(`/drafts/${id}/documents`, {
        state: { report: { ...result.report, fields: reportInput.fields } },
      });
    } catch (requestError) {
      setGenerateError(requestError.message || 'The report could not be generated.');
    } finally {
      setGenerating(false);
    }
  }

  if (loading) return <LoadingState label="Loading agreement clauses…" />;
  if (error) return <ErrorState message={error} onRetry={reload} />;
  const items = preview?.clauses || [];

  return (
    <div>
      <AiConsentDialog
        isOpen={consentOpen}
        onConsent={handleConsentGranted}
        onCancel={() => {
          setConsentOpen(false);
          setExplainingClause(null);
        }}
      />

      <ClauseExplanationPanel
        isOpen={Boolean(explainingClause) && !consentOpen}
        clause={explainingClause}
        onClose={() => setExplainingClause(null)}
        onRequestConsent={() => setConsentOpen(true)}
      />

      <StepBar id={id} active="preview" />
      <PageHeader
        eyebrow="Agreement preview"
        title="Read through the clauses."
        description="Review the wording and available source details returned for this draft’s template."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <AiStatusIndicator />
            <Button onClick={generate} disabled={generating || !reportConsent}>
              <Download size={14} /> {generating ? 'Preparing…' : 'Generate report'}
            </Button>
          </div>
        }
      />
      <LimitationsNotice />
      <div className="mt-4 rounded-xl border border-[#e5e9df] bg-[#f7f8f4] p-4 dark:border-[#39443a] dark:bg-[#202921]">
        <label className="flex items-start gap-3 text-xs leading-5 text-[#596259] dark:text-[#c2cbbf]">
          <input
            type="checkbox"
            checked={reportConsent}
            onChange={(event) => setReportConsent(event.target.checked)}
            className="mt-1 h-4 w-4 rounded accent-[#45674c]"
          />
          <span>
            I agree to send my saved agreement answers to Google Gemini to create a non-binding report summary. The server masks common identifiers and name fields first, but other agreement details are sent to the configured AI provider. Do not include highly sensitive information.
          </span>
        </label>
      </div>
      {generateError && <div className="my-4"><ErrorState message={generateError} /></div>}
      <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_300px]">
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between gap-3 border-b border-[#ecece6] px-5 py-4 dark:border-[#303a31] sm:px-7">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#eff3ed] text-[#58765b] dark:bg-[#29352b] dark:text-[#b4c8b1]">
                <FileText size={17} />
              </span>
              <div>
                <h2 className="text-sm font-semibold text-[#354136] dark:text-[#e0e6df]">Draft clauses</h2>
                <p className="mt-1 text-[10px] text-[#858c82] dark:text-[#9ca69c]">
                  {items.length} {items.length === 1 ? 'clause' : 'clauses'} from this template
                </p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] text-[#5d685c] dark:text-[#9da79c]">
              <Sparkles size={13} className="text-[#3c6b46] dark:text-[#a7d8ad]" />
              AI explanations available
            </span>
          </div>
          {items.length ? (
            <div className="px-5 sm:px-7">
              {items.map((clause, index) => (
                <ClauseCard
                  key={clause.id || index}
                  clause={clause}
                  index={index}
                  onExplain={handleExplain}
                />
              ))}
            </div>
          ) : (
            <div className="p-4">
              <EmptyState
                title="No clauses are available yet."
                description="Check that this draft uses an active template with associated clauses."
              />
            </div>
          )}
        </Card>
        <Card className="h-fit p-5">
          <h2 className="text-sm font-semibold text-[#354136] dark:text-[#e0e6df]">Before you generate</h2>
          <ul className="mt-4 space-y-3 text-xs leading-5 text-[#747c73] dark:text-[#adb6ab]">
            <li>Review every clause, party detail, amount, and date.</li>
            <li>Click <strong>&ldquo;Explain this clause&rdquo;</strong> to view plain-language takeaways for any term.</li>
            <li>Make sure the agreement reflects what both parties discussed.</li>
            <li>Ask a qualified advocate if you are uncertain about a term.</li>
          </ul>
          <div className="mt-5 flex flex-col gap-3 border-t border-[#ecece6] pt-4 dark:border-[#303a31]">
            <Link
              to={`/drafts/${id}/review`}
              className="inline-flex items-center gap-2 text-xs font-semibold text-[#55775d] hover:underline dark:text-[#a9c5a9]"
            >
              <ArrowLeft size={13} /> Back to review
            </Link>
            <Link
              to={`/drafts/${id}/consult`}
              className="text-xs text-[#778075] underline underline-offset-3 hover:text-[#45674c] dark:text-[#aab3a9] dark:hover:text-[#a9c5a9]"
            >
              Ask about this draft
            </Link>
          </div>
        </Card>
      </div>
      <div className="mt-5 flex justify-end">
        <Link
          to={`/drafts/${id}/documents`}
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#55775d] hover:underline dark:text-[#a9c5a9]"
        >
          View generated versions <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}
