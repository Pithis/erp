import { Server as HTTPServer } from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';

let ioInstance: Server | null = null;

// Track active connections in memory
const connectedClients = new Set<string>();

const JWT_SECRET = process.env.JWT_SECRET || 'enterprise_devops_secret_token_123456';

export function initWebSocket(httpServer: HTTPServer) {
  ioInstance = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
    pingInterval: 10000,
    pingTimeout: 5000,
  });

  // Verify JWT Token on Handshake connection attempt
  ioInstance.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) {
      console.warn(`[Socket.IO] Connection rejected: No auth token provided by client.`);
      return next(new Error('Authentication failed: No token provided'));
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      (socket as any).user = decoded;
      next();
    } catch (err: any) {
      console.warn(`[Socket.IO] Connection rejected: Invalid or expired token. Error: ${err.message}`);
      return next(new Error('Authentication failed: Invalid token'));
    }
  });

  ioInstance.on('connection', (socket: Socket) => {
    connectedClients.add(socket.id);
    console.log(`[Socket.IO] Client connected: ${socket.id} (Total: ${connectedClients.size})`);

    // Initial greeting
    socket.emit('connection_status', { 
      status: 'connected', 
      socketId: socket.id, 
      activeConnections: connectedClients.size 
    });

    // 1. Core Priority Alert Emergency Broadcast Handler
    socket.on('priority_alert_broadcast', (payload: { projectName: string; title: string; message: string }) => {
      console.log(`[Socket.IO] Priority alert broadcast received from client:`, payload);
      
      if (ioInstance) {
        // Relay to ALL online clients immediately
        ioInstance.emit('system_alert_received', {
          ...payload,
          id: `ALERT-${Date.now()}`,
          timestamp: new Date().toISOString(),
          sender: 'Operations Staff'
        });
      }
    });

    // 2. Real-time synchronizer events (for immediate lists refresh)
    socket.on('data_mutation_occurred', (payload: { table: string; action: string; data: any }) => {
      console.log(`[Socket.IO] Data mutated - Table: ${payload.table}, Action: ${payload.action}`);
      // Broadcast mutation notification to all other clients to refresh local state
      socket.broadcast.emit('sync_data_refresh', payload);
    });

    socket.on('disconnect', () => {
      connectedClients.delete(socket.id);
      console.log(`[Socket.IO] Client disconnected: ${socket.id} (Remaining: ${connectedClients.size})`);
    });
  });

  return ioInstance;
}

// Global helper to trigger system alerts from Express controllers
export function triggerSystemAlert(projectName: string, title: string, message: string) {
  if (ioInstance) {
    ioInstance.emit('system_alert_received', {
      id: `ALERT-${Date.now()}`,
      projectName,
      title,
      message,
      timestamp: new Date().toISOString(),
      sender: 'System Automatic Auditor'
    });
    return true;
  }
  return false;
}

// Global helper to push data mutations
export function broadcastMutation(table: string, action: string, data: any) {
  if (ioInstance) {
    ioInstance.emit('sync_data_refresh', { table, action, data });
  }
}
