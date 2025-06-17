
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

interface ShippingMethod {
  id: string;
  name: string;
  price: number;
  estimatedDays: string;
  description: string;
}

const shippingMethods: ShippingMethod[] = [
  {
    id: "standard",
    name: "Standard Delivery",
    price: 3500,
    estimatedDays: "5-7 business days",
    description: "Rider delivery within Nigeria"
  },
  {
    id: "executive",
    name: "Executive Delivery",
    price: 6000,
    estimatedDays: "2-3 business days",
    description: "Bold/Uber premium delivery service"
  }
];

interface ShippingMethodStepProps {
  data: {
    id: string;
    name: string;
    price: number;
    estimatedDays: string;
  };
  onUpdate: (data: any) => void;
  onNext: () => void;
  onPrev: () => void;
  subtotal: number;
}

const ShippingMethodStep = ({ data, onUpdate, onNext, onPrev, subtotal }: ShippingMethodStepProps) => {
  const [selectedMethod, setSelectedMethod] = useState(data.id);

  const handleMethodChange = (methodId: string) => {
    const method = shippingMethods.find(m => m.id === methodId);
    if (method) {
      setSelectedMethod(methodId);
      onUpdate({
        id: method.id,
        name: method.name,
        price: method.price,
        estimatedDays: method.estimatedDays
      });
    }
  };

  const handleContinue = () => {
    if (!selectedMethod) {
      return;
    }
    onNext();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Shipping Method</CardTitle>
        <p className="text-sm text-muted-foreground">
          Choose your preferred delivery option
        </p>
      </CardHeader>
      <CardContent>
        <RadioGroup value={selectedMethod} onValueChange={handleMethodChange} className="space-y-4">
          {shippingMethods.map((method) => (
            <div key={method.id} className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <RadioGroupItem value={method.id} id={method.id} />
              <Label htmlFor={method.id} className="flex-1 cursor-pointer">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium">{method.name}</h3>
                      <Badge variant="outline">{method.estimatedDays}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{method.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">₦{method.price.toLocaleString()}</p>
                  </div>
                </div>
              </Label>
            </div>
          ))}
        </RadioGroup>

        {/* Order summary update */}
        {selectedMethod && (
          <div className="mt-6 p-4 bg-muted/30 rounded-lg">
            <div className="flex justify-between items-center">
              <span>Subtotal:</span>
              <span>₦{subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Shipping:</span>
              <span>₦{shippingMethods.find(m => m.id === selectedMethod)?.price.toLocaleString()}</span>
            </div>
            <div className="border-t pt-2 mt-2">
              <div className="flex justify-between items-center font-semibold">
                <span>Total:</span>
                <span>₦{(subtotal + (shippingMethods.find(m => m.id === selectedMethod)?.price || 0)).toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between pt-6">
          <Button type="button" variant="outline" onClick={onPrev}>
            Back
          </Button>
          <Button 
            onClick={handleContinue} 
            size="lg"
            disabled={!selectedMethod}
          >
            Continue to Payment
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ShippingMethodStep;
