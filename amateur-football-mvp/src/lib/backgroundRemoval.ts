import type { Config } from '@imgly/background-removal';

/**
 * Describes the current phase and overall progress of background removal.
 */
export interface RemovalProgressInfo {
  /** Overall progress 0-100 across all phases */
  overall: number;
  /** Human-readable label for the current phase */
  phaseLabel: string;
  /** Progress within the current phase 0-100 */
  phaseProgress: number;
  /** Which step we're on (1-indexed) */
  currentStep: number;
  /** Total number of steps */
  totalSteps: number;
}

/**
 * Phase weights define how much of the overall 0-100 bar each phase occupies.
 * The library fires progress for multiple keys; we map them to weighted ranges.
 * On first run, fetch phases take longer; on subsequent runs they're cached and nearly instant.
 */
const PHASE_CONFIG: Record<string, { label: string; weight: number; order: number }> = {
  'fetch:onnx':          { label: 'Descargando modelo IA',    weight: 0.25, order: 1 },
  'fetch:wasm':          { label: 'Cargando motor de IA',     weight: 0.10, order: 2 },
  'compute:inference':   { label: 'Procesando imagen',        weight: 0.60, order: 3 },
};
const FALLBACK_PHASE = { label: 'Procesando...', weight: 0.05, order: 0 };

/**
 * Removes the background from a File using AI.
 * @param file The image file to process.
 * @param onProgress Optional callback to report rich progress info.
 * @returns Promise<Blob> The resulting transparent PNG blob.
 */
export async function removeBackgroundFromFile(
  file: File,
  onProgress?: (info: RemovalProgressInfo) => void
): Promise<Blob> {
  const { removeBackground } = await import('@imgly/background-removal');

  // Track which phases we've seen to compute overall progress
  const seenPhases = new Map<string, { current: number; total: number }>();
  // Pre-compute cumulative offsets for known phases
  const orderedPhases = Object.entries(PHASE_CONFIG).sort(([, a], [, b]) => a.order - b.order);
  const phaseOffsets = new Map<string, number>();
  let cumulativeOffset = 0;
  for (const [key, cfg] of orderedPhases) {
    phaseOffsets.set(key, cumulativeOffset);
    cumulativeOffset += cfg.weight;
  }

  const config: Config = {
    progress: (key: string, current: number, total: number) => {
      seenPhases.set(key, { current, total });

      const phaseCfg = PHASE_CONFIG[key] || FALLBACK_PHASE;
      const phaseProgress = total > 0 ? Math.min(Math.round((current / total) * 100), 100) : 0;

      // Calculate overall progress using weighted phases
      const offset = phaseOffsets.get(key) ?? (cumulativeOffset);
      const overall = Math.min(
        Math.round((offset + phaseCfg.weight * (current / Math.max(total, 1))) * 100),
        99 // Never show 100 until truly done
      );

      // Determine step number
      const currentStep = (PHASE_CONFIG[key]?.order ?? 0);
      const totalSteps = orderedPhases.length;

      if (onProgress) {
        onProgress({
          overall,
          phaseLabel: phaseCfg.label,
          phaseProgress,
          currentStep: Math.max(currentStep, 1),
          totalSteps,
        });
      }

      console.log(`AI [${key}]: phase ${phaseProgress}% | overall ${overall}%`);
    },
    output: {
      format: 'image/png',
      quality: 0.8
    }
  };

  try {
    const resultBlob = await removeBackground(file, config);
    if (onProgress) {
      onProgress({
        overall: 100,
        phaseLabel: '¡Listo!',
        phaseProgress: 100,
        currentStep: orderedPhases.length,
        totalSteps: orderedPhases.length,
      });
    }
    return resultBlob;
  } catch (error) {
    console.error('Error removing background:', error);
    throw error;
  }
}
