
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Gavel, Plus } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import DesktopNavigation from "@/components/navigation/DesktopNavigation";
import MobileNavigation from "@/components/navigation/MobileNavigation";
import UserMenuSection from "@/components/navigation/UserMenuSection";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { CreateListingModal } from "@/components/CreateListingModal";

// Mock categories data - in a real app, this would come from an API
export const auctionCategories = [
  { id: 1, name: "Electronics", slug: "electronics" },
  { id: 2, name: "Clothing", slug: "clothing" },
  { id: 3, name: "Home & Garden", slug: "home-garden" },
  { id: 4, name: "Collectibles", slug: "collectibles" },
  { id: 5, name: "Jewelry", slug: "jewelry" },
];

export const navItems = [
  { name: "Auctions", href: "#", isDropdown: true },
  { name: "Declutter", href: "/declutter" },
  { name: "How it Works", href: "/how-it-works" },
  { name: "About", href: "/about" },
  { name: "Contact", href: "/contact" },
];

const Header = () => {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [createListingModalOpen, setCreateListingModalOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const handleCreateListingClick = () => {
    setCreateListingModalOpen(true);
  };

  return mounted ? (
    <header className="bg-white border-b py-4 sticky top-0 z-40">
      <div className="container mx-auto px-4 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2" onClick={closeMobileMenu}>
          <Gavel className="h-6 w-6 text-auction-purple" />
          <span className="font-bold text-lg text-auction-purple">FastFlip</span>
        </Link>

        {/* Desktop Navigation */}
        {!isMobile && <DesktopNavigation />}

        {/* Create Listing Button */}
        {!isMobile && (
          <Button 
            onClick={handleCreateListingClick} 
            className="mr-4 bg-auction-purple hover:bg-purple-700 text-white flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Create Listing
          </Button>
        )}

        {/* Right Side Actions */}
        <UserMenuSection 
          user={user} 
          isMobile={isMobile} 
          toggleMobileMenu={toggleMobileMenu} 
          mobileMenuOpen={mobileMenuOpen} 
        />
      </div>

      {/* Mobile Navigation */}
      {isMobile && mobileMenuOpen && (
        <MobileNavigation 
          user={user} 
          closeMobileMenu={closeMobileMenu} 
          onCreateListing={() => {
            setCreateListingModalOpen(true);
            closeMobileMenu();
          }}
        />
      )}

      {/* Create Listing Modal */}
      <CreateListingModal 
        open={createListingModalOpen} 
        onOpenChange={setCreateListingModalOpen} 
      />
    </header>
  ) : null;
};

export default Header;
