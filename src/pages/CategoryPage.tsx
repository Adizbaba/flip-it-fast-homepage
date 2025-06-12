
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

  // Use search params state without initial category filter
  const {
    results,
    loading: searchLoading,
    error: searchError,
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

  useEffect(() => {
    const fetchCategory = async () => {
      if (!categorySlug) {
        setError("Category not specified");
        setLoading(false);
        return;
      }

      try {
        console.log("Looking for category with slug:", categorySlug);

        // Enhanced category lookup with better matching
        let categoryData = null;

        // Try exact name match first (case insensitive)
        const { data: exactMatch, error: exactError } = await supabase
          .from('categories')
          .select('*')
          .ilike('name', categorySlug.replace(/-/g, ' '))
          .single();

        if (!exactError && exactMatch) {
          categoryData = exactMatch;
        } else {
          // Try with proper case conversion
          const categoryName = categorySlug
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');

          console.log("Trying category name:", categoryName);

          const { data: caseMatch, error: caseError } = await supabase
            .from('categories')
            .select('*')
            .ilike('name', categoryName)
            .single();

          if (!caseError && caseMatch) {
            categoryData = caseMatch;
          } else {
            // Try variations and partial matches
            const variations = [
              categorySlug.replace(/-/g, ' '),
              categorySlug.replace(/-/g, ' & '),
              categorySlug === 'motors' ? 'vehicles' : categorySlug,
              categorySlug === 'jewelry' ? 'jewellery' : categorySlug,
              categorySlug === 'jewellery' ? 'jewelry' : categorySlug,
              categorySlug === 'real-estate' ? 'real estate' : categorySlug,
              categorySlug === 'home-garden' ? 'home & garden' : categorySlug,
            ];

            for (const variation of variations) {
              console.log("Trying variation:", variation);
              const { data: varData, error: varError } = await supabase
                .from('categories')
                .select('*')
                .or(`name.ilike.%${variation}%,name.ilike.%${variation.charAt(0).toUpperCase() + variation.slice(1)}%`)
                .single();

              if (!varError && varData) {
                categoryData = varData;
                break;
              }
            }
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
        
        // Set the category filter after we have the category ID
        if (categoryData.id !== filters.category) {
          console.log("Setting category filter to:", categoryData.id);
          handleFilterChange({ category: categoryData.id });
        }

      } catch (err) {
        console.error("Error fetching category:", err);
        setError("Failed to load category");
      } finally {
        setLoading(false);
      }
    };

    fetchCategory();
  }, [categorySlug, handleFilterChange, filters.category]);

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
        error={searchError}
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
        error={searchError}
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
      error={searchError}
    />
  );
};

export default CategoryPage;
