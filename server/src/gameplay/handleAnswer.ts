import { AnswerData, Game, User } from '../types';
import { WebSocket } from 'ws';
import sendMessage from '../utils/sendMessage';
import finishQuestion from './finishQuestion';
import sendErrorMessage from '../utils/sendErrorMessage';

interface handleAnswerParams {
  ws: WebSocket;
  users: Map<string, User>;
  games: Map<string, Game>;
  wsToUser: Map<WebSocket, string>;
  data: AnswerData;
}

function handleAnswer({
  ws,
  users,
  games,
  wsToUser,
  data,
}: handleAnswerParams): void {
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

  if (game.status !== 'in_progress') {
    sendErrorMessage(ws, 'Game not in progress');
  }

  if (data.questionIndex !== game.currentQuestion) {
    sendErrorMessage(ws, 'Game not found');
  }

  const player = game.players.find((p) => p.index === userIndex);
  if (!player) {
    sendErrorMessage(ws, 'Not in this game');
    return;
  }

  if (player.hasAnswered) {
    sendErrorMessage(ws, 'Not in this game');
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
