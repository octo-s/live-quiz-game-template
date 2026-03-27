import { WebSocketServer, WebSocket } from 'ws';
import type {
  User,
  Game,
  WSMessage,
  RegData,
  CreateGameData,
  JoinGameData,
  StartGameData,
  AnswerData,
} from './types';
import handleDisconnect from './utils/handleDisconnect';
import sendMessage from './utils/sendMessage';
import handleAnswer from './gameplay/handleAnswer';
import handleStartGame from './lobby/handleStartGame';
import handleJoinGame from './lobby/handleJoinGame';
import handleCreateGame from './lobby/handleCreateGame';
import handleReg from './handleReg';
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
          handleReg(ws, users, wsToUser, data as RegData);
          break;
        case 'create_game':
          handleCreateGame(ws, games, wsToUser, data as CreateGameData);
          break;
        case 'join_game':
          handleJoinGame(ws, games, users, wsToUser, data as JoinGameData);
          break;
        case 'start_game':
          handleStartGame(ws, users, games, wsToUser, data as StartGameData);
          break;
        case 'answer':
          handleAnswer(ws, data as AnswerData);
          break;
        default:
          sendMessage(ws, 'error', {
            error: true,
            errorText: `Unknown command: ${type}`,
          });
      }
    } catch (e) {
      sendMessage(ws, 'error', {
        error: true,
        errorText: 'Invalid JSON',
      });
    }
  });

  ws.on('close', () => {
    handleDisconnect(ws);
  });
});
