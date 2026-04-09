import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch('https://www.w3schools.com/html/mov_bbb.mp4');
    
    if (!response.ok) {
        throw new Error('Failed to fetch proxy video');
    }

    return new NextResponse(response.body, {
      headers: {
        'Content-Type': 'video/mp4',
        'Content-Disposition': 'attachment; filename="partido_pelotify_demo.mp4"',
      },
    });
  } catch (error: any) {
    console.error('Error proxying video:', error.message);
    return NextResponse.json(
      { error: 'Error processing the request' },
      { status: 500 }
    );
  }
}
