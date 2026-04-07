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
            backgroundColor: '#050505',
            padding: '50px',
            position: 'relative',
          }}
        >
          {/* Subtle Ambient Glows */}
          <div style={{ position: 'absolute', top: '-10%', right: '-10%', width: '60%', height: '60%', backgroundColor: '#2cfc7d', filter: 'blur(150px)', opacity: 0.1, borderRadius: '50%' }} />
          <div style={{ position: 'absolute', bottom: '-10%', left: '-10%', width: '60%', height: '60%', backgroundColor: '#f59e0b', filter: 'blur(150px)', opacity: 0.05, borderRadius: '50%' }} />

          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              width: '100%',
              gap: '50px',
              zIndex: 10,
            }}
          >
            {/* Left Content Side */}
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '30px' }}>
                <div style={{ width: '50px', height: '50px', backgroundColor: '#2cfc7d', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(44, 252, 125, 0.3)' }}>
                  <div style={{ color: '#000', fontSize: '30px', fontWeight: 'bold' }}>P</div>
                </div>
                <div style={{ marginLeft: '15px', fontSize: '32px', fontWeight: '900', color: '#fff', letterSpacing: '-0.5px' }}>PELOTIFY</div>
              </div>

              <div style={{ fontSize: '26px', color: '#2cfc7d', fontWeight: 'bold', marginBottom: '15px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                {type === 'highlight' ? 'FutTok Destacado' : 'Post Social'}
              </div>
              
              <div style={{ fontSize: '56px', fontWeight: 'bold', color: '#fff', marginBottom: '25px', lineHeight: 1.1, letterSpacing: '-1px' }}>
                {username ? `@${username}` : title}
              </div>
              
              <div style={{ fontSize: '28px', color: '#a1a1aa', lineHeight: 1.4, fontWeight: '500' }}>
                {description && description.length > 140 ? description.substring(0, 140) + '...' : description}
              </div>
            </div>

            {/* Right Media Side */}
            {image && (
              <div style={{ position: 'relative', width: '400px', height: '400px', display: 'flex', borderRadius: '40px', overflow: 'hidden', border: '2px solid rgba(255,255,255,0.1)', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}>
                <img src={image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                
                {/* Play Icon Overlay for Highlights */}
                {type === 'highlight' && (
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.3)' }}>
                    <div style={{ width: '100px', height: '100px', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '5px solid white', backdropFilter: 'blur(5px)' }}>
                      <div style={{ borderLeft: '35px solid white', borderTop: '20px solid transparent', borderBottom: '20px solid transparent', marginLeft: '10px' }} />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div style={{ position: 'absolute', bottom: '50px', left: '50px', display: 'flex', alignItems: 'center', zIndex: 10 }}>
             <div style={{ fontSize: '20px', color: 'rgba(255,255,255,0.2)', fontWeight: 'bold' }}>pelotify.app</div>
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
