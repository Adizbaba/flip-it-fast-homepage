import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingBag, ArrowRight, Clock, CheckCircle, XCircle } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import PayNowButton from "@/components/auction/PayNowButton";

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
  total_amount: number;
  status: string;
  payment_reference?: string;
  items: OrderItem[];
}

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'completed':
      return 'bg-green-100 text-green-800';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'cancelled':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getStatusIcon = (status: string) => {
  switch (status.toLowerCase()) {
    case 'completed':
      return <CheckCircle className="h-4 w-4" />;
    case 'pending':
      return <Clock className="h-4 w-4" />;
    case 'cancelled':
      return <XCircle className="h-4 w-4" />;
    default:
      return null;
  }
};

const OrdersPage = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [wonAuctions, setWonAuctions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchOrdersAndAuctions = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // Fetch regular orders
        const { data: ordersData, error: ordersError } = await supabase
          .from('orders')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
          
        if (ordersError) throw ordersError;
        
        // Fetch won auctions
        const { data: auctionsData, error: auctionsError } = await supabase
          .from('auction_items')
          .select(`
            *,
            payment_transactions!inner(status, created_at)
          `)
          .eq('winner_id', user.id)
          .eq('status', 'Ended')
          .order('ended_at', { ascending: false });
        
        if (auctionsError) throw auctionsError;

        // Process orders with items
        if (ordersData && ordersData.length > 0) {
          const orderIds = ordersData.map(order => order.id);
          const { data: orderItems, error: itemsError } = await supabase
            .from('order_items')
            .select('*')
            .in('order_id', orderIds);
            
          if (itemsError) throw itemsError;
          
          const ordersWithItems = ordersData.map(order => {
            const items = orderItems
              .filter(item => item.order_id === order.id)
              .map(item => {
                const itemData = item.item_data as Record<string, any> || {};
                return {
                  id: item.id,
                  title: itemData.title || 'Unknown Item',
                  price: item.price,
                  quantity: item.quantity,
                  image: itemData.image,
                };
              });
              
            return { ...order, items };
          });
          
          setOrders(ordersWithItems);
        }

        setWonAuctions(auctionsData || []);
      } catch (error) {
        console.error('Error fetching orders:', error);
        toast.error('Failed to load order history');
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrdersAndAuctions();
  }, [user]);
  
  const viewOrderDetails = (orderId: string) => {
    navigate(`/dashboard/orders/${orderId}`);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Order History</h1>
          <p className="text-muted-foreground mt-1">View all your past orders and won auctions</p>
        </div>
      </div>
      
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-current border-t-transparent text-auction-purple"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Won Auctions Section */}
          {wonAuctions.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Won Auctions</h2>
              <div className="space-y-4">
                {wonAuctions.map(auction => {
                  const paymentCompleted = auction.payment_transactions?.some(
                    (tx: any) => tx.status === 'completed'
                  );
                  const mainImage = Array.isArray(auction.images) && auction.images.length > 0 
                    ? auction.images[0] 
                    : "/placeholder.svg";

                  return (
                    <Card key={auction.id} className="overflow-hidden">
                      <CardContent className="p-4">
                        <div className="flex gap-4 items-start">
                          <div className="h-20 w-20">
                            <img
                              src={mainImage}
                              alt={auction.title}
                              className="h-full w-full object-cover rounded"
                            />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium">{auction.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              Won for ₦{auction.final_selling_price?.toLocaleString()}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Ended: {format(new Date(auction.ended_at), "PPP")}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            {paymentCompleted ? (
                              <Badge variant="default" className="bg-green-100 text-green-800">
                                Paid
                              </Badge>
                            ) : (
                              <>
                                <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                                  Payment Pending
                                </Badge>
                                <PayNowButton
                                  auctionId={auction.id}
                                  isWinner={true}
                                  auctionEnded={true}
                                  paymentCompleted={paymentCompleted}
                                  size="sm"
                                />
                              </>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Regular Orders Section */}
          {orders.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Purchase Orders</h2>
              <div className="space-y-4">
                {orders.map(order => (
                  <Card key={order.id} className="overflow-hidden">
                    <CardContent className="p-0">
                      <div className="p-4 bg-muted/50 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                        <div>
                          <p className="font-medium">Order #{order.id.substring(0, 8)}</p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(order.created_at), "PPP")}
                          </p>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                          <Badge variant="outline" className={`${getStatusColor(order.status)} flex items-center gap-1`}>
                            {getStatusIcon(order.status)}
                            {order.status}
                          </Badge>
                          
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => viewOrderDetails(order.id)}
                            className="whitespace-nowrap"
                          >
                            View Details <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="p-4">
                        {order.items.slice(0, 3).map((item, idx) => (
                          <div key={idx} className="flex items-center gap-4 py-2">
                            <div className="h-16 w-16">
                              <img
                                src={item.image || "/placeholder.svg"}
                                alt={item.title}
                                className="h-full w-full object-cover rounded"
                              />
                            </div>
                            <div className="flex-1">
                              <p className="font-medium">{item.title}</p>
                              <p className="text-sm text-muted-foreground">
                                Qty: {item.quantity} × ${item.price.toFixed(2)}
                              </p>
                            </div>
                          </div>
                        ))}
                        
                        {order.items.length > 3 && (
                          <div className="text-sm text-muted-foreground mt-2">
                            +{order.items.length - 3} more items
                          </div>
                        )}
                        
                        <div className="flex justify-between items-center mt-4 pt-4 border-t">
                          <span className="font-medium">Total</span>
                          <span className="font-bold">${order.total_amount.toFixed(2)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {orders.length === 0 && wonAuctions.length === 0 && (
            <div className="text-center py-12">
              <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h2 className="text-xl font-medium mb-2">No orders yet</h2>
              <p className="text-muted-foreground mb-6">You haven't made any purchases or won any auctions yet.</p>
              <Button onClick={() => navigate("/auctions")}>Browse Auctions</Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
