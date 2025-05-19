
import { useState } from "react";
import { 
  Card, CardContent, CardFooter, CardHeader, 
  CardTitle, CardDescription 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  AlertDialog, AlertDialogAction, AlertDialogCancel, 
  AlertDialogContent, AlertDialogDescription, 
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle 
} from "@/components/ui/alert-dialog";
import { Pencil, Trash2 } from "lucide-react";
import { SellerListing, MAX_EDIT_COUNT } from "@/hooks/useSellerListings";
import { useNavigate } from "react-router-dom";
import { AspectRatio } from "@/components/ui/aspect-ratio";

interface ListingItemProps {
  listing: SellerListing;
  onDelete: (id: string) => void;
}

export const ListingItem = ({ listing, onDelete }: ListingItemProps) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const navigate = useNavigate();
  
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
  
  // Get first image or placeholder
  const primaryImage = listing.images && listing.images.length > 0 
    ? listing.images[0] 
    : "/placeholder.svg";
  
  // Calculate remaining edits
  const remainingEdits = MAX_EDIT_COUNT - (listing.edit_count || 0);
  const canEdit = remainingEdits > 0;
  
  const handleEdit = () => {
    if (canEdit) {
      navigate(`/dashboard/edit-listing/${listing.id}`);
    }
  };
  
  const handleDelete = () => {
    setDeleteDialogOpen(false);
    onDelete(listing.id);
  };

  return (
    <>
      <Card className="h-full overflow-hidden">
        <div className="relative h-48">
          <AspectRatio ratio={1/1} className="bg-muted">
            <img
              src={primaryImage}
              alt={listing.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "/placeholder.svg";
                target.onerror = null;
              }}
            />
          </AspectRatio>
          <Badge 
            className={`absolute top-2 right-2 ${getStatusColor(listing.status)}`}
          >
            {listing.status}
          </Badge>
        </div>
        
        <CardHeader className="p-4 pb-0">
          <CardTitle className="text-lg truncate">{listing.title}</CardTitle>
          <CardDescription className="line-clamp-2 h-10">
            {listing.description || "No description provided"}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="p-4 pt-2">
          <div className="flex items-center justify-between">
            <p className="text-lg font-semibold">
              ${listing.buy_now_price || listing.starting_bid}
            </p>
            <p className="text-sm text-gray-500">
              {new Date(listing.created_at).toLocaleDateString()}
            </p>
          </div>
        </CardContent>
        
        <CardFooter className="p-4 pt-0 gap-2 flex">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="w-full">
                  <Button 
                    variant="outline" 
                    className="w-full gap-1"
                    onClick={handleEdit}
                    disabled={!canEdit}
                  >
                    <Pencil size={16} />
                    Edit
                  </Button>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>You can edit this item a maximum of {MAX_EDIT_COUNT} times.</p>
                <p>Remaining edits: {remainingEdits}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <Button 
            variant="outline" 
            className="w-full gap-1 border-red-300 hover:bg-red-50 hover:text-red-600"
            onClick={() => setDeleteDialogOpen(true)}
          >
            <Trash2 size={16} />
            Delete
          </Button>
        </CardFooter>
      </Card>
      
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the listing "{listing.title}". 
              This action cannot be undone.
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
