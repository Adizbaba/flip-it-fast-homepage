
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertTriangle, Trash2 } from "lucide-react";

interface AccountDeletionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AccountDeletionDialog = ({ open, onOpenChange }: AccountDeletionDialogProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [confirmText, setConfirmText] = useState("");
  const [confirmationChecks, setConfirmationChecks] = useState({
    understand: false,
    backup: false,
    irreversible: false,
  });
  const [loading, setLoading] = useState(false);

  const isConfirmationComplete = 
    confirmText === "DELETE" && 
    Object.values(confirmationChecks).every(Boolean);

  const handleDelete = async () => {
    if (!isConfirmationComplete || !user) return;

    setLoading(true);
    try {
      // In a real application, you would call a backend endpoint
      // that handles all the cleanup (delete user data, cancel subscriptions, etc.)
      // before deleting the auth user
      
      // For now, we'll just delete the auth user
      // Note: This doesn't clean up related data in other tables
      const { error } = await supabase.auth.admin.deleteUser(user.id);
      
      if (error) throw error;

      toast.success("Account deleted successfully");
      navigate("/");
    } catch (error: any) {
      console.error("Error deleting account:", error);
      toast.error(error.message || "Failed to delete account");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setConfirmText("");
    setConfirmationChecks({
      understand: false,
      backup: false,
      irreversible: false,
    });
    onOpenChange(false);
  };

  const updateCheck = (key: keyof typeof confirmationChecks, checked: boolean) => {
    setConfirmationChecks(prev => ({ ...prev, [key]: checked }));
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Delete Account
          </DialogTitle>
          <DialogDescription>
            This action cannot be undone. Please read the warnings below.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Warnings */}
          <div className="space-y-4 rounded-lg bg-red-50 p-4">
            <h4 className="font-medium text-red-800">What will happen:</h4>
            <ul className="space-y-2 text-sm text-red-700">
              <li>• Your profile and personal information will be permanently deleted</li>
              <li>• All your auction listings will be removed</li>
              <li>• Your bidding history will be deleted</li>
              <li>• You will lose access to any active auctions</li>
              <li>• This action cannot be reversed</li>
            </ul>
          </div>

          {/* Confirmation Checkboxes */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="understand"
                checked={confirmationChecks.understand}
                onCheckedChange={(checked) => updateCheck('understand', checked as boolean)}
              />
              <Label htmlFor="understand" className="text-sm">
                I understand that this action is permanent and cannot be undone
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="backup"
                checked={confirmationChecks.backup}
                onCheckedChange={(checked) => updateCheck('backup', checked as boolean)}
              />
              <Label htmlFor="backup" className="text-sm">
                I have backed up any important data from my account
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="irreversible"
                checked={confirmationChecks.irreversible}
                onCheckedChange={(checked) => updateCheck('irreversible', checked as boolean)}
              />
              <Label htmlFor="irreversible" className="text-sm">
                I acknowledge that my account and all data will be permanently lost
              </Label>
            </div>
          </div>

          {/* Confirmation Text */}
          <div className="space-y-2">
            <Label htmlFor="confirm-text">
              Type <span className="font-mono font-bold text-red-600">DELETE</span> to confirm:
            </Label>
            <Input
              id="confirm-text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="Type DELETE to confirm"
              className={confirmText === "DELETE" ? "border-red-500" : ""}
            />
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={!isConfirmationComplete || loading}
          >
            {loading ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Account
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AccountDeletionDialog;
