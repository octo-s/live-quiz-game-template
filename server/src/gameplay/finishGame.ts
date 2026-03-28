import { Game, User } from '../types';
import broadcast from '../utils/broadcast';

function finishGame(users: Map<string, User>, game: Game): void {
  game.status = 'finished';

  const sorted = [...game.players].sort((a, b) => b.score - a.score);

  const scoreboard = sorted.map((player, index) => ({
    name: player.name,
    score: player.score,
    rank: index + 1,
  }));

  broadcast(users, game, 'game_finished', { scoreboard });
}

export default finishGame;
