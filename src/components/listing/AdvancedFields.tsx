
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Control } from "react-hook-form";
import { ListingFormData } from "./schemas";

interface AdvancedFieldsProps {
  control: Control<ListingFormData>;
}

export const AdvancedFields = ({ control }: AdvancedFieldsProps) => {
  return (
    <div className="space-y-6">
      <div className="p-4 border rounded-md bg-orange-50/30">
        <h3 className="font-medium mb-4">Shipping Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <FormField
            control={control}
            name="weight"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Weight (kg) <span className="text-sm text-muted-foreground">(Optional)</span></FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.5"
                    {...field}
                    onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="mt-4">
          <FormLabel className="text-sm font-medium">Dimensions (cm) <span className="text-sm text-muted-foreground">(Optional)</span></FormLabel>
          <div className="grid grid-cols-3 gap-4 mt-2">
            <FormField
              control={control}
              name="dimensions.height"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Height"
                      {...field}
                      onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="dimensions.width"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Width"
                      {...field}
                      onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="dimensions.length"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Length"
                      {...field}
                      onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </div>
      </div>

      <div className="p-4 border rounded-md bg-purple-50/30">
        <h3 className="font-medium mb-4">SEO & Marketing</h3>
        <div className="space-y-4">
          <FormField
            control={control}
            name="seoTitle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Meta Title <span className="text-sm text-muted-foreground">(Optional)</span></FormLabel>
                <FormControl>
                  <Input placeholder="SEO optimized title" {...field} />
                </FormControl>
                <FormDescription>
                  Recommended: 50-60 characters
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="seoDescription"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Meta Description <span className="text-sm text-muted-foreground">(Optional)</span></FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Brief description for search engines"
                    className="h-20"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Recommended: 150-160 characters
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="tags"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Keywords/Tags <span className="text-sm text-muted-foreground">(Optional)</span></FormLabel>
                <FormControl>
                  <Input placeholder="tag1, tag2, tag3" {...field} />
                </FormControl>
                <FormDescription>
                  Separate multiple tags with commas
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    </div>
  );
};
