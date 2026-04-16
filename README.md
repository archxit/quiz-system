# 🚀 Real-Time Quiz System

A **full-stack real-time quiz application** built using **Node.js, WebSockets, and MySQL** with secure authentication and live leaderboard updates.

---

## 🎯 Features

✅ Real-time quiz using WebSockets
✅ Multi-user support (simultaneous players)
✅ Live leaderboard updates
✅ Secure authentication (bcrypt hashing)
✅ MySQL database integration
✅ Progress tracking (based on correct answers)
✅ Login / Register / Logout system

---

## 🛠️ Tech Stack

| Layer    | Technology                |
| -------- | ------------------------- |
| Backend  | Node.js, WebSocket (`ws`) |
| Database | MySQL                     |
| Frontend | HTML, CSS, JavaScript     |
| Security | bcrypt                    |

---

## 📁 Project Structure

```
quiz-system/
│
├── backend/
│   ├── server.js
│   ├── wsHandler.js
│   ├── quizLogic.js
│   ├── auth.js
│
├── database/
│   ├── db.js
│
├── frontend/
│   ├── index.html
│   ├── quiz.html
│   ├── js/
│   │   └── quiz.js
│   ├── css/
│   │   └── style.css
│
└── README.md
```

---

## ⚙️ Setup Instructions

### 1️⃣ Clone the Repository

```
git clone https://github.com/YOUR_USERNAME/quiz-system.git
cd quiz-system
```

---

### 2️⃣ Setup MySQL Database

Open MySQL and run:

```sql
CREATE DATABASE quiz_app;
USE quiz_app;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE,
  password_hash VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE questions (
  id INT PRIMARY KEY,
  question_text TEXT,
  option_a TEXT,
  option_b TEXT,
  option_c TEXT,
  option_d TEXT,
  correct_option CHAR(1)
);

CREATE TABLE scores (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  question_id INT,
  score INT,
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

---

### 3️⃣ Insert Sample Questions

```sql
INSERT INTO questions VALUES
(1, 'What system call converts socket to active?', 'connect()', 'listen()', 'accept()', 'bind()', 'c'),
(2, 'exec() system call does?', 'Creates process', 'Replaces process', 'Duplicates FD', 'Stops kernel', 'b'),
(3, 'close() socket behavior?', 'Discards data', 'Sends queued data', 'Stops OS', 'Stops TCP', 'b'),
(4, 'Which exec searches PATH?', 'execl()', 'execv()', 'execlp()', 'execve()', 'c'),
(5, 'Get assigned port after bind(0)?', 'getpeername()', 'getsockname()', 'inet_ntoa()', 'recvfrom()', 'b');
```

---

### 4️⃣ Configure Database Connection

📍 `database/db.js`

Update:

```js
password: "your_password"
```

---

### 5️⃣ Install Dependencies

```
cd backend
npm install
```

---

### 6️⃣ Run Backend Server

```
node server.js
```

✔ Expected output:

```
Server running on ws://localhost:8080
```

---

### 7️⃣ Run Frontend

Open:

```
frontend/index.html
```

---

## 🎮 How to Use

### 🔐 Register

* Go to **Register tab**
* Enter username + password
* Click Register

### 🔑 Login

* Switch to Login tab
* Enter credentials
* Click Login

### 🧠 Play Quiz

* Answer questions
* Score updates in real-time

### 🏆 Leaderboard

* Updates instantly across all users

### 🚪 Logout

* Click logout button to switch user

---

## 🔄 System Flow

```
Register → Login → WebSocket AUTH → Receive Question → Answer → Score Update → Leaderboard Broadcast
```

---

## 📊 Key Concepts Used

* WebSocket persistent connection
* Event-driven architecture (Node.js)
* TCP-based communication
* Real-time data synchronization
* Password hashing using bcrypt

---

## ⚠️ Known Limitations

* No session tokens (uses localStorage)
* No reconnection handling
* No timer (optional enhancement)

---

## 🚀 Future Improvements

* ⏱️ Add timer per question
* 🔐 JWT authentication
* 📱 Mobile responsive UI
* 🔄 Auto-reconnect WebSocket
* 🚫 Prevent multiple answers

---

## 👨‍💻 Author

**Your Name**

---

## ⭐ If you like this project

Give it a ⭐ on GitHub!
