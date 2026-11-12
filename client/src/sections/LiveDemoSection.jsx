import { useRef, useState } from 'react';
import { ArrowRight, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion';
import Reveal from '../components/Reveal';
import SectionHeading from '../components/SectionHeading';

const initialDetails = {
  client: 'Client Name',
  freelancer: 'Your name',
  project: 'Brand identity and website design',
  fee: '₹48,000',
};

function DemoField({ label, value, onChange, name, placeholder }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-medium text-[#687267] dark:text-[#b7c0b5]">{label}</span>
      <input
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="min-h-11 w-full rounded-lg border border-[#e5e6df] bg-white px-3.5 text-sm text-[#29332a] outline-none transition focus:border-[#89a18a] focus:ring-2 focus:ring-[#89a18a]/20 dark:border-[#39433a] dark:bg-[#1d251e] dark:text-[#e8ece6] dark:placeholder:text-[#7e887d]"
      />
    </label>
  );
}

export default function LiveDemoSection() {
  const [details, setDetails] = useState(initialDetails);
  const demoRef = useRef(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: demoRef, offset: ['start end', 'end start'] });
  const previewY = useSpring(useTransform(scrollYProgress, [0, 1], [12, -12]), { stiffness: 75, damping: 22 });
  const previewRotate = useTransform(scrollYProgress, [0, 1], [0.5, -0.5]);
  const updateDetail = (event) => {
    const { name, value } = event.target;
    setDetails((current) => ({ ...current, [name]: value }));
  };

  return (
    <section id="demo" className="scroll-mt-24 bg-[#f0f1eb] px-5 py-20 dark:bg-[#171e18] sm:px-8 sm:py-28">
      <div className="mx-auto max-w-7xl">
        <Reveal>
          <SectionHeading
            badge="A closer look"
            title="From project notes to a first draft."
            description="See the pieces of a freelance agreement take shape. Change the details and preview the result."
          />
        </Reveal>
        <Reveal delay={0.08}>
          <div ref={demoRef} className="grid overflow-hidden rounded-[1.5rem] border border-[#e0e2d9] bg-white shadow-[0_24px_70px_-48px_rgba(35,47,37,0.45)] dark:border-[#303b31] dark:bg-[#1b231c] lg:grid-cols-[0.83fr_1.17fr]">
            <div className="border-b border-[#ecece6] p-5 dark:border-[#303b31] sm:p-8 lg:border-b-0 lg:border-r">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#edf3ec] text-[#45674c] dark:bg-[#2b3c2e] dark:text-[#b2d0b6]">
                  <FileText size={17} />
                </span>
                <div>
                  <h3 className="text-sm font-semibold">Your project details</h3>
                  <p className="mt-0.5 text-xs text-[#858c82] dark:text-[#a3ada2]">A few basics are all you need to begin.</p>
                </div>
              </div>
              <div className="mt-7 space-y-4">
                <DemoField label="Client name" name="client" value={details.client} onChange={updateDetail} placeholder="Who are you working with?" />
                <DemoField label="Freelancer name" name="freelancer" value={details.freelancer} onChange={updateDetail} placeholder="Your name or business" />
                <DemoField label="Project or service" name="project" value={details.project} onChange={updateDetail} placeholder="What are you delivering?" />
                <DemoField label="Agreed fee" name="fee" value={details.fee} onChange={updateDetail} placeholder="e.g. ₹48,000" />
              </div>
              <p className="mt-5 text-[11px] leading-5 text-[#8a9086] dark:text-[#9ca69c]">
                This on-page preview is illustrative. Your entries here are not submitted.
              </p>
            </div>

            <motion.div style={{ y: reduceMotion ? 0 : previewY, rotate: reduceMotion ? 0 : previewRotate }} className="bg-[#fbfaf7] p-5 dark:bg-[#151b16] sm:p-8">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#889087]">Agreement preview</p>
                  <h3 className="mt-1 font-serif text-xl text-[#29332a] dark:text-[#e8ece6]">Freelance service agreement</h3>
                </div>
                <span className="rounded-full border border-[#e1e4dc] bg-white px-3 py-1.5 text-[10px] font-medium text-[#647065] dark:border-[#39443a] dark:bg-[#202820] dark:text-[#bec8bc]">
                  Draft · review before use
                </span>
              </div>
              <motion.div
                initial={reduceMotion ? false : { opacity: 0, y: 20, scale: 0.985 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: reduceMotion ? 0 : 0.55, ease: [0.22, 1, 0.36, 1] }}
                className="mt-6 rounded-xl border border-[#e8e7df] bg-white p-5 shadow-sm dark:border-[#303a31] dark:bg-[#1b231c] sm:p-7"
              >
                <p className="text-center text-[10px] font-medium uppercase tracking-[0.2em] text-[#92968d]">Service agreement</p>
                <h4 className="mt-3 text-center font-serif text-lg text-[#29332a] dark:text-[#e8ece6]">Freelance services</h4>
                <p className="mt-5 text-sm leading-6 text-[#687168] dark:text-[#b8c0b6]">
                  This draft outlines an agreement between <strong className="font-semibold text-[#3c493d] dark:text-[#dbe1d8]">{details.client || 'the client'}</strong> and{' '}
                  <strong className="font-semibold text-[#3c493d] dark:text-[#dbe1d8]">{details.freelancer || 'the freelancer'}</strong> for the following project:
                </p>
                <div className="mt-4 rounded-lg bg-[#f5f6f1] p-4 dark:bg-[#222b23]">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-[#838b81]">Scope of work</p>
                  <p className="mt-1.5 text-sm text-[#485449] dark:text-[#d5ddd3]">{details.project || 'Project details will appear here.'}</p>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-lg border border-[#ecebe4] p-3.5 dark:border-[#303a31]">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-[#838b81]">Project fee</p>
                    <p className="mt-1 text-sm font-medium text-[#485449] dark:text-[#d5ddd3]">{details.fee || 'To be agreed'}</p>
                  </div>
                  <div className="rounded-lg border border-[#ecebe4] p-3.5 dark:border-[#303a31]">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-[#838b81]">Next step</p>
                    <p className="mt-1 text-sm font-medium text-[#485449] dark:text-[#d5ddd3]">Review and refine terms</p>
                  </div>
                </div>
                <div className="mt-5 flex items-start gap-2.5 rounded-lg border border-[#e8e4d7] bg-[#faf8f0] p-3 text-[11px] leading-5 text-[#76766b] dark:border-[#494537] dark:bg-[#28271e] dark:text-[#c0bca9]">
                  <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#a79a65]" />
                  Check the scope, payment timing, and any clauses carefully before sharing.
                </div>
              </motion.div>
              <Link
                to="/signup"
                className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-full bg-[#31583b] px-5 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-[#284b32] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#31583b] dark:bg-[#779779] dark:text-[#101a12] dark:hover:bg-[#8eaa8f]"
              >
                Start a real agreement <ArrowRight size={14} />
              </Link>
            </motion.div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
