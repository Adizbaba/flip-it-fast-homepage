import { useState } from "react";
import { MapPin, Edit, Trash2, Star, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { UserAddress } from "@/hooks/useAddresses";

interface AddressCardProps {
  address: UserAddress;
  onEdit: (address: UserAddress) => void;
  onDelete: (id: string) => Promise<void>;
  onSetDefault: (id: string) => Promise<void>;
  isOperationLoading?: boolean;
  selectable?: boolean;
  selected?: boolean;
  onSelect?: (address: UserAddress) => void;
}

const AddressCard = ({
  address,
  onEdit,
  onDelete,
  onSetDefault,
  isOperationLoading,
  selectable,
  selected,
  onSelect,
}: AddressCardProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSettingDefault, setIsSettingDefault] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    await onDelete(address.id);
    setIsDeleting(false);
  };

  const handleSetDefault = async () => {
    setIsSettingDefault(true);
    await onSetDefault(address.id);
    setIsSettingDefault(false);
  };

  return (
    <Card 
      className={`relative transition-all ${
        selectable ? 'cursor-pointer hover:border-primary' : ''
      } ${selected ? 'border-primary ring-2 ring-primary/20' : ''}`}
      onClick={() => selectable && onSelect?.(address)}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <MapPin className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium">{address.label}</span>
                {address.is_default && (
                  <Badge variant="secondary" className="text-xs">
                    <Star className="h-3 w-3 mr-1" />
                    Default
                  </Badge>
                )}
              </div>
              <p className="text-sm font-medium">{address.full_name}</p>
              <p className="text-sm text-muted-foreground">{address.address_line1}</p>
              {address.address_line2 && (
                <p className="text-sm text-muted-foreground">{address.address_line2}</p>
              )}
              <p className="text-sm text-muted-foreground">
                {address.city}, {address.state} {address.postal_code}
              </p>
              <p className="text-sm text-muted-foreground">{address.country}</p>
              {address.phone && (
                <p className="text-sm text-muted-foreground mt-1">{address.phone}</p>
              )}
            </div>
          </div>

          {!selectable && (
            <div className="flex items-center gap-1 flex-shrink-0">
              {!address.is_default && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSetDefault();
                  }}
                  disabled={isSettingDefault || isOperationLoading}
                  title="Set as default"
                >
                  {isSettingDefault ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Star className="h-4 w-4" />
                  )}
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(address);
                }}
                disabled={isOperationLoading}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    disabled={isOperationLoading}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Address</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this address? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      {isDeleting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Deleting...
                        </>
                      ) : (
                        "Delete"
                      )}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AddressCard;