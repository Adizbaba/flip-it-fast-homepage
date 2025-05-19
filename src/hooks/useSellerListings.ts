
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

export interface SellerListing {
  id: string;
  title: string;
  description: string;
  images: string[] | null;
  starting_bid: number;
  status: string;
  created_at: string;
  buy_now_price?: number;
  edit_count: number;
  reserve_price?: number;
}

export const MAX_EDIT_COUNT = 3;

interface FetchListingsParams {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filterStatus?: string;
  searchQuery?: string;
}

export const useSellerListings = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const fetchListings = async ({
    page = 1,
    pageSize = 10,
    sortBy = 'created_at',
    sortOrder = 'desc',
    filterStatus,
    searchQuery
  }: FetchListingsParams) => {
    if (!user) throw new Error("User not authenticated");
    
    console.log("Fetching listings with params:", { page, pageSize, sortBy, sortOrder, filterStatus, searchQuery });
    
    // Start building the query
    let query = supabase
      .from('auction_items')
      .select('*', { count: 'exact' })
      .eq('seller_id', user.id);
    
    // Apply filters if provided
    if (filterStatus) {
      query = query.eq('status', filterStatus);
    }
    
    // Apply search if provided
    if (searchQuery) {
      query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
    }
    
    // Apply sorting
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });
    
    // Apply pagination
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);
    
    // Execute the query
    const { data, error, count } = await query;
    
    if (error) {
      console.error("Error fetching seller listings:", error);
      throw error;
    }
    
    // Process images to ensure they're in a consistent format
    const processedData = data.map(item => {
      let images = item.images;
      
      // Process images to ensure consistent format
      if (!images) {
        images = ["/placeholder.svg"];
      } else if (typeof images === 'string') {
        try {
          images = JSON.parse(images);
        } catch (e) {
          images = [images];
        }
      } else if (typeof images === 'object' && 'url' in images) {
        images = [images.url];
      }
      
      return {
        ...item,
        images: Array.isArray(images) ? images : ["/placeholder.svg"]
      };
    });
    
    return { 
      listings: processedData, 
      totalCount: count || 0
    };
  };
  
  const deleteItem = async (id: string) => {
    if (!user) throw new Error("User not authenticated");
    
    const { error } = await supabase
      .from('auction_items')
      .delete()
      .eq('id', id)
      .eq('seller_id', user.id);
    
    if (error) {
      console.error("Error deleting item:", error);
      throw error;
    }
    
    return { success: true };
  };
  
  const updateItemStatus = async ({ id, status }: { id: string; status: string }) => {
    if (!user) throw new Error("User not authenticated");
    
    // First check if the item exists and belongs to the user
    const { data: item, error: checkError } = await supabase
      .from('auction_items')
      .select('edit_count')
      .eq('id', id)
      .eq('seller_id', user.id)
      .single();
      
    if (checkError) {
      console.error("Error checking item:", checkError);
      throw checkError;
    }
    
    // Check if edit count is within limits
    const currentEditCount = item?.edit_count || 0;
    if (currentEditCount >= MAX_EDIT_COUNT) {
      throw new Error(`You've reached the maximum number of edits (${MAX_EDIT_COUNT}) for this item.`);
    }
    
    // Update the item status and increment edit_count
    const { error } = await supabase
      .from('auction_items')
      .update({ 
        status,
        edit_count: currentEditCount + 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('seller_id', user.id);
    
    if (error) {
      console.error("Error updating item status:", error);
      throw error;
    }
    
    return { success: true };
  };
  
  // Create query for fetching listings with pagination and filters
  const useListingsQuery = (params: FetchListingsParams) => {
    return useQuery({
      queryKey: ['sellerListings', params],
      queryFn: () => fetchListings(params),
      enabled: !!user,
    });
  };
  
  // Create mutation for deleting an item
  const useDeleteItemMutation = () => {
    return useMutation({
      mutationFn: deleteItem,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['sellerListings'] });
        toast.success("Item deleted successfully");
      },
      onError: (error: Error) => {
        toast.error(`Failed to delete item: ${error.message}`);
      }
    });
  };
  
  // Create mutation for updating an item's status
  const useUpdateItemStatusMutation = () => {
    return useMutation({
      mutationFn: updateItemStatus,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['sellerListings'] });
        toast.success("Item status updated successfully");
      },
      onError: (error: Error) => {
        toast.error(`Failed to update item status: ${error.message}`);
      }
    });
  };
  
  return {
    useListingsQuery,
    useDeleteItemMutation,
    useUpdateItemStatusMutation,
    MAX_EDIT_COUNT
  };
};
