
import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

interface OrderItem {
  id: string;
  item_id: string;
  item_type: string;
  title: string;
  price: number;
  quantity: number;
  image?: string;
}

interface Order {
  id: string;
  created_at: string;
  updated_at: string;
  total_amount: number;
  status: string;
  payment_reference?: string;
  payment_details?: any;
  items: OrderItem[];
}

interface UseOrdersProps {
  search?: string;
  statusFilter?: string;
  sortBy?: string;
}

export const useOrders = ({ search = "", statusFilter = "all", sortBy = "date-desc" }: UseOrdersProps = {}) => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // Fetch all orders for the user
        const { data: ordersData, error: ordersError } = await supabase
          .from('orders')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
          
        if (ordersError) throw ordersError;
        
        if (!ordersData?.length) {
          setOrders([]);
          return;
        }
        
        // Fetch order items for each order
        const orderIds = ordersData.map(order => order.id);
        const { data: orderItems, error: itemsError } = await supabase
          .from('order_items')
          .select('*')
          .in('order_id', orderIds);
          
        if (itemsError) throw itemsError;
        
        // Combine orders with their items
        const ordersWithItems = ordersData.map(order => {
          const items = orderItems
            ?.filter(item => item.order_id === order.id)
            .map(item => {
              const itemData = item.item_data as Record<string, any> || {};
              return {
                id: item.id,
                item_id: item.item_id,
                item_type: item.item_type,
                title: itemData.title || 'Unknown Item',
                price: item.price,
                quantity: item.quantity,
                image: itemData.image,
              };
            }) || [];
            
          return {
            ...order,
            items
          };
        });
        
        setOrders(ordersWithItems);
      } catch (error) {
        console.error('Error fetching orders:', error);
        toast.error('Failed to load orders');
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrders();

    // Set up real-time subscription for order updates
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `user_id=eq.${user?.id}`
        },
        () => {
          // Refetch orders when there's a change
          fetchOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Filter and sort orders
  const filteredAndSortedOrders = useMemo(() => {
    let filtered = orders;

    // Apply search filter
    if (search) {
      filtered = filtered.filter(order => 
        order.id.toLowerCase().includes(search.toLowerCase()) ||
        order.items.some(item => 
          item.title.toLowerCase().includes(search.toLowerCase())
        )
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(order => 
        order.status.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "date-asc":
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case "date-desc":
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case "amount-asc":
          return a.total_amount - b.total_amount;
        case "amount-desc":
          return b.total_amount - a.total_amount;
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

    return filtered;
  }, [orders, search, statusFilter, sortBy]);

  return {
    orders: filteredAndSortedOrders,
    loading,
    refetch: () => {
      // This will trigger the useEffect to refetch orders
      setLoading(true);
    }
  };
};
