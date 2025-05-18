
import { useState, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { ImagePlus, X, UploadCloud } from "lucide-react";
import { useDropzone } from 'react-dropzone';

interface ListingImageUploadProps {
  images: File[];
  setImages: (images: File[]) => void;
}

const ListingImageUpload = ({ images, setImages }: ListingImageUploadProps) => {
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  // Generate preview URLs when images change
  const generatePreviews = useCallback((files: File[]) => {
    // Revoke old preview URLs to avoid memory leaks
    previewUrls.forEach(url => URL.revokeObjectURL(url));
    
    // Create preview URLs for new files
    const newPreviewUrls = files.map(file => URL.createObjectURL(file));
    setPreviewUrls(newPreviewUrls);
  }, [previewUrls]);

  // Initialize previews when component mounts
  useCallback(() => {
    if (images.length > 0 && previewUrls.length === 0) {
      generatePreviews(images);
    }
  }, [images, previewUrls.length, generatePreviews]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newImages = [...images, ...acceptedFiles].slice(0, 5);
    setImages(newImages);
    generatePreviews(newImages);
  }, [images, setImages, generatePreviews]);

  const removeImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);

    // Update preview URLs
    const newPreviewUrls = [...previewUrls];
    URL.revokeObjectURL(newPreviewUrls[index]);
    newPreviewUrls.splice(index, 1);
    setPreviewUrls(newPreviewUrls);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxFiles: 5,
    maxSize: 5000000, // 5MB limit
    disabled: images.length >= 5
  });

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          isDragActive ? 'border-primary bg-primary/10' : 'border-gray-300 hover:border-primary hover:bg-gray-50'
        } ${images.length >= 5 ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center space-y-2">
          <UploadCloud className="h-8 w-8 text-gray-400" />
          <p className="text-sm text-gray-500">
            {isDragActive
              ? "Drop the images here..."
              : images.length >= 5
              ? "Maximum 5 images allowed"
              : "Drag & drop images here, or click to select files"}
          </p>
          <p className="text-xs text-gray-400">
            JPEG, PNG, WebP up to 5MB (Max. 5 images)
          </p>
        </div>
      </div>

      {previewUrls.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4">
          {previewUrls.map((url, index) => (
            <div key={index} className="relative group">
              <div className="aspect-square rounded overflow-hidden border">
                <img
                  src={url}
                  alt={`Preview ${index + 1}`}
                  className="h-full w-full object-cover"
                />
              </div>
              <Button
                type="button"
                size="icon"
                variant="destructive"
                className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => removeImage(index)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {images.length < 5 && (
        <div className="flex justify-center">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={() => document.getElementById('fileInput')?.click()}
          >
            <ImagePlus className="h-4 w-4 mr-2" />
            Add Images
          </Button>
          <input
            id="fileInput"
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files) {
                onDrop(Array.from(e.target.files));
              }
            }}
          />
        </div>
      )}
    </div>
  );
};

export default ListingImageUpload;
