
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Menu, X, User, Bell, ShoppingCart } from "lucide-react";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <div className="flex items-center">
            <a href="/" className="flex items-center">
              <span className="text-2xl font-bold bg-gradient-to-r from-auction-purple to-auction-magenta bg-clip-text text-transparent">
                Fast<span className="text-auction-orange">Flip</span>
              </span>
            </a>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <a href="#" className="text-sm font-medium hover:text-auction-purple transition-colors">All Auctions</a>
            <a href="#" className="text-sm font-medium hover:text-auction-purple transition-colors">Categories</a>
            <a href="#" className="text-sm font-medium hover:text-auction-purple transition-colors">How It Works</a>
            <a href="#" className="text-sm font-medium hover:text-auction-purple transition-colors">Sell an Item</a>
          </nav>

          {/* Search, notification and profile (Desktop) */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search auctions..."
                className="w-[200px] pl-8 rounded-full bg-muted/50 border-0 focus-visible:ring-auction-purple"
              />
            </div>
            <Button variant="ghost" size="icon" aria-label="Notifications">
              <Bell className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" aria-label="Cart">
              <ShoppingCart className="h-5 w-5" />
            </Button>
            <Button variant="outline" className="gap-2">
              <User className="h-4 w-4" />
              <span>Login</span>
            </Button>
            <Button>Sign Up</Button>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-md"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t py-4">
          <div className="container mx-auto px-4 flex flex-col space-y-4">
            <div className="relative mb-2">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search auctions..."
                className="w-full pl-8 rounded-full bg-muted/50 border-0"
              />
            </div>
            <a href="#" className="block py-2 text-sm font-medium">All Auctions</a>
            <a href="#" className="block py-2 text-sm font-medium">Categories</a>
            <a href="#" className="block py-2 text-sm font-medium">How It Works</a>
            <a href="#" className="block py-2 text-sm font-medium">Sell an Item</a>
            <div className="flex space-x-3 pt-2 border-t">
              <Button variant="outline" className="flex-1 gap-2">
                <User className="h-4 w-4" />
                <span>Login</span>
              </Button>
              <Button className="flex-1">Sign Up</Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
