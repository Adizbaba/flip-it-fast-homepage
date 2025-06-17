
import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Container } from "@/components/ui/container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, Package, Truck, MapPin, CreditCard } from "lucide-react";

const OrderConfirmation = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [orderData, setOrderData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const orderNumber = searchParams.get("orderNumber");
  const orderId = searchParams.get("orderId");

  useEffect(() => {
    const fetchOrderData = async () => {
      if (!orderId) {
        navigate("/");
        return;
      }

      try {
        const { data: order, error: orderError } = await supabase
          .from("orders")
          .select(`
            *,
            order_items (
              *,
              item_data
            )
          `)
          .eq("id", orderId)
          .single();

        if (orderError) throw orderError;
        setOrderData(order);
      } catch (error) {
        console.error("Error fetching order:", error);
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    fetchOrderData();
  }, [orderId, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 py-10">
          <Container>
            <div className="flex items-center justify-center h-64">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-current border-t-transparent text-primary"></div>
            </div>
          </Container>
        </main>
        <Footer />
      </div>
    );
  }

  if (!orderData) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 py-10">
          <Container>
            <div className="text-center">
              <h1 className="text-2xl font-bold">Order not found</h1>
              <Button onClick={() => navigate("/")} className="mt-4">
                Return to Home
              </Button>
            </div>
          </Container>
        </main>
        <Footer />
      </div>
    );
  }

  const checkoutData = orderData.payment_details?.checkoutData;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 py-10">
        <Container>
          <div className="max-w-4xl mx-auto">
            {/* Success Header */}
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <CheckCircle className="h-16 w-16 text-green-500" />
              </div>
              <h1 className="text-3xl font-bold text-green-600 mb-2">
                Order Confirmed!
              </h1>
              <p className="text-lg text-muted-foreground mb-4">
                Thank you for your order! Your order #{orderNumber} has been placed successfully.
              </p>
              <p className="text-sm text-muted-foreground">
                You will receive an email confirmation shortly with tracking details.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Order Details */}
              <div className="space-y-6">
                {/* Order Items */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Package className="h-5 w-5" />
                      Order Items
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {orderData.order_items?.map((item: any) => (
                        <div key={item.id} className="flex items-center space-x-4">
                          <img
                            src={item.item_data?.image || "/placeholder.svg"}
                            alt={item.item_data?.title}
                            className="w-16 h-16 object-cover rounded-md"
                          />
                          <div className="flex-1">
                            <h3 className="font-medium">{item.item_data?.title}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {item.item_type === "auction" ? "Auction" : "Declutter"}
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                Qty: {item.quantity}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">₦{(item.price * item.quantity).toLocaleString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Order Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle>Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>₦{(orderData.total_amount - (checkoutData?.shippingMethod?.price || 0)).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Shipping:</span>
                        <span>₦{(checkoutData?.shippingMethod?.price || 0).toLocaleString()}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between font-semibold text-lg">
                        <span>Total:</span>
                        <span>₦{orderData.total_amount.toLocaleString()}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Delivery & Payment Info */}
              <div className="space-y-6">
                {/* Shipping Information */}
                {checkoutData?.shippingAddress && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <MapPin className="h-5 w-5" />
                        Delivery Address
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-1">
                        <p className="font-medium">{checkoutData.shippingAddress.fullName}</p>
                        <p>{checkoutData.shippingAddress.addressLine1}</p>
                        {checkoutData.shippingAddress.addressLine2 && (
                          <p>{checkoutData.shippingAddress.addressLine2}</p>
                        )}
                        <p>
                          {checkoutData.shippingAddress.city}, {checkoutData.shippingAddress.state} {checkoutData.shippingAddress.postalCode}
                        </p>
                        <p>{checkoutData.shippingAddress.country}</p>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Shipping Method */}
                {checkoutData?.shippingMethod && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Truck className="h-5 w-5" />
                        Shipping Method
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div>
                        <p className="font-medium">{checkoutData.shippingMethod.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Estimated delivery: {checkoutData.shippingMethod.estimatedDays}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Payment Method */}
                {checkoutData?.paymentInfo && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5" />
                        Payment Method
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="font-medium">
                        {checkoutData.paymentInfo.method === 'card' ? 'Debit/Credit Card' : 'Bank Transfer'}
                      </p>
                      <p className="text-sm text-muted-foreground">Payment via Paystack</p>
                      <Badge variant="outline" className="mt-2">
                        {orderData.status === 'pending' ? 'Payment Pending' : 'Paid'}
                      </Badge>
                    </CardContent>
                  </Card>
                )}

                {/* Next Steps */}
                <Card>
                  <CardHeader>
                    <CardTitle>What's Next?</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                        1
                      </div>
                      <p className="text-sm">We'll send you an email confirmation with your order details</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-sm font-medium">
                        2
                      </div>
                      <p className="text-sm">Your order will be processed and prepared for shipping</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-sm font-medium">
                        3
                      </div>
                      <p className="text-sm">Track your order status in your account dashboard</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              <Button onClick={() => navigate("/dashboard/orders")} size="lg">
                View Order Details
              </Button>
              <Button variant="outline" onClick={() => navigate("/")} size="lg">
                Continue Shopping
              </Button>
            </div>
          </div>
        </Container>
      </main>
      
      <Footer />
    </div>
  );
};

export default OrderConfirmation;
