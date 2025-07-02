
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
import { Control } from "react-hook-form";
import { 
  listingFormSchema, 
  regularListingSchema,
  auctionListingSchema,
  type ListingFormData,
  type RegularListingFormData,
  type AuctionListingFormData
} from "@/components/listing/schemas";
import { BasicDetails } from "@/components/listing/BasicDetails";
import { AuctionDetails } from "@/components/listing/AuctionDetails";
import { RegularListingForm } from "@/components/listing/RegularListingForm";
import { AuctionSpecificFields } from "@/components/listing/AuctionSpecificFields";
import { AdvancedFields } from "@/components/listing/AdvancedFields";
import { PaymentInfoDialog } from "@/components/listing/PaymentInfoDialog";
import { ListingTabs } from "@/components/listing/ListingTabs";
import ListingImageUpload from "@/components/listing/ListingImageUpload";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { TabsContent } from "@/components/ui/tabs";

const CreateListing = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [images, setImages] = useState<File[]>([]);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [listingItem, setListingItem] = useState<any>(null);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<"regular" | "auction">("regular");

  // Use different schemas based on active tab
  const getSchema = () => activeTab === "regular" ? regularListingSchema : auctionListingSchema;
  
  const form = useForm<ListingFormData>({
    resolver: zodResolver(getSchema()),
    defaultValues: {
      listingType: "regular",
      title: "",
      description: "",
      categoryId: "",
      condition: "",
      quantity: 1,
      shippingOptions: JSON.stringify({ 
        domestic: "Standard shipping",
        international: "Not available" 
      }),
      returnPolicy: "No returns accepted",
      // Regular listing defaults
      price: 0,
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

  const handleTabChange = (value: string) => {
    const newActiveTab = value as "regular" | "auction";
    setActiveTab(newActiveTab);
    
    // Reset form with new defaults for the selected tab
    if (newActiveTab === "regular") {
      form.reset({
        listingType: "regular",
        title: "",
        description: "",
        categoryId: "",
        condition: "",
        quantity: 1,
        shippingOptions: JSON.stringify({ 
          domestic: "Standard shipping",
          international: "Not available" 
        }),
        returnPolicy: "No returns accepted",
        price: 0,
      });
    } else {
      form.reset({
        listingType: "auction",
        title: "",
        description: "",
        categoryId: "",
        condition: "",
        quantity: 1,
        shippingOptions: JSON.stringify({ 
          domestic: "Standard shipping",
          international: "Not available" 
        }),
        returnPolicy: "No returns accepted",
        startingBid: 0,
        bidIncrement: 1,
        auctionType: "standard",
        startDate: new Date(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });
    }
    
    // Clear form errors
    form.clearErrors();
  };

  const onSubmit = async (data: ListingFormData) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to create a listing",
        variant: "destructive",
      });
      return;
    }

    setSubmissionError(null);
    setUploading(true);

    try {
      // For auction listings, validate dates
      if (data.listingType === "auction") {
        const auctionData = data as AuctionListingFormData;
        const now = new Date();
        const startDate = new Date(auctionData.startDate);
        const endDate = new Date(auctionData.endDate);
        
        if (endDate <= startDate) {
          toast({
            title: "Error",
            description: "End date must be after start date",
            variant: "destructive",
          });
          setUploading(false);
          return;
        }

        if (endDate <= now) {
          toast({
            title: "Error",
            description: "End date must be in the future",
            variant: "destructive",
          });
          setUploading(false);
          return;
        }

        if (auctionData.buyNowPrice && auctionData.startingBid && auctionData.buyNowPrice <= auctionData.startingBid) {
          toast({
            title: "Error",
            description: "Buy now price must be greater than starting bid",
            variant: "destructive",
          });
          setUploading(false);
          return;
        }
      }

      // Upload images first
      let imageUrls: string[] = [];
      if (images.length > 0) {
        try {
          const uploadedImages = await Promise.all(
            images.map(async (file) => {
              const fileExt = file.name.split('.').pop();
              const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
              
              console.log(`Uploading file ${fileName} to auction_images/public/`);
              
              const { error: uploadError } = await supabase.storage
                .from('auction_images')
                .upload(`public/${fileName}`, file);

              if (uploadError) {
                console.error("Error uploading file:", uploadError);
                throw uploadError;
              }
              
              const { data: { publicUrl } } = supabase.storage
                .from('auction_images')
                .getPublicUrl(`public/${fileName}`);
                
              return publicUrl;
            })
          );
          
          imageUrls = uploadedImages;
        } catch (uploadError) {
          console.error("Error during image upload:", uploadError);
          throw new Error(`Image upload failed: ${uploadError instanceof Error ? uploadError.message : String(uploadError)}`);
        }
      }

      // Prepare data based on listing type
      let insertData: any = {
        seller_id: user.id,
        title: data.title,
        description: data.description,
        condition: data.condition,
        category_id: data.categoryId,
        quantity: data.quantity,
        shipping_options: JSON.parse(data.shippingOptions || '{}'),
        return_policy: data.returnPolicy,
        status: 'Draft',
        images: imageUrls.length > 0 ? imageUrls : null
      };

      if (data.listingType === "regular") {
        const regularData = data as RegularListingFormData;
        insertData = {
          ...insertData,
          starting_bid: regularData.price, // Use price as starting_bid for consistency
          bid_increment: 0, // No bidding for regular listings
          auction_type: 'fixed_price',
          start_date: new Date().toISOString(),
          end_date: null, // No end date for regular listings
          buy_now_price: regularData.price,
        };
      } else {
        const auctionData = data as AuctionListingFormData;
        insertData = {
          ...insertData,
          starting_bid: auctionData.startingBid,
          bid_increment: auctionData.bidIncrement,
          reserve_price: auctionData.reservePrice || null,
          buy_now_price: auctionData.buyNowPrice || null,
          auction_type: auctionData.auctionType,
          start_date: new Date(auctionData.startDate).toISOString(),
          end_date: new Date(auctionData.endDate).toISOString(),
        };
      }

      console.log("Submitting data to Supabase:", insertData);

      const { data: item, error } = await supabase
        .from('auction_items')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }

      console.log("Item created successfully:", item);

      setListingItem({
        id: item.id,
        title: item.title
      });
      
      setShowConfirmDialog(true);
    } catch (error: any) {
      setSubmissionError(error.message);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handlePublishListing = async () => {
    setShowConfirmDialog(false);
    
    if (listingItem) {
      try {
        const { error } = await supabase
          .from('auction_items')
          .update({ status: 'Active' })
          .eq('id', listingItem.id);
          
        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Your listing has been published successfully",
        });
        
        navigate("/auctions");
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
            
            {submissionError && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
                <p className="text-red-800 font-medium">Error: {submissionError}</p>
                <p className="text-sm text-red-600 mt-1">Please check your form values and try again.</p>
              </div>
            )}
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <ListingTabs onTabChange={handleTabChange} defaultValue="regular">
                  <TabsContent value="regular" className="space-y-6">
                    <BasicDetails control={form.control} />
                    
                    <div className="p-4 border rounded-md bg-muted/30">
                      <h3 className="font-medium mb-4">Upload Images</h3>
                      <ListingImageUpload images={images} setImages={setImages} />
                    </div>

                    <RegularListingForm control={form.control as Control<RegularListingFormData>} />
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <label className="text-sm font-medium">Category & Condition</label>
                        <div className="grid grid-cols-1 gap-4">
                          {/* Category and condition selectors would go here */}
                        </div>
                      </div>
                    </div>

                    <AdvancedFields control={form.control} />
                  </TabsContent>

                  <TabsContent value="auction" className="space-y-6">
                    <BasicDetails control={form.control} />
                    
                    <div className="p-4 border rounded-md bg-muted/30">
                      <h3 className="font-medium mb-4">Upload Images</h3>
                      <ListingImageUpload images={images} setImages={setImages} />
                    </div>

                    <AuctionSpecificFields control={form.control as Control<AuctionListingFormData>} />
                    
                    <AuctionDetails 
                      control={form.control}
                      categories={categories || []}
                      categoriesLoading={categoriesLoading}
                    />

                    <AdvancedFields control={form.control} />
                  </TabsContent>
                </ListingTabs>

                <Button type="submit" className="w-full" disabled={uploading}>
                  {uploading ? (
                    <>
                      <span className="animate-spin mr-2">⭘</span> 
                      Creating Listing...
                    </>
                  ) : (
                    `Create ${activeTab === "regular" ? "Regular" : "Auction"} Listing`
                  )}
                </Button>
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
