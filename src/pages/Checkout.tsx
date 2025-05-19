
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Container } from "@/components/ui/container";
import OrderSummary from "@/components/checkout/OrderSummary";
import PaymentSection from "@/components/checkout/PaymentSection";
import PaymentDialog from "@/components/checkout/PaymentDialog";
import CheckoutError from "@/components/checkout/CheckoutError";
import CheckoutLoading from "@/components/checkout/CheckoutLoading";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const formSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  city: z.string().min(2, "City must be at least 2 characters"), 
  state: z.string().min(2, "State must be at least 2 characters"),
  zipCode: z.string().min(4, "Zip code must be at least 4 characters"),
  phoneNumber: z.string().min(10, "Phone number must be at least 10 characters")
});

type FormValues = z.infer<typeof formSchema>;

const Checkout = () => {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const itemId = searchParams.get("id");
  const paymentType = searchParams.get("type") as "bid" | "purchase" | null;
  
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  // Form setup
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      phoneNumber: ""
    }
  });
  
  useEffect(() => {
    const fetchItemAndUserDetails = async () => {
      if (!itemId || !paymentType) {
        setError("Missing item details");
        setLoading(false);
        return;
      }
      
      try {
        // Fetch item details
        const { data: itemData, error: itemError } = await supabase
          .from("auction_items")
          .select("*, profiles:seller_id(username, avatar_url)")
          .eq("id", itemId)
          .single();
        
        if (itemError) throw itemError;
        if (!itemData) throw new Error("Item not found");
        
        setItem(itemData);
        
        // If user is logged in, fetch their profile data
        if (user) {
          const { data: profileData } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();
            
          if (profileData) {
            form.setValue("fullName", profileData.full_name || "");
            form.setValue("email", user.email || "");
            form.setValue("address", profileData.shipping_address || "");
            form.setValue("phoneNumber", profileData.contact_number || "");
          }
        }
      } catch (err: any) {
        console.error("Error fetching data:", err);
        setError(err.message || "Failed to load checkout details");
      } finally {
        setLoading(false);
      }
    };
    
    fetchItemAndUserDetails();
  }, [itemId, user, paymentType, form]);
  
  const handlePaymentClick = async () => {
    if (!user || !item || !paymentType) return;
    
    const isValid = await form.trigger();
    if (!isValid) {
      toast.error("Please complete all required fields");
      return;
    }
    
    setProcessing(true);
    
    try {
      // Prepare the payment data
      const amount = paymentType === "purchase" 
        ? (item.buy_now_price || item.starting_bid)
        : item.starting_bid;
        
      const formValues = form.getValues();
      
      // Process payment with Supabase Edge Function
      const response = await fetch(`${supabase.supabaseUrl}/functions/v1/process-payment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${supabase.supabaseKey}`
        },
        body: JSON.stringify({
          amount,
          email: formValues.email,
          userId: user.id,
          itemId: item.id,
          paymentType,
          metadata: {
            fullName: formValues.fullName,
            address: formValues.address,
            city: formValues.city,
            state: formValues.state,
            zipCode: formValues.zipCode,
            phoneNumber: formValues.phoneNumber
          }
        })
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || "Payment initiation failed");
      }
      
      // Show payment dialog with Paystack URL
      if (result.data?.authorization_url) {
        setPaymentUrl(result.data.authorization_url);
        setDialogOpen(true);
      } else {
        throw new Error("Payment URL not received");
      }
    } catch (err: any) {
      console.error("Payment error:", err);
      toast.error(err.message || "Failed to process payment");
    } finally {
      setProcessing(false);
    }
  };
  
  const handlePaymentCancel = () => {
    setDialogOpen(false);
    setPaymentUrl(null);
  };
  
  if (loading) {
    return <CheckoutLoading />;
  }
  
  if (error || !item || !paymentType) {
    return <CheckoutError />;
  }
  
  // Process the item image for display
  const itemImage = (() => {
    if (!item.images) return "/placeholder.svg";
    
    if (Array.isArray(item.images) && item.images.length > 0) {
      return item.images[0];
    }
    
    if (typeof item.images === 'string') {
      try {
        const parsedImages = JSON.parse(item.images);
        return Array.isArray(parsedImages) && parsedImages.length > 0
          ? parsedImages[0]
          : "/placeholder.svg";
      } catch {
        return item.images;
      }
    }
    
    return "/placeholder.svg";
  })();
  
  // Get price based on payment type
  const itemPrice = paymentType === "purchase" 
    ? (item.buy_now_price || item.starting_bid)
    : item.starting_bid;
  
  // Prepare the item for OrderSummary component
  const checkoutItem = {
    id: item.id,
    title: item.title,
    image: itemImage,
    amount: itemPrice,
    type: paymentType
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 py-10">
        <Container>
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Checkout</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Left side - Order summary */}
              <div className="md:col-span-1">
                <OrderSummary item={checkoutItem} />
              </div>
              
              {/* Right side - Customer info and payment */}
              <div className="md:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Customer Information</CardTitle>
                  </CardHeader>
                  
                  <CardContent>
                    <Form {...form}>
                      <form className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="fullName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Full Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="John Doe" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                  <Input type="email" placeholder="john@example.com" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <FormField
                          control={form.control}
                          name="address"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Address</FormLabel>
                              <FormControl>
                                <Input placeholder="123 Main St" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <FormField
                            control={form.control}
                            name="city"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>City</FormLabel>
                                <FormControl>
                                  <Input placeholder="New York" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="state"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>State</FormLabel>
                                <FormControl>
                                  <Input placeholder="NY" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="zipCode"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>ZIP Code</FormLabel>
                                <FormControl>
                                  <Input placeholder="10001" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <FormField
                          control={form.control}
                          name="phoneNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone Number</FormLabel>
                              <FormControl>
                                <Input type="tel" placeholder="+1 (555) 123-4567" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </form>
                    </Form>
                  </CardContent>
                </Card>
                
                <Separator />
                
                <PaymentSection 
                  amount={itemPrice}
                  processing={processing}
                  onPaymentClick={handlePaymentClick}
                />
              </div>
            </div>
          </div>
        </Container>
      </main>
      
      <PaymentDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        paymentUrl={paymentUrl}
        onCancel={handlePaymentCancel}
      />
      
      <Footer />
    </div>
  );
};

export default Checkout;
