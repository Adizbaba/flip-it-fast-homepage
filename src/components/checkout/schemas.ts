export interface OrderSummaryProps {
  item: {
    id: string;
    title: string;
    image?: string;
    amount: number;
    type: 'bid' | 'purchase' | 'listing' | 'declutter';
  };
}

export interface PaymentSectionProps {
  amount: number;
  processing: boolean;
  onPaymentClick: () => void;
}

export interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  paymentUrl: string | null;
  onCancel: () => void;
}
