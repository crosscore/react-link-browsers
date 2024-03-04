// websocket-server/index.js
const WebSocket = require('ws');
const { v4: uuidv4 } = require('uuid');
const { createCircle, updateCircles, sendCirclePositions } = require('./circleMotion');

const PORT = 8080;
const wss = new WebSocket.Server({ port: PORT });
const clientWidths = new Map();
const clients = new Map();

const isOpen = (ws) => ws.readyState === WebSocket.OPEN;

wss.on('connection', (ws) => {
  const clientId = uuidv4();
  clients.set(ws, clientId); // associates the client with the client ID
  console.log(`Client ${clientId} connected`);

  ws.on('message', (message) => {
    const msg = JSON.parse(message);
    if (msg.type === 'windowInfo') {
      clientWidths.set(clientId, msg.data.innerWidth);
    }
  });

  ws.on('close', () => {
    console.log(`Client ${clientId} disconnected`);
    clientWidths.delete(clientId);
    clients.delete(ws);
  });
});

const updateAndSendCirclePositions = () => {
  updateCircles();
  sendCirclePositions(wss, isOpen, clientWidths, clients);
};

setInterval(updateAndSendCirclePositions, 16);
setInterval(() => createCircle(clientWidths), 5000);

console.log(`WebSocket server started on ws://localhost:${PORT}`);
