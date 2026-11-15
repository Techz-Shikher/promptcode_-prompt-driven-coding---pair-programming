import { createHash, randomUUID, randomBytes } from 'node:crypto';
import type { IncomingMessage, Server } from 'node:http';
import type { Duplex } from 'node:stream';
import { getSessionAccount } from './auth.js';
import { getDatabasePool } from './database.js';
import { readSessionToken } from './authCrypto.js';
import { WebSocket, WebSocketServer } from 'ws';

const SUPPORTED_LANGUAGES = new Set(['typescript', 'python', 'cpp', 'java', 'go']);
interface RoomClient { roomId: string; userId: string; name: string; role: 'owner' | 'editor' | 'viewer'; lastCodeAt: number; chatTimes: number[] }
const connectedClients = new Map<WebSocket, RoomClient>();
const roomSockets = new Map<string, Set<WebSocket>>();

function send(socket: WebSocket, value: unknown) {
  if (socket.readyState === WebSocket.OPEN) socket.send(JSON.stringify(value));
}

function broadcast(roomId: string, value: unknown, except?: WebSocket) {
  for (const socket of roomSockets.get(roomId) || []) if (socket !== except) send(socket, value);
}

function presence(roomId: string) {
  const people = new Map<string, string>();
  for (const socket of roomSockets.get(roomId) || []) {
    const client = connectedClients.get(socket);
    if (client) people.set(client.userId, client.name);
  }
  return [...people].map(([id, name]) => ({ id, name }));
}

function rejectUpgrade(socket: Duplex, status: number, text: string) {
  socket.write(`HTTP/1.1 ${status} ${text}\r\nConnection: close\r\nContent-Length: 0\r\n\r\n`);
  socket.destroy();
}

function originAllowed(request: IncomingMessage): boolean {
  const origin = request.headers.origin;
  if (!origin || !request.headers.host) return false;
  try {
    const parsedOrigin = new URL(origin);
    const appUrl = process.env.APP_URL?.trim();
    if (appUrl && !appUrl.startsWith('MY_') && parsedOrigin.origin === new URL(appUrl).origin) return true;
    return parsedOrigin.host.toLowerCase() === request.headers.host.toLowerCase();
  } catch { return false; }
}

export function attachCollaborationWebSockets(server: Server) {
  const webSockets = new WebSocketServer({ noServer: true, maxPayload: 130_000 });

  server.on('upgrade', (request, socket, head) => {
    let roomId = '';
    try {
      const url = new URL(request.url || '/', `http://${request.headers.host || 'localhost'}`);
      const match = url.pathname.match(/^\/api\/rooms\/([0-9a-f-]{36})\/socket$/i);
      if (!match) return rejectUpgrade(socket, 404, 'Not Found');
      roomId = match[1];
    } catch { return rejectUpgrade(socket, 400, 'Bad Request'); }
    if (!originAllowed(request)) return rejectUpgrade(socket, 403, 'Forbidden');

    void (async () => {
      const pool = getDatabasePool();
      const token = readSessionToken(request.headers.cookie);
      if (!pool || !token) return rejectUpgrade(socket, 401, 'Unauthorized');
      const account = await getSessionAccount(token);
      if (!account) return rejectUpgrade(socket, 401, 'Unauthorized');
      const membership = await pool.query<{ role: RoomClient['role'] }>(
        'SELECT role FROM collaboration_room_members WHERE room_id = $1 AND user_id = $2', [roomId, account.id],
      );
      if (!membership.rowCount) return rejectUpgrade(socket, 403, 'Forbidden');
      if (socket.destroyed) return;
      const client: RoomClient = { roomId, userId: account.id, name: account.name, role: membership.rows[0].role, lastCodeAt: 0, chatTimes: [] };
      webSockets.handleUpgrade(request, socket, head, (webSocket) => {
        connectedClients.set(webSocket, client);
        const members = roomSockets.get(roomId) || new Set<WebSocket>();
        members.add(webSocket);
        roomSockets.set(roomId, members);
        webSockets.emit('connection', webSocket, request);
        void sendSnapshot(webSocket, client);
        broadcast(roomId, { type: 'presence:update', online: presence(roomId) }, webSocket);
      });
    })().catch(() => rejectUpgrade(socket, 503, 'Service Unavailable'));
  });

  webSockets.on('connection', (socket: WebSocket) => {
    socket.on('message', (data: Buffer, isBinary: boolean) => {
      if (isBinary || data.length > 125_000) return send(socket, { type: 'error', error: 'Invalid room message.' });
      let message: any;
      try { message = JSON.parse(data.toString('utf8')); } catch { return send(socket, { type: 'error', error: 'Room messages must be valid JSON.' }); }
      const client = connectedClients.get(socket);
      if (!client || !message || typeof message !== 'object' || Array.isArray(message)) return;
      void handleRoomMessage(socket, client, message).catch(() => send(socket, { type: 'error', error: 'Could not save this room update.' }));
    });

    socket.on('close', () => {
      const client = connectedClients.get(socket);
      connectedClients.delete(socket);
      if (!client) return;
      const members = roomSockets.get(client.roomId);
      members?.delete(socket);
      if (members?.size === 0) roomSockets.delete(client.roomId);
      broadcast(client.roomId, { type: 'presence:update', online: presence(client.roomId) });
    });
    socket.on('error', () => {});
  });

  return webSockets;
}

