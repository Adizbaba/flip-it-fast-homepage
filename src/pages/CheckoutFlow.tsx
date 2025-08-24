
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Container } from "@/components/ui/container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import CheckoutProgress from "@/components/checkout/CheckoutProgress";
import ContactInformationStep from "@/components/checkout/ContactInformationStep";
import ShippingInformationStep from "@/components/checkout/ShippingInformationStep";
import ShippingMethodStep from "@/components/checkout/ShippingMethodStep";
import PaymentInformationStep from "@/components/checkout/PaymentInformationStep";
import ReviewOrderStep from "@/components/checkout/ReviewOrderStep";
import CheckoutSidebar from "@/components/checkout/CheckoutSidebar";

export interface CheckoutData {
  contactInfo: {
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    isGuest: boolean;
  };
  shippingAddress: {
    fullName: string;
    addressLine1: string;
    addressLine2: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  shippingMethod: {
    id: string;
    name: string;
    price: number;
    estimatedDays: string;
  };
  paymentInfo: {
    method: 'card' | 'transfer';
    billingAddress: {
      fullName: string;
      addressLine1: string;
      addressLine2: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
    };
    sameAsShipping: boolean;
  };
}

const CheckoutFlow = () => {
  const { user } = useAuth();
  const { items, subtotal, clearCart, isLoading: cartLoading } = useCart();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [checkoutData, setCheckoutData] = useState<CheckoutData>({
    contactInfo: {
      email: user?.email || '',
      firstName: '',
      lastName: '',
      phone: '',
      isGuest: !user
    },
    shippingAddress: {
      fullName: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'Nigeria'
    },
    shippingMethod: {
      id: '',
      name: '',
      price: 0,
      estimatedDays: ''
    },
    paymentInfo: {
      method: 'card',
      billingAddress: {
        fullName: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'Nigeria'
      },
      sameAsShipping: true
    }
  });

  // Handle direct "Buy It Now" purchases from URL params
  useEffect(() => {
    const buyNow = searchParams.get('buyNow');
    const itemId = searchParams.get('itemId');
    const itemType = searchParams.get('itemType');
    const quantity = searchParams.get('quantity');

    if (buyNow === 'true' && itemId && itemType) {
      // This is a direct "Buy It Now" purchase, skip cart validation
      return;
    }

    // Only redirect if this is not a direct purchase and cart is empty
    if (!cartLoading && items.length === 0 && buyNow !== 'true') {
      toast.error("Your cart is empty");
      navigate("/cart");
    }
  }, [items, cartLoading, navigate, searchParams]);

  // Load user profile data if logged in
  useEffect(() => {
    const loadUserData = async () => {
      if (user) {
        try {
          const { data: profileData } = await (supabase as any)
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();
            
          if (profileData) {
            setCheckoutData(prev => ({
              ...prev,
              contactInfo: {
                ...prev.contactInfo,
                email: user.email || '',
                firstName: profileData.full_name?.split(' ')[0] || '',
                lastName: profileData.full_name?.split(' ').slice(1).join(' ') || '',
                phone: profileData.contact_number || '',
                isGuest: false
              },
              shippingAddress: {
                ...prev.shippingAddress,
                fullName: profileData.full_name || '',
                addressLine1: profileData.shipping_address || ''
              }
            }));
          }
        } catch (error) {
          console.error("Error loading user data:", error);
        }
      }
    };
    
    loadUserData();
  }, [user]);

  const updateCheckoutData = (step: string, data: any) => {
    setCheckoutData(prev => ({
      ...prev,
      [step]: { ...prev[step as keyof CheckoutData], ...data }
    }));
  };

  const nextStep = () => {
    if (currentStep < 5) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const goToStep = (step: number) => {
    setCurrentStep(step);
  };

  const calculateTotal = () => {
    return subtotal + checkoutData.shippingMethod.price;
  };

  const handlePlaceOrder = async () => {
    if (!user && !checkoutData.contactInfo.isGuest) {
      toast.error("Please log in or continue as guest");
      return;
    }

    setIsLoading(true);
    
    try {
      // Generate 5-digit order number
      const orderNumber = Math.floor(10000 + Math.random() * 90000).toString();
      
      // Prepare the payment details object with proper JSON serialization
      const paymentDetails = {
        orderNumber,
        checkoutData: JSON.parse(JSON.stringify(checkoutData)), // Ensure JSON compatibility
        items: items.map(item => ({
          id: item.id,
          itemId: item.itemId,
          title: item.title,
          price: item.price,
          quantity: item.quantity,
          itemType: item.itemType
        }))
      };
      
      // Create order with nullable user_id handling
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: user?.id || null,
          total_amount: calculateTotal(),
          status: "pending",
          payment_details: paymentDetails
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = items.map(item => ({
        order_id: order.id,
        item_id: item.itemId,
        item_type: item.itemType,
        quantity: item.quantity,
        price: item.price,
        item_data: {
          title: item.title,
          image: item.image
        }
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Process stock reduction
      try {
        const { error: stockError } = await supabase.functions.invoke('process-order', {
          body: {
            orderId: order.id,
            items: items.map(item => ({
              itemId: item.itemId,
              itemType: item.itemType,
              quantity: item.quantity,
              price: item.price
            }))
          }
        });

        if (stockError) {
          console.error("Stock processing error:", stockError);
          // Don't block the order, but log the error
        }
      } catch (stockError) {
        console.error("Failed to process stock:", stockError);
        // Continue with order completion even if stock update fails
      }

      // Clear cart
      await clearCart();

      // Navigate to confirmation
      navigate(`/order-confirmation?orderNumber=${orderNumber}&orderId=${order.id}`);
      
    } catch (error) {
      console.error("Error placing order:", error);
      toast.error("Failed to place order. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (cartLoading) {
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

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <ContactInformationStep
            data={checkoutData.contactInfo}
            onUpdate={(data) => updateCheckoutData('contactInfo', data)}
            onNext={nextStep}
            user={user}
          />
        );
      case 2:
        return (
          <ShippingInformationStep
            data={checkoutData.shippingAddress}
            onUpdate={(data) => updateCheckoutData('shippingAddress', data)}
            onNext={nextStep}
            onPrev={prevStep}
          />
        );
      case 3:
        return (
          <ShippingMethodStep
            data={checkoutData.shippingMethod}
            onUpdate={(data) => updateCheckoutData('shippingMethod', data)}
            onNext={nextStep}
            onPrev={prevStep}
            subtotal={subtotal}
          />
        );
      case 4:
        return (
          <PaymentInformationStep
            data={checkoutData.paymentInfo}
            shippingAddress={checkoutData.shippingAddress}
            onUpdate={(data) => updateCheckoutData('paymentInfo', data)}
            onNext={nextStep}
            onPrev={prevStep}
          />
        );
      case 5:
        return (
          <ReviewOrderStep
            checkoutData={checkoutData}
            items={items}
            subtotal={subtotal}
            total={calculateTotal()}
            onPlaceOrder={handlePlaceOrder}
            onPrev={prevStep}
            onEdit={goToStep}
            isLoading={isLoading}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 py-6 md:py-10">
        <Container>
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <h1 className="text-2xl md:text-3xl font-bold mb-4">Secure Checkout</h1>
              <CheckoutProgress currentStep={currentStep} />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main checkout content */}
              <div className="lg:col-span-2">
                {renderStep()}
              </div>
              
              {/* Order summary sidebar */}
              <div className="lg:col-span-1">
                <CheckoutSidebar
                  items={items}
                  subtotal={subtotal}
                  shippingCost={checkoutData.shippingMethod.price}
                  total={calculateTotal()}
                />
              </div>
            </div>
          </div>
        </Container>
      </main>
      
      <Footer />
    </div>
  );
};

export default CheckoutFlow;
