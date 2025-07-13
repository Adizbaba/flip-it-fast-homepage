
import { useEffect, useState } from "react";
import { Activity, DollarSign, ListFilter, Gavel, Heart } from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";
import { useDashboard } from "@/contexts/DashboardContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";

// Activity type definition for the activity log
interface ActivityItem {
  id: string;
  type: string;
  description: string;
  timestamp: string;
  amount?: number;
  status?: string;
}

const Dashboard = () => {
  const { user } = useAuth();
  const { activeRole, sellerStats, buyerStats, loading } = useDashboard();
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [activityLoading, setActivityLoading] = useState(true);

  useEffect(() => {
    const fetchRecentActivity = async () => {
      if (!user) return;

      setActivityLoading(true);
      try {
        let activities: ActivityItem[] = [];

        if (activeRole === "seller") {
          // Fetch recent listings
          const { data: listings, error: listingsError } = await supabase
            .from('auction_items')
            .select('id, title, created_at, status')
            .eq('seller_id', user.id)
            .order('created_at', { ascending: false })
            .limit(5);

          if (listingsError) throw listingsError;

          activities = (listings || []).map(item => ({
            id: item.id,
            type: 'listing',
            description: `Listed item: ${item.title}`,
            timestamp: item.created_at,
            status: item.status
          }));
        } else {
          // For buyer, we could fetch recent transactions or favorites
          const { data: transactions, error: transactionsError } = await supabase
            .from('payment_transactions')
            .select('id, created_at, amount, status, metadata')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(5);

          if (transactionsError) throw transactionsError;

          activities = (transactions || []).map(tx => {
            let itemTitle = "Item";
            if (tx.metadata) {
              if (typeof tx.metadata === 'object' && tx.metadata !== null) {
                const metadata = tx.metadata as Record<string, unknown>;
                if ('item_title' in metadata && typeof metadata.item_title === 'string') {
                  itemTitle = metadata.item_title;
                }
              }
            }

            return {
              id: tx.id,
              type: 'transaction',
              description: `Payment ${tx.status}: ${itemTitle}`,
              timestamp: tx.created_at,
              amount: Number(tx.amount),
              status: tx.status
            };
          });
        }

        setRecentActivity(activities);
      } catch (error) {
        console.error(`Error fetching ${activeRole} recent activity:`, error);
      } finally {
        setActivityLoading(false);
      }
    };

    if (user) {
      fetchRecentActivity();
    }
  }, [user, activeRole]);

  if (loading) {
    return (
      <div className="flex h-64 w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-current border-t-transparent text-auction-purple"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="mb-1 text-3xl font-bold tracking-tight">
          {activeRole === "seller" ? "Seller Dashboard" : "Buyer Dashboard"}
        </h1>
        <p className="text-gray-500">
          Welcome back! Here's an overview of your {activeRole} activity.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {activeRole === "seller" ? (
          <>
            <StatCard
              title="Total Listings"
              value={sellerStats.totalListings}
              icon={ListFilter}
              description="All time"
            />
            <StatCard
              title="Active Listings"
              value={sellerStats.activeListings}
              icon={Activity}
              description="Currently live"
            />
            <StatCard
              title="Total Bids"
              value={sellerStats.totalBids}
              icon={Gavel}
              description="On all listings"
            />
            <StatCard
              title="Total Revenue"
              value={`$${sellerStats.totalRevenue.toFixed(2)}`}
              icon={DollarSign}
              description="From completed sales"
            />
          </>
        ) : (
          <>
            <StatCard
              title="Total Bids"
              value={buyerStats.totalBids}
              icon={Gavel}
              description="All time"
            />
            <StatCard
              title="Auctions Won"
              value={buyerStats.auctionsWon}
              icon={Heart}
              description="Successfully won items"
            />
            <StatCard
              title="Total Spending"
              value={`$${buyerStats.totalSpending.toFixed(2)}`}
              icon={DollarSign}
              description="On won auctions"
            />
          </>
        )}
      </div>

      {/* Recent Activity */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Your latest {activeRole === "seller" ? "seller" : "buyer"} activities
          </CardDescription>
        </CardHeader>
        <CardContent>
          {activityLoading ? (
            <div className="flex h-40 items-center justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-4 border-current border-t-transparent text-auction-purple"></div>
            </div>
          ) : recentActivity.length > 0 ? (
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex flex-col">
                    <span className="font-medium">{activity.description}</span>
                    <span className="text-sm text-gray-500">
                      {new Date(activity.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {activity.status && (
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium ${
                          activity.status.toLowerCase() === "active"
                            ? "bg-green-100 text-green-800"
                            : activity.status.toLowerCase() === "completed"
                            ? "bg-blue-100 text-blue-800"
                            : activity.status.toLowerCase() === "draft"
                            ? "bg-gray-100 text-gray-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {activity.status}
                      </span>
                    )}
                    {activity.amount !== undefined && (
                      <span className="font-semibold">${activity.amount.toFixed(2)}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex h-40 items-center justify-center text-center">
              <div>
                <p className="mb-2 text-gray-500">No recent activity</p>
                {activeRole === "seller" ? (
                  <p className="text-sm text-gray-400">
                    Start by creating your first listing to see activity here
                  </p>
                ) : (
                  <p className="text-sm text-gray-400">
                    Start bidding on items to see your activity here
                  </p>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
