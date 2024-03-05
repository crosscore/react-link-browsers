// websocket-server/index.js
const WebSocket = require("ws");
const { v4: uuidv4 } = require("uuid");
const { createCircle, updateCircles, sendCirclePositions} = require("./circleMotion");

const PORT = 8080;
const wss = new WebSocket.Server({ port: PORT });
const clientWidths = new Map();
const clients = new Map();

const isOpen = (ws) => ws.readyState === WebSocket.OPEN;
let circleUpdatesStarted = false;

wss.on("connection", (ws) => {
  const clientId = uuidv4();
  clients.set(ws, clientId);
  console.log(`Client ${clientId} connected`);

  ws.on("message", (message) => {
    const msg = JSON.parse(message);
    if (msg.type === "windowInfo") {
      clientWidths.set(clientId, msg.data.innerWidth);
      if (!circleUpdatesStarted) {
        circleUpdatesStarted = true;
        startCircleUpdatesAndTransmissions();
      }
    }
  });

  ws.on("close", () => {
    console.log(`Client ${clientId} disconnected`);
    clientWidths.delete(clientId);
    clients.delete(ws);
  });
});

createCircle(getTotalWidth(clientWidths));

function startCircleUpdatesAndTransmissions() {
  setInterval(() => {
    updateCircles();
    sendCirclePositions(wss, isOpen, clientWidths, clients);
  }, 16);
  setInterval(() => createCircle(getTotalWidth(clientWidths)),6000);
}

function getTotalWidth(clientWidths) {
  let totalWidth = 0;
  clientWidths.forEach((width) => (totalWidth += width));
  return totalWidth;
}

startCircleUpdatesAndTransmissions();
console.log(`WebSocket server started on ws://localhost:${PORT}`);
