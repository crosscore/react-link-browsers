// websocket-server/index.js
const WebSocket = require("ws");
const { v4: uuidv4 } = require("uuid");
const {
  createCircle,
  updateCircles,
  sendCirclePositions,
  removeOldCircles,
} = require("./circleMotion");

const PORT = 8080;
const CREATE_CIRCLE_INTERVAL = 500;
const UPDATE_CIRCLE_POSITION_INTERVAL = 9;
const REMOVE_OLD_CIRCLES_INTERVAL = 1000;

const wss = new WebSocket.Server({ port: PORT });
const clientWindowInfo = new Map();
const clientIDs = new Map();

const isOpen = (ws) => ws.readyState === WebSocket.OPEN;

function updateCirclePositions() {
  updateCircles();
  sendCirclePositions(wss, clientWindowInfo, isOpen);
}

setInterval(updateCirclePositions, UPDATE_CIRCLE_POSITION_INTERVAL);
setInterval(removeOldCircles, REMOVE_OLD_CIRCLES_INTERVAL);

setInterval(() => {
  wss.clients.forEach((client) => {
    if (isOpen(client)) {
      const windowInfo = clientWindowInfo.get(client);
      if (windowInfo && windowInfo.width > 0) {
        console.log(`create circle: ${windowInfo.width}`)
        createCircle(windowInfo);
      }
    }
  });
}, CREATE_CIRCLE_INTERVAL);

const clientWindowWidths = new Map();

wss.on("connection", (ws) => {
  const clientID = uuidv4();
  clientIDs.set(ws, clientID);
  ws.on("message", (message) => {
    const msg = JSON.parse(message);
    if (msg.type === "windowInfo") {
      const { innerWidth } = msg.data;
      clientWindowWidths.set(ws, innerWidth);
      let totalWidth = Array.from(clientWindowWidths.values()).reduce((acc, width, index, arr) => acc + (index < arr.length - 1 ? width : 0), 0);
      clientWindowInfo.set(ws, { x: totalWidth, width: innerWidth });
    }
  });


  clientWindowInfo.set(ws, { x: 0, width: 0 });

  ws.on("close", () => {
    clientWindowWidths.delete(ws);
    clientWindowInfo.delete(ws);
    clientIDs.delete(ws);
  });
});
