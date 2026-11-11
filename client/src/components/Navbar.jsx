import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, Moon, Scale, Sun, X } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

const navigation = [
  ['#demo', 'Product'],
  ['#templates', 'Templates'],
  ['#how-it-works', 'How it works'],
  ['#features', 'Features'],
  ['#trust', 'Trust'],
  ['#faq', 'FAQ'],
];

export default function Navbar({ darkMode, toggleDarkMode }) {
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [hoveredLink, setHoveredLink] = useState(null);
  const reduceMotion = useReducedMotion();
  const sectionHref = (href) => pathname === '/' ? href : `/${href}`;

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="sticky top-0 z-50 border-b border-[#e7e7df]/80 bg-[#faf9f6]/90 backdrop-blur-xl dark:border-[#303a31]/80 dark:bg-[#101410]/90">
      <div className="mx-auto flex h-[68px] max-w-7xl items-center justify-between px-5 sm:px-8">
        <Link
          to="/"
          onClick={closeMenu}
          className="inline-flex items-center gap-2.5 rounded-sm text-[#29332a] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#55775d] dark:text-[#e8ece6]"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-[#31583b] text-white dark:bg-[#779779] dark:text-[#101a12]">
            <Scale size={17} strokeWidth={1.8} />
          </span>
          <span className="text-[15px] font-semibold tracking-[-0.03em]">SaralDocs</span>
        </Link>

        <nav aria-label="Main navigation" className="hidden items-center gap-7 md:flex" onMouseLeave={() => setHoveredLink(null)}>
          {navigation.map(([href, label]) => (
            <a
              key={href}
              href={sectionHref(href)}
              onMouseEnter={() => setHoveredLink(href)}
              className="group relative py-2 text-xs font-medium text-[#687267] transition-colors hover:text-[#31583b] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#55775d] dark:text-[#b7c0b5] dark:hover:text-[#c6dbc4]"
            >
              {label}
              {hoveredLink === href && (
                <motion.span
                  layoutId="public-nav-underline"
                  className="absolute inset-x-0 bottom-0 h-px bg-[#668368] dark:bg-[#a9c5a9]"
                  transition={{ duration: reduceMotion ? 0 : 0.2, ease: 'easeOut' }}
                />
              )}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-4 md:flex">
          <button
            type="button"
            onClick={toggleDarkMode}
            className="flex h-9 w-9 items-center justify-center rounded-full text-[#687267] transition-colors hover:bg-[#eff0ea] hover:text-[#29332a] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#55775d] dark:text-[#b7c0b5] dark:hover:bg-[#222b23] dark:hover:text-[#e8ece6]"
            aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {darkMode ? <Sun size={17} /> : <Moon size={17} />}
          </button>
          <Link
            to="/login"
            className="text-xs font-medium text-[#596459] transition-colors hover:text-[#31583b] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#55775d] dark:text-[#c3ccc2] dark:hover:text-[#e0e9df]"
          >
            Sign in
          </Link>
          <Link
            to="/signup"
            className="inline-flex min-h-10 items-center justify-center rounded-full bg-[#31583b] px-4 text-xs font-semibold text-white transition-colors hover:bg-[#284b32] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#31583b] dark:bg-[#779779] dark:text-[#101a12] dark:hover:bg-[#8eaa8f]"
          >
            Get started
          </Link>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <button
            type="button"
            onClick={toggleDarkMode}
            className="flex h-10 w-10 items-center justify-center rounded-full text-[#687267] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#55775d] dark:text-[#b7c0b5]"
            aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="flex h-10 w-10 items-center justify-center rounded-full text-[#465147] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#55775d] dark:text-[#d4dbd2]"
            aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      <AnimatePresence initial={false}>
      {menuOpen && (
        <motion.nav
          id="mobile-navigation"
          aria-label="Mobile navigation"
          initial={reduceMotion ? false : { opacity: 0, y: -8, scaleY: 0.97, transformOrigin: 'top' }}
          animate={{ opacity: 1, y: 0, scaleY: 1 }}
          exit={reduceMotion ? undefined : { opacity: 0, y: -5, scaleY: 0.98 }}
          transition={{ duration: reduceMotion ? 0 : 0.2, ease: 'easeOut' }}
          className="border-t border-[#e7e7df] bg-[#faf9f6] px-5 pb-5 pt-2 dark:border-[#303a31] dark:bg-[#101410] md:hidden"
        >
          <div className="mx-auto flex max-w-7xl flex-col">
            {navigation.map(([href, label]) => (
              <a
                key={href}
                href={sectionHref(href)}
                onClick={closeMenu}
                className="border-b border-[#e9e9e2] py-3.5 text-sm font-medium text-[#596459] focus-visible:outline-2 focus-visible:outline-[#55775d] dark:border-[#303a31] dark:text-[#c3ccc2]"
              >
                {label}
              </a>
            ))}
            <div className="mt-4 flex gap-3">
              <Link
                to="/login"
                onClick={closeMenu}
                className="inline-flex min-h-11 flex-1 items-center justify-center rounded-full border border-[#dfe2d9] text-sm font-medium text-[#465147] focus-visible:outline-2 focus-visible:outline-[#55775d] dark:border-[#39443a] dark:text-[#d4dbd2]"
              >
                Sign in
              </Link>
              <Link
                to="/signup"
                onClick={closeMenu}
                className="inline-flex min-h-11 flex-1 items-center justify-center rounded-full bg-[#31583b] text-sm font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#31583b] dark:bg-[#779779] dark:text-[#101a12]"
              >
                Get started
              </Link>
            </div>
          </div>
        </motion.nav>
      )}
      </AnimatePresence>
    </header>
  );
}
