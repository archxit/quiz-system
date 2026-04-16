const TYPES = require("../shared/messageTypes");
const {
  getFirstQuestion,
  checkAnswer,
  isLastQuestion,
  getNextQuestion,
} = require("./quizLogic");
const db = require("../database/db");
const { register, login } = require("./auth");

async function handleMessage(ws, msg, clients) {
  switch (msg.type) {
    case TYPES.REGISTER: {
      if (!msg.username || !msg.password) {
        ws.send(
          JSON.stringify({
            type: TYPES.AUTH_ERROR,
            message: "Username and password required",
          }),
        );
        return;
      }
      const result = await register(msg.username, msg.password);
      if (!result.success) {
        ws.send(
          JSON.stringify({ type: TYPES.AUTH_ERROR, message: result.message }),
        );
        return;
      }
      ws.send(
        JSON.stringify({
          type: TYPES.REGISTER_SUCCESS,
          message: result.message,
        }),
      );
      break;
    }

    case TYPES.AUTH: {
      if (!msg.username || !msg.password) {
        ws.send(
          JSON.stringify({
            type: TYPES.AUTH_ERROR,
            message: "Username and password required",
          }),
        );
        return;
      }

      const result = await login(msg.username, msg.password);
      if (!result.success) {
        ws.send(
          JSON.stringify({ type: TYPES.AUTH_ERROR, message: result.message }),
        );
        return;
      }

      // Store on WS connection
      ws.userId = result.userId;
      ws.username = result.username;
      clients.set(result.username, ws);
      console.log(`[LOGGED IN] ${result.username}`);

      const firstQuestion = await db.getFirstQuestion();
      ws.send(JSON.stringify({ type: TYPES.QUESTION, ...firstQuestion }));

      const leaderboard = await db.getLeaderboard();
      broadcastLeaderboard(clients, leaderboard);
      break;
    }

    case TYPES.ANSWER: {
      // Edge case — must be authenticated first
      if (!ws.userId) {
        ws.send(
          JSON.stringify({
            type: TYPES.AUTH_ERROR,
            message: "Not authenticated",
          }),
        );
        return;
      }

      // Edge case — invalid questionId
      if (!msg.questionId || !msg.answer) return;

      const correct = await checkAnswer(msg.questionId, msg.answer);
      if (correct === null) return; // question not found

      if (correct) {
        await db.saveScore(ws.userId, msg.questionId, 10);
      }

      const finished = await isLastQuestion(msg.questionId);
      const nextQ = await getNextQuestion(msg.questionId);

      // Send score update
      const leaderboard = await db.getLeaderboard();

      const userRow = leaderboard.find((r) => r.username === ws.username);

      const totalScore = userRow ? userRow.totalScore : 0;

      ws.send(
        JSON.stringify({
          type: TYPES.SCORE_UPDATE,
          correct,
          totalScore,
          selectedAnswer: msg.answer,
          quizFinished: finished,
        }),
      );
      // Broadcast leaderboard
      broadcastLeaderboard(clients, leaderboard);

      // Send next question after delay
      if (nextQ) {
        setTimeout(() => {
          ws.send(JSON.stringify({ type: TYPES.QUESTION, ...nextQ }));
        }, 2000);
      }
      break;
    }

    case "LOGOUT": {
      ws.isLogout = true;
      ws.close();
      break;
    }

    case TYPES.GET_TOTAL_QUESTIONS: {
      const total = await db.getTotalQuestions();
      ws.send(JSON.stringify({ type: TYPES.TOTAL_QUESTIONS, total }));
      break;
    }

    default:
      console.log("Unknown message type:", msg.type);
  }
}

function broadcastLeaderboard(clients, leaderboard) {
  const rankings = leaderboard.map((row, i) => ({
    rank: i + 1,
    username: row.username,
    score: row.totalScore,
  }));

  const payload = JSON.stringify({
    type: "LEADERBOARD_UPDATE",
    data: rankings,
  });

  clients.forEach((client) => {
    if (client.readyState === 1) {
      client.send(payload);
    }
  });
}

module.exports = { handleMessage };
