
export interface FilterState {
  category: string;
  minPrice: string;
  maxPrice: string;
  sortBy: string;
  condition: string;
  auctionType: string;
  [key: string]: string;
}

// Add a utility type for image processing
export type SafeImageArray = string[];
