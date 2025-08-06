import { useForm } from "react-hook-form";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/lib/auth";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
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
import { ModernRegularListingForm } from "@/components/listing/ModernRegularListingForm";
import { AuctionSpecificFields } from "@/components/listing/AuctionSpecificFields";
import { AdvancedFields } from "@/components/listing/AdvancedFields";
import { PaymentInfoDialog } from "@/components/listing/PaymentInfoDialog";
import { ListingTabs } from "@/components/listing/ListingTabs";
import ListingImageUpload from "@/components/listing/ListingImageUpload";
import { CategorySelector } from "@/components/listing/CategorySelector";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Package } from "lucide-react";

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
      location: "",
      salePrice: undefined,
      minOrderQuantity: undefined,
      allowBackorders: false,
      sku: "",
      brand: "",
      weight: undefined,
      dimensions: undefined,
      seoTitle: "",
      seoDescription: "",
      tags: "",
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
        location: "",
        salePrice: undefined,
        minOrderQuantity: undefined,
        allowBackorders: false,
        sku: "",
        brand: "",
        weight: undefined,
        dimensions: undefined,
        seoTitle: "",
        seoDescription: "",
        tags: "",
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
        reservePrice: undefined,
        buyNowPrice: undefined,
        auctionType: "standard",
        startDate: new Date(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        autoExtend: false,
        extensionDuration: undefined,
        triggerTimeframe: undefined,
        sku: "",
        brand: "",
        weight: undefined,
        dimensions: undefined,
        seoTitle: "",
        seoDescription: "",
        tags: "",
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
        // For regular listings, set a far future end date to indicate it's always available
        const farFutureDate = new Date();
        farFutureDate.setFullYear(farFutureDate.getFullYear() + 10); // 10 years from now
        
        insertData = {
          ...insertData,
          starting_bid: regularData.price, // Use price as starting_bid for consistency
          bid_increment: 0, // No bidding for regular listings
          auction_type: 'standard', // Use 'standard' which is allowed by the constraint
          start_date: new Date().toISOString(),
          end_date: farFutureDate.toISOString(), // Set far future date instead of null
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
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-blue-50">
      <Header />
      <main className="flex-1 py-8 md:py-12">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-8">
              <h1 className="text-3xl md:text-4xl font-bold text-center">Create New Listing</h1>
              <p className="text-center mt-2 text-blue-100">List your items for sale on FastFlip marketplace</p>
            </div>

            <div className="p-8 md:p-12">
              {submissionError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <p className="text-red-800 font-medium">Error: {submissionError}</p>
                  <p className="text-sm text-red-600 mt-1">Please check your form values and try again.</p>
                </div>
              )}
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                  <ListingTabs onTabChange={handleTabChange} defaultValue="regular">
                    <TabsContent value="regular" className="space-y-8">
                      {/* Image Upload Section */}
                      <div className="bg-gradient-to-r from-slate-50 to-gray-50 border border-slate-200 rounded-xl p-6">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                          <Package className="h-5 w-5" />
                          Product Images *
                        </h3>
                        <ListingImageUpload images={images} setImages={setImages} />
                        <p className="text-sm text-muted-foreground mt-2">
                          Upload high-quality images to attract more buyers. First image will be your thumbnail.
                        </p>
                      </div>

                      <ModernRegularListingForm 
                        control={form.control as Control<RegularListingFormData>} 
                        categories={categories || []}
                        categoriesLoading={categoriesLoading}
                      />

                      <AdvancedFields control={form.control} />
                    </TabsContent>

                    <TabsContent value="auction" className="space-y-8">
                      <BasicDetails control={form.control} />
                      
                      <div className="bg-gradient-to-r from-slate-50 to-gray-50 border border-slate-200 rounded-xl p-6">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                          <Package className="h-5 w-5" />
                          Product Images *
                        </h3>
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

                  <div className="border-t pt-8">
                    <Button 
                      type="submit" 
                      className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-200" 
                      disabled={uploading}
                    >
                      {uploading ? (
                        <>
                          <span className="animate-spin mr-3">⭘</span> 
                          Creating Your Listing...
                        </>
                      ) : (
                        `Create ${activeTab === "regular" ? "Normal Listing/Auction" : "Bidding Auction"} Listing`
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
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
