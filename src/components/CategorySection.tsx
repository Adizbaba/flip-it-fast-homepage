
import { Laptop, Camera, Car, Home, ShoppingBag, Watch, Palette, Gift } from "lucide-react";
import { Link } from "react-router-dom";

const categories = [
  { id: 1, name: 'Electronics', icon: Laptop, color: 'bg-blue-500', slug: 'electronics' },
  { id: 2, name: 'Cameras', icon: Camera, color: 'bg-green-500', slug: 'cameras' },
  { id: 3, name: 'Vehicles', icon: Car, color: 'bg-red-500', slug: 'vehicles' },
  { id: 4, name: 'Real Estate', icon: Home, color: 'bg-yellow-500', slug: 'real-estate' },
  { id: 5, name: 'Fashion', icon: ShoppingBag, color: 'bg-purple-500', slug: 'fashion' },
  { id: 6, name: 'Watches', icon: Watch, color: 'bg-pink-500', slug: 'watches' },
  { id: 7, name: 'Art', icon: Palette, color: 'bg-indigo-500', slug: 'art' },
  { id: 8, name: 'Collectibles', icon: Gift, color: 'bg-orange-500', slug: 'collectibles' },
];

const CategorySection = () => {
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
