
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingBag, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import OrdersTable from "@/components/dashboard/orders/OrdersTable";
import OrdersFilters from "@/components/dashboard/orders/OrdersFilters";
import { useOrders } from "@/hooks/useOrders";

const OrdersPage = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    search: "",
    status: "all",
    sort: "date-desc"
  });

  const { orders, loading } = useOrders({
    search: filters.search,
    statusFilter: filters.status,
    sortBy: filters.sort
  });

  const handleSearchChange = (search: string) => {
    setFilters(prev => ({ ...prev, search }));
  };

  const handleStatusFilter = (status: string) => {
    setFilters(prev => ({ ...prev, status }));
  };

  const handleSortChange = (sort: string) => {
    setFilters(prev => ({ ...prev, sort }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Orders</h1>
          <p className="text-muted-foreground mt-1">
            Track and manage all your orders and purchases
          </p>
        </div>
        <Button onClick={() => navigate("/auctions")} className="gap-2">
          <Plus className="h-4 w-4" />
          Browse Items
        </Button>
      </div>

      {!loading && orders.length === 0 && filters.search === "" && filters.status === "all" ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ShoppingBag className="h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="text-xl font-medium mb-2">No orders yet</h2>
            <p className="text-muted-foreground mb-6 text-center">
              You haven't made any purchases yet. Start browsing to find great deals!
            </p>
            <div className="flex gap-4">
              <Button onClick={() => navigate("/auctions")}>
                Browse Auctions
              </Button>
              <Button variant="outline" onClick={() => navigate("/declutter")}>
                Browse Declutter Items
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Order History</span>
              {!loading && (
                <span className="text-sm font-normal text-muted-foreground">
                  {orders.length} {orders.length === 1 ? 'order' : 'orders'}
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <OrdersFilters
              onSearchChange={handleSearchChange}
              onStatusFilter={handleStatusFilter}
              onSortChange={handleSortChange}
              activeFilters={filters}
            />
            
            {!loading && orders.length === 0 && (filters.search !== "" || filters.status !== "all") ? (
              <div className="text-center py-8">
                <h3 className="text-lg font-medium mb-2">No orders found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search or filter criteria
                </p>
              </div>
            ) : (
              <OrdersTable orders={orders} loading={loading} />
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default OrdersPage;
