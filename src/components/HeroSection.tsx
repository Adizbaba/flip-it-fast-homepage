
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";

const HeroSection = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleStartSelling = () => {
    if (user) {
      navigate("/create-listing");
    } else {
      navigate("/auth");
    }
  };

  return (
    <section className="relative bg-gradient-to-tr from-auction-purple to-auction-magenta py-12 md:py-20">
      <div className="absolute inset-0 pattern-dots pattern-blue-500 pattern-bg-white pattern-size-4 pattern-opacity-10"></div>
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center text-white">
          <h1 className="text-3xl md:text-5xl font-bold mb-6">
            Buy & Sell <span className="text-auction-orange">Fast</span> with Live Auctions
          </h1>
          <p className="text-lg md:text-xl mb-8 opacity-90">
            Find amazing deals or sell your items quickly on our fast-paced auction platform
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button size="lg" className="bg-white text-auction-purple hover:bg-gray-100 text-lg px-6">
              Explore Auctions
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="bg-transparent border-white text-white hover:bg-white/10 text-lg px-6"
              onClick={handleStartSelling}
            >
              Start Selling
            </Button>
          </div>
          
          <div className="mt-12">
            <p className="text-sm mb-4 opacity-80">Featured Auctions</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="bg-white/10 backdrop-blur-sm rounded-lg p-2 hover:bg-white/20 transition-colors cursor-pointer">
                  <div className="aspect-square rounded-md bg-gray-200/50 animate-pulse mb-2"></div>
                  <div className="h-5 bg-white/20 w-3/4 rounded animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
