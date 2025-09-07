import { Badge } from "@/components/ui/badge";

interface OrderStatusBadgeProps {
  status: string;
}

export const OrderStatusBadge = ({ status }: OrderStatusBadgeProps) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'pending':
        return { label: 'Pending', variant: 'secondary' as const };
      case 'shipped':
        return { label: 'Shipped', variant: 'default' as const };
      case 'delivered':
        return { label: 'Delivered', variant: 'outline' as const };
      case 'completed':
        return { label: 'Completed', variant: 'default' as const };
      default:
        return { label: 'Unknown', variant: 'secondary' as const };
    }
  };

  const { label, variant } = getStatusConfig(status);

  return <Badge variant={variant}>{label}</Badge>;
};