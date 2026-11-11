import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, Scale } from 'lucide-react';
import Card from '../components/Card';
import PageHeader from '../components/PageHeader';

export default function Limitations() {
  return (
    <main className="mx-auto max-w-4xl px-5 py-12 sm:px-8 sm:py-16">
      <Link to="/" className="mb-7 inline-flex items-center gap-2 text-xs font-medium text-[#718472] hover:underline dark:text-[#a9c5a9]"><ArrowLeft size={14} /> Back to SaralDocs</Link>
      <PageHeader
        eyebrow="Please read"
        title="Important limitations."
        description="SaralDocs is a drafting and information tool. It is not a law firm and does not provide legal advice or legal representation."
      />
      <div className="space-y-4">
        <Card className="flex gap-4 border-[#e6dec6] bg-[#fbf9f1] p-5 dark:border-[#4a4534] dark:bg-[#24231c] sm:p-6">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f0ebd9] text-[#88774a] dark:bg-[#393526] dark:text-[#d4c697]"><AlertTriangle size={18} /></span>
          <div>
            <h2 className="text-sm font-semibold text-[#5b5136] dark:text-[#dfd4aa]">Drafts require careful review</h2>
            <p className="mt-2 text-xs leading-6 text-[#756f5b] dark:text-[#c0bca9]">Generated or AI-assisted text may contain errors, omissions, or wording that does not fit your situation. Check every party detail, amount, date, obligation, and clause before sharing or signing.</p>
          </div>
        </Card>
        <Card className="p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eff3ed] text-[#58765b] dark:bg-[#29352b] dark:text-[#b4c8b1]"><Scale size={18} /></span>
            <h2 className="text-sm font-semibold text-[#354136] dark:text-[#e0e6df]">No legal advice or outcome guarantee</h2>
          </div>
          <p className="mt-3 text-xs leading-6 text-[#747c73] dark:text-[#adb6ab]">SaralDocs does not determine whether an agreement is suitable, enforceable, or compliant for your specific facts. Laws, formalities, and requirements can vary by state and circumstance. A qualified advocate can advise on your situation.</p>
        </Card>
        <Card className="p-5 sm:p-6">
          <h2 className="text-sm font-semibold text-[#354136] dark:text-[#e0e6df]">When to consult an advocate</h2>
          <p className="mt-3 text-xs leading-6 text-[#747c73] dark:text-[#adb6ab]">Seek professional advice for high-value or unusual arrangements, disputes, intellectual-property transfers, sensitive personal information, state-specific formalities, or any term you do not understand.</p>
        </Card>
      </div>
    </main>
  );
}
