
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
  sku: z.string().default("").optional(),
  brand: z.string().default("").optional(),
  weight: z.number().default(0).optional(),
  dimensions: z.object({
    height: z.number().default(0).optional(),
    width: z.number().default(0).optional(),
    length: z.number().default(0).optional(),
  }).default({}).optional(),
  seoTitle: z.string().default("").optional(),
  seoDescription: z.string().default("").optional(),
  tags: z.string().default("").optional(),
});

// Regular listing schema - fixed price, no auction fields
export const regularListingSchema = baseListingSchema.extend({
  listingType: z.literal("regular"),
  price: z.number().min(0.01, "Price must be greater than 0."),
  salePrice: z.number().default(0).optional(),
  minOrderQuantity: z.number().int().min(1).default(1).optional(),
  allowBackorders: z.boolean().default(false).optional(),
});

// Auction listing schema - includes auction-specific fields
export const auctionListingSchema = baseListingSchema.extend({
  listingType: z.literal("auction"),
  startingBid: z.number().min(0.01, "Starting bid must be greater than 0."),
  bidIncrement: z.number().min(0.01, "Bid increment must be greater than 0."),
  reservePrice: z.number().default(0).optional(),
  buyNowPrice: z.number().default(0).optional(),
  auctionType: z.string().min(1, "Please select an auction type."),
  startDate: z.date({
    required_error: "Start date is required.",
  }),
  endDate: z.date({
    required_error: "End date is required.",
  }),
  autoExtend: z.boolean().default(false).optional(),
  extensionDuration: z.number().default(5).optional(),
  triggerTimeframe: z.number().default(2).optional(),
});

// Combined schema that validates based on listing type
export const listingFormSchema = z.discriminatedUnion("listingType", [
  regularListingSchema,
  auctionListingSchema,
]);

export type RegularListingFormData = z.infer<typeof regularListingSchema>;
export type AuctionListingFormData = z.infer<typeof auctionListingSchema>;
export type ListingFormData = z.infer<typeof listingFormSchema>;
