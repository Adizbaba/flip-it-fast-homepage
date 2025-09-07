import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface OrderStatusUpdaterProps {
  orderId: string;
  currentStatus: string;
  onStatusUpdate: (newStatus: string) => void;
}

const statusOptions = [
  { value: 'pending', label: 'Pending' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'completed', label: 'Completed' },
];

export const OrderStatusUpdater = ({ 
  orderId, 
  currentStatus, 
  onStatusUpdate 
}: OrderStatusUpdaterProps) => {
  const [selectedStatus, setSelectedStatus] = useState(currentStatus);
  const [updating, setUpdating] = useState(false);
  const { toast } = useToast();

  const updateOrderStatus = async () => {
    if (selectedStatus === currentStatus || updating) return;

    setUpdating(true);
    try {
      const { error } = await supabase
        .from("orders")
        .update({ status: selectedStatus })
        .eq("id", orderId);

      if (error) throw error;

      onStatusUpdate(selectedStatus);
      toast({
        title: "Status updated",
        description: "Order status has been updated successfully",
      });
    } catch (error) {
      console.error("Error updating order status:", error);
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive",
      });
      setSelectedStatus(currentStatus); // Reset on error
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <Select value={selectedStatus} onValueChange={setSelectedStatus}>
        <SelectTrigger className="w-32">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {statusOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {selectedStatus !== currentStatus && (
        <Button
          onClick={updateOrderStatus}
          disabled={updating}
          size="sm"
        >
          {updating ? "Updating..." : "Update"}
        </Button>
      )}
    </div>
  );
};