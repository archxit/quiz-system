const db = require("../database/db");   // adjust path if needed

async function getQuestion(id) {
  return db.getQuestion(id);
}

async function getFirstQuestion() {
  return db.getFirstQuestion();
}

// answer is 'a'|'b'|'c'|'d', fetches question and compares
async function checkAnswer(questionId, answer) {
  const question = await db.getQuestion(questionId);
  if (!question) return null;
  return question.answer === answer;
}

// Returns true when there is no question after this one
async function isLastQuestion(questionId) {
  const next = await db.getNextQuestion(questionId);
  return next === null;
}

async function getNextQuestion(questionId) {
  return db.getNextQuestion(questionId);
}

module.exports = {
  getQuestion,
  getFirstQuestion,
  checkAnswer,
  isLastQuestion,
  getNextQuestion,
};