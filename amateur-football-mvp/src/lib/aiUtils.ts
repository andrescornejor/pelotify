import { removeBackground, Config } from '@imgly/background-removal';

/**
 * Detects if a face is present in an image using the browser's native Face Detector API
 * (fallback to true for unsupported browsers to not block the feature).
 */
export async function detectFace(imageSource: string | File | Blob): Promise<boolean> {
  // Check if the native FaceDetector API is available (Chrome/Edge/Android)
  if ('FaceDetector' in window) {
    try {
      const bitmap = await createImageBitmap(
        imageSource instanceof File || imageSource instanceof Blob 
          ? imageSource 
          : await (await fetch(imageSource)).blob()
      );
      // @ts-ignore - FaceDetector is relatively new
      const faceDetector = new window.FaceDetector({ fastMode: true, maxFaces: 1 });
      const faces = await faceDetector.detect(bitmap);
      return faces.length > 0;
    } catch (err) {
      console.warn('FaceDetector error:', err);
      return true; // Fallback to true
    }
  }

  // Fallback: If not available, we assume true to allow users to at least try
  // or we could use a heavy library like MediaPipe, but for now we'll favor simplicity
  // and browser native features where possible.
  return true;
}

/**
 * Removes the background from an image using @imgly/background-removal.
 */
export async function removeImageBackground(
  imageSource: string | File | Blob,
  onProgress?: (step: string) => void
): Promise<Blob> {
  const config: Config = {
    progress: (kind, progress) => {
      if (onProgress) {
        onProgress(`${kind}: ${Math.round(progress * 100)}%`);
      }
    },
    // We can use default CDN for assets if not hosting locally
  };

  try {
    const resultBlob = await removeBackground(imageSource, config);
    return resultBlob;
  } catch (err) {
    console.error('Background removal error:', err);
    throw err;
  }
}
