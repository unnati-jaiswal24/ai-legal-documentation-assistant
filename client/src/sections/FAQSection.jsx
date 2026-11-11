import Card from '../components/Card';
import FAQItem from '../components/FAQItem';
import Reveal from '../components/Reveal';
import SectionHeading from '../components/SectionHeading';

const faqs = [
  {
    question: 'Does SaralDocs replace advice from an advocate?',
    answer: 'No. SaralDocs provides drafting assistance and general information. It does not provide legal advice or representation. Consult a qualified advocate for advice about your situation.',
  },
  {
    question: 'Can I change my agreement details?',
    answer: 'Yes. The drafting workflow lets you review and edit answers associated with the selected template before continuing.',
  },
  {
    question: 'Are agreements guaranteed to be enforceable?',
    answer: 'No. Generated text may need changes and does not guarantee legal validity, suitability, or enforceability.',
  },
  {
    question: 'Which agreements can I start?',
    answer: 'The available templates are supplied by the SaralDocs service. The initial product focus is freelance service agreements; current availability depends on the active templates in your workspace.',
  },
];

export default function FAQSection() {
  return (
    <section id="faq" className="scroll-mt-24 bg-[#f0f1eb] px-5 py-20 dark:bg-[#171e18] sm:px-8 sm:py-24">
      <div className="mx-auto max-w-4xl">
        <Reveal>
          <SectionHeading badge="A few helpful notes" title="Questions, answered plainly." />
        </Reveal>
        <Reveal>
          <Card className="px-5 py-2 sm:px-8">
            {faqs.map((faq) => <FAQItem key={faq.question} {...faq} />)}
          </Card>
        </Reveal>
      </div>
    </section>
  );
}
