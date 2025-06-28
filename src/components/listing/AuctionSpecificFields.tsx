
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { DollarSign, Clock } from "lucide-react";
import { Control } from "react-hook-form";
import { AuctionListingFormData } from "./schemas";

interface AuctionSpecificFieldsProps {
  control: Control<AuctionListingFormData>;
}

export const AuctionSpecificFields = ({ control }: AuctionSpecificFieldsProps) => {
  return (
    <div className="p-4 border rounded-md bg-red-50/30">
      <h3 className="font-medium mb-4 flex items-center gap-2">
        <Clock className="h-4 w-4" />
        Auction Settings
      </h3>
      
      <div className="space-y-6">
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <FormField
            control={control}
            name="startingBid"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Starting Bid Price ($)</FormLabel>
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
                      placeholder="1.00"
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
                <FormDescription>
                  Minimum price you're willing to accept
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
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
                <FormDescription>
                  Price to end auction immediately
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="mt-6">
          <FormField
            control={control}
            name="autoExtend"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Auto-Extend Auction</FormLabel>
                  <FormDescription>
                    Extend auction time when bids are placed near the end
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />
        </div>

        {/* Show extension fields only if auto-extend is enabled */}
        <FormField
          control={control}
          name="autoExtend"
          render={({ field }) => {
            if (!field.value) return null;
            return (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                <FormField
                  control={control}
                  name="extensionDuration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Extension Duration (minutes)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="5"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name="triggerTimeframe"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Trigger Timeframe (minutes)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="2"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormDescription>
                        Extend if bid placed within this time before end
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            );
          }}
        />
      </div>
    </div>
  );
};
