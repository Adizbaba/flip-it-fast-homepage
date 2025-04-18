
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
import { Camera, AlertCircle } from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from "@/components/ui/dialog";

type FormData = {
  title: string;
  description: string;
  condition: string;
  categoryId: string;
  startingBid: number;
  reservePrice?: number;
  buyNowPrice?: number;
  quantity: number;
  shippingOptions: string;
  returnPolicy: string;
  auctionType: string;
  startDate: string;
  endDate: string;
  variations?: Array<{
    name: string;
    price: number;
  }>;
};

const CreateListing = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors }, watch } = useForm<FormData>();
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [listingItem, setListingItem] = useState<any>(null);

  const { data: categories } = useQuery({
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
          reserve_price: data.reservePrice || null,
          buy_now_price: data.buyNowPrice || null,
          quantity: data.quantity,
          shipping_options: JSON.parse(data.shippingOptions || '{}'),
          return_policy: data.returnPolicy,
          auction_type: data.auctionType,
          start_date: data.startDate,
          end_date: data.endDate,
          status: 'Draft', // Starts as draft until payment is complete
          variations: data.variations || null
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
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            {...register("title", { required: "Title is required" })}
            placeholder="Enter item title"
          />
          {errors.title && (
            <p className="text-sm text-red-500">{errors.title.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            {...register("description", { required: "Description is required" })}
            placeholder="Describe your item"
            className="h-32"
          />
        </div>

        <ListingImageUpload />

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="condition">Condition</Label>
            <select
              id="condition"
              {...register("condition")}
              className="w-full p-2 border rounded"
            >
              <option value="New">New</option>
              <option value="Like New">Like New</option>
              <option value="Good">Good</option>
              <option value="Fair">Fair</option>
              <option value="Poor">Poor</option>
              <option value="Refurbished">Refurbished</option>
              <option value="Vintage">Vintage</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="categoryId">Category</Label>
            <select
              id="categoryId"
              {...register("categoryId")}
              className="w-full p-2 border rounded"
            >
              {categories?.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="startingBid">Starting Bid ($)</Label>
            <Input
              id="startingBid"
              type="number"
              step="0.01"
              {...register("startingBid", { 
                required: "Starting bid is required",
                min: { value: 0, message: "Must be greater than 0" }
              })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="buyNowPrice">Buy Now Price ($)</Label>
            <Input
              id="buyNowPrice"
              type="number"
              step="0.01"
              {...register("buyNowPrice")}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="startDate">Start Date</Label>
            <Input
              id="startDate"
              type="datetime-local"
              {...register("startDate", { required: "Start date is required" })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="endDate">End Date</Label>
            <Input
              id="endDate"
              type="datetime-local"
              {...register("endDate", { required: "End date is required" })}
            />
          </div>
        </div>

        <ListingVariations />

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
