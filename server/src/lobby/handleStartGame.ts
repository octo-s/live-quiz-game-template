import { Game, StartGameData, User } from '../types';
import { WebSocket } from 'ws';
import sendQuestion from '../gameplay/sendQuestion';
import sendErrorMessage from '../utils/sendErrorMessage';

interface handleStartGameParams {
  ws: WebSocket;
  users: Map<string, User>;
  games: Map<string, Game>;
  wsToUser: Map<WebSocket, string>;
  data: StartGameData;
}

function handleStartGame({
  ws,
  users,
  games,
  wsToUser,
  data,
}: handleStartGameParams): void {
  const userIndex = wsToUser.get(ws);
  if (!userIndex) {
    sendErrorMessage(ws, 'Not logged in');
    return;
  }
  const game = games.get(data.gameId);
  if (!game) {
    sendErrorMessage(ws, 'Game not found');
    return;
  }

  if (game.hostId !== userIndex) {
    sendErrorMessage(ws, 'Only host can start the gameplay');
    return;
  }

  if (game.status !== 'waiting') {
    sendErrorMessage(ws, 'Game already started');
    return;
  }

  game.status = 'in_progress';
  game.currentQuestion = 0;

  sendQuestion(users, game);
}

export default handleStartGame;
