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
  Gem,
  Car,
  ShoppingCart
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

  const handleSignUp = () => {
    navigate("/auth?mode=signup");
    closeMobileMenu();
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/");
    closeMobileMenu();
  };

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
        return <Gem className="h-5 w-5" />;
      case "motors":
        return <Car className="h-5 w-5" />;
      default:
        return <Tag className="h-5 w-5" />;
    }
  };

  return (
    <div className="fixed inset-0 top-16 bg-white z-40 overflow-auto">
      <div className="p-4 pb-8">
        <nav className="flex flex-col space-y-4">
          {/* Create Listing Button */}
          <Button 
            onClick={() => {
              onCreateListing();
            }} 
            className="w-full bg-auction-purple hover:bg-purple-700 text-white flex items-center justify-center gap-2 mb-4 h-12 text-base font-medium"
          >
            <Plus className="h-5 w-5" />
            Create Listing
          </Button>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between py-3 border-b border-gray-200">
              <span className="font-semibold text-gray-800 text-lg">Auctions</span>
            </div>
            <div className="pl-2 space-y-1">
              <Link
                to="/auctions"
                className="flex items-center space-x-3 text-gray-600 hover:text-auction-purple hover:bg-gray-50 rounded-lg p-3 transition-colors min-h-[48px]"
                onClick={closeMobileMenu}
              >
                <Gavel className="h-5 w-5" />
                <span className="text-base">All Auctions</span>
              </Link>
              <Link
                to="/browse-categories"
                className="flex items-center space-x-3 text-gray-600 hover:text-auction-purple hover:bg-gray-50 rounded-lg p-3 transition-colors min-h-[48px]"
                onClick={closeMobileMenu}
              >
                <Tag className="h-5 w-5" />
                <span className="text-base">Browse Categories</span>
              </Link>
              {auctionCategories.map((category) => (
                <Link
                  key={category.id}
                  to={`/auctions/category/${category.slug}`}
                  className="flex items-center space-x-3 text-gray-600 hover:text-auction-purple hover:bg-gray-50 rounded-lg p-3 transition-colors transform hover:scale-[1.02] duration-200 min-h-[48px]"
                  onClick={closeMobileMenu}
                >
                  {getCategoryIcon(category.slug)}
                  <span className="text-base">{category.name}</span>
                </Link>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4">
            {navItems.filter(item => !item.isDropdown).map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="flex items-center text-gray-600 hover:text-auction-purple hover:bg-gray-50 transition-colors py-3 px-3 rounded-lg text-base font-medium min-h-[48px]"
                onClick={closeMobileMenu}
              >
                {item.name}
              </Link>
            ))}
          </div>
          
          {user ? (
            <div className="border-t border-gray-200 pt-4 mt-4">
              <div className="flex items-center space-x-3 py-4 px-3 bg-gray-50 rounded-lg mb-4">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user.user_metadata?.avatar_url} alt={user.email || ""} />
                  <AvatarFallback>{user.email ? user.email[0].toUpperCase() : "U"}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{user.user_metadata?.full_name || user.email}</p>
                  <p className="text-sm text-gray-500 truncate">{user.email}</p>
                </div>
              </div>
              
              <div className="space-y-1">
                <Link
                  to="/dashboard"
                  className="flex items-center space-x-3 text-gray-600 hover:text-auction-purple hover:bg-gray-50 rounded-lg p-3 transition-colors min-h-[48px]"
                  onClick={closeMobileMenu}
                >
                  <User className="h-5 w-5" />
                  <span className="text-base">Dashboard</span>
                </Link>
                <Link
                  to="/dashboard/orders"
                  className="flex items-center space-x-3 text-gray-600 hover:text-auction-purple hover:bg-gray-50 rounded-lg p-3 transition-colors min-h-[48px]"
                  onClick={closeMobileMenu}
                >
                  <Gavel className="h-5 w-5" />
                  <span className="text-base">My Orders</span>
                </Link>
                <Link
                  to="/cart"
                  className="flex items-center space-x-3 text-gray-600 hover:text-auction-purple hover:bg-gray-50 rounded-lg p-3 transition-colors min-h-[48px]"
                  onClick={closeMobileMenu}
                >
                  <ShoppingCart className="h-5 w-5" />
                  <span className="text-base">Cart</span>
                </Link>
              </div>
              
              <Button 
                onClick={handleLogout} 
                variant="outline"
                className="w-full mt-4 h-12 text-base font-medium"
              >
                Sign Out
              </Button>
            </div>
          ) : (
            <div className="border-t border-gray-200 pt-4 mt-4">
              <div className="flex flex-col space-y-3">
                <Button 
                  onClick={handleLogin} 
                  className="w-full h-12 text-base font-medium bg-auction-purple hover:bg-purple-700"
                >
                  Log In
                </Button>
                <Button 
                  onClick={handleSignUp} 
                  variant="outline"
                  className="w-full h-12 text-base font-medium border-auction-purple text-auction-purple hover:bg-auction-purple hover:text-white"
                >
                  Sign Up
                </Button>
              </div>
            </div>
          )}
        </nav>
      </div>
    </div>
  );
};

export default MobileNavigation;
