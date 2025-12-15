'use client';

import { useRef, useState } from 'react';
import { ImagePlus, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { validateImage } from '@/lib/supabase/storage';

export interface PhotoData {
  file?: File; // New file to upload
  previewUrl?: string; // Local preview URL (blob: or data:)
  existingUrl?: string; // Existing Supabase URL (for edit mode)
  markedForDeletion?: boolean; // True if user explicitly removed the photo
}

interface PhotoUploaderProps {
  value?: PhotoData;
  onChange: (photo: PhotoData | undefined) => void;
}

export function PhotoUploader({ value, onChange }: PhotoUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Get the URL to display (preview URL or existing URL)
  const displayUrl = value?.previewUrl || value?.existingUrl;

  const handleFileChange = async (file: File | undefined) => {
    if (!file) return;

    // Validate image (type and size)
    const validation = validateImage(file);
    if (!validation.valid) {
      toast.error('Invalid image', {
        description: validation.error,
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Create a local preview URL
      const previewUrl = URL.createObjectURL(file);

      onChange({
        file,
        previewUrl,
        existingUrl: value?.existingUrl, // Keep track of existing URL for cleanup
      });
    } catch (error) {
      console.error('Image processing failed:', error);
      toast.error('Failed to process image', {
        description: 'Please try a smaller image.',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFileChange(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleRemove = () => {
    // Revoke the preview URL to free memory
    if (value?.previewUrl) {
      URL.revokeObjectURL(value.previewUrl);
    }

    // Mark for deletion if there was an existing URL
    if (value?.existingUrl) {
      onChange({ existingUrl: value.existingUrl, markedForDeletion: true });
    } else {
      onChange(undefined);
    }
  };

  if (displayUrl) {
    return (
      <div className="relative rounded-2xl overflow-hidden aspect-square lg:aspect-video lg:max-h-80">
        <img src={displayUrl} alt="Uploaded" className="w-full h-full object-cover" />
        <Button
          type="button"
          variant="destructive"
          size="icon"
          className="absolute top-2 right-2 h-8 w-8 rounded-full"
          onClick={handleRemove}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  if (isProcessing) {
    return (
      <div className="border-2 border-dashed rounded-2xl p-12 lg:p-12 text-center border-primary/50 bg-primary/5">
        <Loader2 className="h-12 w-12 mx-auto text-primary animate-spin mb-2" />
        <p className="text-sm text-muted-foreground">Processing image...</p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'border-2 border-dashed rounded-2xl p-12 lg:p-12 text-center cursor-pointer transition-colors',
        isDragging
          ? 'border-primary bg-primary/5'
          : 'border-muted-foreground/25 hover:border-primary/50'
      )}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={() => inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFileChange(e.target.files?.[0])}
      />
      <ImagePlus className="h-12 w-12 lg:h-14 lg:w-14 mx-auto text-muted-foreground/50 mb-3" />
      <p className="text-sm lg:text-base text-muted-foreground">
        Click or drag & drop to add a picture
      </p>
      <p className="text-xs text-muted-foreground/60 mt-1">
        Max 1MB, JPEG/PNG/GIF/WebP
      </p>
    </div>
  );
}
