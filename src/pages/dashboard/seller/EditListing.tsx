
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { MAX_EDIT_COUNT } from "@/hooks/useSellerListings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useQueryClient } from "@tanstack/react-query";

const EditListing = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [item, setItem] = useState<any>(null);
  const [formValues, setFormValues] = useState({
    title: "",
    description: "",
    starting_bid: "",
    buy_now_price: "",
  });
  
  useEffect(() => {
    const fetchItem = async () => {
      if (!user || !id) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const { data, error } = await supabase
          .from("auction_items")
          .select("*")
          .eq("id", id)
          .eq("seller_id", user.id)
          .single();
          
        if (error) throw error;
        
        if (!data) {
          setError("Item not found or you don't have permission to edit it");
          return;
        }
        
        // Default edit_count to 0 if it's null or undefined
        const editCount = data.edit_count || 0;
        
        // Check if max edits exceeded
        if (editCount >= MAX_EDIT_COUNT) {
          setError(`You've reached the maximum of ${MAX_EDIT_COUNT} edits for this item`);
          return;
        }
        
        // Update the item with default edit_count if needed
        const updatedItem = {
          ...data,
          edit_count: editCount
        };
        
        setItem(updatedItem);
        setFormValues({
          title: updatedItem.title || "",
          description: updatedItem.description || "",
          starting_bid: updatedItem.starting_bid?.toString() || "",
          buy_now_price: updatedItem.buy_now_price?.toString() || "",
        });
      } catch (err) {
        console.error("Error fetching item:", err);
        setError("Failed to load item. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchItem();
  }, [id, user]);
  
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !id) return;
    
    try {
      setSaving(true);
      setError(null);
      
      // Basic validation
      if (!formValues.title.trim()) {
        setError("Title is required");
        return;
      }
      
      if (!formValues.description.trim()) {
        setError("Description is required");
        return;
      }
      
      if (!formValues.starting_bid || parseFloat(formValues.starting_bid) <= 0) {
        setError("Starting bid must be greater than 0");
        return;
      }
      
      // Update the item
      const { error } = await supabase
        .from("auction_items")
        .update({
          title: formValues.title,
          description: formValues.description,
          starting_bid: parseFloat(formValues.starting_bid),
          buy_now_price: formValues.buy_now_price 
            ? parseFloat(formValues.buy_now_price) 
            : null,
          edit_count: (item.edit_count || 0) + 1,
          updated_at: new Date().toISOString()
        })
        .eq("id", id)
        .eq("seller_id", user.id);
        
      if (error) throw error;
      
      // Invalidate queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ['sellerListings'] });
      
      toast.success("Listing updated successfully");
      navigate("/dashboard/listings");
    } catch (err: any) {
      console.error("Error updating item:", err);
      setError(`Failed to update listing: ${err.message || "Unknown error"}`);
    } finally {
      setSaving(false);
    }
  };
  
  const remainingEdits = item ? MAX_EDIT_COUNT - (item.edit_count || 0) : 0;
  
  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">Edit Listing</h1>
          <p className="text-gray-500">Update your auction listing details</p>
        </div>
        
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <div className="flex justify-end">
            <Skeleton className="h-10 w-24" />
          </div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">Edit Listing</h1>
          <p className="text-gray-500">Update your auction listing details</p>
        </div>
        
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        
        <div className="flex justify-end">
          <Button onClick={() => navigate("/dashboard/listings")}>
            Return to Listings
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-1">Edit Listing</h1>
        <p className="text-gray-500">Update your auction listing details</p>
      </div>
      
      <Alert>
        <AlertDescription>
          You have {remainingEdits} {remainingEdits === 1 ? 'edit' : 'edits'} remaining for this listing.
        </AlertDescription>
      </Alert>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              value={formValues.title}
              onChange={handleInputChange}
              placeholder="Enter title"
            />
          </div>
          
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formValues.description}
              onChange={handleInputChange}
              placeholder="Enter description"
              rows={5}
            />
          </div>
          
          <div>
            <Label htmlFor="starting_bid">Starting Bid ($)</Label>
            <Input
              id="starting_bid"
              name="starting_bid"
              type="number"
              step="0.01"
              min="0.01"
              value={formValues.starting_bid}
              onChange={handleInputChange}
              placeholder="Enter starting bid"
            />
          </div>
          
          <div>
            <Label htmlFor="buy_now_price">Buy Now Price (₦) (Optional)</Label>
            <Input
              id="buy_now_price"
              name="buy_now_price"
              type="number"
              step="0.01"
              min="0.01"
              value={formValues.buy_now_price}
              onChange={handleInputChange}
              placeholder="Enter buy now price (optional)"
            />
          </div>
        </div>
        
        <div className="flex justify-end space-x-2">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => navigate("/dashboard/listings")}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditListing;
