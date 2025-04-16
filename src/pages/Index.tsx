
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import AuctionSection from "@/components/AuctionSection";
import CategorySection from "@/components/CategorySection";
import HowItWorks from "@/components/HowItWorks";
import Testimonials from "@/components/Testimonials";
import Footer from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { featuredAuctions, endingSoonAuctions } from "@/data/auctions";

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

  // Function to handle direct navigation to search page for popular searches
  const handleSearchClick = (query: string) => {
    navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main>
        <HeroSection />
        
        {/* Enhanced Search Section */}
        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center mb-8">
              <h2 className="text-3xl font-bold tracking-tight mb-2">Find Your Perfect Item</h2>
              <p className="text-muted-foreground">Search thousands of auctions for the items you love</p>
            </div>
            <form onSubmit={handleSearch} className="max-w-3xl mx-auto relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search for items, categories, or sellers..."
                className="pl-12 pr-28 h-14 text-lg"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onClick={() => navigate('/search')}
              />
              <Button 
                type="submit" 
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-10"
              >
                Search
              </Button>
            </form>
            <div className="max-w-3xl mx-auto mt-4 flex flex-wrap justify-center gap-2">
              <span className="text-sm text-muted-foreground">Popular searches:</span>
              <button 
                onClick={() => handleSearchClick("Watches")}
                className="text-sm text-primary hover:underline"
              >
                Watches
              </button>
              <button 
                onClick={() => handleSearchClick("Electronics")}
                className="text-sm text-primary hover:underline"
              >
                Electronics
              </button>
              <button 
                onClick={() => handleSearchClick("Vintage")}
                className="text-sm text-primary hover:underline"
              >
                Vintage
              </button>
              <button 
                onClick={() => handleSearchClick("Collectibles")}
                className="text-sm text-primary hover:underline"
              >
                Collectibles
              </button>
              <button 
                onClick={() => handleSearchClick("Jewelry")}
                className="text-sm text-primary hover:underline"
              >
                Jewelry
              </button>
            </div>
          </div>
        </section>
        
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
