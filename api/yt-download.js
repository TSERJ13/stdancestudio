// Vercel Serverless Function: YouTube to MP3 Converter Proxy
// Endpoint: https://stdance.ge/api/yt-download
import { Readable } from 'stream';
import { pipeline } from 'stream/promises';

export default async function handler(req, res) {
  // CORS configuration
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Cache-Control', 'no-store, max-age=0');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { url, id, format = 'mp3', action, fileUrl, filename } = req.query;

  // Stream proxy for clean direct file download without opening 3rd party tabs
  if (action === 'file' && fileUrl) {
    try {
      const fileRes = await fetch(fileUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
        }
      });
      if (!fileRes.ok) throw new Error(`CDN returned status ${fileRes.status}`);

      const safeName = (filename || 'audio.mp3').replace(/[^\w\s.-]/gi, '_');
      res.setHeader('Content-Type', fileRes.headers.get('content-type') || 'audio/mpeg');
      res.setHeader('Content-Disposition', `attachment; filename="${safeName}"`);
      const len = fileRes.headers.get('content-length');
      if (len) res.setHeader('Content-Length', len);

      const nodeStream = Readable.fromWeb(fileRes.body);
      await pipeline(nodeStream, res);
      return;
    } catch (e) {
      return res.status(500).json({ error: 'Direct download proxy failed', message: e.message });
    }
  }

  // 1. If progress ID provided, check conversion progress
  if (id) {
    try {
      const progRes = await fetch(`https://lto2.affadaffa.com/api/progress?id=${encodeURIComponent(id)}`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          'Referer': 'https://loader.to/'
        }
      });
      const data = await progRes.json();
      return res.status(200).json(data);
    } catch (e) {
      return res.status(500).json({ error: 'Failed to check conversion progress', message: e.message });
    }
  }

  // 2. Otherwise start conversion for the YouTube URL
  if (!url) {
    return res.status(400).json({ error: 'url parameter is required' });
  }

  try {
    const startRes = await fetch(`https://loader.to/ajax/download.php?button=1&start=1&end=1&format=${encodeURIComponent(format)}&url=${encodeURIComponent(url)}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Referer': 'https://loader.to/'
      }
    });

    const data = await startRes.json();
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to start conversion', message: err.message });
  }
}
