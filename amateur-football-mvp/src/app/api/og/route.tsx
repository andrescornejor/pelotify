import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const title = searchParams.get('title');
    const description = searchParams.get('description');
    const username = searchParams.get('username');
    const type = searchParams.get('type') || 'post';
    const image = searchParams.get('image');

    if (!title) {
      return new Response('Missing title', { status: 400 });
    }

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#09090b',
            padding: '40px',
            position: 'relative',
          }}
        >
          {/* Background effects */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.3, display: 'flex' }}>
            <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '50%', height: '50%', backgroundColor: '#10b981', filter: 'blur(100px)', borderRadius: '50%' }} />
            <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '50%', height: '50%', backgroundColor: '#f59e0b', filter: 'blur(100px)', borderRadius: '50%' }} />
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              gap: '40px',
              zIndex: 10,
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
                <div style={{ width: '40px', height: '40px', backgroundColor: '#2cfc7d', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyItems: 'center', color: '#000', fontSize: '24px', fontWeight: 'bold', justifyContent: 'center' }}>P</div>
                <div style={{ marginLeft: '12px', fontSize: '28px', fontWeight: 'bold', color: '#fff', textTransform: 'uppercase', fontStyle: 'italic' }}>PELOTIFY</div>
              </div>

              {username && (
                <div style={{ fontSize: '24px', color: '#2cfc7d', fontWeight: 'bold', marginBottom: '10px' }}>
                  @{username} {type === 'highlight' ? 'subió un FutTok' : 'publicó un post'}
                </div>
              )}
              
              <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#fff', marginBottom: '20px', lineHeight: 1.1 }}>
                {title.length > 80 ? title.substring(0, 80) + '...' : title}
              </div>
              
              {description && (
                <div style={{ fontSize: '24px', color: '#a1a1aa', lineHeight: 1.4 }}>
                  {description.length > 150 ? description.substring(0, 150) + '...' : description}
                </div>
              )}
            </div>

            {image && (
              <div style={{ width: '350px', height: '350px', display: 'flex', borderRadius: '24px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                <img src={image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            )}
          </div>
          
          <div style={{ position: 'absolute', bottom: '40px', left: '40px', display: 'flex', flexDirection: 'row', alignItems: 'center', zIndex: 10 }}>
             <div style={{ fontSize: '18px', color: '#ffffff30' }}>pelotify.app</div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e: any) {
    console.log(`${e.message}`);
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}
