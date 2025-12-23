import { WebSocketServer, WebSocket } from 'ws';
import { createClient } from 'redis';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import url from 'url';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

// 1. Setup Redis Subscriber
const redisSub = createClient({ url: REDIS_URL });

// 2. Setup WebSocket Server
const wss = new WebSocketServer({ port: 8080 });

// Map: UserId -> WebSocket Connection
// This lets us find the specific user's connection instantly
const clients = new Map<string, WebSocket>();

// --- Handle New Connections ---
wss.on('connection', (ws, req) => {
  // Extract token from query params: ws://localhost:8080?token=XYZ
  const parameters = url.parse(req.url || '', true).query;
  const token = parameters.token as string;

  if (!token) {
    ws.close(1008, "Token required"); // 1008 = Policy Violation
    return;
  }

  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    const userId = decoded.id;

    // Store connection
    clients.set(userId, ws);
    console.log(`🔌 User Connected: ${userId}`);

    // Cleanup on disconnect
    ws.on('close', () => {
      clients.delete(userId);
      console.log(`❌ User Disconnected: ${userId}`);
    });

  } catch (e) {
    ws.close(1008, "Invalid Token");
  }
});

// --- Handle Redis Events ---
async function start() {
  await redisSub.connect();

  // Subscribe to internal events
  await redisSub.subscribe('events:order:status', (message) => {
    try {
      const event = JSON.parse(message);
      const userId = event.data.userId; 

      console.log(`📨 Event received for user: ${userId}`);

      // Forward to specific user if they are connected
      const clientWs = clients.get(userId);
      if (clientWs && clientWs.readyState === WebSocket.OPEN) {
        clientWs.send(JSON.stringify(event));
        console.log(`✅ Sent to Frontend`);
      }
    } catch (e) {
      console.error("Error processing message:", e);
    }
  });

  console.log('📡 Event Service (WS) running on port 8080');
}

start();