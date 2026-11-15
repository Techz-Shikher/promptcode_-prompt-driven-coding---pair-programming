declare module 'ws' {
  import { EventEmitter } from 'node:events';
  import type { IncomingMessage } from 'node:http';
  import type { Duplex } from 'node:stream';

  export class WebSocket extends EventEmitter {
    static OPEN: number;
    readyState: number;
    send(data: string): void;
    close(code?: number, reason?: string): void;
    ping(): void;
    on(event: 'message', listener: (data: Buffer, isBinary: boolean) => void): this;
    on(event: 'close', listener: (code: number, reason: Buffer) => void): this;
    on(event: 'error', listener: (error: Error) => void): this;
  }

  export class WebSocketServer extends EventEmitter {
    constructor(options: { noServer: true; maxPayload: number });
    clients: Set<WebSocket>;
    handleUpgrade(request: IncomingMessage, socket: Duplex, head: Buffer, callback: (webSocket: WebSocket) => void): void;
  }
}
