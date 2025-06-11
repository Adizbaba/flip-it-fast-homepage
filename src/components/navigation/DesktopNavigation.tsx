
import { Link } from "react-router-dom";
import { 
  Gavel, 
  Tag, 
  Plus, 
  Smartphone, 
  Shirt, 
  Home, 
  Trophy, 
  Gem, // Changed from Ring to Gem
  Car
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { auctionCategories, navItems } from "@/components/Header";

interface DesktopNavigationProps {
  onCreateListingClick: () => void;
}

const DesktopNavigation = ({ onCreateListingClick }: DesktopNavigationProps) => {
  // Function to get the appropriate icon for each category
  const getCategoryIcon = (slug: string) => {
    switch (slug) {
      case "electronics":
        return <Smartphone className="h-4 w-4" />;
      case "clothing":
        return <Shirt className="h-4 w-4" />;
      case "home-garden":
        return <Home className="h-4 w-4" />;
      case "collectibles":
        return <Trophy className="h-4 w-4" />;
      case "jewelry":
        return <Gem className="h-4 w-4" />;
      case "motors":
        return <Car className="h-4 w-4" />;
      default:
        return <Tag className="h-4 w-4" />;
    }
  };

  return (
    <div className="hidden md:flex items-center space-x-6">
      {/* Main navigation */}
      <nav className="flex items-center space-x-6">
        {navItems.map((item) => (
          item.isDropdown ? (
            <DropdownMenu key={item.name}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="group flex items-center gap-1">
                  {item.name}
                  <svg
                    className="h-4 w-4 transition-transform duration-200 group-data-[state=open]:rotate-180"
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="w-56 bg-white border shadow-md" sideOffset={8}>
                <DropdownMenuItem asChild>
                  <Link 
                    to="/auctions" 
                    className="flex items-center gap-2 cursor-pointer transition-colors hover:text-auction-purple"
                  >
                    <Gavel className="h-4 w-4" />
                    <span>All Auctions</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link 
                    to="/browse-categories" 
                    className="flex items-center gap-2 cursor-pointer transition-colors hover:text-auction-purple"
                  >
                    <Tag className="h-4 w-4" />
                    <span>Browse Categories</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {auctionCategories.map((category) => (
                  <DropdownMenuItem key={category.id} asChild>
                    <Link 
                      to={`/auctions/category/${category.slug}`} 
                      className="flex items-center gap-2 cursor-pointer transition-colors hover:text-auction-purple hover:scale-105 duration-200"
                    >
                      {getCategoryIcon(category.slug)}
                      <span>{category.name}</span>
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link
              key={item.name}
              to={item.href}
              className="text-gray-600 hover:text-auction-purple transition-colors"
            >
              {item.name}
            </Link>
          )
        ))}
      </nav>
      
      {/* Create Listing Button */}
      <Button 
        onClick={onCreateListingClick} 
        className="bg-auction-purple hover:bg-purple-700 text-white flex items-center gap-2"
      >
        <Plus className="h-4 w-4" />
        Create Listing
      </Button>
    </div>
  );
};

export default DesktopNavigation;
