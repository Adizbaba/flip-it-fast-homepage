
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingBag, MapPin, Package2, MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { DeclutterListing } from "@/hooks/useDeclutterListings";
import { formatCurrency } from "@/lib/utils";

interface DeclutterListingCardProps {
  listing: DeclutterListing;
}

const DeclutterListingCard = ({ listing }: DeclutterListingCardProps) => {
  const navigate = useNavigate();
  const imageUrl = listing.images && listing.images.length > 0
    ? listing.images[0]
    : '/placeholder.svg';

  const discountPercentage = Math.round(
    ((listing.original_price - listing.bulk_price) / listing.original_price) * 100
  );
  
  return (
    <Card className="overflow-hidden h-full flex flex-col hover:shadow-md transition-shadow">
      <div 
        className="h-48 bg-center bg-cover relative cursor-pointer transition-transform duration-300 hover:scale-105"
        style={{ backgroundImage: `url(${imageUrl})` }}
        onClick={() => navigate(`/declutter/${listing.id}`)}
      >
        <div className="absolute top-2 left-2 flex gap-1">
          <Badge variant={listing.status === 'Available' ? 'default' : 'secondary'}>
            {listing.status}
          </Badge>
          
          {discountPercentage > 0 && (
            <Badge variant="destructive">{discountPercentage}% OFF</Badge>
          )}
        </div>
        
        {listing.is_negotiable && (
          <Badge variant="outline" className="absolute top-2 right-2 bg-white">
            Negotiable
          </Badge>
        )}
      </div>
      
      <CardContent className="pt-4 flex-1">
        <h3 
          className="font-semibold text-lg mb-1 line-clamp-2 cursor-pointer hover:underline"
          onClick={() => navigate(`/declutter/${listing.id}`)}
        >
          {listing.title}
        </h3>
        
        <p className="text-muted-foreground text-sm mb-2">
          Sold by {listing.seller_name}
        </p>
        
        <div className="flex justify-between items-center mb-3">
          <div>
            <p className="text-sm font-medium">
              <span className="text-muted-foreground line-through mr-2">
                ${formatCurrency(listing.original_price)}
              </span>
              <span className="text-lg font-bold text-primary">
                ${formatCurrency(listing.bulk_price)}
              </span>
            </p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground mb-3">
          {listing.condition && (
            <Badge variant="outline">{listing.condition}</Badge>
          )}
          
          {listing.category_name && (
            <Badge variant="outline">{listing.category_name}</Badge>
          )}
          
          {listing.location && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {listing.location}
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-1 text-sm">
          <Package2 className="h-4 w-4 text-muted-foreground" />
          <span>
            Min. {listing.min_purchase_quantity} units 
            ({listing.quantity} available)
          </span>
        </div>
      </CardContent>
      
      <CardFooter className="border-t pt-3 gap-2 flex">
        <Button 
          variant="default"
          className="flex-1 group"
          onClick={() => navigate(`/declutter/${listing.id}`)}
        >
          <ShoppingBag className="h-4 w-4 mr-2 group-hover:animate-bounce" />
          Buy in Bulk
        </Button>
        
        <Button 
          variant="outline"
          size="icon"
          onClick={() => navigate(`/declutter/${listing.id}?contact=true`)}
        >
          <MessageCircle className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default DeclutterListingCard;
