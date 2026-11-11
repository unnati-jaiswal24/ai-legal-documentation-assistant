import { Link } from 'react-router-dom';
import { Info } from 'lucide-react';

export default function LimitationsNotice() {
  return (
    <aside className="flex gap-3 rounded-xl border border-[#e6dec6] bg-[#fbf9f1] p-4 dark:border-[#4a4534] dark:bg-[#24231c]" role="note">
      <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#88774a] dark:text-[#d4c697]" />
      <p className="text-[11px] leading-5 text-[#756f5b] dark:text-[#c0bca9]">
        This is drafting assistance, not legal advice, and does not guarantee enforceability. Review the document and consult a qualified advocate where needed.{' '}
        <Link to="/limitations" className="font-semibold underline underline-offset-2">Read the full limitations</Link>
      </p>
    </aside>
  );
}
