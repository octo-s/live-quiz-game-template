import broadcast from '../utils/broadcast';
import { Game, User } from '../types';
import finishQuestion from './finishQuestion';
import finishGame from './finishGame';

function sendQuestion(users: Map<string, User>, game: Game): void {
  const question = game.questions[game.currentQuestion];

  game.playerAnswers = new Map();
  game.questionStartTime = Date.now();

  for (const player of game.players) {
    player.hasAnswered = false;
    player.answeredCorrectly = false;
    player.answerTime = undefined;
  }

  broadcast(users, game, 'question', {
    questionNumber: game.currentQuestion + 1,
    totalQuestions: game.questions.length,
    text: question.text,
    options: question.options,
    timeLimitSec: question.timeLimitSec,
  });

  game.questionTimer = setTimeout(() => {
    finishQuestion(users, game);

    game.currentQuestion++;

    if (game.currentQuestion < game.questions.length) {
      setTimeout(() => sendQuestion(users, game), 3000);
    } else {
      finishGame(users, game);
    }
  }, question.timeLimitSec * 1000);
}

export default sendQuestion;
