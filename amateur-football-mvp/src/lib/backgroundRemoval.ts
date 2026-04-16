import type { Config } from '@imgly/background-removal';

/**
 * Removes the background from a File using AI.
 * @param file The image file to process.
 * @returns Promise<Blob> The resulting transparent PNG blob.
 */
/**
 * Removes the background from a File using AI.
 * @param file The image file to process.
 * @param onProgress Optional callback to report progress (0-100).
 * @returns Promise<Blob> The resulting transparent PNG blob.
 */
export async function removeBackgroundFromFile(
  file: File, 
  onProgress?: (percent: number) => void
): Promise<Blob> {
  const { removeBackground } = await import('@imgly/background-removal');

  const config: Config = {
    progress: (key, current, total) => {
      const percent = Math.round((current / total) * 100);
      if (onProgress) onProgress(percent);
      console.log(`AI Processing [${key}]: ${percent}%`);
    },
    // We use default CDN for WASM and models for simplicity in the MVP.
    // fetchArgs: { mode: 'no-cors' },
    output: {
      format: 'image/png',
      quality: 0.8
    }
  };

  try {
    const resultBlob = await removeBackground(file, config);
    if (onProgress) onProgress(100);
    return resultBlob;
  } catch (error) {
    console.error('Error removing background:', error);
    throw error;
  }
}
