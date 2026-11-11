import { Link } from 'react-router-dom';
import { Bot, FileText } from 'lucide-react';
import Button from '../components/Button';
import Card from '../components/Card';
import PageHeader from '../components/PageHeader';

const examples = [
  'Ask about common terms in a freelance service agreement.',
  'Request a plain-language explanation of a clause.',
  'Check a draft for information that may be missing.',
  'Explore clauses that may be relevant to your agreement.',
];

export default function AssistantUnavailable() {
  return (
    <div>
      <PageHeader
        eyebrow="SaralDocs assistant"
        title="Understand your agreements with clarity."
        description="The assistant experience is not connected yet. No sample or generated answers are shown as if they came from an AI service."
      />

      <Card className="p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#eff3ed] text-[#58765b] dark:bg-[#29352b] dark:text-[#b4c8b1]">
            <Bot size={19} />
          </span>
          <div>
            <h2 className="text-sm font-semibold text-[#354136] dark:text-[#e0e6df]">AI service unavailable</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#747c73] dark:text-[#adb6ab]">
              The current backend exposes no assistant or conversation endpoint. An interactive chat requires a server-side AI integration and must not send provider credentials from this browser.
            </p>
            <p className="mt-3 text-xs leading-5 text-[#747c73] dark:text-[#adb6ab]">
              When the service is available, it can support questions such as:
            </p>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {examples.map((example) => (
                <li key={example} className="flex items-start gap-2 text-xs leading-5 text-[#586158] dark:text-[#bac3b8]">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#78977b]" aria-hidden="true" />
                  {example}
                </li>
              ))}
            </ul>
            <p className="mt-5 text-xs leading-5 text-[#858c82] dark:text-[#9ca69c]">
              AI explanations are informational and are not a substitute for advice from a qualified Indian legal professional.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <Button as={Link} to="/documents"><FileText size={15} /> View my documents</Button>
              <Button as={Link} to="/documents/new" variant="outline">Create an agreement</Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
