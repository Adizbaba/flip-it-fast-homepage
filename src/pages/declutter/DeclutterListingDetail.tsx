
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { DeclutterListing } from "@/hooks/useDeclutterListings";
import { getSellerUsername, convertJsonToStringArray } from "@/components/declutter/utils/dataUtils";
import DeclutterImageGallery from "@/components/declutter/DeclutterImageGallery";
import DeclutterListingDetails from "@/components/declutter/DeclutterListingDetails";
import DeclutterPurchaseCard from "@/components/declutter/DeclutterPurchaseCard";

const DeclutterListingDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [listing, setListing] = useState<DeclutterListing | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchListing = async () => {
      try {
        setLoading(true);
        if (!id) return;

        const { data, error } = await supabase
          .from("declutter_listings")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;
        if (!data) throw new Error("Item not found");
        
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

        // Fetch seller public profile
        let sellerUsername = "Unknown seller";
        if (data.seller_id) {
          const { data: sellerProfile } = await (supabase as any)
            .from("profiles")
            .select("id, username, avatar_url")
            .eq("id", data.seller_id)
            .eq("profile_visibility", "public")
            .maybeSingle();
          if (sellerProfile?.username) {
            sellerUsername = sellerProfile.username;
          }
        }

        // Process the listing data
        setListing({
          ...data,
          category_name: categoryName,
          seller_name: sellerUsername,
          // Convert JSON images to string array using our helper function
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
            <DeclutterImageGallery images={listing.images} title={listing.title} />
          </div>

          {/* Details */}
          <div className="space-y-6">
            <DeclutterListingDetails listing={listing} />
            <DeclutterPurchaseCard listing={listing} />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default DeclutterListingDetail;
