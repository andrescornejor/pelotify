# Pelotify - Fútbol Amateur MVP

Este es un proyecto [Next.js](https://nextjs.org) diseñado para gestionar partidos de fútbol amateur.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel
## Configuración de Entorno

Para que la búsqueda de ubicaciones sea óptima y encuentre establecimientos (canchas, complejos, etc.) por nombre, asegurate de agregar tu API Key de Google Maps en el archivo `.env.local`:

```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=tu_api_key_aca
```

Asegurate de tener habilitada la **Places API** en tu consola de Google Cloud.
