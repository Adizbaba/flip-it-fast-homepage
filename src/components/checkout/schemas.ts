
import { z } from "zod";

export const checkoutItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  image: z.string().optional(),
  amount: z.number().positive(),
  type: z.enum(["bid", "listing", "purchase"])
});

export const orderSummarySchema = z.object({
  item: checkoutItemSchema
});

export const paymentSectionSchema = z.object({
  amount: z.number().positive(),
  processing: z.boolean(),
  onPaymentClick: z.function().args().returns(z.void())
});

export const paymentDialogSchema = z.object({
  open: z.boolean(),
  onOpenChange: z.function().args(z.boolean()).returns(z.void()),
  paymentUrl: z.string().nullable(),
  onCancel: z.function().args().returns(z.void())
});

export type CheckoutItem = z.infer<typeof checkoutItemSchema>;
export type OrderSummaryProps = z.infer<typeof orderSummarySchema>;
export type PaymentSectionProps = z.infer<typeof paymentSectionSchema>;
export type PaymentDialogProps = z.infer<typeof paymentDialogSchema>;
