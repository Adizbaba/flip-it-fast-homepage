
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { DollarSign, Package } from "lucide-react";
import { Control } from "react-hook-form";
import { RegularListingFormData } from "./schemas";

interface RegularListingFormProps {
  control: Control<RegularListingFormData>;
}

export const RegularListingForm = ({ control }: RegularListingFormProps) => {
  return (
    <div className="space-y-6">
      <div className="p-4 border rounded-md bg-blue-50/30">
        <h3 className="font-medium mb-4 flex items-center gap-2">
          <Package className="h-4 w-4" />
          Pricing & Inventory
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <FormField
            control={control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price ($)</FormLabel>
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
            name="salePrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sale Price ($) <span className="text-sm text-muted-foreground">(Optional)</span></FormLabel>
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
            name="quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stock Quantity</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="1"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="minOrderQuantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Minimum Order Quantity <span className="text-sm text-muted-foreground">(Optional)</span></FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="1"
                    {...field}
                    onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="mt-4">
          <FormField
            control={control}
            name="allowBackorders"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Allow Backorders</FormLabel>
                  <FormDescription>
                    Allow customers to order when out of stock
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />
        </div>
      </div>

      <div className="p-4 border rounded-md bg-green-50/30">
        <h3 className="font-medium mb-4">Product Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <FormField
            control={control}
            name="sku"
            render={({ field }) => (
              <FormItem>
                <FormLabel>SKU/Product Code <span className="text-sm text-muted-foreground">(Optional)</span></FormLabel>
                <FormControl>
                  <Input placeholder="Enter SKU" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="brand"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Brand/Manufacturer <span className="text-sm text-muted-foreground">(Optional)</span></FormLabel>
                <FormControl>
                  <Input placeholder="Enter brand name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    </div>
  );
};
