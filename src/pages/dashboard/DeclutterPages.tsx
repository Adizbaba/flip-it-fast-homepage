
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDeclutterListings } from '@/hooks/useDeclutterListings';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import { Pencil, Trash2, Plus, PackageOpen } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

export const DeclutterListingsPage = () => {
  const navigate = useNavigate();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  const { 
    listings, 
    loading, 
    error,
    refetch 
  } = useDeclutterListings({ ownListings: true });
  
  const handleEdit = (id: string) => {
    navigate(`/edit-declutter-listing/${id}`);
  };
  
  const handleDelete = async () => {
    if (!deletingId) return;
    
    try {
      const { error } = await supabase
        .from('declutter_listings')
        .delete()
        .eq('id', deletingId);
        
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Listing deleted successfully",
      });
      
      refetch();
    } catch (err: any) {
      console.error('Error deleting listing:', err);
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="mb-1 text-3xl font-bold tracking-tight">Declutter Listings</h1>
          <p className="text-gray-500">Manage your bulk sale listings</p>
        </div>
        <Button 
          onClick={() => navigate("/create-declutter-listing")}
          className="bg-auction-purple hover:bg-auction-purple/90"
        >
          <Plus className="mr-2 h-4 w-4" />
          Create New
        </Button>
      </div>
      
      {loading ? (
        <div className="text-center py-8">Loading your listings...</div>
      ) : error ? (
        <div className="text-center py-8 text-red-500">
          Error loading listings. Please try again.
        </div>
      ) : listings.length === 0 ? (
        <div className="text-center py-12 border rounded-lg">
          <PackageOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No declutter listings yet</h3>
          <p className="text-muted-foreground mb-6">
            Create your first declutter listing to sell items in bulk
          </p>
          <Button 
            onClick={() => navigate("/create-declutter-listing")}
          >
            Create Listing
          </Button>
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Edits Left</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {listings.map((listing) => (
                <TableRow key={listing.id}>
                  <TableCell className="font-medium">
                    <div 
                      className="max-w-[200px] truncate cursor-pointer hover:text-primary"
                      onClick={() => navigate(`/declutter/${listing.id}`)}
                    >
                      {listing.title}
                    </div>
                  </TableCell>
                  <TableCell>${formatCurrency(listing.bulk_price)}</TableCell>
                  <TableCell>{listing.quantity}</TableCell>
                  <TableCell>
                    <Badge
                      variant={listing.status === 'Available' ? 'default' : 'secondary'}
                    >
                      {listing.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {format(new Date(listing.created_at), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {2 - listing.edit_count} edits left
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(listing.id)}
                        disabled={listing.edit_count >= 2}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      
                      <AlertDialog
                        open={deletingId === listing.id}
                        onOpenChange={(open) => {
                          if (!open) setDeletingId(null);
                        }}
                      >
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeletingId(listing.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Listing</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this listing? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={handleDelete}
                              className="bg-red-500 hover:bg-red-600"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export const EditDeclutterListingPage = () => {
  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="mb-1 text-3xl font-bold tracking-tight">Edit Declutter Listing</h1>
        <p className="text-gray-500">
          Make changes to your listing. Remember you can only edit a listing twice.
        </p>
      </div>
      
      {/* Main form would go here, similar to the create form */}
      <div className="text-center py-8">
        <Button 
          onClick={() => window.location.reload()}
        >
          Refresh Page
        </Button>
      </div>
    </div>
  );
};
