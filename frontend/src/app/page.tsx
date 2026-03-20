import HomepageNavbar from '@/components/homepage/HomepageNavbar';
import HeroSection from '@/components/homepage/HeroSection';
import FarmerBenefitsSection from '@/components/homepage/FarmerBenefitsSection';
import ImpactSection from '@/components/homepage/ImpactSection';
import HowItWorksProSection from '@/components/homepage/HowItWorksProSection';
import TrustSection from '@/components/homepage/TrustSection';
import ProductShowcaseSection from '@/components/homepage/ProductShowcaseSection';
import TestimonialsSection from '@/components/homepage/TestimonialsSection';
import FinalCTASection from '@/components/homepage/FinalCTASection';
import HomepageFooter from '@/components/homepage/HomepageFooter';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-950 selection:bg-primary-500/30">
      <HomepageNavbar />
      <main>
        <HeroSection />
        <FarmerBenefitsSection />
        <ImpactSection />
        <HowItWorksProSection />
        <TrustSection />
        <ProductShowcaseSection />
        <TestimonialsSection />
        <FinalCTASection />
      </main>
      <HomepageFooter />
    </div>
  );
}
