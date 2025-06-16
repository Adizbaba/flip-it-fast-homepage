
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
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/3 mb-6"></div>
            <div className="h-64 bg-gray-300 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-500">Category Not Found</h1>
            <p className="text-gray-600 mt-2">{error || "The requested category could not be found."}</p>
            <button 
              onClick={() => navigate('/auctions')}
              className="mt-4 px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
            >
              Back to All Auctions
            </button>
          </div>
        </div>
      </div>
    );
  }

  const IconComponent = getCategoryIcon(category.slug);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <IconComponent className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">{category.name} Auctions</h1>
        </div>
        
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
        />
      </div>
    </div>
  );
};

export default CategoryPage;
