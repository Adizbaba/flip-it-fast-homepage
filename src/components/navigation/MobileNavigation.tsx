import { Link, useNavigate } from "react-router-dom";
import { Gavel, Tag, Plus, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/lib/auth";
import { auctionCategories, navItems, handleCreateListing } from "@/components/Header";

interface MobileNavigationProps {
  user: any;
  closeMobileMenu: () => void;
}

const MobileNavigation = ({ user, closeMobileMenu }: MobileNavigationProps) => {
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

  const handleCreateListingClick = () => {
    handleCreateListing();
    closeMobileMenu();
  };

  return (
    <div className="fixed inset-0 top-16 bg-white z-50 p-4 overflow-auto">
      <nav className="flex flex-col space-y-4">
        {/* Auctions dropdown for mobile */}
        <div className="space-y-2">
          <div className="flex items-center justify-between py-2 border-b">
            <span className="text-gray-600">Auctions</span>
          </div>
          <div className="pl-4 space-y-2">
            <Link
              to="/auctions"
              className="flex items-center space-x-2 text-gray-600 hover:text-auction-purple transition-colors py-2"
              onClick={closeMobileMenu}
            >
              <Gavel className="h-5 w-5" />
              <span>All Auctions</span>
            </Link>
            {auctionCategories.map((category) => (
              <Link
                key={category.id}
                to={`/auctions/category/${category.slug}`}
                className="flex items-center space-x-2 text-gray-600 hover:text-auction-purple transition-colors py-2"
                onClick={closeMobileMenu}
              >
                <Tag className="h-5 w-5" />
                <span>{category.name}</span>
              </Link>
            ))}
            <button
              onClick={handleCreateListingClick}
              className="flex w-full items-center space-x-2 text-gray-600 hover:text-auction-purple transition-colors py-2"
            >
              <Plus className="h-5 w-5" />
              <span>Create Listing</span>
            </button>
          </div>
        </div>

        {/* Other nav items for mobile */}
        {navItems.filter(item => !item.isDropdown).map((item) => (
          <Link
            key={item.name}
            to={item.href}
            className="text-gray-600 hover:text-auction-purple transition-colors py-2 border-b"
            onClick={closeMobileMenu}
          >
            {item.name}
          </Link>
        ))}
        
        {user ? (
          <>
            <div className="flex items-center space-x-3 py-4">
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
              className="flex items-center space-x-2 text-gray-600 hover:text-auction-purple transition-colors py-2 border-b"
              onClick={closeMobileMenu}
            >
              <User className="h-5 w-5" />
              <span>Dashboard</span>
            </Link>
            <Link
              to="/dashboard/orders"
              className="flex items-center space-x-2 text-gray-600 hover:text-auction-purple transition-colors py-2 border-b"
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
