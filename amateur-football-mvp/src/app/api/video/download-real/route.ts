import { NextResponse } from 'next/server';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegStatic from 'ffmpeg-static';
import axios from 'axios';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const targetUrl = searchParams.get('url');
  const customId = searchParams.get('id') || 'pelotify';

  if (!targetUrl) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 });
  }

  // Bind the embedded ffmpeg binary explicitly
  if (ffmpegStatic) {
    ffmpeg.setFfmpegPath(ffmpegStatic as string);
  }

  try {
    let mediaUrl = targetUrl;

    // 1. If it doesn't look like a direct media link, try to scrape it
    if (!targetUrl.includes('.m3u8') && !targetUrl.includes('.mp4')) {
      const { data: html } = await axios.get(targetUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
      });
      const m3u8Match = html.match(/https?:\/\/[^\s"'<>\\]+\.m3u8[^\s"'<>\\]*/);
      const mp4Match = html.match(/https?:\/\/[^\s"'<>\\]+\.mp4[^\s"'<>\\]*/);

      mediaUrl = (m3u8Match ? m3u8Match[0] : null) || (mp4Match ? mp4Match[0] : null) || targetUrl;
    }

    // 2. We now deploy the mighty FFmpeg stream pipeline!
    // This executes EXACTLY the `ffmpeg -i %url -c copy` you wanted, but wrapped in JS
    const readableStream = new ReadableStream({
      start(controller) {
        const command = ffmpeg(mediaUrl)
          .inputOptions([
            '-protocol_whitelist', 'file,http,https,tcp,tls,crypto'
          ])
          .outputOptions([
            '-c', 'copy',           // Copy original encoding (fastest)
            '-f', 'mp4',            // Force MP4 container
            '-movflags', 'frag_keyframe+empty_moov' // Fragmented MP4 allows seamless HTTP streaming
          ])
          .on('error', (err) => {
            console.error('FFmpeg engine error:', err);
            controller.error(err);
          })
          .on('end', () => {
            controller.close();
          });

        // fluent-ffmpeg .pipe() returns a Node stream, we convert to Web stream chunks
        const ffStream = command.pipe();
        ffStream.on('data', (chunk) => {
          controller.enqueue(new Uint8Array(chunk));
        });
      }
    });

    return new NextResponse(readableStream, {
      headers: {
        'Content-Type': 'video/mp4',
        'Content-Disposition': `attachment; filename="partido_${customId}_completo.mp4"`,
      },
    });

  } catch (error: any) {
    console.error('Download stream extraction error:', error.message);
    return NextResponse.json({ error: 'La descarga falló. URL denegada o inaccesible.' }, { status: 500 });
  }
}
