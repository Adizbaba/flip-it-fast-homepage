import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Info } from "lucide-react";
import ListingImageUpload from "@/components/listing/ListingImageUpload";

const declutterFormSchema = z.object({
  title: z.string().min(5, {
    message: "Title must be at least 5 characters.",
  }).max(100, {
    message: "Title must not exceed 100 characters."
  }),
  description: z.string().min(20, {
    message: "Description must be at least 20 characters."
  }),
  categoryId: z.string().min(1, {
    message: "Please select a category.",
  }),
  condition: z.string().min(1, {
    message: "Please select condition.",
  }),
  originalPrice: z.number().positive({
    message: "Original price must be greater than 0.",
  }),
  bulkPrice: z.number().positive({
    message: "Bulk price must be greater than 0.",
  }),
  quantity: z.number().int().positive({
    message: "Quantity must be a positive number.",
  }),
  minPurchaseQuantity: z.number().int().positive({
    message: "Minimum purchase quantity must be a positive number.",
  }),
  location: z.string().optional(),
  shippingOptions: z.object({
    domestic: z.string().optional(),
    international: z.string().optional(),
    pickup: z.boolean().optional(),
  }).optional(),
  isNegotiable: z.boolean().default(false),
});

type DeclutterFormData = z.infer<typeof declutterFormSchema>;

const CreateDeclutterListing = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [images, setImages] = useState<File[]>([]);
  
  const form = useForm<DeclutterFormData>({
    resolver: zodResolver(declutterFormSchema),
    defaultValues: {
      title: "",
      description: "",
      categoryId: "",
      condition: "",
      originalPrice: 0,
      bulkPrice: 0,
      quantity: 1,
      minPurchaseQuantity: 1,
      location: "",
      shippingOptions: {
        domestic: "Standard shipping",
        international: "Not available",
        pickup: true,
      },
      isNegotiable: false,
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

  const onSubmit = async (data: DeclutterFormData) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to create a declutter listing",
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
              .upload(`declutter/${fileName}`, file);

            if (uploadError) throw uploadError;
            
            const { data: { publicUrl } } = supabase.storage
              .from('auction_images')
              .getPublicUrl(`declutter/${fileName}`);
              
            return publicUrl;
          })
        );
        
        imageUrls = uploadedImages;
      }

      // Create the declutter listing
      const { data: listing, error } = await supabase
        .from('declutter_listings')
        .insert({
          seller_id: user.id,
          title: data.title,
          description: data.description,
          category_id: data.categoryId,
          condition: data.condition,
          original_price: data.originalPrice,
          bulk_price: data.bulkPrice,
          quantity: data.quantity,
          min_purchase_quantity: data.minPurchaseQuantity,
          location: data.location || null,
          shipping_options: data.shippingOptions,
          is_negotiable: data.isNegotiable,
          images: imageUrls.length > 0 ? imageUrls : null,
          status: 'Available',
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Declutter listing created successfully.",
      });
      
      navigate('/dashboard/declutter-listings');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
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
            <h1 className="text-3xl font-bold text-center mb-6">Create Declutter Listing</h1>
            
            <Alert className="bg-blue-50">
              <Info className="h-4 w-4 text-blue-500" />
              <AlertDescription className="text-blue-700">
                Declutter listings allow you to sell items in bulk quantities. These are fixed-price listings without the auction format.
              </AlertDescription>
            </Alert>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                {/* Basic Details */}
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">Basic Details</h2>
                  
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Item Title</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter item title" 
                            {...field} 
                            autoComplete="off"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe your items in detail..."
                            className="h-32"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Images */}
                <div className="p-4 border rounded-md bg-muted/30">
                  <h3 className="font-medium mb-4">Upload Images</h3>
                  <ListingImageUpload images={images} setImages={setImages} />
                </div>

                {/* Pricing and Quantity */}
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">Pricing and Quantity</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="originalPrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Original Price per Unit (₦)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number"
                              step="0.01"
                              {...field}
                              onChange={e => field.onChange(parseFloat(e.target.value))}
                            />
                          </FormControl>
                          <FormDescription>
                            The original retail price
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="bulkPrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bulk Price per Unit (₦)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number"
                              step="0.01"
                              {...field}
                              onChange={e => field.onChange(parseFloat(e.target.value))}
                            />
                          </FormControl>
                          <FormDescription>
                            Your discounted price for bulk purchase
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="quantity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Total Quantity Available</FormLabel>
                          <FormControl>
                            <Input 
                              type="number"
                              {...field}
                              onChange={e => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="minPurchaseQuantity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Minimum Purchase Quantity</FormLabel>
                          <FormControl>
                            <Input 
                              type="number"
                              {...field}
                              onChange={e => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormDescription>
                            Minimum units per order
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="isNegotiable"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Price is Negotiable
                          </FormLabel>
                          <FormDescription>
                            Allow buyers to send offers for your items
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                {/* Item Details */}
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">Item Details</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="categoryId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {categoriesLoading ? (
                                <SelectItem value="loading">Loading categories...</SelectItem>
                              ) : (
                                categories?.map((category) => (
                                  <SelectItem key={category.id} value={category.id}>
                                    {category.name}
                                  </SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="condition"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Item Condition</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select condition" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="New">New</SelectItem>
                              <SelectItem value="Like New">Like New</SelectItem>
                              <SelectItem value="Good">Good</SelectItem>
                              <SelectItem value="Fair">Fair</SelectItem>
                              <SelectItem value="Poor">Poor</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location (Optional)</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="City, State or Zip Code" 
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Helps buyers know where items are located
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <Button type="submit" className="w-full">
                  Create Declutter Listing
                </Button>
              </form>
            </Form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CreateDeclutterListing;
