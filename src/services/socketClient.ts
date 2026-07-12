import { io, Socket } from 'socket.io-client';

interface BufferedPacket {
  id: string;
  event: string;
  payload: any;
  timestamp: string;
}

class ResilientSocketClient {
  private socket: Socket | null = null;
  private offlineQueue: BufferedPacket[] = [];
  private isConnectedState: boolean = false;
  private listeners: Map<string, Set<(data: any) => void>> = new Map();

  constructor() {
    // Load previously buffered packets from localStorage to survive page reloads on site
    this.loadQueue();
  }

  public connect(url?: string): void {
    if (this.socket) return;

    const connectionUrl = url || window.location.origin;
    const token = localStorage.getItem('erp_token');
    console.log(`[Socket Client] Connecting to ${connectionUrl}...`);

    this.socket = io(connectionUrl, {
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      auth: {
        token: token || undefined
      }
    });

    this.socket.on('connect', () => {
      this.isConnectedState = true;
      console.log(`[Socket Client] Connected! Socket ID: ${this.socket?.id}`);
      this.triggerListeners('connection_change', true);
      this.drainQueue();
    });

    this.socket.on('disconnect', (reason) => {
      this.isConnectedState = false;
      console.warn(`[Socket Client] Disconnected. Reason: ${reason}`);
      this.triggerListeners('connection_change', false);
    });

    this.socket.on('connect_error', (error) => {
      this.isConnectedState = false;
      console.error(`[Socket Client] Connection error:`, error);
      this.triggerListeners('connection_change', false);
    });

    // Handle universal broadcast events
    this.socket.on('system_alert_received', (data) => {
      this.triggerListeners('system_alert_received', data);
    });

    this.socket.on('sync_data_refresh', (data) => {
      this.triggerListeners('sync_data_refresh', data);
    });
  }

  // Send packet with fallback buffering
  public emitResilient(event: string, payload: any): void {
    if (this.isConnectedState && this.socket) {
      console.log(`[Socket Client] Direct emit: "${event}"`, payload);
      this.socket.emit(event, payload);
    } else {
      const packet: BufferedPacket = {
        id: `PKT-${Math.random().toString(36).substr(2, 9)}`,
        event,
        payload,
        timestamp: new Date().toISOString(),
      };
      this.offlineQueue.push(packet);
      this.saveQueue();
      console.warn(`[Socket Client] Network offline. Buffered outgoing event "${event}" to local storage.`, packet);
      this.triggerListeners('queue_change', this.offlineQueue);
    }
  }

  // Subscribe to socket/system events
  public on(event: string, callback: (data: any) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  // Unsubscribe
  public off(event: string, callback: (data: any) => void): void {
    if (this.listeners.has(event)) {
      this.listeners.get(event)!.delete(callback);
    }
  }

  public isConnected(): boolean {
    return this.isConnectedState;
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnectedState = false;
      console.log('[Socket Client] Disconnected manually on session logout');
      this.triggerListeners('connection_change', false);
    }
  }

  public getQueue(): BufferedPacket[] {
    return this.offlineQueue;
  }

  // Clear offline cache
  public clearQueue(): void {
    this.offlineQueue = [];
    localStorage.removeItem('erp_offline_socket_queue');
    this.triggerListeners('queue_change', this.offlineQueue);
  }

  // Drain and send queued packets to server
  private drainQueue(): void {
    if (this.offlineQueue.length === 0) return;
    console.log(`[Socket Client] Restored connection. Draining ${this.offlineQueue.length} buffered packets...`);

    const tempQueue = [...this.offlineQueue];
    this.offlineQueue = [];
    this.saveQueue();

    tempQueue.forEach((packet) => {
      if (this.socket) {
        console.log(`[Socket Client] Replaying buffered packet: ${packet.id} ("${packet.event}")`);
        this.socket.emit(packet.event, packet.payload);
      }
    });

    this.triggerListeners('queue_change', this.offlineQueue);
  }

  private saveQueue(): void {
    localStorage.setItem('erp_offline_socket_queue', JSON.stringify(this.offlineQueue));
  }

  private loadQueue(): void {
    try {
      const saved = localStorage.getItem('erp_offline_socket_queue');
      this.offlineQueue = saved ? JSON.parse(saved) : [];
    } catch (e) {
      this.offlineQueue = [];
    }
  }

  private triggerListeners(event: string, data: any): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach((cb) => {
        try {
          cb(data);
        } catch (e) {
          console.error('[Socket Client Callback Error]:', e);
        }
      });
    }
  }
}

export const socketClient = new ResilientSocketClient();
