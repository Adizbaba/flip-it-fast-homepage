
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Json } from '@/integrations/supabase/types';

export interface DeclutterListing {
  id: string;
  seller_id: string;
  title: string;
  description: string;
  category_id: string | null;
  condition: string;
  original_price: number;
  bulk_price: number;
  quantity: number;
  min_purchase_quantity: number;
  location: string | null;
  shipping_options: any | null;
  is_negotiable: boolean;
  images: string[] | null;
  status: string;
  edit_count: number;
  created_at: string;
  updated_at: string;
  seller_name?: string;
  category_name?: string;
}

interface UseDeclutterListingsOptions {
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  condition?: string;
  location?: string;
  searchQuery?: string;
  limit?: number;
  page?: number;
  ownListings?: boolean;
}

export const useDeclutterListings = (options: UseDeclutterListingsOptions = {}) => {
  const [listings, setListings] = useState<DeclutterListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const { toast } = useToast();

  const fetchListings = async () => {
    try {
      setLoading(true);
      
      // Count query
      let countQuery = supabase
        .from('declutter_listings')
        .select('id', { count: 'exact', head: true });
      
      // Main query
      let query = supabase
        .from('declutter_listings')
        .select(`
          *,
          profiles:seller_id (username),
          categories:category_id (name)
        `);
        
      // Apply filters
      if (options.categoryId) {
        query = query.eq('category_id', options.categoryId);
        countQuery = countQuery.eq('category_id', options.categoryId);
      }
      
      if (options.minPrice !== undefined) {
        query = query.gte('bulk_price', options.minPrice);
        countQuery = countQuery.gte('bulk_price', options.minPrice);
      }
      
      if (options.maxPrice !== undefined) {
        query = query.lte('bulk_price', options.maxPrice);
        countQuery = countQuery.lte('bulk_price', options.maxPrice);
      }
      
      if (options.condition) {
        query = query.eq('condition', options.condition);
        countQuery = countQuery.eq('condition', options.condition);
      }
      
      if (options.location) {
        query = query.ilike('location', `%${options.location}%`);
        countQuery = countQuery.ilike('location', `%${options.location}%`);
      }
      
      if (options.searchQuery) {
        query = query.or(`title.ilike.%${options.searchQuery}%,description.ilike.%${options.searchQuery}%`);
        countQuery = countQuery.or(`title.ilike.%${options.searchQuery}%,description.ilike.%${options.searchQuery}%`);
      }
      
      if (options.ownListings) {
        const { data: userData } = await supabase.auth.getUser();
        if (userData?.user?.id) {
          query = query.eq('seller_id', userData.user.id);
          countQuery = countQuery.eq('seller_id', userData.user.id);
        }
      }
      
      // Sort by most recent
      query = query.order('created_at', { ascending: false });
      
      // Pagination
      if (options.limit) {
        const offset = options.page && options.page > 1 ? (options.page - 1) * options.limit : 0;
        query = query.range(offset, offset + options.limit - 1);
      }
      
      // Execute queries
      const [listingsResult, countResult] = await Promise.all([
        query,
        countQuery
      ]);
      
      if (listingsResult.error) throw listingsResult.error;
      if (countResult.error) throw countResult.error;
      
      const processedListings = listingsResult.data.map(listing => {
        // Convert JSON images to string array if needed
        const images = listing.images as Json;
        const imageArray = Array.isArray(images) ? images : (images ? [images.toString()] : null);
        
        return {
          ...listing,
          images: imageArray,
          seller_name: listing.profiles?.username || 'Unknown Seller',
          category_name: listing.categories?.name || 'Uncategorized'
        } as DeclutterListing;
      });
      
      setListings(processedListings);
      setTotalCount(countResult.count || 0);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching declutter listings:', err);
      setError(err);
      toast({
        title: "Error",
        description: "Failed to load declutter listings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, [
    options.categoryId,
    options.minPrice,
    options.maxPrice,
    options.condition,
    options.location,
    options.searchQuery,
    options.limit,
    options.page,
    options.ownListings
  ]);

  return {
    listings,
    loading,
    error,
    totalCount,
    refetch: fetchListings
  };
};
