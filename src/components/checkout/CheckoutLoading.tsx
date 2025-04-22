import { Skeleton } from "@/components/ui/skeleton";

const CheckoutLoading = () => {
  return (
    <div className="w-full max-w-3xl mx-auto space-y-8">
      <Skeleton className="h-8 w-48" /> {/* Title skeleton */}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          {/* Order Summary Skeleton */}
          <div className="space-y-4">
            <Skeleton className="h-6 w-32" /> {/* Section title */}
            <div className="flex items-center space-x-4">
              <Skeleton className="h-24 w-24 rounded-lg" /> {/* Image skeleton */}
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-3/4" /> {/* Title skeleton */}
                <Skeleton className="h-4 w-1/2" /> {/* Price skeleton */}
              </div>
            </div>
          </div>
          
          {/* Payment Details Skeleton */}
          <div className="space-y-4">
            <Skeleton className="h-6 w-40" /> {/* Section title */}
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" /> {/* Input field skeleton */}
              <Skeleton className="h-10 w-full" /> {/* Input field skeleton */}
            </div>
          </div>
        </div>
        
        {/* Payment Summary Skeleton */}
        <div className="space-y-4">
          <Skeleton className="h-6 w-32" /> {/* Section title */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-24" /> {/* Label skeleton */}
              <Skeleton className="h-4 w-16" /> {/* Value skeleton */}
            </div>
            <div className="flex justify-between">
              <Skeleton className="h-4 w-24" /> {/* Label skeleton */}
              <Skeleton className="h-4 w-16" /> {/* Value skeleton */}
            </div>
            <div className="pt-4 border-t">
              <div className="flex justify-between">
                <Skeleton className="h-5 w-24" /> {/* Total label skeleton */}
                <Skeleton className="h-5 w-20" /> {/* Total value skeleton */}
              </div>
            </div>
          </div>
          <Skeleton className="h-10 w-full" /> {/* Button skeleton */}
        </div>
      </div>
    </div>
  );
};

export default CheckoutLoading;
