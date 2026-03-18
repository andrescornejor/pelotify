export async function getDominantColor(imageUrl: string): Promise<string | null> {
    return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.src = imageUrl;

        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            if (!ctx) {
                resolve(null);
                return;
            }

            // Downscale for performance
            canvas.width = 50;
            canvas.height = 50;
            
            ctx.drawImage(img, 0, 0, 50, 50);

            const imageData = ctx.getImageData(0, 0, 50, 50);
            const data = imageData.data;
            
            let r = 0;
            let g = 0;
            let b = 0;
            let count = 0;

            for (let i = 0; i < data.length; i += 4) {
                // Ignore transparent pixels
                if (data[i + 3] < 128) continue;

                // Ignore completely white or black pixels to get actual colors
                const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
                if (brightness < 20 || brightness > 240) continue;

                r += data[i];
                g += data[i + 1];
                b += data[i + 2];
                count++;
            }

            if (count === 0) {
                resolve(null);
                return;
            }

            r = Math.floor(r / count);
            g = Math.floor(g / count);
            b = Math.floor(b / count);

            resolve(`rgba(${r}, ${g}, ${b}, 0.3)`);
        };

        img.onerror = () => {
            resolve(null);
        };
    });
}
