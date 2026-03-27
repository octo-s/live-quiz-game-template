import { Game, JoinGameData, Player, User } from '../types';
import { WebSocket } from 'ws';
import sendMessage from '../utils/sendMessage';
import broadcast from '../utils/broadcast';

function handleJoinGame(
  ws: WebSocket,
  games: Map<string, Game>,
  users: Map<string, User>,
  wsToUser: Map<WebSocket, string>,
  data: JoinGameData
): void {
  const userIndex = wsToUser.get(ws);
  if (!userIndex) {
    sendMessage(ws, 'error', { error: true, errorText: 'Not logged in' });
    return;
  }

  const currentUser = users.get(userIndex);

  if (!currentUser) {
    sendMessage(ws, 'error', { error: true, errorText: 'User not found' });
    return;
  }

  const { code } = data;

  const game = [...games.values()].find((g) => g.code === code);

  if (!game) {
    sendMessage(ws, 'error', { error: true, errorText: 'Game not found' });
    return;
  }

  if (game.status !== 'waiting') {
    sendMessage(ws, 'error', {
      error: true,
      errorText: 'Game already started',
    });
    return;
  }

  if (game.players.some((p) => p.index === userIndex)) {
    sendMessage(ws, 'error', {
      error: true,
      errorText: 'Already in this gameplay',
    });
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
