
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface CheckoutProgressProps {
  currentStep: number;
}

const steps = [
  { id: 1, name: "Contact", description: "Contact Information" },
  { id: 2, name: "Shipping", description: "Shipping Address" },
  { id: 3, name: "Method", description: "Shipping Method" },
  { id: 4, name: "Payment", description: "Payment Details" },
  { id: 5, name: "Review", description: "Review Order" }
];

const CheckoutProgress = ({ currentStep }: CheckoutProgressProps) => {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center border-2 transition-colors",
                  currentStep > step.id
                    ? "bg-primary border-primary text-primary-foreground"
                    : currentStep === step.id
                    ? "border-primary text-primary bg-background"
                    : "border-muted-foreground text-muted-foreground bg-background"
                )}
              >
                {currentStep > step.id ? (
                  <Check className="w-4 h-4 md:w-5 md:h-5" />
                ) : (
                  <span className="text-sm md:text-base font-medium">{step.id}</span>
                )}
              </div>
              <div className="mt-2 text-center">
                <p className="text-xs md:text-sm font-medium text-foreground">
                  {step.name}
                </p>
                <p className="text-xs text-muted-foreground hidden md:block">
                  {step.description}
                </p>
              </div>
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "flex-1 h-0.5 mx-2 md:mx-4 transition-colors",
                  currentStep > step.id ? "bg-primary" : "bg-muted"
                )}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CheckoutProgress;
