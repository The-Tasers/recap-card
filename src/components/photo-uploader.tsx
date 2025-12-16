'use client';

import { useRef, useState } from 'react';
import { ImagePlus, X, Loader2, ChevronDown, Camera } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
  collapsible?: boolean;
}

export function PhotoUploader({ value, onChange, collapsible = false }: PhotoUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Get the URL to display (preview URL or existing URL, unless marked for deletion)
  const displayUrl = value?.markedForDeletion ? undefined : (value?.previewUrl || value?.existingUrl);

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

  // Photo display when uploaded
  const photoDisplay = displayUrl && (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative rounded-2xl overflow-hidden aspect-square lg:aspect-video lg:max-h-80"
    >
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
    </motion.div>
  );

  // Processing state
  const processingDisplay = isProcessing && (
    <div className="border-2 border-dashed rounded-2xl p-12 lg:p-12 text-center border-primary/50 bg-primary/5">
      <Loader2 className="h-12 w-12 mx-auto text-primary animate-spin mb-2" />
      <p className="text-sm text-muted-foreground">Processing image...</p>
    </div>
  );

  // Upload area
  const uploadArea = !displayUrl && !isProcessing && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
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
        Max 5MB, JPEG/PNG/GIF/WebP
      </p>
    </motion.div>
  );

  // Non-collapsible mode
  if (!collapsible) {
    return (
      <div>
        {photoDisplay}
        {processingDisplay}
        {uploadArea}
      </div>
    );
  }

  // Collapsible mode
  const hasPhoto = !!displayUrl;

  return (
    <div className="space-y-2">
      <motion.button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          'w-full flex items-center justify-between p-3 rounded-xl transition-colors cursor-pointer',
          'bg-neutral-100 dark:bg-neutral-800/50 hover:bg-neutral-200 dark:hover:bg-neutral-800'
        )}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        <div className="flex items-center gap-3">
          <Camera className="h-5 w-5 text-muted-foreground" />
          <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Picture of the Day
          </span>
          {hasPhoto && (
            <span className="text-xs text-green-600 dark:text-green-400">
              ✓ Added
            </span>
          )}
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pt-2">
              {photoDisplay}
              {processingDisplay}
              {uploadArea}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
