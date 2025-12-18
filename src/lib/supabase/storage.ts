'use client';

import { createClient } from './client';

const BUCKET_NAME = 'recap-images';
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/heic', 'image/heif'];

export interface ImageValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validate image file (size and type)
 */
export function validateImage(file: File): ImageValidationResult {
  // Check file type
  if (!file.type.startsWith('image/')) {
    return { valid: false, error: 'Please select an image file.' };
  }

  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return { valid: false, error: `Unsupported image format. Allowed: JPEG, PNG, GIF, WebP, HEIC.` };
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
    return { valid: false, error: `Image too large (${sizeMB}MB). Maximum size is 5MB.` };
  }

  return { valid: true };
}

/**
 * Compress image before upload to reduce storage usage
 */
async function compressImage(
  file: File,
  maxWidth = 1200,
  quality = 0.8
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    img.onload = () => {
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

      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to compress image'));
          }
        },
        'image/jpeg',
        quality
      );
    };

    img.onerror = () => reject(new Error('Failed to load image'));

    const reader = new FileReader();
    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Generate a unique filename for the image
 */
function generateImagePath(userId: string, extension = 'jpg'): string {
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(2, 8);
  return `${userId}/${timestamp}-${randomId}.${extension}`;
}

/**
 * Extract the file path from a Supabase storage URL
 */
export function getPathFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);
    const pathMatch = urlObj.pathname.match(/\/storage\/v1\/object\/public\/recap-images\/(.+)/);
    return pathMatch ? pathMatch[1] : null;
  } catch {
    return null;
  }
}

/**
 * Upload an image to Supabase Storage
 * @param file The file to upload
 * @param userId The user's ID (for folder organization)
 * @returns The public URL of the uploaded image, or null if upload failed
 */
export async function uploadImage(
  file: File,
  userId: string
): Promise<{ url: string | null; error: string | null }> {
  const supabase = createClient();

  try {
    // Compress the image first
    const compressedBlob = await compressImage(file);
    const path = generateImagePath(userId);

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(path, compressedBlob, {
        contentType: 'image/jpeg',
        upsert: false,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return { url: null, error: uploadError.message };
    }

    // Get the public URL
    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(path);

    return { url: urlData.publicUrl, error: null };
  } catch (error) {
    console.error('Image upload failed:', error);
    return {
      url: null,
      error: error instanceof Error ? error.message : 'Failed to upload image',
    };
  }
}

/**
 * Delete an image from Supabase Storage
 * @param url The public URL of the image to delete
 * @returns Success status
 */
export async function deleteImage(
  url: string
): Promise<{ success: boolean; error: string | null }> {
  const supabase = createClient();

  try {
    const path = getPathFromUrl(url);
    if (!path) {
      // Not a Supabase URL, nothing to delete
      return { success: true, error: null };
    }

    const { error: deleteError } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([path]);

    if (deleteError) {
      console.error('Delete error:', deleteError);
      return { success: false, error: deleteError.message };
    }

    return { success: true, error: null };
  } catch (error) {
    console.error('Image delete failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete image',
    };
  }
}

/**
 * Check if a URL is a Supabase storage URL
 */
export function isSupabaseStorageUrl(url: string): boolean {
  return url.includes('/storage/v1/object/public/recap-images/');
}

/**
 * Check if a URL is a data URL (base64)
 */
export function isDataUrl(url: string): boolean {
  return url.startsWith('data:');
}

/**
 * Compress image to base64 data URL (for anonymous users)
 */
export async function compressImageToDataUrl(
  file: File,
  maxWidth = 800,
  quality = 0.7
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    img.onload = () => {
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

      ctx.drawImage(img, 0, 0, width, height);
      const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
      resolve(compressedDataUrl);
    };

    img.onerror = () => reject(new Error('Failed to load image'));

    const reader = new FileReader();
    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}
