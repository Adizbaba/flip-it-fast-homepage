
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
    handleFilterChange
  } = useSearchParamsState({ 
    initialQuery: "",
    itemsPerPage: 10
  });

  // Show toast notification when new items are added
  useEffect(() => {
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
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
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
  );
};

export default AllAuctions;
