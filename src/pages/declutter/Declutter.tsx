
import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useDeclutterListings } from '@/hooks/useDeclutterListings';
import DeclutterFilters from '@/components/declutter/DeclutterFilters';
import DeclutterListingCard from '@/components/declutter/DeclutterListingCard';
import SearchBar from '@/components/search/SearchBar';
import { Button } from '@/components/ui/button';
import { PackageSearch } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { Pagination } from '@/components/ui/pagination';
import { Skeleton } from '@/components/ui/skeleton';

const ITEMS_PER_PAGE = 12;

const Declutter = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    categoryId: '',
    minPrice: undefined as number | undefined,
    maxPrice: undefined as number | undefined,
    condition: '',
    location: '',
  });
  
  const { listings, loading, totalCount } = useDeclutterListings({
    ...filters,
    searchQuery,
    limit: ITEMS_PER_PAGE,
    page,
  });
  
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setPage(1);
  };
  
  const handleFilterChange = (newFilters: any) => {
    setFilters({ ...filters, ...newFilters });
    setPage(1);
  };

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto mb-8">
            <h1 className="text-3xl font-bold mb-2">Declutter Marketplace</h1>
            <p className="text-muted-foreground">
              Find great deals on bulk items and clear your space of unwanted items
            </p>

            <div className="mt-6">
              <SearchBar
                initialQuery={searchQuery}
                onSearch={handleSearch}
                placeholder="Search declutter listings..."
                recentSearches={[]}
                popularSearches={["Furniture", "Books", "Electronics", "Kitchen", "Clothing"]}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1">
              <div className="bg-white p-6 rounded-lg shadow-sm sticky top-24">
                <h2 className="text-lg font-semibold mb-4">Filters</h2>
                <DeclutterFilters 
                  filters={filters}
                  onFilterChange={handleFilterChange}
                />
                
                {user && (
                  <div className="mt-8 pt-6 border-t">
                    <Button 
                      className="w-full" 
                      onClick={() => navigate('/create-declutter-listing')}
                    >
                      Sell Your Items
                    </Button>
                  </div>
                )}
              </div>
            </div>
            
            <div className="lg:col-span-3">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold">
                    {loading ? (
                      <Skeleton className="h-8 w-40" />
                    ) : (
                      `${totalCount} items available`
                    )}
                  </h2>
                </div>
                
                <Separator className="mb-6" />
                
                {loading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="border rounded-lg p-4 space-y-3">
                        <Skeleton className="h-40 w-full rounded-md" />
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                        <div className="flex justify-between">
                          <Skeleton className="h-6 w-1/3" />
                          <Skeleton className="h-6 w-1/3" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : listings.length > 0 ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {listings.map((listing) => (
                        <DeclutterListingCard key={listing.id} listing={listing} />
                      ))}
                    </div>
                    
                    {totalPages > 1 && (
                      <div className="mt-8 flex justify-center">
                        <Pagination
                          currentPage={page}
                          totalPages={totalPages}
                          onPageChange={setPage}
                        />
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-12">
                    <PackageSearch className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-xl font-medium mb-2">No listings found</h3>
                    <p className="text-muted-foreground mb-6">
                      Try adjusting your filters or search terms
                    </p>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setSearchQuery('');
                        setFilters({
                          categoryId: '',
                          minPrice: undefined,
                          maxPrice: undefined,
                          condition: '',
                          location: '',
                        });
                      }}
                    >
                      Clear All Filters
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Declutter;
