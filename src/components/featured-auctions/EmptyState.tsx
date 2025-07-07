import { Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  onCreateListing: () => void;
}

export const EmptyState = ({ onCreateListing }: EmptyStateProps) => (
  <section className="py-8 md:py-12 bg-muted/30">
    <div className="container mx-auto px-4">
      <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center">Featured Auctions</h2>
      <div className="text-center py-12 bg-white rounded-lg border border-dashed border-gray-300">
        <div className="max-w-md mx-auto">
          <div className="mb-4">
            <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
              <Clock className="w-8 h-8 text-gray-400" />
            </div>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No featured auctions yet
          </h3>
          <p className="text-gray-600 mb-6">
            Be the first to list! Create an auction and showcase your items to thousands of potential buyers.
          </p>
          <Button 
            onClick={onCreateListing}
            className="bg-auction-purple hover:bg-purple-700"
          >
            Create Your First Listing
          </Button>
        </div>
      </div>
    </div>
  </section>
);