
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/utils";
import { DeclutterListing } from "@/hooks/useDeclutterListings";

interface DeclutterListingDetailsProps {
  listing: DeclutterListing;
}

const DeclutterListingDetails = ({ listing }: DeclutterListingDetailsProps) => {
  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Badge>{listing.condition}</Badge>
          <Badge variant="outline">{listing.category_name}</Badge>
        </div>
        <h1 className="text-3xl font-bold">{listing.title}</h1>
        <p className="text-2xl font-semibold text-primary mt-2">
          ${formatCurrency(listing.bulk_price)} <span className="text-sm text-muted-foreground">per unit</span>
        </p>
        {listing.original_price > 0 && (
          <p className="text-sm text-muted-foreground">
            Original value: ${formatCurrency(listing.original_price)} per unit
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
  );
};

export default DeclutterListingDetails;
