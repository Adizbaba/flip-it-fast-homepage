
import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Upload, X } from "lucide-react";

interface ProfileImageUploadProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentAvatarUrl: string;
  onAvatarUpdate: (newUrl: string) => void;
}

const ProfileImageUpload = ({
  open,
  onOpenChange,
  currentAvatarUrl,
  onAvatarUpdate,
}: ProfileImageUploadProps) => {
  const { user } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleUpload = async () => {
    if (!selectedFile || !user) return;

    setUploading(true);
    try {
      // Create unique filename
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Upload file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(filePath, selectedFile);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data } = supabase.storage
        .from('profiles')
        .getPublicUrl(filePath);

      const publicUrl = data.publicUrl;

      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      onAvatarUpdate(publicUrl);
      toast.success("Profile picture updated successfully");
      handleClose();
    } catch (error: any) {
      console.error("Error uploading image:", error);
      toast.error(error.message || "Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async () => {
    if (!user) return;

    setUploading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ avatar_url: null })
        .eq('id', user.id);

      if (error) throw error;

      onAvatarUpdate("");
      toast.success("Profile picture removed");
      handleClose();
    } catch (error: any) {
      console.error("Error removing image:", error);
      toast.error("Failed to remove profile picture");
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setPreviewUrl("");
    onOpenChange(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Update Profile Picture
          </DialogTitle>
          <DialogDescription>
            Choose a new profile picture or remove the current one.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current/Preview Image */}
          <div className="flex justify-center">
            <Avatar className="h-32 w-32">
              <AvatarImage src={previewUrl || currentAvatarUrl} />
              <AvatarFallback className="bg-auction-purple text-white text-2xl">
                {user?.email?.[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* File Input */}
          <div className="space-y-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />

            <div className="grid gap-2">
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="w-full"
                disabled={uploading}
              >
                <Upload className="h-4 w-4 mr-2" />
                Choose New Image
              </Button>

              {selectedFile && (
                <div className="text-sm text-gray-600 text-center">
                  Selected: {selectedFile.name}
                </div>
              )}
            </div>

            <div className="text-sm text-gray-500 text-center">
              Supported formats: JPG, PNG, GIF (max 5MB)
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between space-x-2">
            {currentAvatarUrl && (
              <Button
                variant="outline"
                onClick={handleRemove}
                disabled={uploading}
                className="text-red-600 hover:text-red-700"
              >
                <X className="h-4 w-4 mr-2" />
                Remove
              </Button>
            )}

            <div className="flex space-x-2 ml-auto">
              <Button variant="outline" onClick={handleClose} disabled={uploading}>
                Cancel
              </Button>
              
              {selectedFile && (
                <Button onClick={handleUpload} disabled={uploading}>
                  {uploading ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  ) : (
                    "Upload"
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileImageUpload;
