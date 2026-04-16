import { FaceDetection } from '@mediapipe/face_detection';

/**
 * Detects if there is at least one human face in the given File.
 * @param file The image file to analyze.
 * @returns Promise<boolean> True if a face is detected with > 0.5 confidence.
 */
export async function detectFace(file: File): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = URL.createObjectURL(file);

    img.onload = async () => {
      URL.revokeObjectURL(img.src);

      try {
        const faceDetection = new FaceDetection({
          locateFile: (file) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/face_detection/${file}`;
          },
        });

        faceDetection.setOptions({
          model: 'short',
          minDetectionConfidence: 0.5,
        });

        let found = false;
        faceDetection.onResults((results) => {
          if (results.detections && results.detections.length > 0) {
            found = true;
          }
          // Close after first result to free memory
          faceDetection.close();
          resolve(found);
        });

        // Send the image to the detector
        // We use a canvas because FaceDetection expects an HTML element or a canvas
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          await faceDetection.send({ image: canvas });
        } else {
          resolve(false);
        }
      } catch (error) {
        console.error('Error en Face Detection:', error);
        resolve(false);
      }
    };

    img.onerror = () => {
      resolve(false);
    };
  });
}
