import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <main className="flex min-h-[65vh] items-center justify-center px-5 py-20">
      <div className="max-w-lg text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#718472] dark:text-[#9eb29e]">404 · Page not found</p>
        <h1 className="mt-4 font-serif text-4xl leading-tight tracking-tight text-[#29332a] dark:text-[#e8ece6]">This page isn’t here.</h1>
        <p className="mt-3 text-sm leading-6 text-[#747c73] dark:text-[#adb6ab]">The link may have changed, or the page may no longer be available.</p>
        <Link to="/" className="mt-7 inline-flex min-h-11 items-center gap-2 rounded-full bg-[#31583b] px-5 text-xs font-semibold text-white hover:bg-[#284b32] dark:bg-[#779779] dark:text-[#101a12]">
          <ArrowLeft size={14} /> Back to SaralDocs
        </Link>
      </div>
    </main>
  );
}
