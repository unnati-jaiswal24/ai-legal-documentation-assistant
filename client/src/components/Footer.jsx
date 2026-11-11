import { Link, useLocation } from 'react-router-dom';
import { ArrowUpRight, Scale } from 'lucide-react';

const footerLinks = [
  ['#demo', 'Product preview'],
  ['#templates', 'Templates'],
  ['#how-it-works', 'How it works'],
  ['#features', 'Features'],
  ['#faq', 'FAQs'],
];
const currentYear = new Date().getFullYear();

export default function Footer() {
  const { pathname } = useLocation();
  const sectionHref = (href) => pathname === '/' ? href : `/${href}`;

  return (
    <footer className="border-t border-[#e7e7df] bg-[#f6f5f0] px-5 py-10 dark:border-[#303a31] dark:bg-[#141a15] sm:px-8 sm:py-12">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-8 sm:grid-cols-[1.4fr_0.7fr_0.9fr] sm:gap-10">
          <div>
            <Link to="/" className="inline-flex items-center gap-2.5 text-[#29332a] dark:text-[#e8ece6]">
              <span className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-[#31583b] text-white dark:bg-[#779779] dark:text-[#101a12]">
                <Scale size={16} strokeWidth={1.8} />
              </span>
              <span className="text-sm font-semibold tracking-tight">SaralDocs</span>
            </Link>
            <p className="mt-4 max-w-sm text-xs leading-5 text-[#777f75] dark:text-[#aab3a9]">
              A clearer way to prepare freelance service agreements, with you in control of every detail.
            </p>
          </div>

          <div>
            <h2 className="text-xs font-semibold text-[#29332a] dark:text-[#e8ece6]">Explore</h2>
            <ul className="mt-3 space-y-2.5">
              {footerLinks.map(([href, label]) => (
                <li key={href}>
                  <a href={sectionHref(href)} className="text-xs text-[#777f75] transition-colors hover:text-[#31583b] focus-visible:outline-2 focus-visible:outline-[#55775d] dark:text-[#aab3a9] dark:hover:text-[#c6dbc4]">
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-xs font-semibold text-[#29332a] dark:text-[#e8ece6]">Your next step</h2>
            <ul className="mt-3 space-y-2.5">
              <li>
                <Link to="/login" className="text-xs text-[#777f75] transition-colors hover:text-[#31583b] focus-visible:outline-2 focus-visible:outline-[#55775d] dark:text-[#aab3a9] dark:hover:text-[#c6dbc4]">
                  Sign in
                </Link>
              </li>
              <li>
                <Link to="/limitations" className="inline-flex items-center gap-1 text-xs text-[#777f75] transition-colors hover:text-[#31583b] focus-visible:outline-2 focus-visible:outline-[#55775d] dark:text-[#aab3a9] dark:hover:text-[#c6dbc4]">
                  Legal limitations <ArrowUpRight size={12} />
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-9 flex flex-col gap-3 border-t border-[#e3e3dc] pt-5 text-[10px] leading-5 text-[#858c82] dark:border-[#303a31] dark:text-[#98a197] sm:flex-row sm:items-center sm:justify-between">
          <span>© {currentYear} SaralDocs</span>
          <p className="max-w-2xl sm:text-right">
            SaralDocs provides drafting assistance and general information, not legal advice. Review documents carefully and consult a qualified advocate when needed.
          </p>
        </div>
      </div>
    </footer>
  );
}
