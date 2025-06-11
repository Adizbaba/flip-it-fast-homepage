
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
  "real-estate": Home,
  fashion: ShoppingBag,
  watches: Watch,
  art: Palette,
  collectibles: Gift,
  clothing: Shirt,
  "home-garden": Home,
  jewelry: Gem,
  motors: Car,
};

const CategoryPage = () => {
  const { categorySlug } = useParams<{ categorySlug: string }>();
  const navigate = useNavigate();
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Use search params state but override the category filter
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

  useEffect(() => {
    const fetchCategory = async () => {
      if (!categorySlug) {
        setError("Category not specified");
        setLoading(false);
        return;
      }

      try {
        // Convert slug back to category name for lookup
        const categoryName = categorySlug
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');

        console.log("Looking for category:", categoryName, "with slug:", categorySlug);

        const { data: categoryData, error: categoryError } = await supabase
          .from('categories')
          .select('*')
          .ilike('name', categoryName)
          .single();

        if (categoryError) {
          console.error("Category lookup error:", categoryError);
          setError("Category not found");
          setLoading(false);
          return;
        }

        if (!categoryData) {
          setError("Category not found");
          setLoading(false);
          return;
        }

        const categoryWithSlug: Category = {
          ...categoryData,
          slug: categorySlug
        };

        setCategory(categoryWithSlug);

        // Set the category filter to this specific category
        handleFilterChange({ category: categoryData.id });

      } catch (err) {
        console.error("Error fetching category:", err);
        setError("Failed to load category");
      } finally {
        setLoading(false);
      }
    };

    fetchCategory();
  }, [categorySlug, handleFilterChange]);

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

  return (
    <SearchLayout
      title={
        <div className="flex items-center gap-3">
          <IconComponent className="h-8 w-8 text-primary" />
          <span>{category.name} Auctions</span>
        </div>
      }
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
    />
  );
};

export default CategoryPage;
