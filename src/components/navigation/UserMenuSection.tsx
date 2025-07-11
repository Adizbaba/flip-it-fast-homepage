import { useNavigate } from "react-router-dom";
import { Menu, X, User, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import CartIcon from "@/components/CartIcon";
import { NotificationCenter } from "@/components/NotificationCenter";
import { useAuth } from "@/lib/auth";

interface UserMenuSectionProps {
  user: any;
  isMobile: boolean;
  toggleMobileMenu: () => void;
  mobileMenuOpen: boolean;
}

const UserMenuSection = ({ 
  user, 
  isMobile, 
  toggleMobileMenu, 
  mobileMenuOpen 
}: UserMenuSectionProps) => {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const handleLogin = () => {
    navigate("/auth");
  };

  const handleSignUp = () => {
    navigate("/auth?mode=signup");
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  const handleNavigateToProfile = () => {
    navigate("/dashboard");
  };

  return (
    <div className="flex items-center space-x-2">
      {!isMobile && (
        <>
          <CartIcon />
          {user && <NotificationCenter />}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full hover:bg-gray-100 transition-colors">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.user_metadata?.avatar_url} alt={user.email || ""} />
                    <AvatarFallback>{user.email ? user.email[0].toUpperCase() : "U"}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-white border shadow-md" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.user_metadata?.full_name || user.email}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleNavigateToProfile} className="cursor-pointer hover:text-auction-purple hover:bg-gray-50">Dashboard</DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/dashboard/orders")} className="cursor-pointer hover:text-auction-purple hover:bg-gray-50">My Orders</DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/cart")} className="cursor-pointer hover:text-auction-purple hover:bg-gray-50">Cart</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer hover:text-auction-purple hover:bg-gray-50">Log out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center space-x-1">
              <Button onClick={handleLogin} variant="ghost" className="hover:bg-gray-100 hover:text-auction-purple transition-colors">
                Log In
              </Button>
              <div className="h-4 w-px bg-gray-300"></div>
              <Button onClick={handleSignUp} variant="ghost" className="hover:bg-gray-100 hover:text-auction-purple transition-colors">
                Sign Up
              </Button>
            </div>
          )}
        </>
      )}

      {/* Mobile Menu Button */}
      {isMobile && (
        <>
          <CartIcon />
          {user && <NotificationCenter />}
          <Button
            variant="ghost" 
            size="sm" 
            onClick={toggleMobileMenu}
            className="hover:bg-gray-100 transition-colors"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </>
      )}
    </div>
  );
};

export default UserMenuSection;
