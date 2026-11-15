import type { IncomingMessage, ServerResponse } from 'node:http';
import { createApp } from '../server.js';

const app = createApp();

export default function handler(
  req: IncomingMessage & { url?: string },
  res: ServerResponse
) {
  const rawUrl = req.url || '/';
  const qIdx = rawUrl.indexOf('?');
  const pathPart = qIdx >= 0 ? rawUrl.slice(0, qIdx) : rawUrl;
  const searchPart = qIdx >= 0 ? rawUrl.slice(qIdx + 1) : '';
  const params = new URLSearchParams(searchPart);
  const captured = params.get('__path');

  if (captured !== null) {
    params.delete('__path');
    const rest = params.toString();
    const cleanCaptured = captured.replace(/^\/+/, '');
    req.url = `/api/${cleanCaptured}${rest ? `?${rest}` : ''}`;
  } else if (pathPart === '/api/index') {
    req.url = `/api/health${searchPart ? `?${searchPart}` : ''}`;
  } else if (!pathPart.startsWith('/api')) {
    req.url = `/api${rawUrl.startsWith('/') ? '' : '/'}${rawUrl}`;
  }

  return app(req as any, res as any);
}
