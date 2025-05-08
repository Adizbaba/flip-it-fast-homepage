import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/use-toast";
import {
  ShoppingBag,
  Heart,
  Share2,
  MapPin,
  Truck,
  Store,
  MessageCircle,
  PackageCheck,
  Info,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/utils";
import { Json } from "@/integrations/supabase/types";

const DeclutterListingDetail = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const showContact = searchParams.get('contact') === 'true';
  
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [listing, setListing] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [seller, setSeller] = useState<any>(null);
  const [currentImage, setCurrentImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [contactDialogOpen, setContactDialogOpen] = useState(showContact);
  const [message, setMessage] = useState("");
  
  useEffect(() => {
    const fetchListing = async () => {
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('declutter_listings')
          .select(`
            *,
            profiles:seller_id (username, avatar_url),
            categories:category_id (name)
          `)
          .eq('id', id)
          .single();
          
        if (error) throw error;
        
        // Convert images from JSON to array if needed
        const images = data.images as Json;
        const imageArray = Array.isArray(images) ? images : (images ? [images.toString()] : null);
        data.images = imageArray;
        
        setListing(data);
        
        // Safely extract profile data
        const sellerProfile = data.profiles || {};
        setSeller({
          username: sellerProfile.username || 'Unknown Seller',
          avatar_url: sellerProfile.avatar_url
        });
        
        // Set initial quantity to minimum purchase quantity
        if (data.min_purchase_quantity) {
          setQuantity(data.min_purchase_quantity);
        }
      } catch (error) {
        console.error('Error fetching listing:', error);
        toast({
          title: 'Error',
          description: 'Could not load the listing details.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      fetchListing();
    }
  }, [id]);
  
  const handleNextImage = () => {
    if (listing?.images && listing.images.length > 0) {
      setCurrentImage((prev) => 
        prev === listing.images.length - 1 ? 0 : prev + 1
      );
    }
  };
  
  const handlePrevImage = () => {
    if (listing?.images && listing.images.length > 0) {
      setCurrentImage((prev) => 
        prev === 0 ? listing.images.length - 1 : prev - 1
      );
    }
  };
  
  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
      // Ensure at least minimum purchase quantity
      const minQty = listing?.min_purchase_quantity || 1;
      // Ensure not more than available quantity
      const maxQty = listing?.quantity || 1;
      
      setQuantity(Math.min(Math.max(value, minQty), maxQty));
    }
  };
  
  const handleContact = () => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to contact the seller.',
      });
      navigate('/auth');
      return;
    }
    
    // In a real app, this would send the message to the seller
    toast({
      title: 'Message Sent',
      description: 'Your message has been sent to the seller.',
    });
    setContactDialogOpen(false);
    setMessage("");
  };
  
  const handleBuy = () => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to purchase this item.',
      });
      navigate('/auth');
      return;
    }
    
    // In a real app, this would initiate the purchase flow
    toast({
      title: 'Purchase Initiated',
      description: `Processing your order for ${quantity} units.`,
    });
    
    // Navigate to a checkout page
    navigate(`/checkout?type=declutter&id=${id}&quantity=${quantity}`);
  };
  
  const handleShare = async () => {
    try {
      await navigator.share({
        title: listing?.title,
        text: `Check out this bulk deal: ${listing?.title}`,
        url: window.location.href,
      });
    } catch (err) {
      // Fall back to copying the URL
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: 'Link Copied',
        description: 'Listing URL copied to clipboard',
      });
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 bg-gray-50 py-8">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div>
                    <Skeleton className="h-96 w-full rounded-md" />
                  </div>
                  <div className="space-y-4">
                    <Skeleton className="h-8 w-3/4" />
                    <Skeleton className="h-6 w-1/3" />
                    <Skeleton className="h-6 w-1/2" />
                    <Skeleton className="h-24 w-full" />
                    <div className="flex gap-2">
                      <Skeleton className="h-10 w-40" />
                      <Skeleton className="h-10 w-10" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  if (!listing) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 bg-gray-50 py-8">
          <div className="container mx-auto px-4 text-center py-16">
            <h1 className="text-3xl font-bold mb-4">Listing Not Found</h1>
            <p className="text-muted-foreground mb-8">
              The declutter listing you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={() => navigate('/declutter')}>
              Back to Declutter
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  const discountPercentage = Math.round(
    ((listing.original_price - listing.bulk_price) / listing.original_price) * 100
  );
  
  const totalPrice = listing.bulk_price * quantity;
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="mb-4">
              <Button
                variant="ghost"
                className="text-muted-foreground"
                onClick={() => navigate('/declutter')}
              >
                <ChevronLeft className="mr-1 h-4 w-4" />
                Back to Declutter
              </Button>
            </div>

            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6">
                {/* Image Gallery */}
                <div className="space-y-4">
                  <div className="relative h-96 bg-gray-100 rounded-lg overflow-hidden">
                    {listing.images && listing.images.length > 0 ? (
                      <>
                        <img
                          src={listing.images[currentImage]}
                          alt={listing.title}
                          className="w-full h-full object-contain"
                        />
                        {listing.images.length > 1 && (
                          <>
                            <button
                              onClick={handlePrevImage}
                              className="absolute left-2 top-1/2 transform -translate-y-1/2 p-2 rounded-full bg-white/80 hover:bg-white shadow-sm"
                            >
                              <ChevronLeft className="h-6 w-6" />
                            </button>
                            <button
                              onClick={handleNextImage}
                              className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 rounded-full bg-white/80 hover:bg-white shadow-sm"
                            >
                              <ChevronRight className="h-6 w-6" />
                            </button>
                            <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
                              {listing.images.map((_: any, idx: number) => (
                                <button
                                  key={idx}
                                  onClick={() => setCurrentImage(idx)}
                                  className={`h-2 w-2 rounded-full ${
                                    currentImage === idx ? 'bg-primary' : 'bg-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                          </>
                        )}
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Info className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}
                    
                    <div className="absolute top-2 left-2 flex gap-1">
                      <Badge
                        variant={listing.status === 'Available' ? 'default' : 'secondary'}
                      >
                        {listing.status}
                      </Badge>
                      
                      {discountPercentage > 0 && (
                        <Badge variant="destructive">{discountPercentage}% OFF</Badge>
                      )}
                      
                      {listing.is_negotiable && (
                        <Badge variant="outline" className="bg-white">
                          Negotiable
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  {/* Thumbnail gallery would go here if needed */}
                </div>
                
                {/* Listing Details */}
                <div className="space-y-6">
                  <div>
                    <h1 className="text-2xl font-bold">{listing.title}</h1>
                    <p className="text-muted-foreground">
                      Category: {listing.categories?.name || 'Uncategorized'}
                    </p>
                    
                    <div className="flex items-center gap-2 text-sm mt-1">
                      <Badge variant="outline">{listing.condition}</Badge>
                      
                      {listing.location && (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          {listing.location}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-end gap-2">
                      <span className="text-3xl font-bold">
                        ${formatCurrency(listing.bulk_price)}
                      </span>
                      <span className="text-muted-foreground line-through">
                        ${formatCurrency(listing.original_price)}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        per unit
                      </span>
                    </div>
                    
                    <p className="text-sm text-muted-foreground">
                      {listing.quantity} units available
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-semibold mb-1">Quantity</p>
                    <div className="flex items-center gap-4">
                      <div className="flex">
                        <button
                          className="border px-3 py-1 rounded-l-md"
                          onClick={() => setQuantity(Math.max(listing.min_purchase_quantity, quantity - 1))}
                        >
                          -
                        </button>
                        <Input
                          type="number"
                          min={listing.min_purchase_quantity}
                          max={listing.quantity}
                          value={quantity}
                          onChange={handleQuantityChange}
                          className="w-16 rounded-none text-center border-l-0 border-r-0"
                        />
                        <button
                          className="border px-3 py-1 rounded-r-md"
                          onClick={() => setQuantity(Math.min(listing.quantity, quantity + 1))}
                        >
                          +
                        </button>
                      </div>
                      
                      <div className="text-sm">
                        Minimum purchase: {listing.min_purchase_quantity} units
                      </div>
                    </div>
                    
                    <div className="mt-2 font-bold">
                      Total: ${formatCurrency(totalPrice)}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      className="flex-1"
                      onClick={handleBuy}
                    >
                      <ShoppingBag className="mr-2 h-4 w-4" />
                      Buy Now in Bulk
                    </Button>
                    <Dialog
                      open={contactDialogOpen}
                      onOpenChange={setContactDialogOpen}
                    >
                      <DialogTrigger asChild>
                        <Button variant="outline">
                          <MessageCircle className="mr-2 h-4 w-4" />
                          Contact Seller
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Contact the Seller</DialogTitle>
                          <DialogDescription>
                            Send a message to {seller?.username} about this listing.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <p className="font-medium">Regarding:</p>
                            <p>{listing.title}</p>
                          </div>
                          <Textarea
                            placeholder="Write your message here..."
                            className="min-h-[120px]"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                          />
                        </div>
                        <DialogFooter>
                          <Button
                            variant="outline"
                            onClick={() => setContactDialogOpen(false)}
                          >
                            Cancel
                          </Button>
                          <Button onClick={handleContact}>
                            Send Message
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleShare}
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h2 className="font-semibold mb-2">Description</h2>
                    <p className="whitespace-pre-line text-sm">
                      {listing.description}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="p-6 bg-gray-50 border-t">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex items-start gap-3">
                    <Truck className="h-5 w-5 text-muted-foreground shrink-0" />
                    <div>
                      <h3 className="font-semibold">Shipping</h3>
                      <p className="text-sm text-muted-foreground">
                        {listing.shipping_options?.domestic || 'Contact seller for shipping details'}
                      </p>
                      {listing.shipping_options?.pickup && (
                        <p className="text-sm text-muted-foreground">Local pickup available</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <PackageCheck className="h-5 w-5 text-muted-foreground shrink-0" />
                    <div>
                      <h3 className="font-semibold">Bulk Details</h3>
                      <p className="text-sm text-muted-foreground">
                        Save {discountPercentage}% when buying in bulk
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Minimum purchase: {listing.min_purchase_quantity} units
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Store className="h-5 w-5 text-muted-foreground shrink-0" />
                    <div>
                      <h3 className="font-semibold">Seller</h3>
                      <p className="text-sm">
                        {seller?.username}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default DeclutterListingDetail;
