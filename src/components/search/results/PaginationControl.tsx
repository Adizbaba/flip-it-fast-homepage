
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Pagination } from "@/components/ui/pagination";

interface PaginationControlProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const PaginationControl = ({ 
  currentPage, 
  totalPages, 
  onPageChange 
}: PaginationControlProps) => {
  if (totalPages <= 1) return null;

  // Generate pagination items
  const generatePaginationItems = () => {
    const items = [];
    
    // Always show first page
    items.push(
      <Button 
        key="1"
        variant={currentPage === 1 ? "default" : "outline"}
        size="sm"
        onClick={() => onPageChange(1)}
        className={currentPage === 1 ? "pointer-events-none" : ""}
      >
        1
      </Button>
    );

    if (totalPages <= 5) {
      // Show all pages if totalPages is small
      for (let i = 2; i <= totalPages; i++) {
        items.push(
          <Button
            key={i}
            variant={currentPage === i ? "default" : "outline"}
            size="sm"
            onClick={() => onPageChange(i)}
            className={currentPage === i ? "pointer-events-none" : ""}
          >
            {i}
          </Button>
        );
      }
    } else {
      // Handle ellipsis logic for many pages
      if (currentPage > 3) {
        items.push(<span key="ellipsis1" className="px-2 text-muted-foreground">...</span>);
      }

      // Show current page and neighbors
      const startPage = Math.max(2, currentPage - 1);
      const endPage = Math.min(totalPages - 1, currentPage + 1);

      for (let i = startPage; i <= endPage; i++) {
        items.push(
          <Button
            key={i}
            variant={currentPage === i ? "default" : "outline"}
            size="sm"
            onClick={() => onPageChange(i)}
            className={currentPage === i ? "pointer-events-none" : ""}
          >
            {i}
          </Button>
        );
      }

      if (currentPage < totalPages - 2) {
        items.push(<span key="ellipsis2" className="px-2 text-muted-foreground">...</span>);
      }

      // Always show last page
      if (totalPages > 1) {
        items.push(
          <Button
            key={totalPages}
            variant={currentPage === totalPages ? "default" : "outline"}
            size="sm"
            onClick={() => onPageChange(totalPages)}
            className={currentPage === totalPages ? "pointer-events-none" : ""}
          >
            {totalPages}
          </Button>
        );
      }
    }

    return items;
  };

  return (
    <div className="flex items-center justify-center space-x-2 mt-8">
      <Button
        variant="outline"
        size="icon"
        onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Previous page"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      
      {generatePaginationItems()}
      
      <Button
        variant="outline"
        size="icon"
        onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Next page"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default PaginationControl;
