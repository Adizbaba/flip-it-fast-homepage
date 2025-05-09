
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Gavel, Menu, X, User, Tag, Plus } from "lucide-react";
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
import { createListingModal } from "@/components/CreateListingModal";

// Mock categories data - in a real app, this would come from an API
const auctionCategories = [
  { id: 1, name: "Electronics", slug: "electronics" },
  { id: 2, name: "Clothing", slug: "clothing" },
  { id: 3, name: "Home & Garden", slug: "home-garden" },
  { id: 4, name: "Collectibles", slug: "collectibles" },
  { id: 5, name: "Jewelry", slug: "jewelry" },
];

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

  const handleCreateListing = () => {
    createListingModal();
    closeMobileMenu();
  };

  const navItems = [
    { name: "Auctions", href: "#", isDropdown: true },
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
          <span className="font-bold text-lg text-auction-purple">FastFlip</span>
        </Link>

        {/* Desktop Navigation */}
        {!isMobile && (
          <nav className="hidden md:flex items-center space-x-6">
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
                  <DropdownMenuContent align="center" className="w-56">
                    <DropdownMenuItem asChild>
                      <Link 
                        to="/auctions" 
                        className="flex items-center gap-2 cursor-pointer transition-colors hover:text-auction-purple"
                      >
                        <Gavel className="h-4 w-4" />
                        <span>All Auctions</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {auctionCategories.map((category) => (
                      <DropdownMenuItem key={category.id} asChild>
                        <Link 
                          to={`/auctions/category/${category.slug}`} 
                          className="flex items-center gap-2 cursor-pointer transition-colors hover:text-auction-purple"
                        >
                          <Tag className="h-4 w-4" />
                          <span>{category.name}</span>
                        </Link>
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onSelect={handleCreateListing}>
                      <div className="flex items-center gap-2 cursor-pointer transition-colors hover:text-auction-purple">
                        <Plus className="h-4 w-4" />
                        <span>Create Listing</span>
                      </div>
                    </DropdownMenuItem>
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
                  onClick={handleCreateListing}
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
      )}
    </header>
  ) : null;
};

export default Header;
