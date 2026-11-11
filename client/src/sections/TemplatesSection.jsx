import { useCallback } from 'react';
import { templates as fetchTemplates } from '../api/drafts';
import { motion, useReducedMotion } from 'framer-motion';
import TemplateCard from '../components/TemplateCard';
import Reveal from '../components/Reveal';
import SectionHeading from '../components/SectionHeading';
import { EmptyState, ErrorState, LoadingState } from '../components/StatePanel';
import useAsyncData from '../hooks/useAsyncData';

function unwrapTemplates(response) {
  return Array.isArray(response) ? response : response?.templates || [];
}

export default function TemplatesSection() {
  const loadTemplates = useCallback(() => fetchTemplates().then(unwrapTemplates), []);
  const { data: templates, loading, error, reload } = useAsyncData(loadTemplates);
  const reduceMotion = useReducedMotion();
  const activeTemplates = (templates || []).filter((template) => template.isActive ?? template.is_active);

  return (
    <section id="templates" className="scroll-mt-24 px-5 py-20 sm:px-8 sm:py-28">
      <div className="mx-auto max-w-7xl">
        <Reveal>
          <SectionHeading
            badge="Start with a structure"
            title="Templates from your workspace."
            description="Available starting points are loaded from the platform, not a hardcoded catalogue."
          />
        </Reveal>
        {loading ? <LoadingState label="Loading available templates…" />
          : error ? <ErrorState message={error} onRetry={reload} />
            : !activeTemplates.length ? (
              <EmptyState title="No active templates are available." description="Check back when a template has been published." />
            ) : (
              <motion.div
                initial={reduceMotion ? false : 'hidden'}
                whileInView="visible"
                viewport={{ once: true, amount: 0.15 }}
                variants={{ hidden: {}, visible: { transition: { staggerChildren: reduceMotion ? 0 : 0.11 } } }}
                className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
              >
                {activeTemplates.slice(0, 3).map((template, index) => (
                  <motion.div
                    key={template.id}
                    variants={{
                      hidden: { opacity: 0, y: 24, rotate: index % 2 ? 1.2 : -1.2, scale: 0.98 },
                      visible: { opacity: 1, y: 0, rotate: 0, scale: 1 },
                    }}
                    transition={{ duration: reduceMotion ? 0 : 0.58, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <TemplateCard template={template} />
                  </motion.div>
                ))}
              </motion.div>
            )}
      </div>
    </section>
  );
}
