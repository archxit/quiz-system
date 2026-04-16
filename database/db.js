const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "root123",
  database: "quiz_app",
  waitForConnections: true,
  connectionLimit: 10,
});

// Reshapes a raw DB row → the {id, text, options, answer} shape
// that quizLogic and wsHandler already expect
function formatQuestion(row) {
  if (!row) return null;
  return {
    id: row.id,
    text: row.question_text,
    options: {
      a: row.option_a,
      b: row.option_b,
      c: row.option_c,
      d: row.option_d,
    },
    answer: row.correct_option,
  };
}

async function getUser(username) {
  const [rows] = await pool.query("SELECT * FROM users WHERE username = ?", [
    username,
  ]);
  return rows[0];
}

async function getUserById(id) {
  const [rows] = await pool.query("SELECT * FROM users WHERE id = ?", [id]);
  return rows[0];
}

async function createUser(username, password_hash) {
  await pool.query(
    "INSERT INTO users (username, password_hash) VALUES (?, ?)",
    [username, password_hash],
  );
}

async function getTotalQuestions() {
  const [rows] = await pool.query("SELECT COUNT(*) as count FROM questions");
  return rows[0].count;
}

async function getQuestion(id) {
  const [rows] = await pool.query("SELECT * FROM questions WHERE id = ?", [id]);
  return formatQuestion(rows[0]);
}

async function getFirstQuestion() {
  const [rows] = await pool.query(
    "SELECT * FROM questions ORDER BY id ASC LIMIT 1",
  );
  return formatQuestion(rows[0]);
}

// NEW — fetches the question with the lowest id that is greater than currentId
async function getNextQuestion(currentId) {
  const [rows] = await pool.query(
    "SELECT * FROM questions WHERE id > ? ORDER BY id ASC LIMIT 1",
    [currentId],
  );
  return formatQuestion(rows[0]); // returns null if no next question
}

async function saveScore(user_id, question_id, score) {
  await pool.query(
    "INSERT INTO scores (user_id, question_id, score) VALUES (?, ?, ?)",
    [user_id, question_id, score],
  );
}

async function getLeaderboard() {
  const [rows] = await pool.query(`
    SELECT u.username, SUM(s.score) AS totalScore
    FROM scores s
    JOIN users u ON s.user_id = u.id
    GROUP BY u.id, u.username
    ORDER BY totalScore DESC
  `);
  return rows;
}

module.exports = {
  getUser,
  getUserById,
  createUser,
  getQuestion,
  getFirstQuestion,
  getNextQuestion,
  saveScore,
  getLeaderboard,
  getTotalQuestions,
};
//log to console
(async () => {
  try {
    const conn = await pool.getConnection();
    console.log("Connected to quiz_app DB");
    conn.release();
  } catch (err) {
    console.error("DB connection failed:", err);
  }
})();
