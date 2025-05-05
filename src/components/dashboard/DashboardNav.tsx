
import { useLocation, useNavigate } from "react-router-dom";
import { 
  SidebarGroup, 
  SidebarGroupContent, 
  SidebarGroupLabel, 
  SidebarMenu, 
  SidebarMenuButton, 
  SidebarMenuItem 
} from "@/components/ui/sidebar";
import { 
  ShoppingBag, 
  Store, 
  ListFilter, 
  Plus, 
  DollarSign, 
  Gavel, 
  Heart, 
  CreditCard, 
  Activity, 
  Bell, 
  UserRound, 
  Settings 
} from "lucide-react";
import { useDashboard } from "@/contexts/DashboardContext";

const DashboardNav = () => {
  const { activeRole } = useDashboard();
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const buyerMenuItems = [
    {
      label: "Dashboard",
      icon: <Activity className="h-4 w-4" />,
      path: "/dashboard",
    },
    {
      label: "My Bids",
      icon: <Gavel className="h-4 w-4" />,
      path: "/dashboard/bids",
    },
    {
      label: "Won Auctions",
      icon: <ShoppingBag className="h-4 w-4" />,
      path: "/dashboard/won-auctions",
    },
    {
      label: "Favorites",
      icon: <Heart className="h-4 w-4" />,
      path: "/dashboard/favorites",
    },
    {
      label: "Payment History",
      icon: <CreditCard className="h-4 w-4" />,
      path: "/dashboard/payment-history",
    },
  ];

  const sellerMenuItems = [
    {
      label: "Dashboard",
      icon: <Activity className="h-4 w-4" />,
      path: "/dashboard",
    },
    {
      label: "My Listings",
      icon: <ListFilter className="h-4 w-4" />,
      path: "/dashboard/listings",
    },
    {
      label: "Create Listing",
      icon: <Plus className="h-4 w-4" />,
      path: "/dashboard/create-listing",
    },
    {
      label: "Sold Items",
      icon: <Store className="h-4 w-4" />,
      path: "/dashboard/sold-items",
    },
    {
      label: "Earnings",
      icon: <DollarSign className="h-4 w-4" />,
      path: "/dashboard/earnings",
    },
  ];

  const sharedMenuItems = [
    {
      label: "Notifications",
      icon: <Bell className="h-4 w-4" />,
      path: "/dashboard/notifications",
    },
    {
      label: "Profile",
      icon: <UserRound className="h-4 w-4" />,
      path: "/dashboard/profile",
    },
    {
      label: "Settings",
      icon: <Settings className="h-4 w-4" />,
      path: "/dashboard/settings",
    },
  ];

  const menuItems = activeRole === "buyer" ? buyerMenuItems : sellerMenuItems;

  return (
    <>
      <SidebarGroup>
        <SidebarGroupLabel>
          {activeRole === "buyer" ? "Buyer Dashboard" : "Seller Dashboard"}
        </SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.path}>
                <SidebarMenuButton
                  isActive={isActive(item.path)}
                  onClick={() => navigate(item.path)}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      <SidebarGroup>
        <SidebarGroupLabel>Account</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {sharedMenuItems.map((item) => (
              <SidebarMenuItem key={item.path}>
                <SidebarMenuButton
                  isActive={isActive(item.path)}
                  onClick={() => navigate(item.path)}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </>
  );
};

export default DashboardNav;
