import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    // Dynamic parameters
    const title = searchParams.get('title') || 'Pelotify';
    const description = searchParams.get('description') || 'Fútbol Amateur';
    const username = searchParams.get('username') || '';
    const type = searchParams.get('type') || 'post'; // post or highlight
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
            backgroundImage: 'radial-gradient(circle at 25% 25%, #10b98115 0%, transparent 50%), radial-gradient(circle at 75% 75%, #f59e0b10 0%, transparent 50%)',
            padding: '40px',
            fontFamily: 'Inter, "sans-serif"',
          }}
        >
          {/* Logo / Branding */}
          <div
            style={{
              position: 'absolute',
              top: '40px',
              left: '40px',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <div
              style={{
                width: '40px',
                height: '40px',
                backgroundColor: '#2cfc7d',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '15px',
              }}
            >
              <div style={{ color: '#000', fontSize: '24px', fontWeight: 'bold' }}>P</div>
            </div>
            <div
              style={{
                fontSize: '28px',
                fontWeight: '900',
                color: '#fff',
                textTransform: 'uppercase',
                letterSpacing: '-1px',
                fontStyle: 'italic',
              }}
            >
              Pelotify
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              gap: '40px',
              marginTop: '40px',
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                flex: 1,
              }}
            >
              {username && (
                <div
                  style={{
                    fontSize: '24px',
                    color: '#2cfc7d',
                    fontWeight: 'bold',
                    marginBottom: '10px',
                  }}
                >
                  @{username} {type === 'highlight' ? 'subió un FutTok' : 'publicó un post'}
                </div>
              )}
              <div
                style={{
                  fontSize: '48px',
                  fontWeight: 'bold',
                  color: '#fff',
                  lineHeight: '1.2',
                  marginBottom: '20px',
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {title}
              </div>
              <div
                style={{
                  fontSize: '24px',
                  color: '#a1a1aa',
                  lineHeight: '1.4',
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {description}
              </div>
            </div>

            {image && (
              <div
                style={{
                  width: '350px',
                  height: '350px',
                  display: 'flex',
                  borderRadius: '24px',
                  overflow: 'hidden',
                  border: '4px solid #ffffff10',
                }}
              >
                <img
                  src={image}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
              </div>
            )}
          </div>

          <div
            style={{
              position: 'absolute',
              bottom: '40px',
              right: '40px',
              fontSize: '20px',
              color: '#ffffff30',
              fontWeight: '500',
            }}
          >
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
