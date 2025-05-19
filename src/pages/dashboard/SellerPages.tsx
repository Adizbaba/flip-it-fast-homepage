
import { useState } from "react";
import { ListingItem } from "@/components/dashboard/seller/ListingItem";
import { ListingsTable } from "@/components/dashboard/seller/ListingsTable";
import { ListingsFilters } from "@/components/dashboard/seller/ListingsFilters";
import { useSellerListings } from "@/hooks/useSellerListings";
import { Plus, Store, DollarSign } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export const MyListingsPage = () => {
  const navigate = useNavigate();
  // State for pagination, sorting, and filtering
  const [page, setPage] = useState(1);
  const [pageSize] = useState(12);
  const [filters, setFilters] = useState({
    sortBy: 'created_at',
    sortOrder: 'desc' as 'asc' | 'desc',
  });
  const [view, setView] = useState<'grid' | 'table'>('grid');
  
  // Use the custom hook to fetch listings and manage delete action
  const { useListingsQuery, useDeleteItemMutation } = useSellerListings();
  const { data, isLoading, isError } = useListingsQuery({
    page,
    pageSize,
    ...filters
  });
  const { mutate: deleteItem, isPending: isDeleting } = useDeleteItemMutation();
  
  // Handle page change
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };
  
  // Handle filter change
  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
    setPage(1); // Reset to first page when filters change
  };
  
  // Handle sorting
  const handleSort = (column: string) => {
    if (filters.sortBy === column) {
      // Toggle sort order if clicking the same column
      setFilters({
        ...filters,
        sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc'
      });
    } else {
      // Set new column with default sort order
      setFilters({
        ...filters,
        sortBy: column,
        sortOrder: column === 'title' ? 'asc' : 'desc'
      });
    }
  };
  
  // Handle view change (grid/table)
  const handleViewChange = (newView: 'grid' | 'table') => {
    setView(newView);
  };
  
  // Handle item deletion
  const handleDeleteItem = (id: string) => {
    deleteItem(id);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">My Listings</h1>
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
      
      <ListingsFilters 
        onFilterChange={handleFilterChange}
        currentFilters={filters}
        onViewChange={handleViewChange}
        currentView={view}
      />
      
      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
            <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
          </div>
          <p className="mt-2 text-gray-500">Loading listings...</p>
        </div>
      ) : isError ? (
        <div className="text-center py-12">
          <p className="text-red-500">Failed to load listings. Please try again.</p>
        </div>
      ) : (
        <>
          {data?.listings.length === 0 ? (
            <div className="text-center py-12 border rounded-lg bg-gray-50">
              <h3 className="text-lg font-semibold mb-2">No listings found</h3>
              <p className="text-gray-500 mb-6">Create your first listing to start selling!</p>
              <Button 
                onClick={() => navigate("/dashboard/create-listing")}
                className="bg-auction-purple hover:bg-auction-purple/90"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Listing
              </Button>
            </div>
          ) : view === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {data?.listings.map((listing) => (
                <ListingItem 
                  key={listing.id} 
                  listing={listing} 
                  onDelete={handleDeleteItem} 
                />
              ))}
            </div>
          ) : (
            <ListingsTable
              listings={data?.listings || []}
              totalCount={data?.totalCount || 0}
              currentPage={page}
              onPageChange={handlePageChange}
              pageSize={pageSize}
              onDelete={handleDeleteItem}
              sortBy={filters.sortBy}
              sortOrder={filters.sortOrder}
              onSort={handleSort}
            />
          )}
        </>
      )}
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
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="mb-1 text-3xl font-bold tracking-tight">Sold Items</h1>
        <p className="text-gray-500">Items you've successfully sold</p>
      </div>
      
      <div className="text-center py-12 border rounded-lg bg-gray-50">
        <Store className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No sold items yet</h3>
        <p className="text-gray-500">Items that have been sold will appear here.</p>
      </div>
    </div>
  );
};

export const EarningsPage = () => {
  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="mb-1 text-3xl font-bold tracking-tight">Earnings</h1>
        <p className="text-gray-500">Track your revenue and payment status</p>
      </div>
      
      <div className="text-center py-12 border rounded-lg bg-gray-50">
        <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No earnings data</h3>
        <p className="text-gray-500">Your earnings information will appear here once you've made sales.</p>
      </div>
    </div>
  );
};
