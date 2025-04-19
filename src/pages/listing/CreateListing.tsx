
import { useForm } from "react-hook-form";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/lib/auth";
import ListingImageUpload from "@/components/listing/ListingImageUpload";
import ListingVariations from "@/components/listing/ListingVariations";
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger 
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AlertCircle, Calendar as CalendarIcon, DollarSign, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

const listingFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters."),
  description: z.string().min(10, "Description must be at least 10 characters."),
  startingBid: z.number().min(0.01, "Starting bid must be greater than 0."),
  bidIncrement: z.number().min(0.01, "Bid increment must be greater than 0."),
  reservePrice: z.number().optional(),
  categoryId: z.string().min(1, "Please select a category."),
  startDate: z.date({
    required_error: "Start date is required.",
  }),
  endDate: z.date({
    required_error: "End date is required.",
  }).refine(
    (date) => date > new Date(),
    "End date must be in the future."
  ),
  condition: z.string().min(1, "Please select a condition."),
  quantity: z.number().int().min(1, "Quantity must be at least 1."),
  buyNowPrice: z.number().optional(),
  shippingOptions: z.string(),
  returnPolicy: z.string(),
  auctionType: z.string().min(1, "Please select an auction type.")
});

type FormData = z.infer<typeof listingFormSchema>;

const CreateListing = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [images, setImages] = useState<File[]>([]);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [listingItem, setListingItem] = useState<any>(null);

  const form = useForm<FormData>({
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

  const onSubmit = async (data: FormData) => {
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

      // Calculate listing fee (5% of starting bid, minimum $5)
      const listingFee = Math.max(5, data.startingBid * 0.05);

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
          status: 'Draft', // Starts as draft until payment is complete
          images: imageUrls.length > 0 ? imageUrls : null
        })
        .select()
        .single();

      if (error) throw error;

      // Store the listing item for the payment process
      setListingItem({
        id: item.id,
        title: item.title,
        startingBid: item.starting_bid,
        fee: listingFee
      });
      
      setShowPaymentDialog(true);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleProceedToPayment = () => {
    setShowPaymentDialog(false);
    if (listingItem) {
      navigate(`/checkout?id=${listingItem.id}&type=listing`);
    }
  };

  const handleSkipPayment = async () => {
    setShowPaymentDialog(false);
    toast({
      title: "Listing Created",
      description: "Your listing has been saved as a draft. To publish it, you'll need to pay the listing fee.",
    });
    navigate("/watch-list");
  };

  if (!user) {
    navigate('/auth');
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Create New Listing</h1>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
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
                    placeholder="Describe your item in detail..."
                    className="h-32"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="p-4 border rounded-md bg-muted/30">
            <h3 className="font-medium mb-4">Upload Images</h3>
            <ListingImageUpload />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="startingBid"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Starting Price ($)</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="number"
                        step="0.01"
                        className="pl-8"
                        placeholder="0.00"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="bidIncrement"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bid Increment ($)</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="number"
                        step="0.01"
                        className="pl-8"
                        placeholder="0.00"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="reservePrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reserve Price ($) <span className="text-sm text-muted-foreground">(Optional)</span></FormLabel>
                  <FormControl>
                    <div className="relative">
                      <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="number"
                        step="0.01"
                        className="pl-8"
                        placeholder="0.00"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="buyNowPrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Buy Now Price ($) <span className="text-sm text-muted-foreground">(Optional)</span></FormLabel>
                  <FormControl>
                    <div className="relative">
                      <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="number"
                        step="0.01"
                        className="pl-8"
                        placeholder="0.00"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Auction Start Date & Time</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP p")
                          ) : (
                            <span>Pick a date and time</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                      />
                      <div className="p-3 border-t border-border">
                        <Input
                          type="time"
                          onChange={(e) => {
                            const [hours, minutes] = e.target.value.split(':');
                            const newDate = new Date(field.value || new Date());
                            newDate.setHours(parseInt(hours), parseInt(minutes));
                            field.onChange(newDate);
                          }}
                        />
                      </div>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="endDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Auction End Date & Time</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP p")
                          ) : (
                            <span>Pick a date and time</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                      />
                      <div className="p-3 border-t border-border">
                        <Input
                          type="time"
                          onChange={(e) => {
                            const [hours, minutes] = e.target.value.split(':');
                            const newDate = new Date(field.value || new Date());
                            newDate.setHours(parseInt(hours), parseInt(minutes));
                            field.onChange(newDate);
                          }}
                        />
                      </div>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Item Category</FormLabel>
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
                      <SelectItem value="Refurbished">Refurbished</SelectItem>
                      <SelectItem value="Vintage">Vintage</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="auctionType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Auction Type</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select auction type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="standard">Standard Auction</SelectItem>
                    <SelectItem value="reserve">Reserve Auction</SelectItem>
                    <SelectItem value="buy_it_now">Buy It Now Option</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="bg-blue-50 p-4 rounded-md flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5" />
            <div>
              <p className="text-sm text-blue-700">
                A listing fee of 5% of your starting bid (minimum $5) will be charged to publish this listing.
                You can still save as draft and pay later.
              </p>
            </div>
          </div>

          <Button type="submit" className="w-full">Create Listing</Button>
        </form>
      </Form>
      
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Listing Fee</DialogTitle>
            <DialogDescription>
              Pay the listing fee to publish your item immediately
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            {listingItem && (
              <>
                <p><strong>Item:</strong> {listingItem.title}</p>
                <p className="mt-2"><strong>Listing Fee:</strong> ${listingItem.fee.toFixed(2)}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  (5% of your starting bid of ${listingItem.startingBid}, minimum $5)
                </p>
              </>
            )}
          </div>
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleSkipPayment}>Save as Draft</Button>
            <Button onClick={handleProceedToPayment}>Pay Now</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CreateListing;
