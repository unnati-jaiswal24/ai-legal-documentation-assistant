import SaralDocsHero from '../components/SaralDocsHero';
import LiveDemoSection from '../sections/LiveDemoSection';
import HowItWorksSection from '../sections/HowItWorksSection';
import FeaturesSection from '../sections/FeaturesSection';
import TemplatesSection from '../sections/TemplatesSection';
import TrustSection from '../sections/TrustSection';
import FinalCTASection from '../sections/FinalCTASection';
import FAQSection from '../sections/FAQSection';

export default function Home() {
  return (
    <main className="bg-[#faf9f6] text-[#202820] dark:bg-[#101410] dark:text-[#f1f3ee]">
      <SaralDocsHero />
      <LiveDemoSection />
      <TemplatesSection />
      <HowItWorksSection />
      <FeaturesSection />
      <TrustSection />
      <FAQSection />
      <FinalCTASection />
    </main>
  );
}
