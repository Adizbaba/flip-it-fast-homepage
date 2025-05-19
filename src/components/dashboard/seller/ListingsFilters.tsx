
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Filter, ArrowUp, ArrowDown } from "lucide-react";

interface ListingsFiltersProps {
  onFilterChange: (filters: {
    status?: string;
    searchQuery?: string;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
  }) => void;
  currentFilters: {
    status?: string;
    searchQuery?: string;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
  };
  onViewChange: (view: 'grid' | 'table') => void;
  currentView: 'grid' | 'table';
}

export const ListingsFilters = ({
  onFilterChange,
  currentFilters,
  onViewChange,
  currentView
}: ListingsFiltersProps) => {
  const [searchValue, setSearchValue] = useState(currentFilters.searchQuery || "");
  
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFilterChange({
      ...currentFilters,
      searchQuery: searchValue
    });
  };
  
  const handleStatusChange = (value: string) => {
    onFilterChange({
      ...currentFilters,
      status: value === "all" ? undefined : value
    });
  };
  
  const handleSortChange = (value: string) => {
    const [sortBy, sortOrder] = value.split('-');
    onFilterChange({
      ...currentFilters,
      sortBy,
      sortOrder: sortOrder as 'asc' | 'desc'
    });
  };
  
  const clearFilters = () => {
    setSearchValue("");
    onFilterChange({
      sortBy: 'created_at',
      sortOrder: 'desc'
    });
  };
  
  return (
    <div className="flex flex-col sm:flex-row gap-4 items-end mb-6">
      <form onSubmit={handleSearchSubmit} className="flex-1">
        <div className="flex gap-2">
          <Input
            placeholder="Search listings..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="flex-1"
          />
          <Button type="submit">Search</Button>
        </div>
      </form>
      
      <div className="flex gap-2 flex-wrap">
        <Select 
          value={currentFilters.status || "all"} 
          onValueChange={handleStatusChange}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Filter by Status</SelectLabel>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Sold">Sold</SelectItem>
              <SelectItem value="Expired">Expired</SelectItem>
              <SelectItem value="Draft">Draft</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-[140px]">
              <Filter className="mr-2 h-4 w-4" />
              Sort
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-40">
            <DropdownMenuLabel>Sort by</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuRadioGroup 
              value={`${currentFilters.sortBy}-${currentFilters.sortOrder}`}
              onValueChange={handleSortChange}
            >
              <DropdownMenuRadioItem value="created_at-desc">Newest</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="created_at-asc">Oldest</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="title-asc">A-Z</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="title-desc">Z-A</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="starting_bid-asc">Price (Low-High)</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="starting_bid-desc">Price (High-Low)</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <div className="flex border rounded-md">
          <Button 
            variant={currentView === 'grid' ? "default" : "ghost"}
            size="icon"
            className="rounded-r-none"
            onClick={() => onViewChange('grid')}
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </Button>
          <Button 
            variant={currentView === 'table' ? "default" : "ghost"}
            size="icon"
            className="rounded-l-none"
            onClick={() => onViewChange('table')}
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
          </Button>
        </div>
        
        <Button variant="ghost" onClick={clearFilters}>
          Clear
        </Button>
      </div>
    </div>
  );
};
