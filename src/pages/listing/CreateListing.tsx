
import { useForm } from "react-hook-form";
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
import { Camera } from "lucide-react";

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
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>();

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
      const { error } = await supabase
        .from('auction_items')
        .insert({
          seller_id: user.id,
          ...data,
          shipping_options: JSON.parse(data.shippingOptions),
          status: 'Draft',
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Your listing has been created",
      });
      
      navigate('/my-listings');
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

        <Button type="submit" className="w-full">
          Create Listing
        </Button>
      </form>
    </div>
  );
};

export default CreateListing;
