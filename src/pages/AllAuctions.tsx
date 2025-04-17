
import SearchLayout from "@/components/search/SearchLayout";
import { useSearchParams } from "@/hooks/useSearchParams";

const AllAuctions = () => {
  const {
    results,
    loading,
    totalCount,
    page,
    filters,
    setPage,
    handleFilterChange
  } = useSearchParams({ initialQuery: "" });

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
    />
  );
};

export default AllAuctions;
