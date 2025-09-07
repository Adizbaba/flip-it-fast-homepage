import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Package, Truck, MessageCircle, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { OrderMessaging } from "@/components/messaging/OrderMessaging";
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";
import { OrderStatusUpdater } from "@/components/orders/OrderStatusUpdater";
import { formatNGNSimple } from "@/utils/currency";

interface OrderItem {
  id: string;
  item_id: string;
  quantity: number;
  price: number;
  item_data: any;
  item_type: string;
}

interface OrderData {
  id: string;
  user_id: string;
  total_amount: number;
  status: string;
  created_at: string;
  payment_details: any;
  order_items: OrderItem[];
}

interface UserProfile {
  id: string;
  username: string;
  full_name: string;
  avatar_url?: string;
}

const OrderDetail = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [otherUserProfile, setOtherUserProfile] = useState<UserProfile | null>(null);
  const [isSeller, setIsSeller] = useState(false);

  useEffect(() => {
    if (!orderId) {
      navigate('/dashboard');
      return;
    }

    const fetchOrderData = async () => {
      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate('/auth');
          return;
        }
        setCurrentUser(user);

        // Fetch order with items
        const { data: order, error } = await supabase
          .from("orders")
          .select(`
            *,
            order_items (*)
          `)
          .eq("id", orderId)
          .single();

        if (error) throw error;
        if (!order) {
          throw new Error("Order not found");
        }

        setOrderData(order);

        // Determine if current user is seller or buyer
        const isOrderOwner = order.user_id === user.id;
        setIsSeller(!isOrderOwner);

        // Fetch the other party's profile (seller or buyer)
        let otherUserId: string;
        if (isOrderOwner) {
          // Current user is buyer, get seller info from first order item
          // This is simplified - in a real app, you'd have seller_id in the order
          otherUserId = "seller-placeholder"; // Replace with actual seller ID logic
        } else {
          // Current user is seller, other user is the buyer
          otherUserId = order.user_id;
        }

        if (otherUserId !== "seller-placeholder") {
          const { data: profile } = await supabase
            .from("profiles")
            .select("id, username, full_name, avatar_url")
            .eq("id", otherUserId)
            .single();

          if (profile) {
            setOtherUserProfile(profile);
          }
        }
      } catch (error) {
        console.error("Error fetching order:", error);
        toast({
          title: "Error",
          description: "Failed to load order details",
          variant: "destructive",
        });
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderData();
  }, [orderId, navigate, toast]);

  const handleStatusUpdate = (newStatus: string) => {
    if (orderData) {
      setOrderData({ ...orderData, status: newStatus });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Loading order details...</div>
      </div>
    );
  }

  if (!orderData) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Order not found</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" onClick={() => navigate('/dashboard')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Order Details</h1>
          <p className="text-muted-foreground">Order #{orderData.id.slice(-8)}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Order Information */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Order Summary
                </div>
                <OrderStatusBadge status={orderData.status} />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span>Order Date:</span>
                  <span>{new Date(orderData.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Amount:</span>
                  <span className="font-semibold">{formatNGNSimple(orderData.total_amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Payment Status:</span>
                  <span>Paid</span>
                </div>
              </div>

              <Separator className="my-4" />

              <div className="space-y-3">
                <h4 className="font-medium">Order Items:</h4>
                {orderData.order_items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">{item.item_data?.title || "Product"}</div>
                      <div className="text-sm text-muted-foreground">
                        Qty: {item.quantity} × {formatNGNSimple(item.price)}
                      </div>
                    </div>
                    <div className="font-medium">
                      {formatNGNSimple(item.price * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Seller Controls */}
          {isSeller && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Order Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Update Order Status:</label>
                    <div className="mt-2">
                      <OrderStatusUpdater
                        orderId={orderData.id}
                        currentStatus={orderData.status}
                        onStatusUpdate={handleStatusUpdate}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Messaging Section */}
        <div className="space-y-6">
          {otherUserProfile ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  Order Communication
                </CardTitle>
              </CardHeader>
              <CardContent>
                <OrderMessaging
                  orderId={orderData.id}
                  currentUserId={currentUser.id}
                  otherUserId={otherUserProfile.id}
                  orderStatus={orderData.status}
                  otherUserProfile={otherUserProfile}
                />
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-6">
                <div className="text-center text-muted-foreground">
                  <User className="h-8 w-8 mx-auto mb-2" />
                  <p>Messaging will be available once order is confirmed</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;