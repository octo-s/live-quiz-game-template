import { Game, User } from '../types';
import broadcast from '../utils/broadcast';

function finishQuestion(users: Map<string, User>, game: Game): void {
  const question = game.questions[game.currentQuestion];
  const BASE_POINTS = 1000;

  const playerResults = game.players.map((player) => {
    const answer = game.playerAnswers.get(player.index);
    let pointsEarned = 0;
    let correct = false;
    let answered = false;

    if (answer) {
      answered = true;
      if (answer.answerIndex === question.correctIndex) {
        correct = true;
        const timeSpent =
          (answer.timestamp - (game.questionStartTime || 0)) / 1000;
        const timeRemaining = Math.max(0, question.timeLimitSec - timeSpent);
        pointsEarned = Math.round(
          BASE_POINTS * (timeRemaining / question.timeLimitSec)
        );
      }
    }

    player.score += pointsEarned;

    return {
      name: player.name,
      answered,
      correct,
      pointsEarned,
      totalScore: player.score,
    };
  });

  broadcast(users, game, 'question_result', {
    questionIndex: game.currentQuestion,
    correctIndex: question.correctIndex,
    playerResults,
  });
}

export default finishQuestion;
