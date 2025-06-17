
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { CreditCard, Banknote } from "lucide-react";

const billingSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  addressLine1: z.string().min(5, "Address must be at least 5 characters"),
  addressLine2: z.string().optional(),
  city: z.string().min(2, "City must be at least 2 characters"),
  state: z.string().min(2, "State must be at least 2 characters"),
  postalCode: z.string().min(4, "Postal code must be at least 4 characters"),
  country: z.string().min(1, "Country must be selected")
});

type BillingValues = z.infer<typeof billingSchema>;

interface PaymentInformationStepProps {
  data: {
    method: 'card' | 'transfer';
    billingAddress: {
      fullName: string;
      addressLine1: string;
      addressLine2: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
    };
    sameAsShipping: boolean;
  };
  shippingAddress: {
    fullName: string;
    addressLine1: string;
    addressLine2: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  onUpdate: (data: any) => void;
  onNext: () => void;
  onPrev: () => void;
}

const PaymentInformationStep = ({ data, shippingAddress, onUpdate, onNext, onPrev }: PaymentInformationStepProps) => {
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'transfer'>(data.method);
  const [sameAsShipping, setSameAsShipping] = useState(data.sameAsShipping);

  const form = useForm<BillingValues>({
    resolver: zodResolver(billingSchema),
    defaultValues: sameAsShipping ? shippingAddress : data.billingAddress
  });

  const handleSameAsShippingChange = (checked: boolean) => {
    setSameAsShipping(checked);
    if (checked) {
      form.reset(shippingAddress);
    } else {
      form.reset(data.billingAddress);
    }
    
    onUpdate({
      method: paymentMethod,
      sameAsShipping: checked,
      billingAddress: checked ? shippingAddress : form.getValues()
    });
  };

  const handlePaymentMethodChange = (method: 'card' | 'transfer') => {
    setPaymentMethod(method);
    onUpdate({
      method,
      sameAsShipping,
      billingAddress: sameAsShipping ? shippingAddress : form.getValues()
    });
  };

  const onSubmit = (values: BillingValues) => {
    onUpdate({
      method: paymentMethod,
      sameAsShipping,
      billingAddress: sameAsShipping ? shippingAddress : values
    });
    onNext();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Payment Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Payment Method Selection */}
        <div>
          <h3 className="font-medium mb-4">Payment Method</h3>
          <RadioGroup value={paymentMethod} onValueChange={handlePaymentMethodChange} className="space-y-3">
            <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <RadioGroupItem value="card" id="card" />
              <Label htmlFor="card" className="flex items-center gap-2 cursor-pointer flex-1">
                <CreditCard className="h-5 w-5" />
                <div>
                  <p className="font-medium">Debit/Credit Card</p>
                  <p className="text-sm text-muted-foreground">Pay securely with Paystack</p>
                </div>
              </Label>
            </div>
            
            <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <RadioGroupItem value="transfer" id="transfer" />
              <Label htmlFor="transfer" className="flex items-center gap-2 cursor-pointer flex-1">
                <Banknote className="h-5 w-5" />
                <div>
                  <p className="font-medium">Bank Transfer</p>
                  <p className="text-sm text-muted-foreground">Direct bank transfer via Paystack</p>
                </div>
              </Label>
            </div>
          </RadioGroup>
        </div>

        <Separator />

        {/* Billing Address */}
        <div>
          <h3 className="font-medium mb-4">Billing Address</h3>
          
          <div className="flex items-center space-x-2 mb-4">
            <Checkbox
              id="sameAsShipping"
              checked={sameAsShipping}
              onCheckedChange={handleSameAsShippingChange}
            />
            <Label htmlFor="sameAsShipping">Same as shipping address</Label>
          </div>

          {!sameAsShipping && (
            <Form {...form}>
              <form className="space-y-4">
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="addressLine1"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address Line 1 *</FormLabel>
                      <FormControl>
                        <Input placeholder="123 Main Street" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="addressLine2"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address Line 2 (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Apartment, suite, etc." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City *</FormLabel>
                        <FormControl>
                          <Input placeholder="Lagos" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>State *</FormLabel>
                        <FormControl>
                          <Input placeholder="Lagos State" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="postalCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Postal Code *</FormLabel>
                        <FormControl>
                          <Input placeholder="100001" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Country *</FormLabel>
                        <FormControl>
                          <Input value="Nigeria" disabled {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </form>
            </Form>
          )}
        </div>

        <div className="flex justify-between pt-4">
          <Button type="button" variant="outline" onClick={onPrev}>
            Back
          </Button>
          <Button onClick={form.handleSubmit(onSubmit)} size="lg">
            Review Order
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentInformationStep;
