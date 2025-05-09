
import { Link } from "react-router-dom";
import { Gavel, Tag, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { auctionCategories, navItems, handleCreateListing } from "@/components/Header";

const DesktopNavigation = () => {
  return (
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
  );
};

export default DesktopNavigation;
