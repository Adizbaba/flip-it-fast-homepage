import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  data: any;
  read: boolean;
  email_sent: boolean;
  created_at: string;
}

export const useNotifications = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isConnected, setIsConnected] = useState(false);

  // Fetch notifications
  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ["notifications", user?.id],
    queryFn: async (): Promise<Notification[]> => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  // Mark notification as read
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("id", notificationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications", user?.id] });
    },
  });

  // Mark all as read
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      if (!user) return;
      
      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("user_id", user.id)
        .eq("read", false);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications", user?.id] });
    },
  });

  // Send email notification
  const sendEmailNotification = async (notificationId: string) => {
    try {
      await supabase.functions.invoke('send-auction-notifications', {
        body: { notification_id: notificationId }
      });
    } catch (error) {
      console.error('Failed to send email notification:', error);
    }
  };

  // Set up real-time subscriptions
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`notifications-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const newNotification = payload.new as Notification;
          
          // Show toast notification for real-time alerts
          showToastNotification(newNotification);
          
          // Refetch notifications
          queryClient.invalidateQueries({ queryKey: ["notifications", user.id] });
          
          // Send email notification in background
          sendEmailNotification(newNotification.id);
        }
      )
      .subscribe((status) => {
        setIsConnected(status === "SUBSCRIBED");
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, queryClient]);

  const showToastNotification = (notification: Notification) => {
    const { type, title, message, data } = notification;
    
    switch (type) {
      case 'outbid':
        toast.error(title, {
          description: message,
          action: {
            label: "View Auction",
            onClick: () => window.location.href = `/item/${data.auction_id}`
          },
          duration: 10000,
        });
        break;
        
      case 'won_auction':
        toast.success(title, {
          description: message,
          action: {
            label: "Pay Now",
            onClick: () => window.location.href = `/payment/auction/${data.auction_id}`
          },
          duration: 15000,
        });
        break;
        
      case 'auction_live':
        toast.success(title, {
          description: message,
          action: {
            label: "View Auction",
            onClick: () => window.location.href = `/item/${data.auction_id}`
          },
          duration: 8000,
        });
        break;
        
      case 'auction_sold':
        toast.success(title, {
          description: message,
          action: {
            label: "Dashboard",
            onClick: () => window.location.href = `/dashboard/seller/listings`
          },
          duration: 10000,
        });
        break;
        
      case 'auction_ending':
        toast.warning(title, {
          description: message,
          action: {
            label: "Quick Bid",
            onClick: () => window.location.href = `/item/${data.auction_id}`
          },
          duration: 12000,
        });
        break;
        
      default:
        toast.info(title, {
          description: message,
          duration: 6000,
        });
        break;
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return {
    notifications,
    unreadCount,
    isLoading,
    isConnected,
    markAsRead: markAsReadMutation.mutate,
    markAllAsRead: markAllAsReadMutation.mutate,
    isMarkingAsRead: markAsReadMutation.isPending,
    isMarkingAllAsRead: markAllAsReadMutation.isPending,
  };
};