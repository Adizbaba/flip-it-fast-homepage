
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { Tables } from '@/integrations/supabase/types';

// Define types for our saved items and auction items
interface SavedItem extends Tables<'saved_items'> {
  auction_items?: Tables<'auction_items'> | null;
}

export const useSavedItems = (user: User | null) => {
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSavedItems = async () => {
      if (!user) {
        setSavedItems([]);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('saved_items')
          .select('*, auction_items:item_id(*)')
          .eq('user_id', user.id);

        if (error) throw error;
        setSavedItems(data || []);
      } catch (error) {
        console.error('Error fetching saved items:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSavedItems();
  }, [user]);

  const addToSavedItems = async (itemId: string) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('saved_items')
        .insert({ user_id: user.id, item_id: itemId })
        .select();

      if (error) throw error;
      
      if (data) {
        // Fetch the auction item separately
        const { data: auctionData, error: auctionError } = await supabase
          .from('auction_items')
          .select('*')
          .eq('id', itemId)
          .single();
          
        if (!auctionError && auctionData) {
          // Add the new item with its auction data to the state
          const newItem: SavedItem = {
            ...data[0],
            auction_items: auctionData
          };
          setSavedItems(prev => [...prev, newItem]);
        } else {
          // Add just the saved item if we couldn't fetch auction data
          setSavedItems(prev => [...prev, data[0]]);
        }
      }
      return data;
    } catch (error) {
      console.error('Error adding to saved items:', error);
      return null;
    }
  };

  const removeFromSavedItems = async (itemId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('saved_items')
        .delete()
        .eq('user_id', user.id)
        .eq('item_id', itemId);

      if (error) throw error;
      setSavedItems(prev => prev.filter(item => item.item_id !== itemId));
    } catch (error) {
      console.error('Error removing from saved items:', error);
    }
  };

  return {
    savedItems,
    loading,
    addToSavedItems,
    removeFromSavedItems,
    isSaved: (itemId: string) => savedItems.some(item => item.item_id === itemId)
  };
};
