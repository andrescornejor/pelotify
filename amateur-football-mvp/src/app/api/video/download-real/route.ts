import { NextResponse } from 'next/server';
import axios from 'axios';

export const dynamic = 'force-dynamic';
// Allow long-running for large video downloads
export const maxDuration = 300;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const m3u8Url = searchParams.get('url');
  const customId = searchParams.get('id') || 'pelotify';

  if (!m3u8Url) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 });
  }

  try {
    // 1. Fetch the M3U8 playlist
    const { data: playlist } = await axios.get(m3u8Url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
    });

    // 2. Parse segment filenames from the playlist
    const lines = playlist.split('\n');
    const segments: string[] = [];
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        segments.push(trimmed);
      }
    }

    if (segments.length === 0) {
      return NextResponse.json({ error: 'No se encontraron segmentos en el playlist M3U8' }, { status: 500 });
    }

    // 3. Resolve segment URLs relative to the M3U8 URL
    const baseUrl = m3u8Url.substring(0, m3u8Url.lastIndexOf('/') + 1);

    // 4. Stream the concatenated TS segments as a single downloadable file
    // MPEG-TS is a container format that can be concatenated directly
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for (const segment of segments) {
            const segUrl = segment.startsWith('http') ? segment : baseUrl + segment;
            const { data } = await axios.get(segUrl, {
              responseType: 'arraybuffer',
              headers: { 'User-Agent': 'Mozilla/5.0' },
              timeout: 30000,
            });
            controller.enqueue(new Uint8Array(data));
          }
          controller.close();
        } catch (err: any) {
          console.error('Segment download error:', err.message);
          controller.error(err);
        }
      },
    });

    // Return as MPEG-TS (universally playable by VLC, modern players, etc.)
    // Browsers might not play .ts natively but it downloads correctly
    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'video/mp2t',
        'Content-Disposition': `attachment; filename="partido_${customId}_completo.ts"`,
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error: any) {
    console.error('Download error:', error.message);
    return NextResponse.json(
      { error: 'La descarga falló. URL denegada o inaccesible.', details: error.message },
      { status: 500 }
    );
  }
}
