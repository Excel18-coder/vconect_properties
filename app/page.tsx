import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { HeroSection } from '@/components/hero-section';
import { PropertyCategories } from '@/components/property-categories';
import { FeaturedProperties } from '@/components/featured-properties';
import { WhyChooseUs } from '@/components/why-choose-us';
import { LatestListings } from '@/components/latest-listings';
import { Statistics } from '@/components/statistics';
import { Testimonials } from '@/components/testimonials';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <PropertyCategories />
        <FeaturedProperties />
        <WhyChooseUs />
        <LatestListings />
        <Statistics />
        <Testimonials />
      </main>
      <Footer />
    </div>
  );
}
