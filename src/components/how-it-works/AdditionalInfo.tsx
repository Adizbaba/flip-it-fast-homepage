
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export const AdditionalInfo = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-12">
      <section className="bg-muted p-8 rounded-lg">
        <h2 className="text-2xl font-semibold mb-4">Buyer Guidelines</h2>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-6">
          <li>Always review item descriptions and images carefully</li>
          <li>Check seller ratings and reviews before bidding</li>
          <li>Set up alerts for items you're interested in</li>
          <li>Understand shipping costs and delivery times</li>
          <li>Contact sellers with questions before bidding</li>
        </ul>
        <Button onClick={() => navigate("/search")}>Start Browsing</Button>
      </section>

      <section className="bg-muted p-8 rounded-lg">
        <h2 className="text-2xl font-semibold mb-4">Seller Guidelines</h2>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-6">
          <li>Provide accurate item descriptions and clear photos</li>
          <li>Set fair starting prices and shipping costs</li>
          <li>Respond promptly to buyer questions</li>
          <li>Ship items within the specified timeframe</li>
          <li>Maintain good communication throughout the process</li>
        </ul>
        <Button onClick={() => navigate("/create-listing")}>Start Selling</Button>
      </section>
    </div>
  );
};
