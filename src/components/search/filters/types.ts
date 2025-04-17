
export interface FilterState {
  category: string;
  minPrice: string;
  maxPrice: string;
  sortBy: string;
  condition?: string;
  [key: string]: string | undefined;
}
