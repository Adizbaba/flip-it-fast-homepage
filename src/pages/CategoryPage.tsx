
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import SearchLayout from "@/components/search/SearchLayout";
import { useSearchParamsState } from "@/hooks/useSearchParams";
import { SearchResultItem } from "@/hooks/useSearch";
import { 
  Laptop, 
  Camera, 
  Car, 
  Home, 
  ShoppingBag, 
  Watch, 
  Palette, 
  Gift,
  Shirt,
  Trophy,
  Gem
} from "lucide-react";

interface Category {
  id: string;
  name: string;
  description: string;
  slug: string;
}

const categoryIcons: Record<string, any> = {
  electronics: Laptop,
  cameras: Camera,
  vehicles: Car,
  motors: Car,
  "real-estate": Home,
  fashion: ShoppingBag,
  watches: Watch,
  art: Palette,
  collectibles: Gift,
  clothing: Shirt,
  "home-garden": Home,
  jewelry: Gem,
  jewellery: Gem,
};

const CategoryPage = () => {
  const { categorySlug } = useParams<{ categorySlug: string }>();
  const navigate = useNavigate();
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categoryId, setCategoryId] = useState<string>("");

  useEffect(() => {
    const fetchCategory = async () => {
      if (!categorySlug) {
        setError("Category not specified");
        setLoading(false);
        return;
      }

      try {
        console.log("Looking for category with slug:", categorySlug);

        // First try to find by exact slug match in description or a custom slug field
        let { data: categoryData, error: categoryError } = await supabase
          .from('categories')
          .select('*')
          .ilike('name', categorySlug.replace(/-/g, ' '))
          .single();

        // If not found, try different variations
        if (categoryError || !categoryData) {
          // Try with proper case conversion
          const categoryName = categorySlug
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');

          console.log("Trying category name:", categoryName);

          const { data: categoryData2, error: categoryError2 } = await supabase
            .from('categories')
            .select('*')
            .ilike('name', categoryName)
            .single();

          if (categoryError2 || !categoryData2) {
            // Try some common variations
            const variations = [
              categorySlug.replace(/-/g, ' '),
              categorySlug.replace(/-/g, ' & '),
              categorySlug === 'motors' ? 'vehicles' : categorySlug,
              categorySlug === 'jewelry' ? 'jewellery' : categorySlug,
              categorySlug === 'jewellery' ? 'jewelry' : categorySlug,
            ];

            for (const variation of variations) {
              console.log("Trying variation:", variation);
              const { data: varData, error: varError } = await supabase
                .from('categories')
                .select('*')
                .ilike('name', `%${variation}%`)
                .single();

              if (!varError && varData) {
                categoryData = varData;
                break;
              }
            }
          } else {
            categoryData = categoryData2;
          }
        }

        if (!categoryData) {
          console.error("Category not found for slug:", categorySlug);
          setError("Category not found");
          setLoading(false);
          return;
        }

        console.log("Found category:", categoryData);

        const categoryWithSlug: Category = {
          ...categoryData,
          slug: categorySlug
        };

        setCategory(categoryWithSlug);
        setCategoryId(categoryData.id);

      } catch (err) {
        console.error("Error fetching category:", err);
        setError("Failed to load category");
      } finally {
        setLoading(false);
      }
    };

    fetchCategory();
  }, [categorySlug]);

  // Use search params state with the category ID once it's loaded
  const {
    results,
    loading: searchLoading,
    totalCount,
    page,
    filters,
    itemsPerPage,
    setPage,
    handleFilterChange,
    handleSearch,
  } = useSearchParamsState({
    itemsPerPage: 12
  });

  // Set the category filter when categoryId is available
  useEffect(() => {
    if (categoryId && categoryId !== filters.category) {
      console.log("Setting category filter to:", categoryId);
      handleFilterChange({ category: categoryId });
    }
  }, [categoryId, filters.category, handleFilterChange]);

  const getCategoryIcon = (slug: string) => {
    const IconComponent = categoryIcons[slug] || Gift;
    return IconComponent;
  };

  if (loading) {
    return (
      <SearchLayout
        title="Loading..."
        description="Loading category information..."
        results={[]}
        loading={true}
        totalCount={0}
        page={1}
        itemsPerPage={12}
        filters={filters}
        onFilterChange={handleFilterChange}
        onPageChange={setPage}
      />
    );
  }

  if (error || !category) {
    return (
      <SearchLayout
        title="Category Not Found"
        description={error || "The requested category could not be found."}
        results={[]}
        loading={false}
        totalCount={0}
        page={1}
        itemsPerPage={12}
        filters={filters}
        onFilterChange={handleFilterChange}
        onPageChange={setPage}
      />
    );
  }

  const IconComponent = getCategoryIcon(category.slug);

  // Create a custom header component for the category
  const CategoryHeader = () => (
    <div className="flex items-center gap-3">
      <IconComponent className="h-8 w-8 text-primary" />
      <span>{category.name} Auctions</span>
    </div>
  );

  return (
    <SearchLayout
      title={`${category.name} Auctions`}
      description={
        category.description || 
        `Browse all ${category.name.toLowerCase()} auctions and find great deals on quality items.`
      }
      results={results}
      loading={searchLoading}
      totalCount={totalCount}
      page={page}
      itemsPerPage={itemsPerPage}
      filters={filters}
      onFilterChange={handleFilterChange}
      onPageChange={setPage}
      customHeader={<CategoryHeader />}
    />
  );
};

export default CategoryPage;
