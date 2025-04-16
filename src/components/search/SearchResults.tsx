import { Heart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious
} from "@/components/ui/pagination";
import { useAuth } from "@/lib/auth";
import { useSavedItems } from "@/hooks/useSavedItems";
import { SearchResultItem } from "@/hooks/useSearch";
import { useNavigate } from "react-router-dom";

interface SearchResultsProps {
  results: SearchResultItem[];
  loading: boolean;
  page: number;
  totalCount: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

const SearchResults = ({
  results,
  loading,
  page,
  totalCount,
  itemsPerPage,
  onPageChange,
}: SearchResultsProps) => {
  const { user } = useAuth();
  const { isSaved, addToSavedItems, removeFromSavedItems } = useSavedItems(user);
  const navigate = useNavigate();

  // Calculate total pages
  const totalPages = Math.ceil(totalCount / itemsPerPage);

  // Generate pagination items
  const generatePaginationItems = () => {
    const items = [];
    const maxVisiblePages = 5;
    
    // Always show first page
    items.push(
      <PaginationItem key="1">
        <PaginationLink 
          isActive={page === 1} 
          onClick={() => onPageChange(1)}
        >
          1
        </PaginationLink>
      </PaginationItem>
    );

    if (totalPages <= maxVisiblePages) {
      // Show all pages if totalPages is small
      for (let i = 2; i <= totalPages; i++) {
        items.push(
          <PaginationItem key={i}>
            <PaginationLink 
              isActive={page === i} 
              onClick={() => onPageChange(i)}
            >
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      }
    } else {
      // Handle ellipsis logic for many pages
      if (page > 3) {
        items.push(<PaginationItem key="ellipsis1">...</PaginationItem>);
      }

      // Show current page and neighbors
      const startPage = Math.max(2, page - 1);
      const endPage = Math.min(totalPages - 1, page + 1);

      for (let i = startPage; i <= endPage; i++) {
        items.push(
          <PaginationItem key={i}>
            <PaginationLink 
              isActive={page === i} 
              onClick={() => onPageChange(i)}
            >
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      }

      if (page < totalPages - 2) {
        items.push(<PaginationItem key="ellipsis2">...</PaginationItem>);
      }

      // Always show last page
      if (totalPages > 1) {
        items.push(
          <PaginationItem key={totalPages}>
            <PaginationLink 
              isActive={page === totalPages} 
              onClick={() => onPageChange(totalPages)}
            >
              {totalPages}
            </PaginationLink>
          </PaginationItem>
        );
      }
    }

    return items;
  };

  // Toggle saved status
  const toggleSaved = (itemId: string) => {
    if (isSaved(itemId)) {
      removeFromSavedItems(itemId);
    } else {
      addToSavedItems(itemId);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: itemsPerPage }).map((_, index) => (
          <Card key={index} className="overflow-hidden h-[300px] animate-pulse">
            <div className="bg-muted h-40 w-full"></div>
            <CardContent className="p-4">
              <div className="h-4 bg-muted rounded-md w-3/4 mb-2"></div>
              <div className="h-4 bg-muted rounded-md w-1/2 mb-2"></div>
              <div className="h-4 bg-muted rounded-md w-1/4"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-semibold mb-2">No results found</h3>
        <p className="text-muted-foreground">Try adjusting your search or filters</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {results.map((item) => (
          <Card key={item.id} className="overflow-hidden h-full">
            <div className="relative h-48 overflow-hidden">
              <img
                src={item.images?.[0] || "/placeholder.svg"}
                alt={item.title}
                className="w-full h-full object-cover"
              />
              {user && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 bg-white/80 hover:bg-white rounded-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSaved(item.id);
                  }}
                >
                  <Heart
                    className={`h-5 w-5 ${
                      isSaved(item.id) ? "fill-red-500 text-red-500" : ""
                    }`}
                  />
                </Button>
              )}
            </div>
            <CardContent className="p-4">
              <h3 className="font-semibold truncate">{item.title}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2 h-10">
                {item.description}
              </p>
              <div className="mt-2 flex justify-between items-center">
                <span className="font-bold">${item.starting_bid}</span>
                <span className="text-sm text-muted-foreground">
                  {item.profiles?.username || "Unknown seller"}
                </span>
              </div>
              <Button
                variant="outline"
                className="w-full mt-3"
                onClick={() => navigate(`/item/${item.id}`)}
              >
                View Item
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {totalPages > 1 && (
        <Pagination className="mt-8">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                onClick={() => page > 1 && onPageChange(page - 1)} 
                className={page === 1 ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
            
            {generatePaginationItems()}
            
            <PaginationItem>
              <PaginationNext 
                onClick={() => page < totalPages && onPageChange(page + 1)} 
                className={page === totalPages ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
};

export default SearchResults;
