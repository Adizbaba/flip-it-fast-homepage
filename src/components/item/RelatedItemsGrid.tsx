
import { useNavigate } from "react-router-dom";
import { RelatedItemData } from "./types";

interface RelatedItemsGridProps {
  title: string;
  items: RelatedItemData[];
  onItemClick: (id: string) => void;
}

const RelatedItemsGrid = ({ title, items, onItemClick }: RelatedItemsGridProps) => {
  if (items.length === 0) return null;

  return (
    <div className="py-2">
      <h3 className="font-semibold mb-3">{title}</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {items.map((item) => (
          <div 
            key={item.id}
            className="border rounded-md p-2 cursor-pointer hover:border-primary transition-colors"
            onClick={() => onItemClick(item.id)}
          >
            <img
              src={item.images[0] || "/placeholder.svg"}
              alt={item.title}
              className="w-full aspect-square object-cover rounded-sm"
            />
            <p className="text-sm font-medium mt-1 truncate">{item.title}</p>
            <p className="text-xs text-muted-foreground">${item.starting_bid}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RelatedItemsGrid;
