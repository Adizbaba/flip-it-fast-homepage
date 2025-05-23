
import { z } from "zod";

export const listingFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters."),
  description: z.string().min(10, "Description must be at least 10 characters."),
  startingBid: z.number().min(0.01, "Starting bid must be greater than 0."),
  bidIncrement: z.number().min(0.01, "Bid increment must be greater than 0."),
  reservePrice: z.number().optional(),
  categoryId: z.string().min(1, "Please select a category."),
  startDate: z.date({
    required_error: "Start date is required.",
  }),
  endDate: z.date({
    required_error: "End date is required.",
  }).refine(
    (date) => date > new Date(),
    "End date must be in the future."
  ),
  condition: z.string().min(1, "Please select a condition."),
  quantity: z.number().int().min(1, "Quantity must be at least 1."),
  buyNowPrice: z.number().optional(),
  shippingOptions: z.string(),
  returnPolicy: z.string(),
  auctionType: z.string().min(1, "Please select an auction type.")
}).refine(
  (data) => {
    // Convert dates to make sure we're comparing properly
    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);
    
    // Return true if end date is after start date
    return endDate > startDate;
  },
  {
    message: "End date must be after start date",
    path: ["endDate"]
  }
).refine(
  (data) => {
    if (data.buyNowPrice) {
      return data.buyNowPrice > data.startingBid;
    }
    return true;
  },
  {
    message: "Buy now price must be greater than starting bid",
    path: ["buyNowPrice"]
  }
);

export type ListingFormData = z.infer<typeof listingFormSchema>;
