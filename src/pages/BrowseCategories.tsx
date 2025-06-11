
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Laptop, 
  Camera, 
  Car, 
  Home, 
  ShoppingBag, 
  Watch, 
  Palette, 
  Gift,
  Smartphone,
  Shirt,
  Trophy,
  Gem
} from "lucide-react";

interface Category {
  id: string;
  name: string;
  description: string;
  slug: string;
  itemCount: number;
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

const categoryColors: Record<string, string> = {
  electronics: "bg-blue-500",
  cameras: "bg-green-500", 
  vehicles: "bg-red-500",
  "real-estate": "bg-yellow-500",
  fashion: "bg-purple-500",
  watches: "bg-pink-500",
  art: "bg-indigo-500",
  collectibles: "bg-orange-500",
  clothing: "bg-purple-500",
  "home-garden": "bg-green-600",
  jewelry: "bg-pink-600",
  motors: "bg-red-500",
};

const BrowseCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // Fetch categories with item counts
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('categories')
          .select('*');

        if (categoriesError) throw categoriesError;

        // For each category, get the count of active auction items
        const categoriesWithCounts = await Promise.all(
          (categoriesData || []).map(async (category) => {
            const { count } = await supabase
              .from('auction_items')
              .select('*', { count: 'exact', head: true })
              .eq('category_id', category.id)
              .eq('status', 'Active');

            // Create slug from category name
            const slug = category.name.toLowerCase()
              .replace(/\s+/g, '-')
              .replace(/[&]/g, '')
              .replace(/[^\w-]/g, '');

            return {
              id: category.id,
              name: category.name,
              description: category.description || '',
              slug,
              itemCount: count || 0,
            };
          })
        );

        setCategories(categoriesWithCounts);
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const getCategoryIcon = (slug: string) => {
    const IconComponent = categoryIcons[slug] || Gift;
    return IconComponent;
  };

  const getCategoryColor = (slug: string) => {
    return categoryColors[slug] || "bg-gray-500";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="text-center">Loading categories...</div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Browse Categories</h1>
          <p className="text-muted-foreground text-lg">
            Explore our wide range of auction categories and find exactly what you're looking for.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {categories.map((category) => {
            const IconComponent = getCategoryIcon(category.slug);
            const colorClass = getCategoryColor(category.slug);
            
            return (
              <Link
                key={category.id}
                to={`/auctions/category/${category.slug}`}
                className="group"
              >
                <Card className="h-full transition-all duration-300 hover:shadow-lg hover:scale-105 border-2 hover:border-primary/20">
                  <CardContent className="p-6 text-center">
                    <div className={`${colorClass} h-16 w-16 rounded-full flex items-center justify-center text-white mb-4 mx-auto group-hover:scale-110 transition-transform`}>
                      <IconComponent size={32} />
                    </div>
                    <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                      {category.name}
                    </h3>
                    <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                      {category.description || `Browse ${category.name.toLowerCase()} auctions`}
                    </p>
                    <div className="text-sm font-medium text-primary">
                      {category.itemCount} {category.itemCount === 1 ? 'item' : 'items'} available
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        {categories.length === 0 && (
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold mb-4">No Categories Available</h2>
            <p className="text-muted-foreground">
              Categories will appear here once they are added to the system.
            </p>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default BrowseCategories;
