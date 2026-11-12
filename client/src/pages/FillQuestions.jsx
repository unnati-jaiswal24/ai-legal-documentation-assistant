import { useCallback, useMemo, useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, Save, Sparkles } from 'lucide-react';
import { getQuestionnaireHelp } from '../api/ai';
import { draft as fetchDraft, saveValues } from '../api/drafts';
import Button from '../components/Button';
import Card from '../components/Card';
import FieldInput from '../components/FieldInput';
import PageHeader from '../components/PageHeader';
import StepBar from '../components/StepBar';
import LimitationsNotice from '../components/LimitationsNotice';
import { ErrorState, LoadingState } from '../components/StatePanel';
import AiChatbox from '../components/ai/AiChatbox';
import AiStatusIndicator from '../components/ai/AiStatusIndicator';
import useAsyncData from '../hooks/useAsyncData';

function unwrapDraft(response) {
  return response.draft || response;
}

function valuesByFieldId(draft) {
  const values = draft.values || draft.fieldValues || draft.field_values || [];
  return Object.fromEntries(values.map((item) => [item.fieldId || item.field_id, item.value]));
}

const AI_HELP_FIELDS = new Set([
  'effective_date',
  'freelancer_name',
  'client_name',
  'scope_description',
  'fee_amount',
  'payment_days',
  'include_nda',
  'notice_days',
  'arbitration_city',
  'deliverables',
  'project_timeline',
  'ip_arrangement',
  'confidentiality_requirements',
  'termination_conditions',
  'governing_law',
  'jurisdiction',
  'payment_milestones',
]);

