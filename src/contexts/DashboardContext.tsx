import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

type DashboardRole = "seller" | "buyer" | "both";

interface DashboardContextType {
  activeRole: DashboardRole;
  setActiveRole: (role: DashboardRole) => void;
  loading: boolean;
  sellerStats: SellerStats;
  buyerStats: BuyerStats;
}

interface SellerStats {
  totalListings: number;
  activeListings: number;
  totalBids: number;
  totalRevenue: number;
}

interface BuyerStats {
  totalBids: number;
  auctionsWon: number;
  totalSpending: number;
}

const initialSellerStats: SellerStats = {
  totalListings: 0,
  activeListings: 0,
  totalBids: 0,
  totalRevenue: 0,
};

const initialBuyerStats: BuyerStats = {
  totalBids: 0,
  auctionsWon: 0,
  totalSpending: 0,
};

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const DashboardProvider = ({ children }: { children: ReactNode }) => {
  const [activeRole, setActiveRoleState] = useState<DashboardRole>("buyer");
  const [loading, setLoading] = useState(true);
  const [sellerStats, setSellerStats] = useState<SellerStats>(initialSellerStats);
  const [buyerStats, setBuyerStats] = useState<BuyerStats>(initialBuyerStats);
  const { user } = useAuth();

  const setActiveRole = (role: DashboardRole) => {
    setActiveRoleState(role);
    localStorage.setItem('dashboardActiveRole', role);
  };

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchRoleData = async () => {
      setLoading(true);
      
      try {
        // Check localStorage for saved role preference
        const savedRole = localStorage.getItem('dashboardActiveRole') as DashboardRole;
        
        // Check if the user has any seller activity
        const { data: sellerData, error: sellerError } = await supabase
          .from('auction_items')
          .select('id')
          .eq('seller_id', user.id)
          .limit(1);
        
        // Check if the user has any buyer activity
        const { data: buyerData, error: buyerError } = await supabase
          .from('payment_transactions')
          .select('id')
          .eq('user_id', user.id)
          .limit(1);
        
        // Set role based on saved preference or activity
        if (savedRole && (savedRole === 'buyer' || savedRole === 'seller')) {
          setActiveRoleState(savedRole);
        } else if (sellerData && sellerData.length > 0) {
          setActiveRoleState('seller');
          localStorage.setItem('dashboardActiveRole', 'seller');
        } else if (buyerData && buyerData.length > 0) {
          setActiveRoleState('buyer');
          localStorage.setItem('dashboardActiveRole', 'buyer');
        } else {
          setActiveRoleState('buyer');
          localStorage.setItem('dashboardActiveRole', 'buyer');
        }
        
        // Fetch seller statistics if user has seller activity
        if (sellerData && sellerData.length > 0) {
          await fetchSellerStats(user.id);
        }
        
        // Fetch buyer statistics if user has buyer activity
        if (buyerData && buyerData.length > 0) {
          await fetchBuyerStats(user.id);
        }
      } catch (error) {
        console.error("Error determining user role:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRoleData();
  }, [user]);

  const fetchSellerStats = async (userId: string) => {
    try {
      // Get total listings
      const { data: listings, error: listingsError } = await supabase
        .from('auction_items')
        .select('id, status, starting_bid, buy_now_price')
        .eq('seller_id', userId);
      
      if (listingsError) throw listingsError;
      
      // Get active listings
      const activeListings = listings?.filter(item => item.status === 'Active') || [];
      
      // Calculate revenue from completed transactions
      const { data: transactions, error: transactionsError } = await supabase
        .from('payment_transactions')
        .select('amount')
        .eq('status', 'completed')
        .in('item_id', listings?.map(item => item.id) || []);
      
      if (transactionsError) throw transactionsError;
      
      const totalRevenue = transactions?.reduce((sum, tx) => sum + Number(tx.amount), 0) || 0;
      
      setSellerStats({
        totalListings: listings?.length || 0,
        activeListings: activeListings.length,
        totalBids: 0, // We would need a bids table to calculate this
        totalRevenue,
      });
    } catch (error) {
      console.error("Error fetching seller stats:", error);
    }
  };

  const fetchBuyerStats = async (userId: string) => {
    try {
      // Get total spending from completed transactions
      const { data: transactions, error: transactionsError } = await supabase
        .from('payment_transactions')
        .select('amount, status')
        .eq('user_id', userId);
      
      if (transactionsError) throw transactionsError;
      
      const completedTransactions = transactions?.filter(tx => tx.status === 'completed') || [];
      const totalSpending = completedTransactions.reduce((sum, tx) => sum + Number(tx.amount), 0);
      
      setBuyerStats({
        totalBids: 0, // We would need a bids table to calculate this
        auctionsWon: completedTransactions.length,
        totalSpending,
      });
    } catch (error) {
      console.error("Error fetching buyer stats:", error);
    }
  };

  return (
    <DashboardContext.Provider
      value={{
        activeRole,
        setActiveRole,
        loading,
        sellerStats,
        buyerStats,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  
  if (context === undefined) {
    throw new Error("useDashboard must be used within a DashboardProvider");
  }
  
  return context;
};
