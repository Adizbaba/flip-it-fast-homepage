
import { z } from "zod";

// Base schema for common fields
const baseListingSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters.").max(100, "Title must be less than 100 characters."),
  description: z.string().min(10, "Description must be at least 10 characters."),
  categoryId: z.string().min(1, "Please select a category."),
  condition: z.string().min(1, "Please select a condition."),
  quantity: z.number().int().min(1, "Quantity must be at least 1."),
  shippingOptions: z.string(),
  returnPolicy: z.string(),
  // SKU and brand for regular listings
  sku: z.string().optional(),
  brand: z.string().optional(),
  weight: z.number().optional(),
  dimensions: z.object({
    height: z.number().optional(),
    width: z.number().optional(),
    length: z.number().optional(),
  }).optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  tags: z.string().optional(),
});

// Regular listing schema - fixed price, no auction fields
export const regularListingSchema = baseListingSchema.extend({
  listingType: z.literal("regular"),
  price: z.number().min(0.01, "Price must be greater than 0."),
  salePrice: z.number().optional(),
  minOrderQuantity: z.number().int().min(1).optional(),
  allowBackorders: z.boolean().optional(),
});

// Auction listing schema - includes auction-specific fields
export const auctionListingSchema = baseListingSchema.extend({
  listingType: z.literal("auction"),
  startingBid: z.number().min(0.01, "Starting bid must be greater than 0."),
  bidIncrement: z.number().min(0.01, "Bid increment must be greater than 0."),
  reservePrice: z.number().optional(),
  buyNowPrice: z.number().optional(),
  auctionType: z.string().min(1, "Please select an auction type."),
  startDate: z.date({
    required_error: "Start date is required.",
  }),
  endDate: z.date({
    required_error: "End date is required.",
  }),
  autoExtend: z.boolean().optional(),
  extensionDuration: z.number().optional(),
  triggerTimeframe: z.number().optional(),
});

// Combined schema that validates based on listing type
export const listingFormSchema = z.discriminatedUnion("listingType", [
  regularListingSchema,
  auctionListingSchema,
]);

export type RegularListingFormData = z.infer<typeof regularListingSchema>;
export type AuctionListingFormData = z.infer<typeof auctionListingSchema>;
export type ListingFormData = z.infer<typeof listingFormSchema>;
