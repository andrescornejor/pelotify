import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const title = searchParams.get('title') || 'Pelotify';
    const description = searchParams.get('description') || '';
    const username = searchParams.get('username') || '';
    const type = searchParams.get('type') || 'post';
    const image = searchParams.get('image');

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
            color: 'white',
            padding: '60px',
          }}
        >
          {/* Main Card container */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              width: '100%',
              backgroundColor: 'rgba(255,255,255,0.03)',
              borderRadius: '30px',
              border: '1px solid rgba(255,255,255,0.1)',
              padding: '40px',
              gap: '40px',
            }}
          >
            {/* Left Content */}
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
               <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
                <div style={{ width: '40px', height: '40px', backgroundColor: '#2cfc7d', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontSize: '24px', fontWeight: 'bold' }}>P</div>
                <div style={{ marginLeft: '12px', fontSize: '28px', fontWeight: 'bold' }}>PELOTIFY</div>
              </div>

              {username && (
                <div style={{ fontSize: '24px', color: '#2cfc7d', fontWeight: 'bold', marginBottom: '8px' }}>
                  @{username} {type === 'highlight' ? 'subió un FutTok' : 'publicó'}
                </div>
              )}
              
              <div style={{ fontSize: '42px', fontWeight: 'bold', marginBottom: '16px', lineHeight: 1.1 }}>
                {title.length > 70 ? title.substring(0, 70) + '...' : title}
              </div>
              
              {description && (
                <div style={{ fontSize: '22px', color: '#a1a1aa', lineHeight: 1.4 }}>
                  {description.length > 120 ? description.substring(0, 120) + '...' : description}
                </div>
              )}
            </div>

            {/* Right Image */}
            {image && (
              <div style={{ width: '320px', height: '320px', display: 'flex', borderRadius: '20px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.2)' }}>
                <img src={image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            )}
          </div>
          
          <div style={{ position: 'absolute', bottom: '20px', right: '60px', opacity: 0.3, fontSize: '18px' }}>
            pelotify.app
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
