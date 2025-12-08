'use client';

import { useRef, useState } from 'react';
import { ImagePlus, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PhotoUploaderProps {
  value?: string;
  onChange: (photoUrl: string | undefined) => void;
}

// Compress image to reduce localStorage usage (iOS has ~5MB limit)
const compressImage = (file: File, maxWidth = 800, quality = 0.7): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img;
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;

      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      // Draw and compress
      ctx.drawImage(img, 0, 0, width, height);
      const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
      resolve(compressedDataUrl);
    };

    img.onerror = () => reject(new Error('Failed to load image'));

    // Read file as data URL
    const reader = new FileReader();
    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
};

export function PhotoUploader({ value, onChange }: PhotoUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);

  const handleFileChange = async (file: File | undefined) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    setIsCompressing(true);
    try {
      const compressedUrl = await compressImage(file);
      onChange(compressedUrl);
    } catch (error) {
      console.error('Image compression failed:', error);
      alert('Failed to process image. Please try a smaller image.');
    } finally {
      setIsCompressing(false);
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

  if (value) {
    return (
      <div className="relative rounded-2xl overflow-hidden">
        <img
          src={value}
          alt="Uploaded"
          className="w-full h-48 object-cover"
        />
        <Button
          type="button"
          variant="destructive"
          size="icon"
          className="absolute top-2 right-2 h-8 w-8 rounded-full"
          onClick={() => onChange(undefined)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  if (isCompressing) {
    return (
      <div className="border-2 border-dashed rounded-2xl p-8 text-center border-primary/50 bg-primary/5">
        <Loader2 className="h-10 w-10 mx-auto text-primary animate-spin mb-2" />
        <p className="text-sm text-muted-foreground">Processing image...</p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-colors',
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
      <ImagePlus className="h-10 w-10 mx-auto text-muted-foreground/50 mb-2" />
      <p className="text-sm text-muted-foreground">
        Tap to add a photo (optional)
      </p>
    </div>
  );
}
