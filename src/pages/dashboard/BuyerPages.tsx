
import PlaceholderPage from "@/components/dashboard/PlaceholderPage";
import { Gavel, ShoppingBag, Heart, CreditCard } from "lucide-react";

export const MyBidsPage = () => {
  return (
    <PlaceholderPage
      title="My Bids"
      description="Track all of your active and past bids here"
      icon={<Gavel className="h-6 w-6" />}
    />
  );
};

export const WonAuctionsPage = () => {
  return (
    <PlaceholderPage
      title="Won Auctions"
      description="Items you've successfully won at auction"
      icon={<ShoppingBag className="h-6 w-6" />}
    />
  );
};

export const FavoritesPage = () => {
  return (
    <PlaceholderPage
      title="Favorites"
      description="Listings you've saved for later"
      icon={<Heart className="h-6 w-6" />}
    />
  );
};

export const PaymentHistoryPage = () => {
  return (
    <PlaceholderPage
      title="Payment History"
      description="Record of your past payments"
      icon={<CreditCard className="h-6 w-6" />}
    />
  );
};
