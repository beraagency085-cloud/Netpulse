import express, { Request, Response } from 'express';
import path from 'path';
import crypto from 'crypto';
import { createServer as createViteServer } from 'vite';

// Pre-allocate 4MB of pseudo-random buffer to prevent CPU overhead/compression during high-speed download testing
const CHUNK_SIZE = 4 * 1024 * 1024; // 4 MB
const RANDOM_BUFFER = crypto.randomBytes(CHUNK_SIZE);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Basic CORS & Security headers for speed-test endpoints
  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Cache-Control, X-Client-Timestamp');
    if (req.method === 'OPTIONS') {
      return res.status(204).end();
    }
    next();
  });

  // Health check endpoint
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({
      status: 'ok',
      service: 'NetPulse Speed Engine',
      timestamp: Date.now(),
      uptime: process.uptime(),
    });
  });

  // 1. High Precision Ping & Latency Endpoint
  app.get('/api/speedtest/ping', (req: Request, res: Response) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Content-Type', 'application/json');

    const clientTimestamp = req.headers['x-client-timestamp'] || req.query.t;
    res.json({
      serverTime: Date.now(),
      clientTime: clientTimestamp ? Number(clientTimestamp) : null,
      status: 'pong'
    });
  });

  // 2. High Throughput Download Stream Endpoint
  app.get('/api/speedtest/download', (req: Request, res: Response) => {
    // Prevent any browser or intermediary proxy caching
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', 'attachment; filename="speedtest.bin"');

    // Desired byte size (default 10MB, cap at 100MB per single request)
    const requestedBytes = parseInt(req.query.bytes as string, 10) || 10 * 1024 * 1024;
    const totalBytes = Math.min(Math.max(requestedBytes, 64 * 1024), 100 * 1024 * 1024);
    
    res.setHeader('Content-Length', totalBytes.toString());

    let bytesSent = 0;
    
    function sendChunks() {
      while (bytesSent < totalBytes) {
        const remaining = totalBytes - bytesSent;
        const chunkSize = Math.min(remaining, CHUNK_SIZE);
        
        // Write chunk directly
        const canContinue = res.write(RANDOM_BUFFER.subarray(0, chunkSize));
        bytesSent += chunkSize;

        if (!canContinue) {
          // If backpressure, pause until drain
          res.once('drain', sendChunks);
          return;
        }
      }
      res.end();
    }

    sendChunks();
  });

  // 3. High Throughput Upload Stream Endpoint
  app.post('/api/speedtest/upload', (req: Request, res: Response) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
    
    const startTime = Date.now();
    let bytesReceived = 0;

    req.on('data', (chunk: Buffer) => {
      bytesReceived += chunk.length;
    });

    req.on('end', () => {
      const durationMs = Math.max(Date.now() - startTime, 1);
      const speedMbps = ((bytesReceived * 8) / (durationMs / 1000)) / (1024 * 1024);
      
      res.json({
        bytesReceived,
        durationMs,
        speedMbps: Number(speedMbps.toFixed(2)),
        success: true,
      });
    });

    req.on('error', (err) => {
      console.error('Upload stream error:', err);
      res.status(500).json({ error: 'Upload stream failed' });
    });
  });

  // 4. Server & Client Network Telemetry Info
  app.get('/api/speedtest/server-info', (req: Request, res: Response) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    
    // Safely extract client IP
    const rawIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || 
                  req.socket.remoteAddress || 
                  '127.0.0.1';

    // Mask the last octet/segment for user privacy
    let maskedIp = rawIp;
    if (rawIp.includes('.')) {
      const parts = rawIp.split('.');
      if (parts.length === 4) {
        maskedIp = `${parts[0]}.${parts[1]}.${parts[2]}.xxx`;
      }
    } else if (rawIp.includes(':')) {
      const parts = rawIp.split(':');
      if (parts.length > 2) {
        maskedIp = `${parts[0]}:${parts[1]}:...:xxxx`;
      }
    }

    const host = req.headers.host || 'localhost:3000';

    res.json({
      client: {
        ip: maskedIp,
        protocol: req.secure || req.headers['x-forwarded-proto'] === 'https' ? 'HTTPS' : 'HTTP/1.1',
        userAgent: req.headers['user-agent'] || 'Modern Web Browser',
      },
      server: {
        id: 'netpulse-primary-edge',
        name: 'NetPulse Edge Hub #01',
        location: 'Cloud High-Speed Backbone',
        region: 'Global Optimized Anycast',
        host: host,
      },
      timestamp: new Date().toISOString()
    });
  });

  // 5. Available Test Servers List
  app.get('/api/speedtest/servers', (_req: Request, res: Response) => {
    res.json({
      servers: [
        {
          id: 'edge-auto',
          name: 'Automatic (Closest Edge Node)',
          location: 'Optimal Routing Engine',
          country: 'Auto',
          isDefault: true,
          pingUrl: '/api/speedtest/ping',
          downloadUrl: '/api/speedtest/download',
          uploadUrl: '/api/speedtest/upload'
        },
        {
          id: 'node-na-east',
          name: 'US East (Virginia Hub)',
          location: 'Ashburn, VA',
          country: 'USA',
          isDefault: false,
          pingUrl: '/api/speedtest/ping',
          downloadUrl: '/api/speedtest/download',
          uploadUrl: '/api/speedtest/upload'
        },
        {
          id: 'node-eu-west',
          name: 'Europe West (Frankfurt)',
          location: 'Frankfurt, Germany',
          country: 'Germany',
          isDefault: false,
          pingUrl: '/api/speedtest/ping',
          downloadUrl: '/api/speedtest/download',
          uploadUrl: '/api/speedtest/upload'
        },
        {
          id: 'node-ap-se',
          name: 'Asia Pacific (Singapore)',
          location: 'Singapore',
          country: 'Singapore',
          isDefault: false,
          pingUrl: '/api/speedtest/ping',
          downloadUrl: '/api/speedtest/download',
          uploadUrl: '/api/speedtest/upload'
        }
      ]
    });
  });

  // Vite middleware for development vs static build in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[NetPulse Server] Running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start NetPulse server:', err);
  process.exit(1);
});
