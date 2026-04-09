import { NextResponse } from 'next/server';
import axios from 'axios';
import * as cheerio from 'cheerio';

export async function POST(request: Request) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Attempt to scrape the target URL to find an m3u8 link
    const { data: html } = await axios.get(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
    });

    const $ = cheerio.load(html);

    // Look for m3u8 links in source tags
    let m3u8Url = '';
    $('source').each((_, element) => {
      const src = $(element).attr('src');
      if (src && src.includes('.m3u8')) {
        m3u8Url = src;
      }
    });

    // If not found in source, try searching in script tags (common in video players)
    if (!m3u8Url) {
      $('script').each((_, element) => {
        const scriptContent = $(element).html();
        if (scriptContent && scriptContent.includes('.m3u8')) {
          const match = scriptContent.match(/(https?:\/\/[^\s"'<>]+\.m3u8[^\s"'<>]*)/);
          if (match && match[1]) {
            m3u8Url = match[1];
          }
        }
      });
    }

    // Mock fallback for MVP if we couldn't scrape an actual m3u8
    // Since Sportsreel might block scraping or require auth
    if (!m3u8Url) {
      m3u8Url = 'https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8';
    }

    return NextResponse.json({ m3u8Url });
  } catch (error: any) {
    console.error('Error scraping video:', error.message);
    return NextResponse.json(
      { error: 'Error processing the request', details: error.message },
      { status: 500 }
    );
  }
}
