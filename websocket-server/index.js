// websocket-server/index.js

const WebSocket = require('ws');
const { v4: uuidv4 } = require('uuid');
const { generateCircles, updateCircles, sendCirclePositions } = require('./circleMotion');

const PORT = 8080;
const wss = new WebSocket.Server({ port: PORT });
const clientWidths = new Map();
const clients = new Map();
const isOpen = (ws) => ws.readyState === WebSocket.OPEN;
let updatesIntervalId = null;

generateCircles(getTotalWidth(clientWidths));

wss.on('connection', (ws) => {
  const clientId = uuidv4();
  clients.set(ws, clientId);
  console.log(`Client ${clientId} connected`);

  ws.on('message', (message) => {
    const msg = JSON.parse(message);
    if (msg.type === 'windowInfo') {
      clientWidths.set(clientId, msg.data.innerWidth);
      if (!updatesIntervalId) {
        startCircleUpdatesAndTransmissions();
      }
    }
  });

  ws.on('close', () => {
    console.log(`Client ${clientId} disconnected`);
    clientWidths.delete(clientId);
    clients.delete(ws);
    if (clients.size === 0) {
      clearInterval(updatesIntervalId);
      updatesIntervalId = null;
    }
  });
});

function getTotalWidth(clientWidths) {
  return Array.from(clientWidths.values()).reduce((acc, width) => acc + width, 0);
}

function startCircleUpdatesAndTransmissions() {
  if (updatesIntervalId !== null) {
    clearInterval(updatesIntervalId);
  }
  updatesIntervalId = setInterval(() => {
    updateCircles();
    sendCirclePositions(wss, isOpen, clientWidths, clients);
  }, 16);
}

startCircleUpdatesAndTransmissions();

console.log(`WebSocket server started on ws://localhost:${PORT}`);
