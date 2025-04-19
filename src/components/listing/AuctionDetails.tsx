
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Control } from "react-hook-form";
import { ListingFormData } from "./schemas";
import { DateTimePicker } from "./DateTimePicker";
import { CategorySelector } from "./CategorySelector";

interface AuctionDetailsProps {
  control: Control<ListingFormData>;
  categories: any[];
  categoriesLoading: boolean;
}

export const AuctionDetails = ({ control, categories, categoriesLoading }: AuctionDetailsProps) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <DateTimePicker 
          control={control} 
          name="startDate" 
          label="Auction Start Date & Time"
        />
        <DateTimePicker 
          control={control} 
          name="endDate" 
          label="Auction End Date & Time"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <CategorySelector 
          control={control}
          categories={categories}
          categoriesLoading={categoriesLoading}
        />

        <FormField
          control={control}
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
        control={control}
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
    </div>
  );
};
