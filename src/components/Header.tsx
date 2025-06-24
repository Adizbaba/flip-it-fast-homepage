import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Gavel } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import DesktopNavigation from "@/components/navigation/DesktopNavigation";
import MobileNavigation from "@/components/navigation/MobileNavigation";
import UserMenuSection from "@/components/navigation/UserMenuSection";
import { useAuth } from "@/lib/auth";
import { CreateListingModal } from "@/components/CreateListingModal";

// Mock categories data - in a real app, this would come from an API
export const auctionCategories = [
  { id: 1, name: "Electronics", slug: "electronics" },
  { id: 2, name: "Clothing", slug: "clothing" },
  { id: 3, name: "Home & Garden", slug: "home-garden" },
  { id: 4, name: "Collectibles", slug: "collectibles" },
  { id: 5, name: "Jewelry", slug: "jewelry" },
  { id: 6, name: "Motors", slug: "motors" },
];

export const navItems = [
  { name: "Auctions", href: "#", isDropdown: true },
  { name: "Declutter", href: "/declutter" },
  { name: "Discover", href: "#", isDropdown: true },
  { name: "Contact", href: "/contact" },
];

export const discoverItems = [
  { name: "How it Works", href: "/how-it-works" },
  { name: "About Us", href: "/about" },
];

const Header = () => {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [createListingModalOpen, setCreateListingModalOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Close mobile menu when resizing to desktop
    const handleResize = () => {
      if (window.innerWidth >= 768 && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [mobileMenuOpen]);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const handleCreateListingClick = () => {
    setCreateListingModalOpen(true);
  };

  // Prevent body scrolling when mobile menu is open
  useEffect(() => {
    if (isMobile && mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
    } else {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    }
    
    // Cleanup on unmount
    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    };
  }, [mobileMenuOpen, isMobile]);

  return mounted ? (
    <header className="bg-white border-b py-4 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 flex justify-between items-center">
        {/* Logo */}
        <Link 
          to="/" 
          className="flex items-center space-x-2 hover:opacity-80 transition-opacity" 
          onClick={closeMobileMenu}
        >
          <Gavel className="h-6 w-6 text-auction-purple" />
          <span className="font-bold text-lg text-auction-purple">FastFlip</span>
        </Link>

        {/* Desktop Navigation */}
        <DesktopNavigation onCreateListingClick={handleCreateListingClick} />

        {/* Right Side Actions */}
        <UserMenuSection 
          user={user} 
          isMobile={isMobile} 
          toggleMobileMenu={toggleMobileMenu} 
          mobileMenuOpen={mobileMenuOpen} 
        />
      </div>

      {/* Mobile Navigation Overlay */}
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
