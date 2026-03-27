import { WebSocket } from 'ws';
import finishQuestion from '../gameplay/finishQuestion';
import broadcast from './broadcast';
import { Game, User } from '../types';

function handleDisconnect(
  users: Map<string, User>,
  games: Map<string, Game>,
  wsToUser: Map<WebSocket, string>,
  ws: WebSocket
): void {
  const userIndex = wsToUser.get(ws);
  if (!userIndex) return;

  wsToUser.delete(ws);

  for (const game of games.values()) {
    const playerIndex = game.players.findIndex((p) => p.index === userIndex);
    if (playerIndex !== -1) {
      game.players.splice(playerIndex, 1);

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

      if (game.status === 'in_progress' && game.players.length > 0) {
        const allAnswered = game.players.every((p) => p.hasAnswered);
        if (allAnswered) {
          if (game.questionTimer) clearTimeout(game.questionTimer);
          finishQuestion(users, game);
        }
      }
    }
  }
}

export default handleDisconnect;
