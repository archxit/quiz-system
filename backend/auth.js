const bcrypt = require("bcrypt");
const db = require("../database/db");

const SALT_ROUNDS = 10;

async function register(username, password) {
  // Check if username already taken
  const existing = await db.getUser(username);
  if (existing) {
    return { success: false, message: "Username already taken" };
  }

  // Hash password and store
  const hash = await bcrypt.hash(password, SALT_ROUNDS);
  await db.createUser(username, hash);

  return { success: true, message: "Registered successfully" };
}

async function login(username, password) {
  const user = await db.getUser(username);
  if (!user) {
    return { success: false, message: "User not found" };
  }

  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) {
    return { success: false, message: "Incorrect password" };
  }

  return { success: true, userId: user.id, username: user.username };
}

module.exports = { register, login };