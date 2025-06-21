
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import SearchLayout from "@/components/search/SearchLayout";
import { useSearchParamsState } from "@/hooks/useSearchParams";
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
  const [categorySet, setCategorySet] = useState(false);

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
  } = useSearchParamsState({
    itemsPerPage: 12
  });

  // Create default filter state for loading and error states
  const defaultFilters = {
    category: "all",
    minPrice: "",
    maxPrice: "",
    sortBy: "newest",
    condition: "all",
    auctionType: "all",
  };

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

        // Only set the category filter if it hasn't been set yet
        if (!categorySet) {
          handleFilterChange({ category: categoryData.id });
          setCategorySet(true);
        }

      } catch (err) {
        console.error("Error fetching category:", err);
        setError("Failed to load category");
      } finally {
        setLoading(false);
      }
    };

    fetchCategory();
  }, [categorySlug]); // Remove handleFilterChange from dependencies to prevent loops

  const getCategoryIcon = (slug: string) => {
    const IconComponent = categoryIcons[slug] || Gift;
    return IconComponent;
  };

  if (loading) {
    return (
      <SearchLayout
        title="Loading..."
        results={[]}
        loading={true}
        totalCount={0}
        page={1}
        itemsPerPage={12}
        filters={defaultFilters}
        onFilterChange={() => {}}
        onPageChange={() => {}}
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
        filters={defaultFilters}
        onFilterChange={() => {}}
        onPageChange={() => {}}
      />
    );
  }

  const IconComponent = getCategoryIcon(category.slug);

  // Create custom title with icon
  const customTitle = (
    <div className="flex items-center gap-3">
      <IconComponent className="h-8 w-8 text-primary" />
      <span>{category.name} Auctions</span>
    </div>
  );

  return (
    <SearchLayout
      title={customTitle}
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
