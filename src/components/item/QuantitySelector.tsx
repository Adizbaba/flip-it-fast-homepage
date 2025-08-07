import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Minus, Plus } from "lucide-react";

interface QuantitySelectorProps {
  quantity: number;
  onQuantityChange: (quantity: number) => void;
  maxQuantity?: number;
  minQuantity?: number;
  disabled?: boolean;
}

const QuantitySelector = ({ 
  quantity, 
  onQuantityChange, 
  maxQuantity = 99, 
  minQuantity = 1,
  disabled = false 
}: QuantitySelectorProps) => {
  const [inputValue, setInputValue] = useState(quantity.toString());

  const handleDecrement = () => {
    const newQuantity = Math.max(quantity - 1, minQuantity);
    onQuantityChange(newQuantity);
    setInputValue(newQuantity.toString());
  };

  const handleIncrement = () => {
    const newQuantity = Math.min(quantity + 1, maxQuantity);
    onQuantityChange(newQuantity);
    setInputValue(newQuantity.toString());
  };

  const handleInputChange = (value: string) => {
    setInputValue(value);
    
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue) && numValue >= minQuantity && numValue <= maxQuantity) {
      onQuantityChange(numValue);
    }
  };

  const handleInputBlur = () => {
    const numValue = parseInt(inputValue, 10);
    if (isNaN(numValue) || numValue < minQuantity || numValue > maxQuantity) {
      setInputValue(quantity.toString());
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm font-medium">Qty:</span>
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8"
        onClick={handleDecrement}
        disabled={disabled || quantity <= minQuantity}
      >
        <Minus className="h-3 w-3" />
      </Button>
      <Input
        type="text"
        value={inputValue}
        onChange={(e) => handleInputChange(e.target.value)}
        onBlur={handleInputBlur}
        className="w-16 h-8 text-center"
        disabled={disabled}
      />
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8"
        onClick={handleIncrement}
        disabled={disabled || quantity >= maxQuantity}
      >
        <Plus className="h-3 w-3" />
      </Button>
    </div>
  );
};

export default QuantitySelector;