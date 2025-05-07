
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Menu, X, User, Bell, ShoppingCart, Heart, Laptop, Camera, Car, Home, ShoppingBag, Watch, Palette, Gift, LayoutDashboard, List } from "lucide-react";
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";

const categories = [
  { id: 0, name: 'All Auctions', icon: List, href: '/auctions' },
  { id: 1, name: 'Electronics', icon: Laptop, href: '/search?category=electronics' },
  { id: 2, name: 'Cameras', icon: Camera, href: '/search?category=cameras' },
  { id: 3, name: 'Vehicles', icon: Car, href: '/search?category=vehicles' },
  { id: 4, name: 'Real Estate', icon: Home, href: '/search?category=real-estate' },
  { id: 5, name: 'Fashion', icon: ShoppingBag, href: '/search?category=fashion' },
  { id: 6, name: 'Watches', icon: Watch, href: '/search?category=watches' },
  { id: 7, name: 'Art', icon: Palette, href: '/search?category=art' },
  { id: 8, name: 'Collectibles', icon: Gift, href: '/search?category=collectibles' },
];

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const handleAuthClick = () => {
    if (user) {
      signOut();
    } else {
      navigate('/auth');
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <span className="text-2xl font-bold bg-gradient-to-r from-auction-purple to-auction-magenta bg-clip-text text-transparent">
                Fast<span className="text-auction-orange">Flip</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="text-sm font-medium hover:text-auction-purple transition-colors">
                    Categories
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="grid grid-cols-2 gap-2 p-4 w-[400px]">
                      {categories.map((category) => (
                        <Link
                          key={category.id}
                          to={category.href}
                          className="flex items-center gap-2 p-2 rounded-md hover:bg-muted transition-colors"
                        >
                          <category.icon className="h-5 w-5 text-muted-foreground" />
                          <span className="text-sm font-medium">{category.name}</span>
                        </Link>
                      ))}
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
            <Link to="/how-it-works" className="text-sm font-medium hover:text-auction-purple transition-colors">
              How It Works
            </Link>
            {user && (
              <Link to="/create-listing" className="text-sm font-medium hover:text-auction-purple transition-colors">
                Create Listing
              </Link>
            )}
          </nav>

          {/* Notification and profile (Desktop) */}
          <div className="hidden md:flex items-center space-x-4">
            <Button variant="ghost" size="icon" aria-label="Notifications">
              <Bell className="h-5 w-5" />
            </Button>
            {user && (
              <Button 
                variant="ghost" 
                size="icon" 
                aria-label="Saved Items"
                onClick={() => navigate('/watch-list')}
              >
                <Heart className="h-5 w-5" />
              </Button>
            )}
            <Button variant="ghost" size="icon" aria-label="Cart">
              <ShoppingCart className="h-5 w-5" />
            </Button>
            {user ? (
              <>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  aria-label="Dashboard"
                  onClick={() => navigate('/dashboard')}
                >
                  <LayoutDashboard className="h-5 w-5" />
                </Button>
                <Button variant="outline" onClick={handleAuthClick} className="gap-2">
                  <User className="h-4 w-4" />
                  <span>Sign Out</span>
                </Button>
              </>
            ) : (
              <Button variant="outline" onClick={handleAuthClick} className="gap-2">
                <User className="h-4 w-4" />
                <span>Sign In</span>
              </Button>
            )}
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
            <Link to="/auctions" className="block py-2 text-sm font-medium">All Auctions</Link>
            <Link to="#" className="block py-2 text-sm font-medium">Categories</Link>
            <Link to="/how-it-works" className="block py-2 text-sm font-medium">How It Works</Link>
            {user && (
              <>
                <Link to="/create-listing" className="block py-2 text-sm font-medium">Create Listing</Link>
                <Link to="/watch-list" className="block py-2 text-sm font-medium">Saved Items</Link>
                <Link to="/dashboard" className="block py-2 text-sm font-medium">Dashboard</Link>
              </>
            )}
            <div className="flex space-x-3 pt-2 border-t">
              <Button 
                variant="outline" 
                className="flex-1 gap-2"
                onClick={handleAuthClick}
              >
                <User className="h-4 w-4" />
                <span>{user ? 'Sign Out' : 'Sign In'}</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
