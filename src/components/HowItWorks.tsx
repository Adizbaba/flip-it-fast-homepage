
import { Search, Gavel, CreditCard, Package } from "lucide-react";

const steps = [
  {
    id: 1,
    title: 'Find Items',
    description: 'Browse thousands of items or search for something specific.',
    icon: Search,
    color: 'bg-blue-500',
  },
  {
    id: 2,
    title: 'Place Bids',
    description: 'Bid on items you want and track your active auctions.',
    icon: Gavel,
    color: 'bg-green-500',
  },
  {
    id: 3,
    title: 'Win & Pay',
    description: 'Pay securely when you win with multiple payment options.',
    icon: CreditCard,
    color: 'bg-purple-500',
  },
  {
    id: 4,
    title: 'Get Delivered',
    description: 'Receive your items directly to your doorstep.',
    icon: Package,
    color: 'bg-orange-500',
  },
];

const HowItWorks = () => {
  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold mb-2">How FastFlip Works</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Our auction process is quick and easy, allowing you to buy or sell items in just a few steps
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step) => (
            <div key={step.id} className="flex flex-col items-center text-center">
              <div className={`${step.color} h-16 w-16 rounded-full flex items-center justify-center text-white mb-4`}>
                <step.icon size={28} />
              </div>
              <div className="relative mb-3">
                <h3 className="text-xl font-semibold">{step.title}</h3>
                <span className="absolute -right-4 -top-1 text-5xl font-bold text-gray-100 -z-10">
                  {step.id}
                </span>
              </div>
              <p className="text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
