const WebSocket = require("ws");
const { handleMessage } = require("./wsHandler");

const wss = new WebSocket.Server({ port: 8080 });
const clients = new Map(); // userId → ws connection

wss.on("connection", (ws) => {
  console.log(`!!!! NEW CLIENT !!!!`);

  ws.on("message", (data) => {
    const msg = JSON.parse(data);
    handleMessage(ws, msg, clients);
  });

  ws.on("close", () => {
    let username = null;
    // Remove from clients map on disconnect
    clients.forEach((value, key) => {
      if (value === ws) {
        username = key;
        clients.delete(key);
      }
    });
    if (ws.isLogout) {
      console.log(`[LOGOUT] ${username}`);
    } else {
      console.log(`[DISCONNECT] ${username}`);
    }
  });

  ws.on("error", (err) => console.error("WS Error:", err));
});

console.log("Server running on ws://localhost:8080");
