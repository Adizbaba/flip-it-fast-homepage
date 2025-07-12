import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Control } from "react-hook-form";
import { ListingFormData } from "./schemas";
import { Smartphone, Shirt, Home, Trophy, Gem, Car } from "lucide-react";

interface CategorySelectorProps {
  control: Control<ListingFormData>;
  categories: any[];
  categoriesLoading: boolean;
}

export const CategorySelector = ({ control, categories, categoriesLoading }: CategorySelectorProps) => {
  // Function to get the appropriate icon for each category
  const getCategoryIcon = (slug: string) => {
    switch (slug) {
      case "electronics":
        return <Smartphone className="h-4 w-4" />;
      case "clothing":
        return <Shirt className="h-4 w-4" />;
      case "home-garden":
        return <Home className="h-4 w-4" />;
      case "collectibles":
        return <Trophy className="h-4 w-4" />;
      case "jewelry":
        return <Gem className="h-4 w-4" />; // Changed from Ring to Gem
      case "motors":
        return <Car className="h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <FormField
      control={control}
      name="categoryId"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Item Category</FormLabel>
          <Select 
            onValueChange={field.onChange} 
            value={field.value}
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
                  <SelectItem key={category.id} value={category.id} className="flex items-center gap-2">
                    {category.slug && getCategoryIcon(category.slug)}
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
  );
};
