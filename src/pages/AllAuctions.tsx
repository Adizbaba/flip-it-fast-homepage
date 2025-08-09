
import { useEffect } from "react";
import { toast } from "sonner";
import SearchLayout from "@/components/search/SearchLayout";
import { useSearchParamsState } from "@/hooks/useSearchParams";
import { supabase } from "@/integrations/supabase/client";
import SEO from "@/components/SEO";

const AllAuctions = () => {
  const {
    results,
    loading,
    totalCount,
    page,
    filters,
    setPage,
    handleFilterChange,
    refreshResults
  } = useSearchParamsState({ 
    initialQuery: "",
    itemsPerPage: 10
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
          if (payload.new && payload.new.status === 'Active') {
            toast.info('New auction listing added!', {
              description: payload.new.title || 'Check it out!',
              duration: 5000,
            });
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
          if (payload.new && payload.old.status !== 'Active' && payload.new.status === 'Active') {
            toast.info('New auction listing published!', {
              description: payload.new.title || 'Check it out!',
              duration: 5000,
            });
            refreshResults();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refreshResults]);

return (
    <>
      <SEO
        title="All Auctions | FastFlip"
        description="Browse all active auctions on FastFlip and find your next treasure."
        type="website"
      />
      <SearchLayout
        title="All Auctions"
        description="Browse all available auction items and find your next treasure"
        results={results}
        loading={loading}
        totalCount={totalCount}
        page={page}
        itemsPerPage={10}
        filters={filters}
        onFilterChange={handleFilterChange}
        onPageChange={setPage}
      />
    </>
  );
};

export default AllAuctions;
