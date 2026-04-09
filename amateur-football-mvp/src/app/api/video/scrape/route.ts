import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: Request) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Extract the video UUID from the Sportsreel URL
    // Format: https://www.sportsreel.com.ar/#/video/{uuid}
    const videoIdMatch = url.match(/\/video\/([a-f0-9\-]{36})/i);
    if (!videoIdMatch) {
      return NextResponse.json(
        { error: 'No se pudo extraer el ID del video de la URL de Sportsreel' },
        { status: 400 }
      );
    }
    const videoId = videoIdMatch[1];

    // Step 1: Get video block metadata (contains canchaId and VMS info)
    const { data: vodBlock } = await axios.get(
      `https://servicios.sportsreel.com.ar/vodBlocks/get/${videoId}`,
      { headers: { 'User-Agent': 'Mozilla/5.0' } }
    );

    const canchaId = vodBlock.canchaId;
    // VMS info is nested inside eid.Vms
    const vmsUrl = vodBlock.eid?.Vms?.url;
    const vmsPort = vodBlock.eid?.Vms?.port;

    if (!canchaId || !vmsUrl || !vmsPort) {
      return NextResponse.json(
        { error: 'No se pudo obtener la información del servidor de video', vodBlock },
        { status: 500 }
      );
    }

    // Step 2: Get camera name from canchaId
    const { data: camaraData } = await axios.get(
      `https://servicios.sportsreel.com.ar/camara/getByCanchaId/${canchaId}`,
      { headers: { 'User-Agent': 'Mozilla/5.0' } }
    );

    const cameraName = camaraData.camaras?.[0]?.Nombre;
    if (!cameraName) {
      return NextResponse.json(
        { error: 'No se pudo obtener el nombre de la cámara', camaraData },
        { status: 500 }
      );
    }

    // Step 3: Construct the M3U8 URL
    const m3u8Url = `https://${vmsUrl}:${vmsPort}/vod/${cameraName}/vodBlock/${videoId}/index.m3u8`;

    return NextResponse.json({ m3u8Url, videoId, cameraName });
  } catch (error: any) {
    console.error('Error scraping video:', error.message);
    return NextResponse.json(
      { error: 'Error al procesar la solicitud', details: error.message },
      { status: 500 }
    );
  }
}
