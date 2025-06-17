
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Edit, CreditCard, Truck, MapPin, User, Loader2 } from "lucide-react";
import { CheckoutData } from "@/pages/CheckoutFlow";

interface ReviewOrderStepProps {
  checkoutData: CheckoutData;
  items: any[];
  subtotal: number;
  total: number;
  onPlaceOrder: () => void;
  onPrev: () => void;
  onEdit: (step: number) => void;
  isLoading: boolean;
}

const ReviewOrderStep = ({ 
  checkoutData, 
  items, 
  subtotal, 
  total, 
  onPlaceOrder, 
  onPrev, 
  onEdit,
  isLoading 
}: ReviewOrderStepProps) => {
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  const handlePlaceOrder = () => {
    if (!agreeToTerms) {
      return;
    }
    onPlaceOrder();
  };

  const handleTermsChange = (checked: boolean | "indeterminate") => {
    setAgreeToTerms(checked === true);
  };

  return (
    <div className="space-y-6">
      {/* Order Items */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Order Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="flex items-center space-x-4">
                <img
                  src={item.image || "/placeholder.svg"}
                  alt={item.title}
                  className="w-16 h-16 object-cover rounded-md"
                />
                <div className="flex-1">
                  <h3 className="font-medium">{item.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {item.itemType === "auction" ? "Auction" : "Declutter"}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      Qty: {item.quantity}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">₦{(item.price * item.quantity).toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">₦{item.price.toLocaleString()} each</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="h-5 w-5" />
              Contact Information
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => onEdit(1)}>
              <Edit className="h-4 w-4" />
              Edit
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <p>{checkoutData.contactInfo.firstName} {checkoutData.contactInfo.lastName}</p>
          <p className="text-muted-foreground">{checkoutData.contactInfo.email}</p>
          <p className="text-muted-foreground">{checkoutData.contactInfo.phone}</p>
        </CardContent>
      </Card>

      {/* Shipping Address */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Shipping Address
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => onEdit(2)}>
              <Edit className="h-4 w-4" />
              Edit
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <p>{checkoutData.shippingAddress.fullName}</p>
          <p>{checkoutData.shippingAddress.addressLine1}</p>
          {checkoutData.shippingAddress.addressLine2 && (
            <p>{checkoutData.shippingAddress.addressLine2}</p>
          )}
          <p>
            {checkoutData.shippingAddress.city}, {checkoutData.shippingAddress.state} {checkoutData.shippingAddress.postalCode}
          </p>
          <p>{checkoutData.shippingAddress.country}</p>
        </CardContent>
      </Card>

      {/* Shipping Method */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Shipping Method
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => onEdit(3)}>
              <Edit className="h-4 w-4" />
              Edit
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium">{checkoutData.shippingMethod.name}</p>
              <p className="text-sm text-muted-foreground">{checkoutData.shippingMethod.estimatedDays}</p>
            </div>
            <p className="font-medium">₦{checkoutData.shippingMethod.price.toLocaleString()}</p>
          </div>
        </CardContent>
      </Card>

      {/* Payment Method */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment Method
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => onEdit(4)}>
              <Edit className="h-4 w-4" />
              Edit
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <p className="font-medium">
            {checkoutData.paymentInfo.method === 'card' ? 'Debit/Credit Card' : 'Bank Transfer'}
          </p>
          <p className="text-sm text-muted-foreground">Payment via Paystack</p>
          
          <Separator className="my-4" />
          
          <div>
            <p className="font-medium mb-2">Billing Address:</p>
            {checkoutData.paymentInfo.sameAsShipping ? (
              <p className="text-sm text-muted-foreground">Same as shipping address</p>
            ) : (
              <div className="text-sm text-muted-foreground">
                <p>{checkoutData.paymentInfo.billingAddress.fullName}</p>
                <p>{checkoutData.paymentInfo.billingAddress.addressLine1}</p>
                <p>
                  {checkoutData.paymentInfo.billingAddress.city}, {checkoutData.paymentInfo.billingAddress.state}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Order Total */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Order Total</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>₦{subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping:</span>
              <span>₦{checkoutData.shippingMethod.price.toLocaleString()}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-semibold text-lg">
              <span>Total:</span>
              <span>₦{total.toLocaleString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Terms and Conditions */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start space-x-2">
            <Checkbox
              id="terms"
              checked={agreeToTerms}
              onCheckedChange={handleTermsChange}
            />
            <Label htmlFor="terms" className="text-sm leading-relaxed">
              I agree to the{" "}
              <Button variant="link" className="p-0 h-auto text-primary">
                Terms & Conditions
              </Button>{" "}
              and{" "}
              <Button variant="link" className="p-0 h-auto text-primary">
                Privacy Policy
              </Button>
            </Label>
          </div>
          
          <div className="mt-4 p-4 bg-muted/30 rounded-lg">
            <p className="text-sm text-center text-muted-foreground">
              🔒 Your payment is secure and encrypted
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-between pt-4">
        <Button type="button" variant="outline" onClick={onPrev}>
          Back
        </Button>
        <Button 
          onClick={handlePlaceOrder} 
          size="lg"
          disabled={!agreeToTerms || isLoading}
          className="min-w-32"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            "Place Order"
          )}
        </Button>
      </div>
    </div>
  );
};

export default ReviewOrderStep;
