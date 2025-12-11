
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Gavel,
  ShoppingBag,
  Heart,
  CreditCard,
  ListFilter,
  Store,
  DollarSign,
  Bell,
  UserRound,
  Settings,
  PackageOpen,
  Receipt,
  MapPin,
} from "lucide-react";
import { useDashboard } from "@/contexts/DashboardContext";

export function DashboardNav() {
  const { pathname } = useLocation();
  const { activeRole } = useDashboard();
  const [activeGroups, setActiveGroups] = useState<string[]>(['buyer', 'seller', 'account']);

  // Buyer Links
  const buyerLinks = [
    {
      title: "My Bids",
      href: "/dashboard/bids",
      icon: Gavel,
    },
    {
      title: "Won Auctions",
      href: "/dashboard/won-auctions",
      icon: ShoppingBag,
    },
    {
      title: "My Orders",
      href: "/dashboard/orders",
      icon: Receipt,
    },
    {
      title: "Favorites",
      href: "/dashboard/favorites",
      icon: Heart,
    },
    {
      title: "Payment History",
      href: "/dashboard/payment-history",
      icon: CreditCard,
    },
  ];

  // Seller Links
  const sellerLinks = [
    {
      title: "My Listings",
      href: "/dashboard/listings",
      icon: ListFilter,
    },
    {
      title: "Declutter Listings",
      href: "/dashboard/declutter-listings",
      icon: PackageOpen,
    },
    {
      title: "Sold Items",
      href: "/dashboard/sold-items",
      icon: Store,
    },
    {
      title: "Earnings",
      href: "/dashboard/earnings",
      icon: DollarSign,
    },
  ];

  // Common Links
  const commonLinks = [
    {
      title: "Notifications",
      href: "/dashboard/notifications",
      icon: Bell,
    },
    {
      title: "Profile",
      href: "/dashboard/profile",
      icon: UserRound,
    },
    {
      title: "Addresses",
      href: "/dashboard/addresses",
      icon: MapPin,
    },
    {
      title: "Settings",
      href: "/dashboard/settings",
      icon: Settings,
    },
  ];

  const navGroups = [
    {
      id: "buyer",
      title: "Buyer",
      links: buyerLinks,
      visible: activeRole === "buyer" || activeRole === "both",
    },
    {
      id: "seller",
      title: "Seller",
      links: sellerLinks,
      visible: activeRole === "seller" || activeRole === "both",
    },
    {
      id: "account",
      title: "Account",
      links: commonLinks,
      visible: true,
    },
  ];

  // Auto-expand the group containing the active link
  useEffect(() => {
    navGroups.forEach(group => {
      const isActive = group.links.some(link => pathname === link.href || pathname.startsWith(link.href + '/'));
      if (isActive && !activeGroups.includes(group.id)) {
        setActiveGroups(prev => [...prev, group.id]);
      }
    });
  }, [pathname]);

  // Toggle group expansion
  const toggleGroup = (groupId: string) => {
    if (activeGroups.includes(groupId)) {
      setActiveGroups(activeGroups.filter(id => id !== groupId));
    } else {
      setActiveGroups([...activeGroups, groupId]);
    }
  };

  return (
    <nav className="grid gap-2 px-2 py-2">
      {navGroups.map(group => (
        group.visible && (
          <div key={group.id} className="mb-2">
            <h3
              className="cursor-pointer flex items-center justify-between py-2 px-3 mb-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => toggleGroup(group.id)}
            >
              {group.title}
              <span className={`transition-transform text-xs ${activeGroups.includes(group.id) ? 'rotate-90' : ''}`}>
                ❯
              </span>
            </h3>
            {activeGroups.includes(group.id) && (
              <div className="grid gap-1 ml-2">
                {group.links.map(link => (
                  <Link
                    key={link.href}
                    to={link.href}
                  >
                    <Button
                      variant={pathname === link.href || pathname.startsWith(link.href + '/') ? "secondary" : "ghost"}
                      className={cn(
                        "w-full justify-start gap-2 h-9",
                        (pathname === link.href || pathname.startsWith(link.href + '/')) &&
                          "bg-muted font-medium text-foreground"
                      )}
                    >
                      <link.icon className="h-4 w-4" />
                      <span className="truncate">{link.title}</span>
                    </Button>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )
      ))}
    </nav>
  );
}

export default DashboardNav;
