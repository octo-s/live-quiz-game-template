import { Game, StartGameData, User } from '../types';
import { WebSocket } from 'ws';
import sendMessage from '../utils/sendMessage';
import sendQuestion from '../gameplay/sendQuestion';

function handleStartGame(
  ws: WebSocket,
  users: Map<string, User>,
  games: Map<string, Game>,
  wsToUser: Map<WebSocket, string>,
  data: StartGameData
): void {
  const userIndex = wsToUser.get(ws);
  if (!userIndex) {
    sendMessage(ws, 'error', { error: true, errorText: 'Not logged in' });
    return;
  }
  const game = games.get(data.gameId);
  if (!game) {
    sendMessage(ws, 'error', { error: true, errorText: 'Game not found' });
    return;
  }

  if (game.hostId !== userIndex) {
    sendMessage(ws, 'error', {
      error: true,
      errorText: 'Only host can start the gameplay',
    });
    return;
  }

  if (game.status !== 'waiting') {
    sendMessage(ws, 'error', {
      error: true,
      errorText: 'Game already started',
    });
    return;
  }

  game.status = 'in_progress';
  game.currentQuestion = 0;

  sendQuestion(users, game);
}

export default handleStartGame;
