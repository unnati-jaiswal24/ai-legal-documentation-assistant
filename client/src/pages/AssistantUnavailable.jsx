import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bot, FileText, Sparkles, FilePlus2, CheckCircle2 } from 'lucide-react';
import Button from '../components/Button';
import Card from '../components/Card';
import PageHeader from '../components/PageHeader';
import AiStatusIndicator from '../components/ai/AiStatusIndicator';
import AiChatbox from '../components/ai/AiChatbox';
import { isAiEnabled, isMockMode } from '../api/ai/config';

const samplePrompts = [
  'Help me capture terms for a freelance web development agreement.',
  'What payment terms are standard for Indian freelancers under GST?',
  'Explain what an intellectual property assignment clause should include.',
  'What happens if a contract includes an uncapped liability clause in India?',
];

export default function AssistantUnavailable() {
  const [activeChat, setActiveChat] = useState(false);
  const enabled = isAiEnabled();
  const mock = isMockMode();

  return (
    <div>
      <PageHeader
        eyebrow="SaralDocs AI Assistant"
        title="Understand your agreements with clarity."
        description={
          enabled
            ? 'Interactive legal drafting assistant for Indian freelance contracts.'
            : 'The assistant experience is currently not configured on this environment.'
        }
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <AiStatusIndicator />
            {enabled && (
              <Button onClick={() => setActiveChat((prev) => !prev)}>
                <Sparkles size={14} />
                {activeChat ? 'Close chat' : 'Open intake chat'}
              </Button>
            )}
            <Button as={Link} to="/documents/new" variant="outline">
              <FilePlus2 size={14} /> Create document
            </Button>
          </div>
        }
      />

      {activeChat ? (
        <div className="rounded-2xl border border-[#e2e5dc] bg-white shadow-xs dark:border-[#303a31] dark:bg-[#182119] overflow-hidden">
          <AiChatbox
            isOpen={true}
            onClose={() => setActiveChat(false)}
            title="Interactive AI Drafting Assistant"
          />
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
          <Card className="p-6 sm:p-8">
            <div className="flex items-start gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#eff3ed] text-[#58765b] dark:bg-[#29352b] dark:text-[#b4c8b1]">
                <Bot size={20} />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-semibold text-[#354136] dark:text-[#e0e6df]">
                    {enabled ? (mock ? 'AI Running in Safe Mock Mode' : 'AI Assistant Connected') : 'AI Assistant Not Configured'}
                  </h2>
                  <AiStatusIndicator />
                </div>
                <p className="mt-2 text-xs leading-6 text-[#747c73] dark:text-[#adb6ab]">
                  {enabled
                    ? 'The AI assistant is ready to help you draft, review, and explain clauses for Indian Freelance Agreements. It extracts terms deterministically while adhering to reviewed legal templates.'
                    : 'The current environment has not enabled server-side AI processing. You can still create and complete documents manually with full template safety.'}
                </p>

                <div className="mt-4 rounded-xl border border-[#e6e9e0] bg-[#f8f9f6] p-4 dark:border-[#334035] dark:bg-[#202921]">
                  <h3 className="text-xs font-semibold text-[#384339] dark:text-[#dce2db] mb-2">
                    Supported Drafting Capabilities:
                  </h3>
                  <ul className="grid gap-2 sm:grid-cols-2">
                    {samplePrompts.map((example) => (
                      <li key={example} className="flex items-start gap-2 text-xs leading-5 text-[#586158] dark:text-[#bac3b8]">
                        <CheckCircle2 size={13} className="shrink-0 mt-1 text-[#47704f]" />
                        <span>{example}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <p className="mt-5 text-[11px] leading-5 text-[#858c82] dark:text-[#9ca69c]">
                  <strong>Persistent Limitation:</strong> AI explanations are informational and do not substitute for independent counsel from an Indian advocate. Binding contract text comes solely from lawyer-reviewed templates.
                </p>

                <div className="mt-6 flex flex-wrap gap-2">
                  {enabled && (
                    <Button onClick={() => setActiveChat(true)}>
                      <Sparkles size={14} /> Start guided chat
                    </Button>
                  )}
                  <Button as={Link} to="/documents" variant="outline">
                    <FileText size={15} /> View my documents
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-sm font-semibold text-[#354136] dark:text-[#e0e6df] mb-3">
              Environment & Connection
            </h3>
            <dl className="space-y-3 text-xs">
              <div className="flex justify-between border-b border-[#e9ece3] pb-2 dark:border-[#2f3a31]">
                <dt className="text-[#757f74] dark:text-[#9fa99e]">Feature Status</dt>
                <dd className="font-medium text-[#29332a] dark:text-[#e0e6df]">
                  {enabled ? 'Active' : 'Disabled'}
                </dd>
              </div>
              <div className="flex justify-between border-b border-[#e9ece3] pb-2 dark:border-[#2f3a31]">
                <dt className="text-[#757f74] dark:text-[#9fa99e]">Adapter Mode</dt>
                <dd className="font-medium text-[#29332a] dark:text-[#e0e6df]">
                  {mock ? 'Offline Mock Adapter' : 'Remote API Client'}
                </dd>
              </div>
              <div className="flex justify-between border-b border-[#e9ece3] pb-2 dark:border-[#2f3a31]">
                <dt className="text-[#757f74] dark:text-[#9fa99e]">Model Authority</dt>
                <dd className="font-medium text-[#29332a] dark:text-[#e0e6df]">
                  Constrained Output
                </dd>
              </div>
            </dl>

            <div className="mt-5 rounded-lg bg-[#f4f6f1] p-3 text-[11px] text-[#6d766c] dark:bg-[#202921] dark:text-[#9ba69a]">
              API keys are never exposed in client-side code. The frontend talks exclusively to the backend orchestrator via authenticated session tokens.
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
