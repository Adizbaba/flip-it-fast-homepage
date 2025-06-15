
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  AlertDialog, AlertDialogAction, AlertDialogCancel, 
  AlertDialogContent, AlertDialogDescription, 
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle 
} from "@/components/ui/alert-dialog";
import { Pencil, Trash2, ArrowUp, ArrowDown, ChevronUp, ChevronDown } from "lucide-react";
import { SellerListing, MAX_EDIT_COUNT } from "@/hooks/useSellerListings";
import { useNavigate } from "react-router-dom";
import { Pagination } from "@/components/ui/pagination";

interface ListingsTableProps {
  listings: SellerListing[];
  totalCount: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  pageSize: number;
  onDelete: (id: string) => void;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onSort: (column: string) => void;
}

export const ListingsTable = ({ 
  listings, 
  totalCount, 
  currentPage, 
  onPageChange, 
  pageSize,
  onDelete,
  sortBy,
  sortOrder,
  onSort
}: ListingsTableProps) => {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const navigate = useNavigate();
  
  const totalPages = Math.ceil(totalCount / pageSize);
  
  // Get status color based on listing status
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-500';
      case 'sold':
        return 'bg-blue-500';
      case 'expired':
        return 'bg-amber-500';
      case 'draft':
        return 'bg-gray-400';
      default:
        return 'bg-gray-400';
    }
  };
  
  const getSortIcon = (column: string) => {
    if (sortBy !== column) return null;
    return sortOrder === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />;
  };
  
  const handleEdit = (listing: SellerListing) => {
    const remainingEdits = MAX_EDIT_COUNT - (listing.edit_count || 0);
    if (remainingEdits > 0) {
      navigate(`/dashboard/edit-listing/${listing.id}`);
    }
  };
  
  const confirmDelete = (id: string) => {
    setDeleteId(id);
  };
  
  const handleDelete = () => {
    if (deleteId) {
      onDelete(deleteId);
      setDeleteId(null);
    }
  };
  
  return (
    <>
      <div className="rounded-md border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Image</TableHead>
                <TableHead 
                  className="cursor-pointer"
                  onClick={() => onSort('title')}
                >
                  <div className="flex items-center gap-1">
                    Item Name {getSortIcon('title')}
                  </div>
                </TableHead>
                <TableHead className="hidden md:table-cell">Description</TableHead>
                <TableHead 
                  className="cursor-pointer"
                  onClick={() => onSort('starting_bid')}
                >
                  <div className="flex items-center gap-1">
                    Price {getSortIcon('starting_bid')}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer"
                  onClick={() => onSort('status')}
                >
                  <div className="flex items-center gap-1">
                    Status {getSortIcon('status')}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hidden md:table-cell"
                  onClick={() => onSort('created_at')}
                >
                  <div className="flex items-center gap-1">
                    Date Listed {getSortIcon('created_at')}
                  </div>
                </TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {listings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    No listings found
                  </TableCell>
                </TableRow>
              ) : (
                listings.map((listing) => {
                  // Calculate remaining edits
                  const remainingEdits = MAX_EDIT_COUNT - (listing.edit_count || 0);
                  const canEdit = remainingEdits > 0;
                  
                  // Get first image or placeholder
                  const primaryImage = listing.images && listing.images.length > 0 
                    ? listing.images[0] 
                    : "/placeholder.svg";
                    
                  return (
                    <TableRow key={listing.id}>
                      <TableCell>
                        <img 
                          src={primaryImage}
                          alt={listing.title}
                          className="w-16 h-16 object-cover rounded"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = "/placeholder.svg";
                            target.onerror = null;
                          }}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{listing.title}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        <span className="line-clamp-1">{listing.description}</span>
                      </TableCell>
                      <TableCell>${listing.buy_now_price || listing.starting_bid}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(listing.status)}>
                          {listing.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {new Date(listing.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right space-x-1">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-8 w-8 p-0"
                                onClick={() => handleEdit(listing)}
                                disabled={!canEdit}
                              >
                                <Pencil size={14} />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>You can edit this item a maximum of {MAX_EDIT_COUNT} times.</p>
                              <p>Remaining edits: {remainingEdits}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-8 w-8 p-0 border-red-300 hover:bg-red-50 hover:text-red-600"
                          onClick={() => confirmDelete(listing.id)}
                        >
                          <Trash2 size={14} />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      
      {totalCount > pageSize && (
        <div className="flex justify-center mt-6">
          <Pagination 
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        </div>
      )}
      
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this listing. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
