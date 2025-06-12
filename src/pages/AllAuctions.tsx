
import { useEffect } from "react";
import { toast } from "sonner";
import SearchLayout from "@/components/search/SearchLayout";
import { useSearchParamsState } from "@/hooks/useSearchParams";
import { supabase } from "@/integrations/supabase/client";

const AllAuctions = () => {
  const {
    results,
    loading,
    totalCount,
    page,
    filters,
    setPage,
    handleFilterChange,
    refreshResults,
    error // Add error from the hook
  } = useSearchParamsState({ 
    initialQuery: "",
    itemsPerPage: 12 // Increased from 10 to 12 for better grid layout
  });

  // Show toast notification when new items are added
  useEffect(() => {
    // Set up real-time subscription for new auction items
    const channel = supabase
      .channel('public:auction_items')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'auction_items'
        },
        (payload) => {
          console.log("Real-time update received:", payload);
          if (payload.new && payload.new.status === 'Active') {
            toast.info('New auction listing added!', {
              description: payload.new.title || 'Check it out!',
              duration: 5000,
            });
            // Refresh results to show the new item
            refreshResults();
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'auction_items',
          filter: 'status=eq.Active'
        },
        (payload) => {
          console.log("Listing updated:", payload);
          if (payload.new && payload.old.status !== 'Active' && payload.new.status === 'Active') {
            toast.info('New auction listing published!', {
              description: payload.new.title || 'Check it out!',
              duration: 5000,
            });
            // Refresh results when a draft is published
            refreshResults();
          }
        }
      )
      .subscribe();

    console.log("Real-time subscription set up for auction_items");
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [refreshResults]);

  return (
    <SearchLayout
      title="All Auctions"
      description="Browse all available auction items and find your next treasure"
      results={results}
      loading={loading}
      totalCount={totalCount}
      page={page}
      itemsPerPage={12}
      filters={filters}
      onFilterChange={handleFilterChange}
      onPageChange={setPage}
      error={error}
    />
  );
};

export default AllAuctions;
