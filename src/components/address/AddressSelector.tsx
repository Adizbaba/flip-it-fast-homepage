import { useState } from "react";
import { Plus, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useAddresses, UserAddress, AddressFormData } from "@/hooks/useAddresses";
import AddressForm from "./AddressForm";
import AddressCard from "./AddressCard";

interface AddressSelectorProps {
  selectedAddress: UserAddress | null;
  onSelect: (address: UserAddress) => void;
}

const AddressSelector = ({ selectedAddress, onSelect }: AddressSelectorProps) => {
  const {
    addresses,
    isLoading,
    isOperationLoading,
    addAddress,
  } = useAddresses();

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleAddAddress = async (data: AddressFormData) => {
    const newAddress = await addAddress(data);
    if (newAddress) {
      onSelect(newAddress);
      setIsDialogOpen(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {addresses.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <MapPin className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
              <p className="text-muted-foreground mb-4">No saved addresses yet</p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add New Address
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {addresses.map((address) => (
              <AddressCard
                key={address.id}
                address={address}
                onEdit={() => {}}
                onDelete={async () => {}}
                onSetDefault={async () => {}}
                selectable
                selected={selectedAddress?.id === address.id}
                onSelect={onSelect}
              />
            ))}
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setIsDialogOpen(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add New Address
            </Button>
          </>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Address</DialogTitle>
          </DialogHeader>
          <AddressForm
            onSubmit={handleAddAddress}
            onCancel={() => setIsDialogOpen(false)}
            isLoading={isOperationLoading}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AddressSelector;