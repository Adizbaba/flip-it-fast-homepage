
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { Tables } from '@/integrations/supabase/types';

export const useSavedItems = (user: User | null) => {
  const [savedItems, setSavedItems] = useState<Tables<'saved_items'>[]>([]);
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
          .select('*, auction_items(*)')
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
      if (data) setSavedItems(prev => [...prev, data[0]]);
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
