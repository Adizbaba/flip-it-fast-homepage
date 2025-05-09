
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";

export type CartItemType = {
  id: string;
  itemId: string;
  itemType: 'auction' | 'declutter';
  title: string;
  price: number;
  image?: string;
  quantity: number;
};

interface CartContextType {
  items: CartItemType[];
  isLoading: boolean;
  addToCart: (item: Omit<CartItemType, 'id'>) => Promise<void>;
  removeFromCart: (id: string) => Promise<void>;
  updateQuantity: (id: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  totalItems: number;
  subtotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItemType[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchCartItems = async () => {
    if (!user) {
      setItems([]);
      return;
    }

    try {
      setIsLoading(true);
      
      // Fetch cart items from database
      const { data: cartItems, error: cartError } = await supabase
        .from('cart_items')
        .select('*')
        .eq('user_id', user.id);
        
      if (cartError) {
        throw cartError;
      }
      
      if (!cartItems.length) {
        setItems([]);
        return;
      }
      
      // Fetch all auction items in the cart
      const auctionItemIds = cartItems
        .filter(item => item.item_type === 'auction')
        .map(item => item.item_id);
        
      // Fetch all declutter items in the cart
      const declutterItemIds = cartItems
        .filter(item => item.item_type === 'declutter')
        .map(item => item.item_id);
      
      let auctionItems = [];
      let declutterItems = [];
      
      if (auctionItemIds.length) {
        const { data: fetchedAuctionItems, error: auctionError } = await supabase
          .from('auction_items')
          .select('id, title, starting_bid, images, buy_now_price')
          .in('id', auctionItemIds);
          
        if (auctionError) throw auctionError;
        auctionItems = fetchedAuctionItems || [];
      }
      
      if (declutterItemIds.length) {
        const { data: fetchedDeclutterItems, error: declutterError } = await supabase
          .from('declutter_listings')
          .select('id, title, bulk_price, images')
          .in('id', declutterItemIds);
          
        if (declutterError) throw declutterError;
        declutterItems = fetchedDeclutterItems || [];
      }
      
      // Map cart items with their details
      const populatedItems = cartItems.map(cartItem => {
        if (cartItem.item_type === 'auction') {
          const auctionItem = auctionItems.find(item => item.id === cartItem.item_id);
          if (!auctionItem) return null;
          
          return {
            id: cartItem.id,
            itemId: cartItem.item_id,
            itemType: cartItem.item_type as 'auction',
            title: auctionItem.title,
            price: auctionItem.buy_now_price || auctionItem.starting_bid,
            image: auctionItem.images?.[0],
            quantity: cartItem.quantity,
          };
        } else {
          const declutterItem = declutterItems.find(item => item.id === cartItem.item_id);
          if (!declutterItem) return null;
          
          return {
            id: cartItem.id,
            itemId: cartItem.item_id,
            itemType: cartItem.item_type as 'declutter',
            title: declutterItem.title,
            price: declutterItem.bulk_price,
            image: declutterItem.images?.[0],
            quantity: cartItem.quantity,
          };
        }
      }).filter(Boolean) as CartItemType[];
      
      setItems(populatedItems);
    } catch (error) {
      console.error('Error fetching cart items:', error);
      toast.error('Failed to load cart items');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCartItems();
  }, [user]);

  const addToCart = async (item: Omit<CartItemType, 'id'>) => {
    if (!user) {
      toast.error('Please sign in to add items to cart');
      return;
    }
    
    try {
      // Check if item already exists in cart
      const existingItem = items.find(
        i => i.itemId === item.itemId && i.itemType === item.itemType
      );
      
      if (existingItem) {
        // Update quantity if item already exists
        await updateQuantity(existingItem.id, existingItem.quantity + item.quantity);
        toast.success('Item quantity updated in cart');
      } else {
        // Insert new cart item
        const { data, error } = await supabase
          .from('cart_items')
          .insert({
            user_id: user.id,
            item_id: item.itemId,
            item_type: item.itemType,
            quantity: item.quantity
          })
          .select()
          .single();
          
        if (error) throw error;
        
        setItems(prev => [...prev, { ...item, id: data.id }]);
        toast.success('Item added to cart');
      }
    } catch (error) {
      console.error('Error adding item to cart:', error);
      toast.error('Failed to add item to cart');
    }
  };

  const removeFromCart = async (id: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
        
      if (error) throw error;
      
      setItems(prev => prev.filter(item => item.id !== id));
      toast.success('Item removed from cart');
    } catch (error) {
      console.error('Error removing item from cart:', error);
      toast.error('Failed to remove item from cart');
    }
  };

  const updateQuantity = async (id: string, quantity: number) => {
    if (!user || quantity < 1) return;
    
    try {
      const { error } = await supabase
        .from('cart_items')
        .update({ quantity })
        .eq('id', id)
        .eq('user_id', user.id);
        
      if (error) throw error;
      
      setItems(prev => 
        prev.map(item => item.id === id ? { ...item, quantity } : item)
      );
    } catch (error) {
      console.error('Error updating cart item quantity:', error);
      toast.error('Failed to update quantity');
    }
  };

  const clearCart = async () => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id);
        
      if (error) throw error;
      
      setItems([]);
    } catch (error) {
      console.error('Error clearing cart:', error);
      toast.error('Failed to clear cart');
    }
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  
  const subtotal = items.reduce(
    (sum, item) => sum + (item.price * item.quantity), 
    0
  );

  return (
    <CartContext.Provider value={{
      items,
      isLoading,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      totalItems,
      subtotal
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
