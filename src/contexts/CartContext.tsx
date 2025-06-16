
import { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';

// Define the structure of a cart item
interface CartItem {
  id: string;
  itemId: string;
  title: string;
  price: number;
  quantity: number;
  image?: string;
  itemType: 'auction' | 'declutter';
  variations?: Record<string, string>; // For size, color, etc.
}

// Define the cart context type
interface CartContextType {
  items: CartItem[];
  totalItems: number;
  subtotal: number;
  isLoading: boolean;
  addToCart: (item: Omit<CartItem, 'id'>) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
}

// Create context with default values
const CartContext = createContext<CartContextType>({
  items: [],
  totalItems: 0,
  subtotal: 0,
  isLoading: true,
  addToCart: () => {},
  removeFromCart: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
});

// Generate a unique ID for local cart items
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

// Provider component
export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  // Calculate derived state
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // Load cart items when the user changes
  useEffect(() => {
    const loadCartItems = async () => {
      setIsLoading(true);
      
      try {
        // If user is logged in, fetch cart from database
        if (user) {
          const { data, error } = await supabase
            .from('cart_items')
            .select('*, item_id, quantity, item_type')
            .eq('user_id', user.id);
            
          if (error) {
            throw error;
          }
          
          if (data) {
            // For each cart item, fetch the corresponding item details
            const enrichedItems = await Promise.all(
              data.map(async (cartItem) => {
                try {
                  // Determine which table to query based on item_type
                  const tableName = cartItem.item_type === 'auction' ? 'auction_items' : 'declutter_listings';
                  
                  const { data: itemData, error: itemError } = await supabase
                    .from(tableName)
                    .select('title, images')
                    .eq('id', cartItem.item_id)
                    .single();
                    
                  if (itemError) throw itemError;
                  
                  const itemPrice = cartItem.item_type === 'auction' 
                    ? (await supabase.from('auction_items').select('starting_bid').eq('id', cartItem.item_id).single()).data?.starting_bid 
                    : (await supabase.from('declutter_listings').select('bulk_price').eq('id', cartItem.item_id).single()).data?.bulk_price;
                  
                  return {
                    id: cartItem.id,
                    itemId: cartItem.item_id,
                    title: itemData?.title || 'Unknown Item',
                    price: itemPrice || 0,
                    quantity: cartItem.quantity,
                    image: itemData?.images?.[0] || undefined,
                    itemType: cartItem.item_type as 'auction' | 'declutter',
                    variations: {} // Add variations support here if needed
                  };
                } catch (error) {
                  console.error('Error fetching item details:', error);
                  return {
                    id: cartItem.id,
                    itemId: cartItem.item_id,
                    title: 'Unknown Item',
                    price: 0,
                    quantity: cartItem.quantity,
                    itemType: cartItem.item_type as 'auction' | 'declutter',
                    variations: {}
                  };
                }
              })
            );
            
            setItems(enrichedItems);
          }
        } else {
          // If no user, check local storage
          const localCart = localStorage.getItem('fastflip_cart');
          if (localCart) {
            try {
              const parsedCart = JSON.parse(localCart);
              setItems(parsedCart);
            } catch (error) {
              console.error('Error parsing local cart:', error);
              localStorage.removeItem('fastflip_cart');
              setItems([]);
            }
          } else {
            setItems([]);
          }
        }
      } catch (error) {
        console.error('Error loading cart:', error);
        toast.error('Failed to load cart');
        setItems([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadCartItems();
  }, [user]);

  // Save cart to local storage if not logged in
  useEffect(() => {
    if (!user && !isLoading) {
      localStorage.setItem('fastflip_cart', JSON.stringify(items));
    }
  }, [items, user, isLoading]);

  // Add item to cart
  const addToCart = async (item: Omit<CartItem, 'id'>) => {
    try {
      // Check if the item is already in the cart
      const existingItem = items.find(
        (i) => i.itemId === item.itemId && i.itemType === item.itemType
      );
      
      if (existingItem) {
        // If it exists, update the quantity
        await updateQuantity(existingItem.id, existingItem.quantity + item.quantity);
        return;
      }
      
      // If user is logged in, add to database
      if (user) {
        const { data, error } = await supabase
          .from('cart_items')
          .insert({
            user_id: user.id,
            item_id: item.itemId,
            quantity: item.quantity,
            item_type: item.itemType
          })
          .select()
          .single();
          
        if (error) throw error;
        
        // Add the new item to items state
        setItems([...items, {
          id: data.id,
          ...item
        }]);
      } else {
        // If no user, add to local state with a generated ID
        setItems([...items, {
          id: generateId(),
          ...item
        }]);
      }
      
      toast.success('Added to cart');
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add item to cart');
    }
  };

  // Remove item from cart
  const removeFromCart = async (id: string) => {
    try {
      // If user is logged in, remove from database
      if (user) {
        const { error } = await supabase
          .from('cart_items')
          .delete()
          .eq('id', id);
          
        if (error) throw error;
      }
      
      // Remove from state
      setItems(items.filter(item => item.id !== id));
      toast.success('Item removed from cart');
    } catch (error) {
      console.error('Error removing from cart:', error);
      toast.error('Failed to remove item');
    }
  };

  // Update item quantity
  const updateQuantity = async (id: string, quantity: number) => {
    try {
      // Make sure quantity is valid
      if (quantity < 1) return;
      
      // If user is logged in, update database
      if (user) {
        const { error } = await supabase
          .from('cart_items')
          .update({ quantity })
          .eq('id', id);
          
        if (error) throw error;
      }
      
      // Update state
      setItems(items.map(item => 
        item.id === id ? { ...item, quantity } : item
      ));
      toast.success('Quantity updated');
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast.error('Failed to update quantity');
    }
  };

  // Clear the entire cart
  const clearCart = async () => {
    try {
      // If user is logged in, clear from database
      if (user) {
        const { error } = await supabase
          .from('cart_items')
          .delete()
          .eq('user_id', user.id);
          
        if (error) throw error;
      }
      
      // Clear state
      setItems([]);
      toast.success('Cart cleared');
    } catch (error) {
      console.error('Error clearing cart:', error);
      toast.error('Failed to clear cart');
    }
  };

  return (
    <CartContext.Provider
      value={{
        items,
        totalItems,
        subtotal,
        isLoading,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

// Custom hook for using the cart context
export const useCart = () => useContext(CartContext);
