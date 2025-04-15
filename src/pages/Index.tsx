
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import AuctionSection from "@/components/AuctionSection";
import CategorySection from "@/components/CategorySection";
import HowItWorks from "@/components/HowItWorks";
import Testimonials from "@/components/Testimonials";
import Footer from "@/components/Footer";
import { featuredAuctions, endingSoonAuctions } from "@/data/auctions";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main>
        <HeroSection />
        <CategorySection />
        <AuctionSection title="Featured Auctions" auctions={featuredAuctions} />
        <AuctionSection title="Ending Soon" auctions={endingSoonAuctions} />
        <HowItWorks />
        <Testimonials />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
