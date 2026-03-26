import { WebSocketServer, WebSocket } from 'ws';
import type { User, Game } from './types';

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

// WebSocket server
const wss = new WebSocketServer({ port: PORT });

const users = new Map<string, User>();
const games = new Map<string, Game>();
const wsToUser = new Map<WebSocket, string>();

console.log(`WebSocket server started on ws://localhost:${PORT}`);