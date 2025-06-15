
import PlaceholderPage from "@/components/dashboard/PlaceholderPage";
import { ListFilter, Plus, Store, DollarSign } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export const MyListingsPage = () => {
  const navigate = useNavigate();
  
  return (
    <div className="space-y-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="mb-1 text-3xl font-bold tracking-tight">My Listings</h1>
          <p className="text-gray-500">Manage your auction listings</p>
        </div>
        <Button 
          onClick={() => navigate("/dashboard/create-listing")}
          className="bg-auction-purple hover:bg-auction-purple/90"
        >
          <Plus className="mr-2 h-4 w-4" />
          Create Listing
        </Button>
      </div>
      
      <PlaceholderPage
        title="My Listings"
        description="All your current and past listings"
        icon={<ListFilter className="h-6 w-6" />}
      />
    </div>
  );
};

export const CreateListingPage = () => {
  const navigate = useNavigate();
  
  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="mb-1 text-3xl font-bold tracking-tight">Create Listing</h1>
        <p className="text-gray-500">List a new item for auction</p>
      </div>
      
      <div className="flex items-center justify-center">
        <Button 
          onClick={() => navigate("/create-listing")}
          className="bg-auction-purple hover:bg-auction-purple/90"
        >
          Go to Create Listing Form
        </Button>
      </div>
    </div>
  );
};

export const SoldItemsPage = () => {
  return (
    <PlaceholderPage
      title="Sold Items"
      description="Items you've successfully sold"
      icon={<Store className="h-6 w-6" />}
    />
  );
};

export const EarningsPage = () => {
  return (
    <PlaceholderPage
      title="Earnings"
      description="Track your revenue and payment status"
      icon={<DollarSign className="h-6 w-6" />}
    />
  );
};
