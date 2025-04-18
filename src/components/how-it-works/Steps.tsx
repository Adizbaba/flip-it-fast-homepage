
import { UserPlus, Search, Gavel, CreditCard, Package, Shield } from "lucide-react";

const steps = [
  {
    icon: UserPlus,
    title: "Create an Account",
    description: "Sign up for free in seconds and verify your email to start buying or selling.",
  },
  {
    icon: Search,
    title: "Browse Listings",
    description: "Explore thousands of items or use our powerful search to find exactly what you want.",
  },
  {
    icon: Gavel,
    title: "Place Bids",
    description: "Bid on items you're interested in and track your active auctions in real-time.",
  },
  {
    icon: CreditCard,
    title: "Secure Payment",
    description: "When you win an auction, pay securely through our protected payment system.",
  },
  {
    icon: Package,
    title: "Shipping",
    description: "Sellers ship items directly to buyers with tracking information provided.",
  },
  {
    icon: Shield,
    title: "Protection",
    description: "Our buyer protection program ensures a safe and secure transaction.",
  },
];

export const Steps = () => {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
      {steps.map((step, index) => (
        <div key={index} className="relative p-6 rounded-lg border bg-card">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <step.icon className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-semibold">{step.title}</h3>
          </div>
          <p className="text-muted-foreground">{step.description}</p>
        </div>
      ))}
    </div>
  );
};
