
import { useForm } from "react-hook-form";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/lib/auth";
import { Form } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { listingFormSchema, type ListingFormData } from "@/components/listing/schemas";
import { BasicDetails } from "@/components/listing/BasicDetails";
import { PricingDetails } from "@/components/listing/PricingDetails";
import { AuctionDetails } from "@/components/listing/AuctionDetails";
import { PaymentInfoDialog } from "@/components/listing/PaymentInfoDialog";
import ListingImageUpload from "@/components/listing/ListingImageUpload";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const CreateListing = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [images, setImages] = useState<File[]>([]);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [listingItem, setListingItem] = useState<any>(null);

  const form = useForm<ListingFormData>({
    resolver: zodResolver(listingFormSchema),
    defaultValues: {
      title: "",
      description: "",
      startingBid: 0,
      bidIncrement: 0,
      reservePrice: undefined,
      categoryId: "",
      condition: "",
      quantity: 1,
      shippingOptions: JSON.stringify({ 
        domestic: "Standard shipping",
        international: "Not available" 
      }),
      returnPolicy: "No returns accepted",
      auctionType: "standard"
    },
  });

  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*');
      
      if (error) throw error;
      return data;
    },
  });

  const onSubmit = async (data: ListingFormData) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to create a listing",
        variant: "destructive",
      });
      return;
    }

    try {
      // Upload images first
      let imageUrls: string[] = [];
      if (images.length > 0) {
        const uploadedImages = await Promise.all(
          images.map(async (file) => {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
            
            const { error: uploadError, data: uploadData } = await supabase.storage
              .from('auction_images')
              .upload(`public/${fileName}`, file);

            if (uploadError) throw uploadError;
            
            const { data: { publicUrl } } = supabase.storage
              .from('auction_images')
              .getPublicUrl(`public/${fileName}`);
              
            return publicUrl;
          })
        );
        
        imageUrls = uploadedImages;
      }

      // Properly format the data to match the database schema
      const { data: item, error } = await supabase
        .from('auction_items')
        .insert({
          seller_id: user.id,
          title: data.title,
          description: data.description,
          condition: data.condition,
          category_id: data.categoryId,
          starting_bid: data.startingBid,
          bid_increment: data.bidIncrement,
          reserve_price: data.reservePrice || null,
          buy_now_price: data.buyNowPrice || null,
          quantity: data.quantity,
          shipping_options: JSON.parse(data.shippingOptions || '{}'),
          return_policy: data.returnPolicy,
          auction_type: data.auctionType,
          start_date: data.startDate.toISOString(),
          end_date: data.endDate.toISOString(),
          status: 'Draft', // Starts as draft until published
          images: imageUrls.length > 0 ? imageUrls : null
        })
        .select()
        .single();

      if (error) throw error;

      // Store the listing item for the confirmation dialog
      setListingItem({
        id: item.id,
        title: item.title
      });
      
      setShowConfirmDialog(true);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handlePublishListing = async () => {
    setShowConfirmDialog(false);
    
    if (listingItem) {
      try {
        // Update the listing status to Active
        const { error } = await supabase
          .from('auction_items')
          .update({ status: 'Active' })
          .eq('id', listingItem.id);
          
        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Your listing has been published successfully",
        });
        
        navigate("/watch-list");
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      }
    }
  };

  const handleSaveAsDraft = async () => {
    setShowConfirmDialog(false);
    toast({
      title: "Listing Created",
      description: "Your listing has been saved as a draft. You can publish it later.",
    });
    navigate("/watch-list");
  };

  if (!user) {
    navigate('/auth');
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-gray-50 flex items-center justify-center py-12">
        <div className="w-full max-w-4xl px-4">
          <div className="bg-white rounded-xl shadow-md p-8 md:p-12 space-y-6">
            <h1 className="text-3xl font-bold text-center mb-6">Create New Listing</h1>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <BasicDetails control={form.control} />
                
                <div className="p-4 border rounded-md bg-muted/30">
                  <h3 className="font-medium mb-4">Upload Images</h3>
                  <ListingImageUpload />
                </div>

                <PricingDetails control={form.control} />
                
                <AuctionDetails 
                  control={form.control}
                  categories={categories || []}
                  categoriesLoading={categoriesLoading}
                />

                <Button type="submit" className="w-full">Create Listing</Button>
              </form>
            </Form>
          </div>
          
          <PaymentInfoDialog
            open={showConfirmDialog}
            onOpenChange={setShowConfirmDialog}
            listingItem={listingItem}
            onSkip={handleSaveAsDraft}
            onProceed={handlePublishListing}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CreateListing;
