import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * Obtiene la URL base correcta según el entorno para redirecciones de autenticación.
 */
export const getURL = () => {
    // Check if we are running in a mobile app with Capacitor
    const isApp = typeof window !== 'undefined' && (window as any).Capacitor?.isNativePlatform();
    
    if (isApp) {
        // Use the custom scheme defined in capacitor.config.ts if possible, 
        // or a standard one that stays consistent.
        return 'com.pelotify.app://';
    }

    let url =
        process?.env?.NEXT_PUBLIC_SITE_URL ?? // Manual config
        process?.env?.NEXT_PUBLIC_VERCEL_URL ?? // Vercel deploy
        'http://localhost:3000/';
    
    // Ensure protocol
    url = url.includes('http') ? url : `https://${url}`;
    // Remove trailing slash
    url = url.endsWith('/') ? url.slice(0, -1) : url;
    
    return url;
};
export function formatTime(timeStr: string) {
    if (!timeStr) return '';
    const parts = timeStr.split(':');
    if (parts.length < 2) return timeStr;
    return `${parts[0]}:${parts[1]}`;
}