async function sendSnapshot(socket: WebSocket, client: RoomClient) {
  const pool = getDatabasePool();
  if (!pool) return send(socket, { type: 'error', error: 'Room storage is unavailable.' });
  const result = await pool.query(
    `SELECT r.id, r.title, r.code, r.language, r.revision, m.role
       FROM collaboration_rooms r JOIN collaboration_room_members m ON m.room_id = r.id
       WHERE r.id = $1 AND m.user_id = $2`,
    [client.roomId, client.userId],
  );
  if (!result.rowCount) { socket.close(4403, 'Room access revoked'); return; }
  const [members, messages] = await Promise.all([
    pool.query('SELECT u.id, u.display_name AS name, m.role FROM collaboration_room_members m JOIN users u ON u.id = m.user_id WHERE m.room_id = $1 ORDER BY m.joined_at', [client.roomId]),
    pool.query(
      `SELECT message.id, message.sender_id AS "senderId", account.display_name AS "senderName", message.content, message.created_at AS "createdAt"
         FROM collaboration_room_messages message JOIN users account ON account.id = message.sender_id
        WHERE message.room_id = $1 ORDER BY message.created_at DESC, message.id DESC LIMIT 50`, [client.roomId],
    ),
  ]);
  send(socket, { type: 'room:snapshot', room: result.rows[0], members: members.rows, messages: messages.rows.reverse(), online: presence(client.roomId) });
}

async function handleRoomMessage(socket: WebSocket, client: RoomClient, message: any) {
  const pool = getDatabasePool();
  if (!pool) return send(socket, { type: 'error', error: 'Room storage is unavailable.' });
  const membership = await pool.query<{ role: RoomClient['role'] }>(
    'SELECT role FROM collaboration_room_members WHERE room_id = $1 AND user_id = $2', [client.roomId, client.userId],
  );
  if (!membership.rowCount) { socket.close(4403, 'Room access revoked'); return; }
  client.role = membership.rows[0].role;
  if (message.type === 'code:update') {
    if (client.role === 'viewer') return send(socket, { type: 'error', error: 'Your room role is view-only.' });
    if (typeof message.code !== 'string' || message.code.length > 100_000 || !SUPPORTED_LANGUAGES.has(message.language)
      || !Number.isInteger(message.baseRevision) || !Number.isInteger(message.clientVersion)) return send(socket, { type: 'error', error: 'Invalid collaborative editor update.' });
    const now = Date.now();
    if (now - client.lastCodeAt < 180) return;
    client.lastCodeAt = now;
    const result = await pool.query<{ revision: number }>(
      `UPDATE collaboration_rooms SET code = $3, language = $4, revision = revision + 1, updated_at = now()
       WHERE id = $1 AND revision = $2 RETURNING revision`,
      [client.roomId, message.baseRevision, message.code, message.language],
    );
    if (!result.rowCount) {
      const current = await pool.query('SELECT code, language, revision FROM collaboration_rooms WHERE id = $1', [client.roomId]);
      return send(socket, { type: 'code:conflict', ...current.rows[0], clientVersion: message.clientVersion });
    }
    const update = { type: 'code:update', userId: client.userId, code: message.code, language: message.language, revision: Number(result.rows[0].revision) };
    send(socket, { type: 'code:ack', revision: update.revision, clientVersion: message.clientVersion });
    return broadcast(client.roomId, update, socket);
  }

  if (message.type === 'chat:send') {
    if (typeof message.content !== 'string' || !message.content.trim() || message.content.length > 2_000) return send(socket, { type: 'error', error: 'Chat messages must be 1–2,000 characters.' });
    const now = Date.now();
    client.chatTimes = client.chatTimes.filter((time) => now - time < 10_000);
    if (client.chatTimes.length >= 10) return send(socket, { type: 'error', error: 'Room chat is temporarily rate limited.' });
    client.chatTimes.push(now);
    const result = await pool.query(
      `INSERT INTO collaboration_room_messages(id, room_id, sender_id, content) VALUES($1, $2, $3, $4)
       RETURNING id, sender_id AS "senderId", content, created_at AS "createdAt"`,
      [randomUUID(), client.roomId, client.userId, message.content.trim()],
    );
    return broadcast(client.roomId, { type: 'chat:message', message: { ...result.rows[0], senderName: client.name } });
  }

  if (message.type === 'cursor:update') {
    if (!Number.isInteger(message.line) || message.line < 1 || message.line > 100_000
      || !Number.isInteger(message.column) || message.column < 1 || message.column > 2_000) return;
    return broadcast(client.roomId, { type: 'cursor:update', userId: client.userId, line: message.line, column: message.column }, socket);
  }

  if (message.type === 'presence:typing' && typeof message.typing === 'boolean') {
    return broadcast(client.roomId, { type: 'presence:typing', userId: client.userId, typing: message.typing }, socket);
  }
  send(socket, { type: 'error', error: 'Unsupported room message type.' });
}

export function hashRoomInvite(inviteCode: string) {
  return createHash('sha256').update(inviteCode).digest();
}

export function broadcastRoomMemberRole(roomId: string, userId: string, role: 'editor' | 'viewer') {
  for (const socket of roomSockets.get(roomId) || []) {
    const client = connectedClients.get(socket);
    if (client?.userId !== userId) continue;
    client.role = role;
    send(socket, { type: 'member:role', role });
  }
}
