import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const LoadingSkeleton = () => (
  <section className="py-8 md:py-12 bg-muted/30">
    <div className="container mx-auto px-4">
      <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center">Featured Auctions</h2>
      
      {/* Mobile Carousel Skeleton */}
      <div className="md:hidden">
        <div className="flex gap-4 overflow-x-auto pb-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex-shrink-0 w-64">
              <Card className="overflow-hidden">
                <Skeleton className="h-64 w-full" />
                <CardContent className="p-4">
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-6 w-1/2 mb-2" />
                  <Skeleton className="h-8 w-full" />
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
      
      {/* Desktop Grid Skeleton */}
      <div className="hidden md:grid md:grid-cols-3 lg:grid-cols-5 gap-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <Skeleton className="h-48 w-full" />
            <CardContent className="p-4">
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-6 w-1/2 mb-2" />
              <Skeleton className="h-8 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  </section>
);