
import { useNavigate } from "react-router-dom";
import { Menu, X, User } from "lucide-react";
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
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.user_metadata?.avatar_url} alt={user.email || ""} />
                    <AvatarFallback>{user.email ? user.email[0].toUpperCase() : "U"}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.user_metadata?.full_name || user.email}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleNavigateToProfile}>Dashboard</DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/dashboard/orders")}>My Orders</DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/cart")}>Cart</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>Log out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button onClick={handleLogin} variant="ghost">
              Sign In
            </Button>
          )}
        </>
      )}

      {/* Mobile Menu Button */}
      {isMobile && (
        <>
          <CartIcon />
          <Button variant="ghost" size="sm" onClick={toggleMobileMenu}>
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </>
      )}
    </div>
  );
};

export default UserMenuSection;
