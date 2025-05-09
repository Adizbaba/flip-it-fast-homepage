import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Gavel, Menu, X, User } from "lucide-react";
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
import { useAuth } from "@/lib/auth";
import { useIsMobile } from "@/hooks/use-mobile";
import CartIcon from "@/components/CartIcon";

const Header = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const navItems = [
    { name: "Auctions", href: "/auctions" },
    { name: "Declutter", href: "/declutter" },
    { name: "How it Works", href: "/how-it-works" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ];

  const handleLogin = () => {
    navigate("/auth");
    closeMobileMenu();
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/");
    closeMobileMenu();
  };

  const handleNavigateToProfile = () => {
    navigate("/dashboard");
    closeMobileMenu();
  };

  return mounted ? (
    <header className="bg-white border-b py-4 sticky top-0 z-40">
      <div className="container mx-auto px-4 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2" onClick={closeMobileMenu}>
          <Gavel className="h-6 w-6 text-auction-purple" />
          <span className="font-bold text-lg text-auction-purple">BidHub</span>
        </Link>

        {/* Desktop Navigation */}
        {!isMobile && (
          <nav className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="text-gray-600 hover:text-auction-purple transition-colors"
              >
                {item.name}
              </Link>
            ))}
          </nav>
        )}

        {/* Right Side Actions */}
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
      </div>

      {/* Mobile Navigation */}
      {isMobile && mobileMenuOpen && (
        <div className="fixed inset-0 top-16 bg-white z-50 p-4 overflow-auto">
          <nav className="flex flex-col space-y-4">
            {navItems.map((item) => (
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
      )}
    </header>
  ) : null;
};

export default Header;
