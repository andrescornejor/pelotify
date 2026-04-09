import { NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const targetUrl = searchParams.get('url');

  if (!targetUrl) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 });
  }

  try {
    // 1. Fetch the raw HTML of the requested match video page
    const { data: html } = await axios.get(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      },
    });

    // 2. Extremely aggressive regex to find any real media files in the source code
    const m3u8Match = html.match(/https?:\/\/[^\s"'<>\\]+\.m3u8[^\s"'<>\\]*/);
    const mp4Match = html.match(/https?:\/\/[^\s"'<>\\]+\.mp4[^\s"'<>\\]*/);

    const m3u8Url = m3u8Match ? m3u8Match[0] : null;
    const mp4Url = mp4Match ? mp4Match[0] : null;

    // 3. Fallback: If no direct media link found in raw HTML,
    // it likely uses an encrypted or obfuscated player. We return an error.
    if (!m3u8Url && !mp4Url) {
      return NextResponse.json({ 
        error: 'No se encontró un enlace descifrado de MP4 o M3U8 en el código fuente (posible renderizado por servidor o ofuscación DRM).' 
      }, { status: 404 });
    }

    // 4. If we found an MP4, proxy it directly!
    if (mp4Url) {
      const response = await fetch(mp4Url);
      return new NextResponse(response.body, {
        headers: {
          'Content-Type': 'video/mp4',
          'Content-Disposition': 'attachment; filename="partido_completo.mp4"',
        },
      });
    }

    // 5. If we found an M3U8, we fetch its segments and merge them smoothly
    if (m3u8Url) {
      const manifestRes = await fetch(m3u8Url);
      const manifest = await manifestRes.text();

      // Simple parsing: getting all valid .ts chunks
      const lines = manifest.split('\n');
      const tsUrls = lines.filter(line => line.trim() && !line.startsWith('#'));

      if (tsUrls.length === 0) {
        // Might be a master playlist containing other playlists instead of direct .ts segments.
        // Proxying the master playlist itself isn't a direct MP4, but it's the raw video file.
        const masterRes = await fetch(m3u8Url);
        return new NextResponse(masterRes.body, {
             headers: {
                 'Content-Type': 'application/vnd.apple.mpegurl',
                 'Content-Disposition': 'attachment; filename="partido_lista.m3u8"'
             }
        });
      }

      // Merge sequence: Read chunks one by one
      const baseUrl = m3u8Url.substring(0, m3u8Url.lastIndexOf('/') + 1);
      
      const readableStream = new ReadableStream({
        async start(controller) {
          try {
             // For the MVP, we merge max 100 chunks to prevent memory/timeout max outs on free plans.
             const segmentsToFix = tsUrls.slice(0, 100);
             for (const segment of segmentsToFix) {
                const segUrl = segment.startsWith('http') ? segment : baseUrl + segment;
                const segRes = await fetch(segUrl);
                if (segRes.ok) {
                   const arrayBuffer = await segRes.arrayBuffer();
                   controller.enqueue(new Uint8Array(arrayBuffer));
                }
             }
             controller.close();
          } catch(e) {
             controller.close();
          }
        }
      });

      // Serving concatenated .ts segments masquerading as .mp4 can often play seamlessly in VLC.
      return new NextResponse(readableStream, {
        headers: {
          'Content-Type': 'video/mp4',
          'Content-Disposition': 'attachment; filename="partido_completo_fusionado.mp4"',
        },
      });
    }

  } catch (error: any) {
    console.error('Download extraction error:', error.message);
    return NextResponse.json({ error: 'Falló la conexión al servidor de Sportsreel.' }, { status: 500 });
  }
}
