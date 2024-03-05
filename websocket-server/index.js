// websocket-server/index.js
const WebSocket = require('ws');
const { v4: uuidv4 } = require('uuid');
const { createCircle, updateCircles, sendCirclePositions, isCirclePresent } = require('./circleMotion');

const PORT = 8080;
const wss = new WebSocket.Server({ port: PORT });
const clientWidths = new Map();
const clients = new Map();
const isOpen = (ws) => ws.readyState === WebSocket.OPEN;
let updatesIntervalId = null;

wss.on('connection', (ws) => {
  const clientId = uuidv4();
  clients.set(ws, clientId);
  console.log(`Client ${clientId} connected`);

  ws.on('message', (message) => {
    const msg = JSON.parse(message);
    if (msg.type === 'windowInfo') {
      clientWidths.set(clientId, msg.data.innerWidth);
      if (!updatesIntervalId) {
        createCircle(getTotalWidth(clientWidths));
        startCircleUpdatesAndTransmissions();
      }
      console.log('clientWidths', clientWidths);
    }
  });

  ws.on('close', () => {
    console.log(`Client ${clientId} disconnected`);
    clientWidths.delete(clientId);
    clients.delete(ws);
  });
});

function getTotalWidth(clientWidths) {
  return Array.from(clientWidths.values()).reduce((acc, width) => acc + width, 0);
}

function startCircleUpdatesAndTransmissions() {
  updatesIntervalId = setInterval(() => {
    updateCircles();
    sendCirclePositions(wss, isOpen, clientWidths, clients);
    if (!isCirclePresent()) {
      createCircle(getTotalWidth(clientWidths));
    }
  }, 16);
}

console.log(`WebSocket server started on ws://localhost:${PORT}`);
