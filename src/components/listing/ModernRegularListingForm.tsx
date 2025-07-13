import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { DollarSign, Package, MapPin, Tag, Info } from "lucide-react";
import { Control } from "react-hook-form";
import { RegularListingFormData } from "./schemas";

interface ModernRegularListingFormProps {
  control: Control<RegularListingFormData>;
  categories: any[];
  categoriesLoading: boolean;
}

export const ModernRegularListingForm = ({ control, categories, categoriesLoading }: ModernRegularListingFormProps) => {
  return (
    <div className="space-y-8">
      {/* Essential Information Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-6 flex items-center gap-2 text-blue-900">
          <Info className="h-5 w-5" />
          Essential Information
        </h3>
        
        <div className="space-y-6">
          {/* Title */}
          <FormField
            control={control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-medium">Item Title *</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Enter a clear and descriptive title for your item" 
                    {...field} 
                    className="h-12 text-base"
                    autoComplete="off"
                  />
                </FormControl>
                <FormDescription>
                  Use keywords that buyers would search for (50-100 characters recommended)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Description */}
          <FormField
            control={control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-medium">Detailed Description *</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Provide a comprehensive description including features, condition details, measurements, and any relevant information buyers should know..."
                    className="min-h-32 text-base"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Include key details like brand, model, size, color, material, condition, and any flaws
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Category and Condition Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-medium">Category *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} disabled={categoriesLoading}>
                    <FormControl>
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Select item category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories?.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="condition"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-medium">Item Condition *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Select condition" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="New">New - Brand new in original packaging</SelectItem>
                      <SelectItem value="Like New">Like New - Excellent condition, barely used</SelectItem>
                      <SelectItem value="Used">Used - Good condition with normal wear</SelectItem>
                      <SelectItem value="Fair">Fair - Functional with noticeable wear</SelectItem>
                      <SelectItem value="Damaged">Damaged - Has defects or significant wear</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      </div>

      {/* Pricing & Inventory Section */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-6 flex items-center gap-2 text-green-900">
          <DollarSign className="h-5 w-5" />
          Pricing & Inventory
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-medium">Selling Price ($) *</FormLabel>
                <FormControl>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
                    <Input
                      type="number"
                      step="0.01"
                      className="pl-10 h-12 text-base"
                      placeholder="0.00"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </FormControl>
                <FormDescription>
                  Set a competitive price based on market research
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-medium">Available Quantity *</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Package className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
                    <Input
                      type="number"
                      className="pl-10 h-12 text-base"
                      placeholder="1"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                    />
                  </div>
                </FormControl>
                <FormDescription>
                  How many units do you have available for sale?
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="salePrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-medium">Sale Price ($)</FormLabel>
                <FormControl>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
                    <Input
                      type="number"
                      step="0.01"
                      className="pl-10 h-12 text-base"
                      placeholder="Optional discount price"
                      {...field}
                      onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                    />
                  </div>
                </FormControl>
                <FormDescription>
                  Optional: Set a discounted price to attract more buyers
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="minOrderQuantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-medium">Minimum Order Quantity</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    className="h-12 text-base"
                    placeholder="1"
                    {...field}
                    onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                  />
                </FormControl>
                <FormDescription>
                  Minimum quantity buyers must purchase
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="mt-6">
          <FormField
            control={control}
            name="allowBackorders"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel className="text-base font-medium">Allow Backorders</FormLabel>
                  <FormDescription>
                    Let customers order when out of stock (they'll wait for restock)
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />
        </div>
      </div>

      {/* Location Section */}
      <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-6 flex items-center gap-2 text-orange-900">
          <MapPin className="h-5 w-5" />
          Location Information
        </h3>
        
        <FormField
          control={control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-medium">Item Location *</FormLabel>
              <FormControl>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder="City, State (e.g., Los Angeles, CA)"
                    className="pl-10 h-12 text-base"
                    {...field}
                  />
                </div>
              </FormControl>
              <FormDescription>
                Enter your city and state to help buyers estimate shipping costs
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Product Details Section */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-6 flex items-center gap-2 text-purple-900">
          <Tag className="h-5 w-5" />
          Product Details
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={control}
            name="brand"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-medium">Brand/Manufacturer</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Enter brand name (e.g., Apple, Nike, Samsung)" 
                    className="h-12 text-base"
                    {...field} 
                  />
                </FormControl>
                <FormDescription>
                  Help buyers find your item by brand
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="sku"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-medium">SKU/Model Number</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Product code or model number" 
                    className="h-12 text-base"
                    {...field} 
                  />
                </FormControl>
                <FormDescription>
                  Optional: Product identification number
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