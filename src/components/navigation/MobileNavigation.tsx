
import { Link, useNavigate } from "react-router-dom";
import { 
  Gavel, 
  Tag, 
  Plus, 
  User, 
  Smartphone, 
  Shirt, 
  Home, 
  Trophy, 
  Gem, // Changed from Ring to Gem
  Car 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/lib/auth";
import { auctionCategories, navItems } from "@/components/Header";

interface MobileNavigationProps {
  user: any;
  closeMobileMenu: () => void;
  onCreateListing: () => void;
}

const MobileNavigation = ({ user, closeMobileMenu, onCreateListing }: MobileNavigationProps) => {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const handleLogin = () => {
    navigate("/auth");
    closeMobileMenu();
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/");
    closeMobileMenu();
  };

  // Function to get the appropriate icon for each category
  const getCategoryIcon = (slug: string) => {
    switch (slug) {
      case "electronics":
        return <Smartphone className="h-5 w-5" />;
      case "clothing":
        return <Shirt className="h-5 w-5" />;
      case "home-garden":
        return <Home className="h-5 w-5" />;
      case "collectibles":
        return <Trophy className="h-5 w-5" />;
      case "jewelry":
        return <Gem className="h-5 w-5" />; // Changed from Ring to Gem
      case "motors":
        return <Car className="h-5 w-5" />;
      default:
        return <Tag className="h-5 w-5" />;
    }
  };

  return (
    <div className="fixed inset-0 top-16 bg-white z-50 p-4 overflow-auto animate-in fade-in slide-in-from-top duration-300">
      <nav className="flex flex-col space-y-4">
        {/* Create Listing Button */}
        <Button 
          onClick={() => {
            onCreateListing();
            closeMobileMenu();
          }} 
          className="w-full bg-auction-purple hover:bg-purple-700 text-white flex items-center justify-center gap-2 mb-4"
        >
          <Plus className="h-4 w-4" />
          Create Listing
        </Button>
        
        {/* Auctions dropdown for mobile */}
        <div className="space-y-2">
          <div className="flex items-center justify-between py-2 border-b">
            <span className="font-medium text-gray-800">Auctions</span>
          </div>
          <div className="pl-4 space-y-2">
            <Link
              to="/auctions"
              className="flex items-center space-x-2 text-gray-600 hover:text-auction-purple hover:bg-gray-50 rounded-md p-2 transition-colors"
              onClick={closeMobileMenu}
            >
              <Gavel className="h-5 w-5" />
              <span>All Auctions</span>
            </Link>
            {auctionCategories.map((category) => (
              <Link
                key={category.id}
                to={`/auctions/category/${category.slug}`}
                className="flex items-center space-x-2 text-gray-600 hover:text-auction-purple hover:bg-gray-50 rounded-md p-2 transition-colors transform hover:scale-105 duration-200"
                onClick={closeMobileMenu}
              >
                {getCategoryIcon(category.slug)}
                <span>{category.name}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Other nav items for mobile */}
        {navItems.filter(item => !item.isDropdown).map((item) => (
          <Link
            key={item.name}
            to={item.href}
            className="text-gray-600 hover:text-auction-purple hover:bg-gray-50 transition-colors py-2 px-2 border-b rounded-md"
            onClick={closeMobileMenu}
          >
            {item.name}
          </Link>
        ))}
        
        {user ? (
          <>
            <div className="flex items-center space-x-3 py-4 border-t mt-2">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user.user_metadata?.avatar_url} alt={user.email || ""} />
                <AvatarFallback>{user.email ? user.email[0].toUpperCase() : "U"}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{user.user_metadata?.full_name || user.email}</p>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
            </div>
            <Link
              to="/dashboard"
              className="flex items-center space-x-2 text-gray-600 hover:text-auction-purple hover:bg-gray-50 rounded-md p-2 transition-colors"
              onClick={closeMobileMenu}
            >
              <User className="h-5 w-5" />
              <span>Dashboard</span>
            </Link>
            <Link
              to="/dashboard/orders"
              className="flex items-center space-x-2 text-gray-600 hover:text-auction-purple hover:bg-gray-50 rounded-md p-2 transition-colors"
              onClick={closeMobileMenu}
            >
              <Gavel className="h-5 w-5" />
              <span>My Orders</span>
            </Link>
            <Button onClick={handleLogout} className="w-full mt-4">
              Log out
            </Button>
          </>
        ) : (
          <Button onClick={handleLogin} className="w-full mt-4">
            Sign In
          </Button>
        )}
      </nav>
    </div>
  );
};

export default MobileNavigation;