export default function FillQuestions() {
  const { id } = useParams();
  const navigate = useNavigate();
  const storageKey = `saraldocs_draft_edits_${id}`;

  const [edits, setEdits] = useState(() => {
    if (typeof localStorage !== 'undefined') {
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved) return { draftId: id, values: JSON.parse(saved) };
      } catch {
        // ignore
      }
    }
    return { draftId: null, values: {} };
  });

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [saved, setSaved] = useState(false);
  const [aiConsent, setAiConsent] = useState(false);
  const [aiHelp, setAiHelp] = useState({});
  const [aiHelpLoading, setAiHelpLoading] = useState({});
  const [aiChatOpen, setAiChatOpen] = useState(false);

  const loadDraft = useCallback(() => fetchDraft(id).then(unwrapDraft), [id]);
  const { data: draft, loading, error, reload } = useAsyncData(loadDraft);

  const answers = draft
    ? { ...valuesByFieldId(draft), ...(edits.draftId === draft.id ? edits.values : {}) }
    : {};

  const fields = useMemo(
    () => [...(draft?.template?.fields || draft?.template?.templateFields || draft?.template?.template_fields || [])]
      .sort((a, b) => (a.displayOrder ?? a.display_order ?? 0) - (b.displayOrder ?? b.display_order ?? 0)),
    [draft],
  );

  const filledCount = fields.filter((field) => {
    const value = answers[field.id];
    return value !== undefined && value !== null && value !== '';
  }).length;

  // Persist edits to localStorage
  useEffect(() => {
    if (draft && edits.draftId === draft.id && Object.keys(edits.values).length > 0) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(edits.values));
      } catch {
        // ignore
      }
    }
  }, [edits, draft, storageKey]);

  function update(fieldId, value) {
    setEdits((current) => ({
      draftId: draft?.id,
      values: { ...(current.draftId === draft?.id ? current.values : {}), [fieldId]: value },
    }));
    setFieldErrors((current) => {
      const next = { ...current };
      delete next[fieldId];
      return next;
    });
    setSaveError('');
    setSaved(false);
  }

  // Validate fields client-side
  function validateFields() {
    const errors = {};
    for (const field of fields) {
      const val = answers[field.id];
      const isReq = field.isRequired ?? field.is_required ?? false;
      const type = field.dataType || field.data_type;

      if (isReq && (val === undefined || val === null || String(val).trim() === '')) {
        errors[field.id] = `${field.labelPlain || field.label_plain || 'This field'} is required.`;
        continue;
      }

      if (val !== undefined && val !== null && String(val).trim() !== '') {
        if (type === 'number') {
          const num = Number(val);
          if (Number.isNaN(num) || num <= 0) {
            errors[field.id] = 'Please enter a positive numeric value.';
          }
        }
        if (type === 'date') {
          const date = new Date(val);
          if (Number.isNaN(date.getTime())) {
            errors[field.id] = 'Please enter a valid calendar date.';
          }
        }
      }
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  // Auto-populate questionnaire fields when the AI chat extracts values
  const handleFieldsExtracted = useCallback((extracted) => {
    if (!extracted || !fields.length || !draft) return;
    setEdits((current) => {
      const nextValues = { ...(current.draftId === draft.id ? current.values : {}) };
      for (const [key, val] of Object.entries(extracted)) {
        const matched = fields.find((f) => (f.fieldKey || f.field_key) === key);
        if (matched && val !== undefined) {
          nextValues[matched.id] = val;
        }
      }
      return { draftId: draft.id, values: nextValues };
    });
    setSaved(false);
  }, [fields, draft]);

  async function requestAiHelp(fieldKey) {
    setAiHelpLoading((current) => ({ ...current, [fieldKey]: true }));
    setAiHelp((current) => ({ ...current, [fieldKey]: { error: '' } }));
    try {
      const result = await getQuestionnaireHelp(fieldKey);
      setAiHelp((current) => ({
        ...current,
        [fieldKey]: { guidance: result.guidance?.[0], error: '' },
      }));
    } catch (requestError) {
      setAiHelp((current) => ({
        ...current,
        [fieldKey]: {
          error: requestError.message || 'AI help is unavailable. You can try again.',
        },
      }));
    } finally {
      setAiHelpLoading((current) => ({ ...current, [fieldKey]: false }));
    }
  }

  async function saveProgress(showSuccess = true) {
    setSaving(true);
    setSaveError('');
    try {
      const values = fields
        .filter((field) => answers[field.id] !== undefined)
        .map((field) => ({ fieldId: field.id, value: answers[field.id] }));
      await saveValues(id, values);
      if (showSuccess) setSaved(true);
      return true;
    } catch (requestError) {
      setSaveError(requestError.message || 'Your answers could not be saved.');
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveSubmit(event) {
    event.preventDefault();
    await saveProgress(true);
  }

  async function handleContinueToReview(event) {
    event.preventDefault();
    const isValid = validateFields();
    if (!isValid) {
      setSaveError('Please complete all required fields correctly before moving to review.');
      return;
    }
    const success = await saveProgress(false);
    if (success) {
      navigate(`/drafts/${id}/review`);
    }
  }

  if (loading) return <LoadingState label="Loading agreement questions…" />;
  if (error) return <ErrorState message={error} onRetry={reload} />;
  if (!draft) return <ErrorState message="This draft could not be found." />;

  const templateTitle = draft.template?.title || 'Freelance service agreement';
  return (
    <div>
      <StepBar id={id} active="fill" />
      <PageHeader
        eyebrow={templateTitle}
        title="Tell us about the work."
        description="Your answers fill the fields connected to this template. You can come back and edit them later."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Link
              to="/drafts"
              className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-[#dfe2d9] bg-white px-3.5 py-1.5 text-xs font-semibold text-[#465147] hover:bg-[#f8f9f6] dark:border-[#39443a] dark:bg-[#1b231c] dark:text-[#d4dbd2]"
            >
              <ArrowLeft size={13} /> Back to drafts
            </Link>
            <AiStatusIndicator />
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAiChatOpen((prev) => !prev)}
              aria-expanded={aiChatOpen}
            >
              <Sparkles size={13} />
              {aiChatOpen ? 'Hide AI assistant' : 'Guided AI intake'}
            </Button>
          </div>
        }
      />

      <div className="mb-5">
        <LimitationsNotice />
      </div>

      <div className="mb-4 flex items-center justify-between text-[11px] text-[#778075] dark:text-[#aab3a9]">
        <span>{filledCount} of {fields.length} fields completed</span>
        <span>{fields.length ? Math.round((filledCount / fields.length) * 100) : 0}%</span>
      </div>
      <div className="mb-7 h-1.5 overflow-hidden rounded-full bg-[#e8eae3] dark:bg-[#303a31]" role="progressbar" aria-valuemin={0} aria-valuemax={fields.length} aria-valuenow={filledCount}>
        <div className="h-full rounded-full bg-[#78977b] transition-[width] duration-300" style={{ width: fields.length ? `${(filledCount / fields.length) * 100}%` : '0%' }} />
      </div>

      <form onSubmit={handleSaveSubmit}>
        <Card className="p-5 sm:p-8">
          {fields.some((field) => AI_HELP_FIELDS.has(field.fieldKey || field.field_key)) && (
            <div className="mb-6 rounded-xl border border-[#e5e9df] bg-[#f7f8f4] p-4 dark:border-[#39443a] dark:bg-[#202921]">
              <label className="flex items-start gap-3 text-xs leading-5 text-[#596259] dark:text-[#c2cbbf]">
                <input
                  type="checkbox"
                  checked={aiConsent}
                  onChange={(event) => {
                    setAiConsent(event.target.checked);
                    if (!event.target.checked) setAiHelp({});
                  }}
                  className="mt-1 h-4 w-4 rounded accent-[#45674c]"
                />
                <span>
                  I consent to sending only the selected generic question identifier to Gemini for general guidance. My answers, personal details, and document text will not be sent.
                </span>
              </label>
            </div>
          )}

          {!fields.length ? (
            <p className="text-sm text-[#747c73] dark:text-[#adb6ab]">This template has no questionnaire fields.</p>
          ) : (
            <div className="grid gap-x-6 gap-y-6 sm:grid-cols-2">
              {fields.map((field) => {
                const hasError = Boolean(fieldErrors[field.id]);
                return (
                  <div key={field.id} className={(field.dataType || field.data_type) === 'boolean' ? 'sm:col-span-2' : ''}>
                    <FieldInput
                      field={field}
                      value={answers[field.id]}
                      onChange={(value) => update(field.id, value)}
                    />
                    {hasError && (
                      <p className="mt-1.5 text-xs text-[#9b483f] font-medium" role="alert">
                        {fieldErrors[field.id]}
                      </p>
                    )}
                    {AI_HELP_FIELDS.has(field.fieldKey || field.field_key) && (
                      <div className="mt-2">
                        <button
                          type="button"
                          disabled={!aiConsent || aiHelpLoading[field.fieldKey || field.field_key]}
                          onClick={() => requestAiHelp(field.fieldKey || field.field_key)}
                          className="inline-flex min-h-8 items-center gap-1.5 rounded-full px-2.5 text-xs font-medium text-[#55775d] hover:bg-[#eff3ed] disabled:cursor-not-allowed disabled:opacity-50 dark:text-[#a9c5a9] dark:hover:bg-[#273329]"
                          aria-label={`Get AI guidance for ${field.labelPlain || field.label_plain || field.fieldKey || field.field_key}`}
                        >
                          <Sparkles size={13} />
                          {aiHelpLoading[field.fieldKey || field.field_key] ? 'Getting guidance…' : 'Explain this question'}
                        </button>
                        {aiHelp[field.fieldKey || field.field_key]?.guidance && (
                          <div className="mt-2 rounded-lg border border-[#e5e9df] bg-[#f7f8f4] p-3 text-xs leading-5 text-[#596259] dark:border-[#39443a] dark:bg-[#202921] dark:text-[#c2cbbf]" aria-live="polite">
                            <p>{aiHelp[field.fieldKey || field.field_key].guidance.explanation}</p>
                            {aiHelp[field.fieldKey || field.field_key].guidance.questions?.length > 0 && (
                              <ul className="mt-2 list-disc space-y-1 pl-4">
                                {aiHelp[field.fieldKey || field.field_key].guidance.questions.map((question) => (
                                  <li key={question}>{question}</li>
                                ))}
                              </ul>
                            )}
                            <p className="mt-2 text-[10px] text-[#778075] dark:text-[#aab3a9]">
                              AI-generated general guidance; not legal advice.
                            </p>
                          </div>
                        )}
                        {aiHelp[field.fieldKey || field.field_key]?.error && (
                          <div className="mt-2 flex items-center gap-2 text-xs text-[#9b483f]" aria-live="polite">
                            <span>{aiHelp[field.fieldKey || field.field_key].error}</span>
                            <button
                              type="button"
                              onClick={() => requestAiHelp(field.fieldKey || field.field_key)}
                              className="font-semibold underline"
                            >
                              Try again
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {saveError && (
            <div className="mt-6 rounded-lg border border-[#f0c3be] bg-[#fff5f4] p-3 text-xs text-[#8c2b22] dark:border-[#532b27] dark:bg-[#2d1715] dark:text-[#f29f98]">
              {saveError}
            </div>
          )}

          <div className="mt-8 flex flex-col-reverse gap-3 border-t border-[#ecece6] pt-5 dark:border-[#303a31] sm:flex-row sm:items-center sm:justify-between">
            <span className="text-xs text-[#778075] dark:text-[#aab3a9]">
              {saved && (
                <span className="inline-flex items-center gap-1.5 text-[#55775d] dark:text-[#a9c5a9]">
                  <Check size={14} /> Answers saved to draft
                </span>
              )}
            </span>
            <div className="flex flex-wrap gap-2">
              <Button type="submit" variant="outline" disabled={saving}>
                <Save size={14} /> {saving ? 'Saving…' : 'Save progress'}
              </Button>
              <button
                type="button"
                onClick={handleContinueToReview}
                disabled={saving}
                className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[#31583b] px-5 text-xs font-semibold text-white hover:bg-[#284b32] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#31583b] disabled:opacity-55 dark:bg-[#779779] dark:text-[#101a12]"
              >
                Continue to review <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </Card>
      </form>

      {/* Docked AI Chatbox on the intake questionnaire */}
      <AiChatbox
        isDocked
        isOpen={aiChatOpen}
        onClose={() => setAiChatOpen(false)}
        draftId={id}
        onFieldsExtracted={handleFieldsExtracted}
        title="Guided Intake Assistant"
      />

      {/* Floating launcher if closed */}
      {!aiChatOpen && (
        <button
          type="button"
          onClick={() => setAiChatOpen(true)}
          className="fixed bottom-6 right-6 z-30 flex items-center gap-2 rounded-full bg-[#31583b] px-4 py-2.5 text-xs font-semibold text-white shadow-lg transition-transform hover:scale-105 hover:bg-[#284b32] focus-visible:outline-[#31583b] dark:bg-[#779779] dark:text-[#101a12]"
          aria-label="Open AI intake assistant"
        >
          <Sparkles size={15} />
          <span>Need help filling?</span>
        </button>
      )}
    </div>
  );
}
