
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';

interface FiltersState {
  categoryId: string;
  minPrice?: number;
  maxPrice?: number;
  condition: string;
  location: string;
}

interface DeclutterFiltersProps {
  filters: FiltersState;
  onFilterChange: (filters: Partial<FiltersState>) => void;
}

interface Category {
  id: string;
  name: string;
}

const CONDITIONS = [
  { value: 'all', label: 'Any condition' }, // Changed from empty string to 'all'
  { value: 'New', label: 'New' },
  { value: 'Like New', label: 'Like New' },
  { value: 'Good', label: 'Good' },
  { value: 'Fair', label: 'Fair' },
  { value: 'Poor', label: 'Poor' },
];

const DeclutterFilters = ({ filters, onFilterChange }: DeclutterFiltersProps) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [localFilters, setLocalFilters] = useState(filters);
  
  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase
        .from('categories')
        .select('id, name')
        .order('name');
        
      if (data) {
        setCategories(data);
      }
    };
    
    fetchCategories();
  }, []);
  
  // Update local state when props change
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);
  
  const handleChange = (field: keyof FiltersState, value: any) => {
    setLocalFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const handleApplyFilters = () => {
    onFilterChange(localFilters);
  };
  
  const handleReset = () => {
    const resetFilters = {
      categoryId: 'all', // Changed from empty string to 'all'
      minPrice: undefined,
      maxPrice: undefined,
      condition: 'all', // Changed from empty string to 'all'
      location: '',
    };
    setLocalFilters(resetFilters);
    onFilterChange(resetFilters);
  };
  
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Category</Label>
        <Select
          value={localFilters.categoryId}
          onValueChange={(value) => handleChange('categoryId', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem> {/* Changed from empty string to 'all' */}
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label>Price Range</Label>
        <div className="flex items-center space-x-2">
          <Input
            type="number"
            placeholder="Min"
            value={localFilters.minPrice || ''}
            onChange={(e) => handleChange('minPrice', e.target.value ? Number(e.target.value) : undefined)}
            className="w-full"
          />
          <span className="text-muted-foreground">to</span>
          <Input
            type="number"
            placeholder="Max"
            value={localFilters.maxPrice || ''}
            onChange={(e) => handleChange('maxPrice', e.target.value ? Number(e.target.value) : undefined)}
            className="w-full"
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label>Condition</Label>
        <Select
          value={localFilters.condition}
          onValueChange={(value) => handleChange('condition', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Any Condition" />
          </SelectTrigger>
          <SelectContent>
            {CONDITIONS.map((condition) => (
              <SelectItem key={condition.value} value={condition.value}>
                {condition.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label>Location</Label>
        <Input
          placeholder="City, State or Zip"
          value={localFilters.location}
          onChange={(e) => handleChange('location', e.target.value)}
        />
      </div>
      
      <div className="flex gap-2 pt-4">
        <Button
          type="button"
          onClick={handleApplyFilters}
          className="flex-1"
        >
          Apply Filters
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={handleReset}
        >
          Reset
        </Button>
      </div>
    </div>
  );
};

export default DeclutterFilters;
