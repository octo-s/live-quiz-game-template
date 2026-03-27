import { AnswerData, Game, User } from '../types';
import { WebSocket } from 'ws';
import sendMessage from '../utils/sendMessage';
import finishQuestion from './finishQuestion';

function handleAnswer(
  users: Map<string, User>,
  games: Map<string, Game>,
  wsToUser: Map<WebSocket, string>,
  ws: WebSocket,
  data: AnswerData
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

  if (game.status !== 'in_progress') {
    sendMessage(ws, 'error', {
      error: true,
      errorText: 'Game not in progress',
    });
    return;
  }

  if (data.questionIndex !== game.currentQuestion) {
    sendMessage(ws, 'error', {
      error: true,
      errorText: 'Wrong question index',
    });
    return;
  }

  const player = game.players.find((p) => p.index === userIndex);
  if (!player) {
    sendMessage(ws, 'error', { error: true, errorText: 'Not in this game' });
    return;
  }

  if (player.hasAnswered) {
    sendMessage(ws, 'error', { error: true, errorText: 'Already answered' });
    return;
  }

  player.hasAnswered = true;
  player.answerTime = Date.now();

  game.playerAnswers.set(userIndex, {
    answerIndex: data.answerIndex,
    timestamp: Date.now(),
  });

  sendMessage(ws, 'answer_accepted', {
    questionIndex: data.questionIndex,
  });

  const allAnswered = game.players.every((p) => p.hasAnswered);
  if (allAnswered) {
    if (game.questionTimer) clearTimeout(game.questionTimer);
    finishQuestion(users, game);
  }
}
export default handleAnswer;
