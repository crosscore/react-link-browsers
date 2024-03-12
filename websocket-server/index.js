// websocket-server/index.js

const WebSocket = require('ws');
const { v4: uuidv4 } = require('uuid');
const { generateCircles, updateCircles, sendCirclePositions } = require('./circleMotion');
const { generatePiDigits, updatePiDigitsPosition, sendPiDigitPositions } = require('./stringMotion');

const PORT = 8080;
const wss = new WebSocket.Server({ port: PORT });
const clientWidths = new Map();
const clients = new Map();
const isOpen = (ws) => ws.readyState === WebSocket.OPEN;
let updatesIntervalId = null;

generateCircles(getTotalWidth(clientWidths));
generatePiDigits();

wss.on('connection', (ws) => {
  const clientId = uuidv4();
  console.log(`Client ${clientId} connected`);
  ws.on('message', (message) => {
    const msg = JSON.parse(message);
    if (msg.type === 'windowInfo') {
      const clientWidth = parseInt(msg.data.innerWidth, 10);
      if (clientWidth > 0) {
        clientWidths.set(clientId, clientWidth);
        clients.set(ws, clientId);
        console.log(`Client ${clientId} width set to ${clientWidth}`);
      } else {
        console.log(`Client ${clientId} has invalid width ${clientWidth}, ignoring this client.`);
      }
    }
  });

  ws.on('close', () => {
    console.log(`Client ${clientId} disconnected`);
    clients.delete(ws);
    clientWidths.delete(clientId);
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
    updatePiDigitsPosition(clientWidths);
    sendPiDigitPositions(wss, isOpen, clientWidths, clients);
  }, 16);
}

startCircleUpdatesAndTransmissions();

console.log(`WebSocket server started on ws://localhost:${PORT}`);
