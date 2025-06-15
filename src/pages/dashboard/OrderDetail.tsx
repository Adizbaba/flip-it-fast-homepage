
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle, Clock, XCircle, Package, Truck, Copy } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

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

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'completed':
    case 'delivered':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'pending':
    case 'processing':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'shipped':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'cancelled':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getStatusIcon = (status: string) => {
  switch (status.toLowerCase()) {
    case 'completed':
    case 'delivered':
      return <CheckCircle className="h-4 w-4" />;
    case 'pending':
    case 'processing':
      return <Clock className="h-4 w-4" />;
    case 'shipped':
      return <Truck className="h-4 w-4" />;
    case 'cancelled':
      return <XCircle className="h-4 w-4" />;
    default:
      return <Package className="h-4 w-4" />;
  }
};

const OrderDetail = () => {
  const { orderId } = useParams();
  const { user } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!user || !orderId) return;
      
      try {
        setLoading(true);
        
        // Fetch order details
        const { data: orderData, error: orderError } = await supabase
          .from('orders')
          .select('*')
          .eq('id', orderId)
          .eq('user_id', user.id)
          .single();
          
        if (orderError) {
          if (orderError.code === 'PGRST116') {
            throw new Error('Order not found or you do not have permission to view it.');
          }
          throw orderError;
        }
        
        // Fetch order items
        const { data: orderItems, error: itemsError } = await supabase
          .from('order_items')
          .select('*')
          .eq('order_id', orderId);
          
        if (itemsError) throw itemsError;
        
        // Transform items for display
        const transformedItems = orderItems?.map(item => {
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
        
        setOrder({
          ...orderData,
          items: transformedItems
        });
      } catch (error: any) {
        console.error('Error fetching order details:', error);
        toast.error(error.message || 'Failed to load order details');
        navigate('/dashboard/orders');
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrderDetails();
  }, [orderId, user, navigate]);

  const copyOrderId = () => {
    if (order) {
      navigator.clipboard.writeText(order.id);
      toast.success('Order ID copied to clipboard');
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-current border-t-transparent text-auction-purple"></div>
      </div>
    );
  }
  
  if (!order) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-medium mb-2">Order not found</h2>
        <p className="text-muted-foreground mb-6">The order you're looking for doesn't exist or you don't have permission to view it.</p>
        <Button onClick={() => navigate("/dashboard/orders")}>Back to Orders</Button>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard/orders')}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Orders
        </Button>
      </div>
      
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Order Details</h1>
          <div className="flex items-center gap-2 mt-2">
            <p className="text-muted-foreground">Order #{order.id.substring(0, 8)}</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={copyOrderId}
              className="h-6 w-6 p-0"
            >
              <Copy className="h-3 w-3" />
            </Button>
          </div>
        </div>
        
        <Badge 
          variant="outline" 
          className={`${getStatusColor(order.status)} flex items-center gap-1 px-3 py-1 text-sm`}
        >
          {getStatusIcon(order.status)}
          {order.status}
        </Badge>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Items Ordered</CardTitle>
            </CardHeader>
            <CardContent>
              {order.items.map((item, idx) => (
                <div key={idx}>
                  <div className="flex items-center gap-4 py-4">
                    <div className="h-20 w-20 flex-shrink-0">
                      <img
                        src={item.image || "/placeholder.svg"}
                        alt={item.title}
                        className="h-full w-full object-cover rounded border"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{item.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.item_type === 'auction' ? 'Auction Item' : 'Declutter Item'}
                      </p>
                      <Button
                        variant="link"
                        className="p-0 h-auto text-sm"
                        onClick={() => navigate(`/${item.item_type === 'auction' ? 'item' : 'declutter'}/${item.item_id}`)}
                      >
                        View Item →
                      </Button>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-medium">${item.price.toFixed(2)}</p>
                      <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                      <p className="font-medium mt-1">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                  {idx < order.items.length - 1 && <Separator />}
                </div>
              ))}
              
              <Separator className="my-4" />
              <div className="flex justify-between items-center">
                <span className="font-medium">Order Total</span>
                <span className="font-bold text-lg">${order.total_amount.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium text-sm text-muted-foreground">Order Date</h3>
                <p>{format(new Date(order.created_at), "PPP 'at' p")}</p>
              </div>
              
              <div>
                <h3 className="font-medium text-sm text-muted-foreground">Last Updated</h3>
                <p>{format(new Date(order.updated_at), "PPP 'at' p")}</p>
              </div>
              
              <div>
                <h3 className="font-medium text-sm text-muted-foreground">Order Status</h3>
                <Badge variant="outline" className={`${getStatusColor(order.status)} mt-1 flex items-center gap-1 w-fit`}>
                  {getStatusIcon(order.status)}
                  {order.status}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {order.payment_reference && (
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground">Payment Reference</h3>
                  <p className="font-mono text-sm bg-muted p-2 rounded">{order.payment_reference}</p>
                </div>
              )}
              
              <div>
                <h3 className="font-medium text-sm text-muted-foreground">Payment Status</h3>
                <Badge variant={order.payment_reference ? "default" : "secondary"} className="mt-1">
                  {order.payment_reference ? "Paid" : "Pending"}
                </Badge>
              </div>

              <div>
                <h3 className="font-medium text-sm text-muted-foreground">Total Amount</h3>
                <p className="font-bold text-lg">${order.total_amount.toFixed(2)}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
