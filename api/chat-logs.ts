import { createApp } from '../server.js';

const app = createApp();

export default function handler(req: Parameters<typeof app>[0], res: Parameters<typeof app>[1]) {
  req.url = '/api/chat/logs';
  return app(req, res);
}
