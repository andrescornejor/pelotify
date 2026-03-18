import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * Obtiene la URL base correcta según el entorno para redirecciones de autenticación.
 */
export const getURL = () => {
  let url =
    process?.env?.NEXT_PUBLIC_SITE_URL ?? // Configurado manualmente
    process?.env?.NEXT_PUBLIC_VERCEL_URL ?? // Despliegue en Vercel
    'http://localhost:3000/';
  
  // Asegurarse de que tenga protocolo
  url = url.includes('http') ? url : `https://${url}`;
  // Asegurarse de quitar '/' final
  url = url.charAt(url.length - 1) === '/' ? url.slice(0, -1) : url;
  
  return url;
};
