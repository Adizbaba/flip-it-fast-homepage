
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import AddToCartButton from "@/components/AddToCartButton";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Badge } from '@/components/ui/badge';
import { MapPin, Package, Truck, User, Mail } from 'lucide-react';

const DeclutterListingDetail = () => {
  const { id } = useParams();

  // Fetch declutter listing details
  const { data: listing, isLoading, error } = useQuery({
    queryKey: ['declutterListing', id],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('declutter_listings')
          .select(`
            *,
            categories:category_id (name),
            profiles:seller_id (username, avatar_url)
          `)
          .eq('id', id)
          .single();

        if (error) throw error;
        return data;
      } catch (err) {
        console.error('Error fetching declutter listing:', err);
        throw err;
      }
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8 flex-1">
          <div className="animate-pulse space-y-4">
            <div className="h-96 bg-muted rounded-lg"></div>
            <div className="space-y-2">
              <div className="h-8 bg-muted rounded w-3/4"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8 flex-1">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-500">Listing not found</h1>
            <p className="text-muted-foreground">The listing you're looking for doesn't exist or has been removed.</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Extract seller profile
  const sellerProfile = listing.profiles || { username: 'Unknown Seller' };
  
  // Calculate savings
  const savingsPercent = Math.round((1 - (listing.bulk_price / listing.original_price)) * 100);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Images Gallery */}
          <div className="space-y-4">
            <Card className="p-4">
              <Carousel>
                <CarouselContent>
                  {(listing.images as string[] || ['/placeholder.svg']).map((image, index) => (
                    <CarouselItem key={index}>
                      <div className="aspect-square relative">
                        <img
                          src={image}
                          alt={`${listing.title} - Image ${index + 1}`}
                          className="object-cover rounded-lg"
                        />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
              </Carousel>
            </Card>

            {/* Additional Details */}
            <Card>
              <CardContent className="p-4 space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Shipping</h3>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Truck className="h-4 w-4" />
                    <span>
                      {listing.shipping_options ?
                        'Shipping options available' :
                        'Contact seller for shipping details'}
                    </span>
                  </div>
                </div>
                {listing.location && (
                  <div>
                    <h3 className="font-semibold mb-2">Location</h3>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{listing.location}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Listing Details */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center space-x-2 mb-1">
                {listing.categories && (
                  <Badge variant="outline" className="text-xs">
                    {listing.categories.name}
                  </Badge>
                )}
                <Badge variant="outline" className="text-xs">
                  {listing.condition}
                </Badge>
              </div>
              <h1 className="text-3xl font-bold">{listing.title}</h1>
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Bulk Price</p>
                  <p className="text-2xl font-bold">${listing.bulk_price}</p>
                  <p className="text-sm text-muted-foreground line-through">
                    ${listing.original_price} original price
                  </p>
                  <p className="text-sm text-green-600">
                    Save {savingsPercent}%
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Available Quantity</p>
                  <p className="text-2xl font-medium">{listing.quantity} items</p>
                  <p className="text-sm text-muted-foreground">
                    Min. purchase: {listing.min_purchase_quantity} items
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Button 
                  className="w-full" 
                  size="lg"
                >
                  Contact Seller
                </Button>
                
                <AddToCartButton 
                  itemId={listing.id}
                  itemType="declutter"
                  title={listing.title}
                  price={listing.bulk_price}
                  image={(listing.images as string[])?.[0]}
                  quantity={listing.min_purchase_quantity}
                  className="w-full"
                  size="lg"
                  variant="outline"
                />
              </div>
              
              {listing.is_negotiable && (
                <p className="text-sm text-center">
                  <span className="font-medium">Price is negotiable.</span> Contact the seller for bulk discounts.
                </p>
              )}
            </div>

            <Separator />

            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Description</h2>
              <p className="text-muted-foreground whitespace-pre-wrap">{listing.description}</p>
            </div>

            <Separator />

            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Seller Information</h2>
              <div className="flex items-center space-x-4">
                <Avatar>
                  <AvatarFallback>
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{sellerProfile.username}</p>
                  <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                    <Button variant="link" className="h-auto p-0 text-sm">
                      <Mail className="h-3 w-3 mr-1" />
                      Contact Seller
                    </Button>
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
