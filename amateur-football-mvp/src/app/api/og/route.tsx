import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const title = searchParams.get('title'); // Often username in our usage
    let description = searchParams.get('description'); // The post content
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
            backgroundColor: '#050505',
            padding: '60px',
            position: 'relative',
          }}
        >
          {/* subtle ambient lighting */}
          <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '70%', height: '70%', backgroundColor: '#2cfc7d', filter: 'blur(160px)', opacity: 0.12, borderRadius: '50%' }} />
          <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '60%', height: '60%', backgroundColor: '#f59e0b', filter: 'blur(160px)', opacity: 0.08, borderRadius: '50%' }} />

          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'flex-start',
              width: '100%',
              gap: '60px',
              zIndex: 10,
            }}
          >
            {/* Left Content Side */}
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'flex-start', height: '100%', paddingTop: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '40px' }}>
                <div style={{ width: '48px', height: '48px', backgroundColor: '#2cfc7d', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ color: '#000', fontSize: '28px', fontWeight: 'bold' }}>P</div>
                </div>
                <div style={{ marginLeft: '15px', fontSize: '24px', fontWeight: '900', color: '#fff', letterSpacing: '2px' }}>PELOTIFY</div>
              </div>

              {/* USERNAME (SMALL) */}
              <div style={{ fontSize: '24px', color: '#2cfc7d', fontWeight: '600', marginBottom: '20px', letterSpacing: '0.5px' }}>
                @{username || title} compartió un {type === 'highlight' ? 'FutTok' : 'post'}
              </div>
              
              {/* POST CONTENT (BIG) */}
              <div style={{ 
                fontSize: '60px', 
                fontWeight: '800', 
                color: '#fff', 
                marginBottom: '20px', 
                lineHeight: 1.1, 
                letterSpacing: '-2px',
                display: 'block',
                maxHeight: '330px',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {description && description.length > 120 ? description.substring(0, 120) + '...' : (description || '¡Mirá lo nuevo en Pelotify!')}
              </div>
            </div>

            {/* Right Media Side */}
            {image && (
              <div style={{ position: 'relative', width: '420px', height: '420px', display: 'flex', borderRadius: '48px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.15)', boxShadow: '0 25px 60px rgba(0,0,0,0.6)' }}>
                <img src={image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                
                {/* Play Icon Overlay for Highlights */}
                {type === 'highlight' && (
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.25)' }}>
                    <div style={{ width: '110px', height: '110px', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '4px solid white', backdropFilter: 'blur(8px)' }}>
                      <div style={{ borderLeft: '40px solid white', borderTop: '24px solid transparent', borderBottom: '24px solid transparent', marginLeft: '12px' }} />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div style={{ position: 'absolute', bottom: '50px', left: '60px', display: 'flex', alignItems: 'center', zIndex: 10 }}>
             <div style={{ fontSize: '18px', color: 'rgba(255,255,255,0.25)', fontWeight: '600' }}>pelotify.vercel.app</div>
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
