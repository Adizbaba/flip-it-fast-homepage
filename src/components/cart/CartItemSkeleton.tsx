import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

const CartItemSkeleton = () => {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="flex flex-col sm:flex-row">
          <Skeleton className="w-full sm:w-32 h-32" />
          <div className="flex-1 p-4">
            <div className="flex flex-col h-full">
              <div className="flex-1">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                  <Skeleton className="h-8 w-8 rounded" />
                </div>
              </div>
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center space-x-2">
                  <Skeleton className="h-8 w-8" />
                  <Skeleton className="h-6 w-12" />
                  <Skeleton className="h-8 w-8" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CartItemSkeleton;