
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Minus } from "lucide-react";

const ListingVariations = () => {
  const [variations, setVariations] = useState<{ name: string; price: string }[]>([]);

  const addVariation = () => {
    setVariations([...variations, { name: '', price: '' }]);
  };

  const removeVariation = (index: number) => {
    setVariations(variations.filter((_, i) => i !== index));
  };

  const updateVariation = (index: number, field: 'name' | 'price', value: string) => {
    const newVariations = [...variations];
    newVariations[index][field] = value;
    setVariations(newVariations);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Variations (Optional)</Label>
        <Button type="button" variant="outline" size="sm" onClick={addVariation}>
          <Plus className="h-4 w-4 mr-2" />
          Add Variation
        </Button>
      </div>

      {variations.map((variation, index) => (
        <div key={index} className="flex gap-4 items-start">
          <div className="flex-1">
            <Input
              placeholder="Variation name (e.g., Color, Size)"
              value={variation.name}
              onChange={(e) => updateVariation(index, 'name', e.target.value)}
            />
          </div>
          <div className="flex-1">
            <Input
              type="number"
              step="0.01"
              placeholder="Price"
              value={variation.price}
              onChange={(e) => updateVariation(index, 'price', e.target.value)}
            />
          </div>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => removeVariation(index)}
          >
            <Minus className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
  );
};

export default ListingVariations;
