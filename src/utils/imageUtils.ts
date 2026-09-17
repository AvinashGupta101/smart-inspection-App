export interface ImageValidationResult {
  valid: boolean;
  error?: string;
}

export interface CompressedImageResult {
  blob: Blob;
  previewUrl: string;
  originalSize: number;
  compressedSize: number;
  width: number;
  height: number;
}

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export function validateImageFile(file: File): ImageValidationResult {
  if (!file) {
    return { valid: false, error: 'No file selected.' };
  }

  // Validate type
  const isMimeValid = ALLOWED_MIME_TYPES.includes(file.type.toLowerCase());
  const extension = file.name.split('.').pop()?.toLowerCase();
  const isExtensionValid = extension && ['jpg', 'jpeg', 'png', 'webp'].includes(extension);

  if (!isMimeValid && !isExtensionValid) {
    return {
      valid: false,
      error: 'Invalid file format. Only JPG, JPEG, PNG, and WEBP images are supported.',
    };
  }

  // Validate size
  if (file.size > MAX_FILE_SIZE_BYTES) {
    const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
    return {
      valid: false,
      error: `File is too large (${sizeInMB} MB). Maximum allowed size is 5 MB.`,
    };
  }

  return { valid: true };
}

export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function compressAndResizeImage(
  file: File,
  maxDimension = 800,
  quality = 0.85
): Promise<CompressedImageResult> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      let { width, height } = img;

      // Calculate target dimensions
      if (width > height) {
        if (width > maxDimension) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        }
      } else {
        if (height > maxDimension) {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to create canvas context for image processing.'));
        return;
      }

      // High quality smoothing
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      // Attempt to export as WebP, falling back to JPEG if unsupported
      const exportType = 'image/webp';

      canvas.toBlob(
        blob => {
          if (!blob) {
            // Fallback to JPEG if webp failed
            canvas.toBlob(
              fallbackBlob => {
                if (!fallbackBlob) {
                  reject(new Error('Failed to compress image.'));
                  return;
                }
                const previewUrl = URL.createObjectURL(fallbackBlob);
                resolve({
                  blob: fallbackBlob,
                  previewUrl,
                  originalSize: file.size,
                  compressedSize: fallbackBlob.size,
                  width,
                  height,
                });
              },
              'image/jpeg',
              quality
            );
            return;
          }

          const previewUrl = URL.createObjectURL(blob);
          resolve({
            blob,
            previewUrl,
            originalSize: file.size,
            compressedSize: blob.size,
            width,
            height,
          });
        },
        exportType,
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Failed to read and parse the selected image.'));
    };

    img.src = objectUrl;
  });
}
