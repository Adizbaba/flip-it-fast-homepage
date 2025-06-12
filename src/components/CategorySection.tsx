
import { useEffect, useState } from "react";
import { Laptop, Camera, Car, Home, ShoppingBag, Watch, Palette, Gift } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface CategoryWithSlug {
  id: string;
  name: string;
  slug: string;
  icon: any;
  color: string;
}

const defaultCategories = [
  { name: 'Electronics', icon: Laptop, color: 'bg-blue-500', slug: 'electronics' },
  { name: 'Cameras', icon: Camera, color: 'bg-green-500', slug: 'cameras' },
  { name: 'Vehicles', icon: Car, color: 'bg-red-500', slug: 'vehicles' },
  { name: 'Motors', icon: Car, color: 'bg-red-500', slug: 'motors' },
  { name: 'Real Estate', icon: Home, color: 'bg-yellow-500', slug: 'real-estate' },
  { name: 'Fashion', icon: ShoppingBag, color: 'bg-purple-500', slug: 'fashion' },
  { name: 'Watches', icon: Watch, color: 'bg-pink-500', slug: 'watches' },
  { name: 'Art', icon: Palette, color: 'bg-indigo-500', slug: 'art' },
  { name: 'Collectibles', icon: Gift, color: 'bg-orange-500', slug: 'collectibles' },
];

const CategorySection = () => {
  const [categories, setCategories] = useState<CategoryWithSlug[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAndMatchCategories = async () => {
      try {
        // Fetch all categories from database
        const { data: dbCategories, error } = await supabase
          .from('categories')
          .select('*');

        if (error) {
          console.error("Error fetching categories:", error);
          setLoading(false);
          return;
        }

        // Match database categories with our display categories
        const matchedCategories: CategoryWithSlug[] = [];

        for (const defaultCat of defaultCategories) {
          // Try to find matching category in database
          const dbCategory = dbCategories?.find(dbCat => 
            dbCat.name.toLowerCase() === defaultCat.name.toLowerCase() ||
            dbCat.name.toLowerCase().includes(defaultCat.name.toLowerCase()) ||
            defaultCat.name.toLowerCase().includes(dbCat.name.toLowerCase())
          );

          if (dbCategory) {
            matchedCategories.push({
              id: dbCategory.id,
              name: dbCategory.name,
              slug: defaultCat.slug,
              icon: defaultCat.icon,
              color: defaultCat.color,
            });
          }
        }

        // Add any database categories that don't match our defaults
        dbCategories?.forEach(dbCat => {
          const alreadyMatched = matchedCategories.find(mc => mc.id === dbCat.id);
          if (!alreadyMatched) {
            // Create a slug from the category name
            const slug = dbCat.name.toLowerCase()
              .replace(/\s+/g, '-')
              .replace(/[&]/g, '')
              .replace(/[^\w-]/g, '');

            matchedCategories.push({
              id: dbCat.id,
              name: dbCat.name,
              slug: slug,
              icon: Gift, // Default icon
              color: 'bg-gray-500', // Default color
            });
          }
        });

        console.log("Matched categories:", matchedCategories);
        setCategories(matchedCategories.slice(0, 8)); // Show first 8 categories
      } catch (err) {
        console.error("Error in fetchAndMatchCategories:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAndMatchCategories();
  }, []);

  if (loading) {
    return (
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-6">Loading Categories...</h2>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Browse Categories</h2>
          <Link 
            to="/browse-categories" 
            className="text-primary hover:text-primary/80 font-medium transition-colors"
          >
            View All Categories →
          </Link>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {categories.map((category) => (
            <Link 
              to={`/auctions/category/${category.slug}`} 
              key={category.id} 
              className="category-item group"
            >
              <div className={`${category.color} h-12 w-12 rounded-full flex items-center justify-center text-white mb-3 group-hover:scale-110 transition-transform`}>
                <category.icon size={24} />
              </div>
              <span className="text-sm font-medium">{category.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategorySection;
