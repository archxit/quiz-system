const socket = new WebSocket("ws://localhost:8080");
let currentQuestionId = null;
let optionsDiv = document.getElementById("options");
let questionIndex = 0;
let TOTAL_QUESTIONS = 10;
let correctAnswers = 0;

socket.onopen = () => {
  // Authenticate (hardcoded for now, replace with real username later)
  const username = localStorage.getItem("username") || "guest";
  const password = localStorage.getItem("password") || "";
  socket.send(JSON.stringify({ type: "AUTH", username, password }));
  socket.send(JSON.stringify({ type: "GET_TOTAL_QUESTIONS" }));
  document.getElementById("profile-username").textContent = username;
  document.querySelector(".avatar").src =
    `https://ui-avatars.com/api/?name=${storedName}&background=2E75B6&color=fff&size=48`;
};

socket.onmessage = (event) => {
  const msg = JSON.parse(event.data);

  if (msg.type === "QUESTION") {
    questionIndex++;
    currentQuestionId = msg.id;
    document.getElementById("question-text").textContent = msg.text;

    const pct = Math.round((correctAnswers / TOTAL_QUESTIONS) * 100);

    document.getElementById("progress-percent").textContent = pct + "%";
    document.getElementById("progress-bar").style.width = pct + "%";

    optionsDiv = document.getElementById("options");
    optionsDiv.innerHTML = "";

    Object.entries(msg.options).forEach(([key, val]) => {
      const btn = document.createElement("button");
      btn.textContent = `${key.toUpperCase()}: ${val}`;
      btn.className = "option-btn";
      btn.dataset.key = key;
      btn.onclick = () => {
        socket.send(
          JSON.stringify({
            type: "ANSWER",
            questionId: currentQuestionId,
            answer: key,
          }),
        );
        optionsDiv
          .querySelectorAll("button")
          .forEach((b) => (b.disabled = true));
      };
      optionsDiv.appendChild(btn);
    });
  }

  if (msg.type === "SCORE_UPDATE") {
    document.getElementById("score").textContent = msg.totalScore;

    if (msg.correct) {
      correctAnswers++;
    }

    const buttons = optionsDiv.querySelectorAll("button");
    buttons.forEach((b) => {
      if (b.dataset.key === msg.selectedAnswer) {
        b.classList.add(msg.correct ? "correct" : "wrong");
      }
    });

    // Show finished screen if quiz is done
    if (msg.quizFinished) {
      setTimeout(() => {
        document.getElementById("question-text").style.display = "none";
        document.getElementById("options").style.display = "none";
        document.getElementById("final-score").textContent = msg.totalScore;
        document.getElementById("finished").style.display = "block";
      }, 1500); // wait 1.5 seconds so they can see correct/wrong first
    }
  }
  if (msg.type === "LEADERBOARD_UPDATE") {
    const tbody = document.getElementById("lb-body");
    tbody.innerHTML = msg.data
      .map(
        (row) =>
          `<tr><td>${row.rank}</td><td>${row.username}</td><td>${row.score}</td></tr>`,
      )
      .join("");
  }

  if (msg.type === "TOTAL_QUESTIONS") {
    TOTAL_QUESTIONS = msg.total;
  }
};

function logout() {
  // Close WebSocket connection
  if (socket && socket.readyState === 1) {
    socket.send(JSON.stringify({ type: "LOGOUT" }));
    socket.close();
  }

  // Clear stored credentials
  localStorage.removeItem("username");
  localStorage.removeItem("password");

  // Redirect to login page
  window.location.href = "index.html";
}
