import { Game, type User } from '../types';
import sendMessage from './sendMessage';

function broadcast(
  users: Map<string, User>,
  game: Game,
  type: string,
  data: any
): void {
  const hostUser = [...users.values()].find((u) => u.index === game.hostId);
  if (hostUser?.ws) sendMessage(hostUser.ws, type, data);

  for (const player of game.players) {
    if (player.ws) sendMessage(player.ws, type, data);
  }
}

export default broadcast;
