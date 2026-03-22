/**
 * Utilities for image processing and optimization
 */

/**
 * Compresses an image file using the Canvas API.
 * @param file The image file to compress.
 * @param maxWidth The maximum width of the compressed image.
 * @param quality The quality of the compression (0.0 to 1.0).
 * @returns A promise that resolves to the compressed Blob.
 */
export async function compressImage(
  file: File,
  maxWidth: number = 800,
  quality: number = 0.8
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(img.src);

      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      // Calculate new dimensions while maintaining aspect ratio
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      // Draw and compress
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Canvas toBlob failed'));
          }
        },
        'image/jpeg',
        quality
      );
    };

    img.onerror = (err) => {
      reject(err);
    };
  });
}

/**
 * Convenience function to convert a Blob back to a File.
 * @param blob The blob to convert.
 * @param originalFileName The original file name.
 * @returns A File object.
 */
export function blobToFile(blob: Blob, originalFileName: string): File {
  return new File([blob], originalFileName, {
    type: blob.type,
    lastModified: Date.now(),
  });
}
