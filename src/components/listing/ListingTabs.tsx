
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, Gavel } from "lucide-react";

interface ListingTabsProps {
  children: React.ReactNode;
  onTabChange: (value: string) => void;
  defaultValue: string;
}

export const ListingTabs = ({ children, onTabChange, defaultValue }: ListingTabsProps) => {
  return (
    <Tabs defaultValue={defaultValue} onValueChange={onTabChange} className="w-full">
      <TabsList className="grid w-full grid-cols-2 mb-8 bg-muted/30 p-1 rounded-lg">
        <TabsTrigger value="regular" className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-md transition-all">
          <Package className="h-4 w-4" />
          Normal Listing/Auction
        </TabsTrigger>
        <TabsTrigger value="auction" className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-md transition-all">
          <Gavel className="h-4 w-4" />
          Bidding / Auction Listing
        </TabsTrigger>
      </TabsList>
      {children}
    </Tabs>
  );
};
