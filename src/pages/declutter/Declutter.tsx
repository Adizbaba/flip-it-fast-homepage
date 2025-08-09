import SEO from '@/components/SEO';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { SearchIcon, FilterIcon, ViewIcon, GridIcon, PackageOpen } from 'lucide-react';
import { useDeclutterListings } from '@/hooks/useDeclutterListings';
import DeclutterListingCard from '@/components/declutter/DeclutterListingCard';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from '@/components/ui/sheet';
import DeclutterFilters from '@/components/declutter/DeclutterFilters';

const Declutter = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    categoryId: 'all',
    minPrice: undefined,
    maxPrice: undefined,
    condition: 'all',
    location: '',
  });
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 12;
  
  const { 
    listings, 
    loading, 
    error, 
    totalCount 
  } = useDeclutterListings({
    categoryId: filters.categoryId !== 'all' ? filters.categoryId : undefined,
    minPrice: filters.minPrice,
    maxPrice: filters.maxPrice,
    condition: filters.condition !== 'all' ? filters.condition : undefined,
    location: filters.location || undefined,
    searchQuery: searchQuery || undefined,
    limit: ITEMS_PER_PAGE,
    page: page
  });
  
  // Reset page when filters or search query changes
  useEffect(() => {
    setPage(1);
  }, [filters, searchQuery]);

  // Calculate total pages
  const totalPages = Math.max(1, Math.ceil(totalCount / ITEMS_PER_PAGE));
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Already using controlled input so no need to get value
  };

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
  };
  
  // Pagination component
  const Pagination = () => {
    return (
      <div className="flex justify-center items-center gap-2 mt-8">
        <Button
          variant="outline"
          onClick={() => setPage(Math.max(1, page - 1))}
          disabled={page === 1}
        >
          Previous
        </Button>
        <div className="flex items-center gap-1">
          {Array.from({ length: Math.min(5, totalPages) }).map((_, idx) => {
            // Show pagination numbers intelligently
            let pageNumber = 0;
            if (totalPages <= 5) {
              pageNumber = idx + 1;
            } else if (page <= 3) {
              pageNumber = idx + 1;
              if (idx === 4) pageNumber = totalPages;
            } else if (page >= totalPages - 2) {
              pageNumber = totalPages - 4 + idx;
              if (idx === 0) pageNumber = 1;
            } else {
              pageNumber = page - 2 + idx;
              if (idx === 0) pageNumber = 1;
              if (idx === 4) pageNumber = totalPages;
            }

            return (
              <Button
                key={`page-${pageNumber}`}
                variant={pageNumber === page ? "default" : "outline"}
                className="w-10 h-10 p-0"
                onClick={() => setPage(pageNumber)}
              >
                {pageNumber}
              </Button>
            );
          })}
        </div>
        <Button
          variant="outline"
          onClick={() => setPage(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
        >
          Next
        </Button>
      </div>
    );
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <SEO title="Declutter Marketplace | FastFlip" description="Find great deals on bulk items or sell excess inventory on FastFlip Declutter." type="website" />
      <main className="flex-1 bg-gray-50">
        {/* Hero banner */}
        <div className="bg-gradient-to-r from-auction-purple to-auction-magenta text-white py-12">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl font-bold mb-4 text-center">
              Declutter & Save - Bulk Buying Marketplace
            </h1>
            <p className="text-xl text-center mb-8 max-w-2xl mx-auto">
              Find great deals on bulk items or sell your excess inventory at competitive prices
            </p>
            
            {/* Search bar */}
            <div className="max-w-2xl mx-auto">
              <form onSubmit={handleSearch} className="flex gap-2">
                <Input
                  type="search"
                  placeholder="Search for bulk items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-white/90 border-0 focus-visible:ring-0 text-black"
                />
                <Button type="submit" variant="default">
                  <SearchIcon className="h-4 w-4 mr-2" />
                  Search
                </Button>
              </form>
            </div>
          </div>
        </div>
        
        <div className="container mx-auto px-4 py-8">
          {/* Filters and controls */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div>
              <h2 className="text-2xl font-bold">Browse Bulk Deals</h2>
              <p className="text-muted-foreground">
                {!loading && `Showing ${listings.length} of ${totalCount} items`}
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <FilterIcon className="h-4 w-4" />
                    Filters
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Filter Items</SheetTitle>
                  </SheetHeader>
                  <Separator className="my-4" />
                  <DeclutterFilters 
                    filters={filters} 
                    onFilterChange={handleFilterChange} 
                  />
                </SheetContent>
              </Sheet>
              
              <div className="flex items-center border rounded-md overflow-hidden">
                <Button 
                  variant={view === 'grid' ? 'secondary' : 'ghost'} 
                  size="sm"
                  onClick={() => setView('grid')}
                  className="rounded-none"
                >
                  <GridIcon className="h-4 w-4" />
                </Button>
                <Button 
                  variant={view === 'list' ? 'secondary' : 'ghost'} 
                  size="sm"
                  onClick={() => setView('list')}
                  className="rounded-none"
                >
                  <ViewIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          
          {/* Loading state */}
          {loading && (
            <div className="text-center py-12">
              <div className="animate-spin h-8 w-8 border-4 border-auction-purple border-t-transparent rounded-full mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Loading items...</p>
            </div>
          )}
          
          {/* Error state */}
          {error && (
            <div className="text-center py-12">
              <p className="text-red-500">Something went wrong. Please try again.</p>
              <Button 
                onClick={() => window.location.reload()} 
                className="mt-4"
              >
                Retry
              </Button>
            </div>
          )}
          
          {/* Empty state */}
          {!loading && !error && listings.length === 0 && (
            <div className="text-center py-12 border rounded-lg">
              <PackageOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No items found</h3>
              <p className="text-muted-foreground mb-6">
                Try adjusting your filters or search query
              </p>
              <Button 
                onClick={() => {
                  setFilters({
                    categoryId: 'all',
                    minPrice: undefined,
                    maxPrice: undefined,
                    condition: 'all',
                    location: '',
                  });
                  setSearchQuery('');
                }}
              >
                Clear Filters
              </Button>
            </div>
          )}
          
          {/* Results grid */}
          {!loading && !error && listings.length > 0 && (
            <div className={`grid ${view === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'} gap-6`}>
              {listings.map((listing) => (
                <DeclutterListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          )}
          
          {/* Pagination */}
          {totalPages > 1 && <Pagination />}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Declutter;
