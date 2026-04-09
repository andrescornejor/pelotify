import { NextResponse } from 'next/server';
import axios from 'axios';

// Helper: Make relative URLs absolute
function makeAbsolute(url: string, baseUrl: string) {
  if (url.startsWith('http')) return url;
  if (url.startsWith('/')) {
    const urlObj = new URL(baseUrl);
    return `${urlObj.origin}${url}`;
  }
  return baseUrl + url;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const targetUrl = searchParams.get('url');
  const customId = searchParams.get('id') || 'pelotify';

  if (!targetUrl) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 });
  }

  try {
    let m3u8Url = targetUrl;

    // 1. If it's not a direct media link, try to scrape the page
    if (!targetUrl.includes('.m3u8') && !targetUrl.includes('.mp4')) {
      const { data: html } = await axios.get(targetUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
      });
      const m3u8Match = html.match(/https?:\/\/[^\s"'<>\\]+\.m3u8[^\s"'<>\\]*/);
      const mp4Match = html.match(/https?:\/\/[^\s"'<>\\]+\.mp4[^\s"'<>\\]*/);

      if (mp4Match) {
         const response = await fetch(mp4Match[0]);
         return new NextResponse(response.body, {
           headers: {
             'Content-Type': 'video/mp4',
             'Content-Disposition': `attachment; filename="partido_${customId}.mp4"`,
           },
         });
      }
      
      m3u8Url = m3u8Match ? m3u8Match[0] : null;
      if (!m3u8Url) {
        return NextResponse.json({ error: 'No se encontraron medios en la página' }, { status: 404 });
      }
    }

    // 2. We now have an m3u8Url. Let's fetch it.
    let manifestRes = await fetch(m3u8Url);
    let manifestText = await manifestRes.text();
    let currentBaseUrl = m3u8Url.substring(0, m3u8Url.lastIndexOf('/') + 1);

    // 3. Is it a Master Playlist (contains other m3u8s instead of ts)?
    if (manifestText.includes('.m3u8')) {
       const lines = manifestText.split('\n');
       // Find the first variant playlist (or highest quality if we parsed properly)
       const variantLines = lines.filter(line => line.trim() && !line.startsWith('#') && line.includes('.m3u8'));
       if (variantLines.length > 0) {
          // Follow the variant
          m3u8Url = makeAbsolute(variantLines[variantLines.length - 1], currentBaseUrl);
          manifestRes = await fetch(m3u8Url);
          manifestText = await manifestRes.text();
          currentBaseUrl = m3u8Url.substring(0, m3u8Url.lastIndexOf('/') + 1);
       }
    }

    // 4. Now we should have a chunklist with .ts files
    const lines = manifestText.split('\n');
    const tsUrls = lines.filter(line => line.trim() && !line.startsWith('#'));

    // If still no chunks, export a fixed raw M3U8 where we make all relative paths absolute
    // so VLC can play it seamlessly from the saved file.
    if (tsUrls.length === 0) {
       const absoluteManifest = lines.map(line => {
          if (line.startsWith('#')) return line;
          if (line.trim().length === 0) return line;
          return makeAbsolute(line, currentBaseUrl);
       }).join('\n');
       
       return new NextResponse(absoluteManifest, {
           headers: {
               'Content-Type': 'application/vnd.apple.mpegurl',
               'Content-Disposition': `attachment; filename="partido_${customId}.m3u8"`
           }
       });
    }

    // 5. Download and stream the .ts chunks as a single concatenated file
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
           for (const segment of tsUrls) {
              const segUrl = makeAbsolute(segment, currentBaseUrl);
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

    // Serving concatenated .ts segments as video/mp4.
    // Changing the extension to .mp4 explicitly because mobile browsers and strict clients
    // strongly prefer MP4 declarations even for raw stream buffers.
    return new NextResponse(readableStream, {
      headers: {
        'Content-Type': 'video/mp4',
        'Content-Disposition': `attachment; filename="partido_${customId}_fusion.mp4"`,
      },
    });

  } catch (error: any) {
    console.error('Download error:', error.message);
    return NextResponse.json({ error: 'Fallo critico al procesar el stream.' }, { status: 500 });
  }
}
