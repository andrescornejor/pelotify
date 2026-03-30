import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  // Inicializa el cliente middleware para sincronizar las cookies con Supabase
  const supabase = createMiddlewareClient({ req, res });

  // Esto actualiza la cookie de sesión si está caducada, permitiendo que 
  // los Server Components (como page.tsx) siempre tengan el token válido.
  await supabase.auth.getSession();

  return res;
}

export const config = {
  matcher: [
    /*
     * Aplica el middleware a todas las rutas excepto:
     * - api (API routes)
     * - _next/static (archivos estáticos)
     * - _next/image (optimización de imágenes)
     * - favicon.ico (y otros archivos del root)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
