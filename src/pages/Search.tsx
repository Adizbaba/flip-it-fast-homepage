
import { SearchState } from "@/components/search/SearchState";
import SearchLayout from "@/components/search/SearchLayout";
import { useSearchParamsState } from "@/hooks/useSearchParams";

const Search = () => {
  const {
    results,
    loading,
    totalCount,
    page,
    filters,
    setPage,
    handleFilterChange,
    handleSearch
  } = useSearchParamsState();

  return (
    <SearchLayout
      title="Search Results"
      results={results}
      loading={loading}
      totalCount={totalCount}
      page={page}
      itemsPerPage={12}
      filters={filters}
      onFilterChange={handleFilterChange}
      onPageChange={setPage}
      searchQuery={filters.query}
      searchArea={
        <SearchState
          initialQuery={filters.query}
          onSearch={handleSearch}
        />
      }
    />
  );
};

export default Search;
