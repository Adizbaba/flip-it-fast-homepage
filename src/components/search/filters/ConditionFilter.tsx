
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface ConditionFilterProps {
  selectedCondition: string;
  onConditionChange: (value: string) => void;
}

const ConditionFilter = ({ selectedCondition, onConditionChange }: ConditionFilterProps) => {
  // Condition options
  const conditions = [
    { value: "all", label: "All Conditions" }, // Make sure this isn't an empty string
    { value: "New", label: "New" },
    { value: "Like New", label: "Like New" },
    { value: "Excellent", label: "Excellent" },
    { value: "Good", label: "Good" },
    { value: "Fair", label: "Fair" },
    { value: "Poor", label: "Poor" }
  ];

  return (
    <div className="space-y-2">
      <Label htmlFor="condition">Condition</Label>
      <Select
        value={selectedCondition || "all"}
        onValueChange={onConditionChange}
      >
        <SelectTrigger id="condition">
          <SelectValue placeholder="All Conditions" />
        </SelectTrigger>
        <SelectContent>
          {conditions.map((condition) => (
            <SelectItem key={condition.value} value={condition.value}>
              {condition.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default ConditionFilter;
