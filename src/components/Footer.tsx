import { Facebook, Twitter, Instagram, Youtube } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";

const Footer = () => {
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
    <footer className="bg-auction-dark text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <div className="mb-4">
              <img 
                src="/lovable-uploads/440a9b3f-f502-457a-9c31-af487096144e.png" 
                alt="FastFlip"
                className="h-10 w-auto brightness-0 invert"
              />
            </div>
            <p className="text-gray-400 mb-4">
              The fastest way to buy and sell in online auctions. Find great deals or sell your items today!
            </p>
            <div className="flex space-x-4">
              <a href="#" aria-label="Facebook" className="text-gray-400 hover:text-white transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" aria-label="Twitter" className="text-gray-400 hover:text-white transition-colors">
                <Twitter size={20} />
              </a>
              <a href="#" aria-label="Instagram" className="text-gray-400 hover:text-white transition-colors">
                <Instagram size={20} />
              </a>
              <a href="#" aria-label="Youtube" className="text-gray-400 hover:text-white transition-colors">
                <Youtube size={20} />
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><a href="/auctions" className="text-gray-400 hover:text-white transition-colors">All Auctions</a></li>
              <li><a href="/search" className="text-gray-400 hover:text-white transition-colors">Categories</a></li>
              <li><a href="/how-it-works" className="text-gray-400 hover:text-white transition-colors">How It Works</a></li>
              <li>
                <button
                  onClick={handleStartSelling}
                  className="text-gray-400 hover:text-white transition-colors text-left"
                >
                  Sell an Item
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Customer Service</h3>
            <ul className="space-y-2">
              <li><a href="/contact" className="text-gray-400 hover:text-white transition-colors">Contact Us</a></li>
              <li><a href="/how-it-works#faq" className="text-gray-400 hover:text-white transition-colors">FAQs</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Returns & Refunds</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Shipping Info</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">About FastFlip</h3>
            <ul className="space-y-2">
              <li><a href="/about" className="text-gray-400 hover:text-white transition-colors">About Us</a></li>
              <li><a href="/privacy-policy" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="/terms-of-service" className="text-gray-400 hover:text-white transition-colors">Terms of Service</a></li>
              <li><a href="/careers" className="text-gray-400 hover:text-white transition-colors">Careers</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2025 FastFlip. All rights reserved.
            </p>
            <div className="mt-4 md:mt-0">
              <img 
                src="https://via.placeholder.com/240x30?text=Payment+Methods" 
                alt="Payment Methods"
                className="h-8"
              />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
