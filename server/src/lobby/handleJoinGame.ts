import { Game, JoinGameData, User } from '../types';
import { WebSocket } from 'ws';
import sendMessage from '../utils/sendMessage';
import broadcast from '../utils/broadcast';
import sendErrorMessage from '../utils/sendErrorMessage';

interface handleJoinGameParams {
  ws: WebSocket;
  users: Map<string, User>;
  games: Map<string, Game>;
  wsToUser: Map<WebSocket, string>;
  data: JoinGameData;
}

function handleJoinGame({
  ws,
  games,
  users,
  wsToUser,
  data,
}: handleJoinGameParams): void {
  const userIndex = wsToUser.get(ws);
  if (!userIndex) {
    sendErrorMessage(ws, 'Not logged in');
    return;
  }

  const currentUser = users.get(userIndex);

  if (!currentUser) {
    sendErrorMessage(ws, 'User not found');
    return;
  }

  const { code } = data;

  const game = [...games.values()].find((g) => g.code === code);

  if (!game) {
    return;
  }

  if (game.status !== 'waiting') {
    sendErrorMessage(ws, 'Game already started');
    return;
  }

  if (game.players.some((p) => p.index === userIndex)) {
    sendErrorMessage(ws, 'Already in this gameplay');
    return;
  }

  const newPlayer = {
    name: currentUser.name,
    index: userIndex,
    score: 0,
    ws,
  };

  game.players.push(newPlayer);

  sendMessage(ws, 'game_joined', { gameId: game.id });

  broadcast(users, game, 'player_joined', {
    playerName: currentUser.name,
    playerCount: game.players.length,
  });

  broadcast(
    users,
    game,
    'update_players',
    game.players.map((p) => ({
      name: p.name,
      index: p.index,
      score: p.score,
    }))
  );
}

export default handleJoinGame;
