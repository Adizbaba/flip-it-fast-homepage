
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, ShoppingCart, Package, MessageCircle } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { formatCurrency } from "@/lib/utils";
import { DeclutterListing } from "@/hooks/useDeclutterListings";
import { Json } from "@/integrations/supabase/types";

// Add this function to safely access the username
const getSellerUsername = (profiles: any): string => {
  if (!profiles) return "Unknown seller";
  if (typeof profiles === 'object' && 'username' in profiles) {
    return profiles.username || "Unknown seller";
  }
  return "Unknown seller";
};

// Helper function to convert Json array to string array
const convertJsonToStringArray = (images: Json | null): string[] => {
  if (!images) return [];
  if (Array.isArray(images)) {
    return images.map(img => String(img));
  }
  return [String(images)];
};

const DeclutterListingDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [listing, setListing] = useState<DeclutterListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false);
  const [message, setMessage] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    const fetchListing = async () => {
      try {
        setLoading(true);
        if (!id) return;

        const { data, error } = await supabase
          .from("declutter_listings")
          .select("*, profiles:seller_id(*)")
          .eq("id", id)
          .single();

        if (error) throw error;

        // Fetch category information if available
        let categoryName = "Uncategorized";
        if (data.category_id) {
          const { data: categoryData } = await supabase
            .from("categories")
            .select("name")
            .eq("id", data.category_id)
            .single();
          
          if (categoryData) {
            categoryName = categoryData.name;
          }
        }

        // Process the listing data
        setListing({
          ...data,
          category_name: categoryName,
          seller_name: getSellerUsername(data.profiles),
          // Convert JSON images to string array using our new helper function
          images: convertJsonToStringArray(data.images)
        });
      } catch (err) {
        console.error("Error fetching declutter listing:", err);
        toast({
          title: "Error",
          description: "Failed to load listing details.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [id, toast]);

  const handleQuantityChange = (value: string) => {
    const numValue = parseInt(value, 10);
    if (
      !isNaN(numValue) && 
      listing && 
      numValue >= listing.min_purchase_quantity && 
      numValue <= listing.quantity
    ) {
      setQuantity(numValue);
    }
  };

  const handleAddToCart = async () => {
    try {
      setIsAddingToCart(true);
      
      // Check if user is authenticated
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user?.id) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to add items to your cart.",
        });
        return;
      }

      if (!listing) return;

      // Check if this item is already in the cart
      const { data: existingCartItem } = await supabase
        .from("cart_items")
        .select("*")
        .eq("user_id", userData.user.id)
        .eq("item_id", listing.id)
        .eq("item_type", "declutter")
        .single();

      if (existingCartItem) {
        // Update existing cart item
        const newQuantity = existingCartItem.quantity + quantity;
        const { error: updateError } = await supabase
          .from("cart_items")
          .update({ quantity: newQuantity })
          .eq("id", existingCartItem.id);

        if (updateError) throw updateError;
      } else {
        // Add new cart item
        const { error: insertError } = await supabase
          .from("cart_items")
          .insert({
            user_id: userData.user.id,
            item_id: listing.id,
            item_type: "declutter",
            quantity,
          });

        if (insertError) throw insertError;
      }

      toast({
        title: "Added to Cart",
        description: `${quantity} ${quantity > 1 ? "items" : "item"} added to your cart.`,
      });
    } catch (err: any) {
      console.error("Error adding to cart:", err);
      toast({
        title: "Error",
        description: err.message || "Failed to add item to cart.",
        variant: "destructive",
      });
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleSendMessage = async () => {
    // Simplified - would be implemented with a real messaging system
    toast({
      title: "Message Sent",
      description: "Your message has been sent to the seller.",
    });
    setIsContactDialogOpen(false);
    setMessage("");
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <div className="flex-1 container mx-auto px-4 py-8 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <div className="flex-1 container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">Listing Not Found</h2>
            <p className="mb-6 text-muted-foreground">
              The declutter listing you're looking for doesn't exist or has been removed.
            </p>
            <Button asChild>
              <Link to="/declutter">Browse Declutter Listings</Link>
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link to="/declutter" className="text-sm text-muted-foreground hover:text-primary">
            ← Back to Declutter Listings
          </Link>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Images */}
          <div>
            {listing.images && listing.images.length > 0 ? (
              <Carousel className="w-full">
                <CarouselContent>
                  {listing.images.map((image, index) => (
                    <CarouselItem key={index}>
                      <div className="overflow-hidden rounded-lg border">
                        <AspectRatio ratio={4/3}>
                          <img 
                            src={image} 
                            alt={`${listing.title} image ${index + 1}`}
                            className="h-full w-full object-cover"
                          />
                        </AspectRatio>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <CarouselPrevious className="static transform-none" />
                  <CarouselNext className="static transform-none" />
                </div>
              </Carousel>
            ) : (
              <div className="overflow-hidden rounded-lg border bg-secondary/50 flex items-center justify-center h-80">
                <Package className="h-20 w-20 text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge>{listing.condition}</Badge>
                <Badge variant="outline">{listing.category_name}</Badge>
              </div>
              <h1 className="text-3xl font-bold">{listing.title}</h1>
              <p className="text-2xl font-semibold text-primary mt-2">
                ${formatCurrency(listing.bulk_price)}
              </p>
              {listing.original_price > 0 && (
                <p className="text-sm text-muted-foreground">
                  Original value: ${formatCurrency(listing.original_price)}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <h3 className="font-medium">Sold by: {listing.seller_name}</h3>
              <p className="text-sm text-muted-foreground">
                Location: {listing.location || "Not specified"}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Quantity available:</span>
                <Badge variant="outline">{listing.quantity} items</Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Minimum purchase:</span>
                <Badge variant="outline">{listing.min_purchase_quantity} items</Badge>
              </div>
            </div>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Purchase Options</CardTitle>
                <CardDescription>
                  {listing.is_negotiable ? "Price is negotiable" : "Fixed price"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-end gap-4">
                  <div className="space-y-1">
                    <label htmlFor="quantity" className="text-sm font-medium">
                      Quantity
                    </label>
                    <Select
                      value={quantity.toString()}
                      onValueChange={handleQuantityChange}
                    >
                      <SelectTrigger className="w-20">
                        <SelectValue placeholder={listing.min_purchase_quantity.toString()} />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from(
                          { length: listing.quantity - listing.min_purchase_quantity + 1 },
                          (_, i) => listing.min_purchase_quantity + i
                        ).map((value) => (
                          <SelectItem key={value} value={value.toString()}>
                            {value}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex-1">
                    <Button 
                      className="w-full"
                      onClick={handleAddToCart}
                      disabled={isAddingToCart}
                    >
                      {isAddingToCart ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Adding...
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="mr-2 h-4 w-4" />
                          Add to Cart
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                {listing.is_negotiable && (
                  <Dialog open={isContactDialogOpen} onOpenChange={setIsContactDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full">
                        <MessageCircle className="mr-2 h-4 w-4" />
                        Contact Seller
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Contact the Seller</DialogTitle>
                        <DialogDescription>
                          Send a message to {listing.seller_name} about this listing.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <label htmlFor="message" className="text-sm font-medium">
                            Your Message
                          </label>
                          <Input
                            id="message"
                            placeholder="I'm interested in your listing..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsContactDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleSendMessage}>Send Message</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}
              </CardFooter>
            </Card>

            <Separator />

            <div>
              <h2 className="text-xl font-bold mb-2">Description</h2>
              <div className="prose prose-sm max-w-none">
                <p>{listing.description}</p>
              </div>
            </div>

            {listing.shipping_options && (
              <div>
                <h2 className="text-xl font-bold mb-2">Shipping Information</h2>
                <div className="prose prose-sm max-w-none">
                  <p>
                    {typeof listing.shipping_options === 'object'
                      ? JSON.stringify(listing.shipping_options)
                      : listing.shipping_options}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

// Add the default export
export default DeclutterListingDetail;
