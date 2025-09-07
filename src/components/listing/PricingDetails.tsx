
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { DollarSign } from "lucide-react";
import { Control } from "react-hook-form";
import { ListingFormData } from "./schemas";

interface PricingDetailsProps {
  control: Control<ListingFormData>;
}

export const PricingDetails = ({ control }: PricingDetailsProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      <FormField
        control={control}
        name="startingBid"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Starting Price (₦)</FormLabel>
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
        control={control}
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

      <FormField
        control={control}
        name="reservePrice"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Reserve Price (₦) <span className="text-sm text-muted-foreground">(Optional)</span></FormLabel>
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
        control={control}
        name="buyNowPrice"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Buy Now Price (₦) <span className="text-sm text-muted-foreground">(Optional)</span></FormLabel>
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
  );
};
