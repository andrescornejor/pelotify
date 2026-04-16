import type { Config } from '@imgly/background-removal';

/**
 * Removes the background from a File using AI.
 * @param file The image file to process.
 * @returns Promise<Blob> The resulting transparent PNG blob.
 */
export async function removeBackgroundFromFile(file: File): Promise<Blob> {
  const { removeBackground } = await import('@imgly/background-removal');

  const config: Config = {
    progress: (key, current, total) => {
      console.log(`Downloading ${key}: ${Math.round((current / total) * 100)}%`);
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
    return resultBlob;
  } catch (error) {
    console.error('Error removing background:', error);
    throw error;
  }
}
