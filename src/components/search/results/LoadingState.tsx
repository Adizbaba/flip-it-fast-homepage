
import { Card, CardContent } from "@/components/ui/card";

interface LoadingStateProps {
  count: number;
}

const LoadingState = ({ count }: LoadingStateProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index} className="overflow-hidden h-[300px] animate-pulse">
          <div className="bg-muted h-40 w-full"></div>
          <CardContent className="p-4">
            <div className="h-4 bg-muted rounded-md w-3/4 mb-2"></div>
            <div className="h-4 bg-muted rounded-md w-1/2 mb-2"></div>
            <div className="h-4 bg-muted rounded-md w-1/4"></div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default LoadingState;
