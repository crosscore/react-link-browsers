// websocket-server/index.js

const WebSocket = require('ws');
const { v4: uuidv4 } = require('uuid');
const { generateCircles, updateCircles, sendCirclePositions } = require('./circleMotion');
const { generateCharactors, updateCharactorPositions, sendCharactorPositions, setFontSize } = require('./stringMotion');
const { getTotalWidth, getMaxWidth } = require('./utils');

const PORT = 8080;
const wss = new WebSocket.Server({ port: PORT });
const clientWidths = new Map();
const clients = new Map();
const isOpen = (ws) => ws.readyState === WebSocket.OPEN;
const initialFontSize = 360;
let updatesIntervalId = null;

setFontSize(initialFontSize);
generateCircles(getTotalWidth(clientWidths));

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
        if (clients.size === 1) { // only start updates and transmissions when the first client connects
          const totalWidth = getTotalWidth(clientWidths);
          const maxWidth = getMaxWidth(clientWidths);
          generateCharactors(totalWidth, maxWidth);
        }
      } else {
        console.log(`Client ${clientId} has invalid width ${clientWidth}, ignoring this client.`);
      }
    }
  });

  ws.send(JSON.stringify({ type: "fontSize", fontSize: initialFontSize }));

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

function startUpdatesAndTransmissions() {
  if (updatesIntervalId !== null) {
    clearInterval(updatesIntervalId);
  }
  updatesIntervalId = setInterval(() => {
    updateCircles();
    sendCirclePositions(wss, isOpen, clientWidths, clients);
    const maxWidth = getMaxWidth(clientWidths);
    updateCharactorPositions();
    sendCharactorPositions(wss, isOpen, clients, clientWidths, maxWidth);
  }, 16);
}

startUpdatesAndTransmissions();

console.log(`WebSocket server started on ws://localhost:${PORT}`);
