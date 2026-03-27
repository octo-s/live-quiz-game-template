import { WebSocketServer, WebSocket } from 'ws';
import type { User, Game, WSMessage } from './types';
import handleDisconnect from './utils/handleDisconnect';
import handleAnswer from './gameplay/handleAnswer';
import handleStartGame from './lobby/handleStartGame';
import handleJoinGame from './lobby/handleJoinGame';
import handleCreateGame from './lobby/handleCreateGame';
import handleReg from './handleReg';
import sendErrorMessage from './utils/sendErrorMessage';
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

// WebSocket server
const wss = new WebSocketServer({ port: PORT });

const users = new Map<string, User>();
const games = new Map<string, Game>();
const wsToUser = new Map<WebSocket, string>();

console.log(`WebSocket server started on ws://localhost:${PORT}`);

wss.on('connection', (ws: WebSocket) => {
  console.log('New client connected');

  ws.on('message', (rawData: string) => {
    try {
      const message: WSMessage = JSON.parse(rawData.toString());
      const { type, data } = message;

      switch (type) {
        case 'reg':
          handleReg({ ws, users, wsToUser, data });
          break;
        case 'create_game':
          handleCreateGame({ ws, games, wsToUser, data });
          break;
        case 'join_game':
          handleJoinGame({ ws, games, users, wsToUser, data });
          break;
        case 'start_game':
          handleStartGame({ ws, games, users, wsToUser, data });
          break;
        case 'answer':
          handleAnswer({ ws, games, users, wsToUser, data });
          break;
        default:
          sendErrorMessage(ws, `Unknown command: ${type}`);
      }
    } catch (e) {
      sendErrorMessage(ws, 'Invalid JSON');
    }
  });

  ws.on('close', () => {
    handleDisconnect({ ws, games, users, wsToUser });
  });
});
