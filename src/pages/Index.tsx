
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import CategorySection from "@/components/CategorySection";
import HowItWorks from "@/components/HowItWorks";
import Testimonials from "@/components/Testimonials";
import Footer from "@/components/Footer";
import FeaturedAuctionsSection from "@/components/FeaturedAuctionsSection";
import AuctionSection from "@/components/AuctionSection";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, PackageOpen } from "lucide-react";
import { endingSoonAuctions } from "@/data/auctions";
import { Card, CardContent } from "@/components/ui/card";
import SEO from "@/components/SEO";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate("/search");
    }
  };

  const handleSearchClick = (query: string) => {
    navigate(`/search?q=${encodeURIComponent(query)}`);
  };

return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <SEO
        title="FastFlip – Buy, Sell & Bid Deals"
        description="Discover auctions and buy-now deals across categories on FastFlip. Browse, bid, or buy instantly."
        type="website"
      />
      <main>
        <HeroSection />
        
        {/* Enhanced Search Section */}
        <section className="py-8 md:py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center mb-6 md:mb-8">
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">Find Your Perfect Item</h2>
              <p className="text-muted-foreground text-sm md:text-base">Search thousands of auctions for the items you love</p>
            </div>
            <form onSubmit={handleSearch} className="max-w-3xl mx-auto relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search for items, categories, or sellers..."
                className="pl-12 pr-20 md:pr-28 h-12 md:h-14 text-base md:text-lg"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onClick={() => navigate('/search')}
              />
              <Button 
                type="submit" 
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 md:h-10 px-3 md:px-4 text-sm md:text-base"
              >
                Search
              </Button>
            </form>
            <div className="max-w-3xl mx-auto mt-4 flex flex-wrap justify-center gap-2">
              <span className="text-sm text-muted-foreground">Popular searches:</span>
              {["Watches", "Electronics", "Vintage", "Collectibles", "Jewelry"].map((term) => (
                <button 
                  key={term}
                  onClick={() => handleSearchClick(term)}
                  className="text-sm text-primary hover:underline transition-colors"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        </section>
        
        <section className="py-8 md:py-12">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 items-center">
              <Card className="shadow-lg border-0">
                <CardContent className="flex flex-col items-center justify-center p-6 md:p-8">
                  <h2 className="text-xl md:text-2xl font-bold mb-4 text-center">Looking for Bulk Deals?</h2>
                  <PackageOpen className="h-16 md:h-24 w-16 md:w-24 text-auction-purple mb-4" />
                  <p className="text-center mb-6 text-sm md:text-base">
                    Visit our Declutter Marketplace for great deals on bulk quantities and help sellers clear their inventory.
                  </p>
                  <Button 
                    className="w-full max-w-xs h-11 text-base"
                    onClick={() => navigate('/declutter')}
                  >
                    Shop Declutter Items
                  </Button>
                </CardContent>
              </Card>
              
              <div className="space-y-4">
                <h2 className="text-xl md:text-2xl font-bold">Declutter Marketplace</h2>
                <p className="text-sm md:text-base">
                  Our new Declutter section is perfect for buyers looking for bulk deals and sellers 
                  wanting to clear inventory quickly. No bidding required - just fixed price bulk listings!
                </p>
                <ul className="space-y-2">
                  {[
                    "Buy in bulk at discounted prices",
                    "Find unique items from sellers clearing inventory", 
                    "Great for resellers, collectors, and wholesale buyers",
                    "Direct contact with sellers for questions"
                  ].map((item, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-auction-purple flex-shrink-0"></div>
                      <span className="text-sm md:text-base">{item}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  variant="outline"
                  className="mt-4 h-11"
                  onClick={() => navigate('/declutter')}
                >
                  Learn More
                </Button>
              </div>
            </div>
          </div>
        </section>
        
        <CategorySection />
        <FeaturedAuctionsSection />
        <AuctionSection title="Ending Soon" auctions={endingSoonAuctions} />
        <HowItWorks />
        <Testimonials />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
