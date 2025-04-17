
import { Button } from "@/components/ui/button";

interface FilterActionsProps {
  onApply: () => void;
  onReset: () => void;
}

const FilterActions = ({ onApply, onReset }: FilterActionsProps) => {
  return (
    <div className="flex flex-col gap-2">
      <Button onClick={onApply} className="w-full">
        Apply Filters
      </Button>
      <Button
        onClick={onReset}
        variant="outline"
        className="w-full"
      >
        Reset Filters
      </Button>
    </div>
  );
};

export default FilterActions;
