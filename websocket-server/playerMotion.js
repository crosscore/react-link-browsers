// websocket-server/playerMotion.js

const { getTotalWidth } = require("./utils");
const players = new Map();

const stepSize = 10;
let intervalId = null;

function initializePlayerPosition(clientWindowSize, clientID, clientWidths) {
  const totalWidth = getTotalWidth(clientWidths);
  const player = {
    x: totalWidth / 2,
    y: clientWindowSize.innerHeight / 2,
    id: clientID,
    type: "player",
  };
  players.set(clientID, player);
}

function updatePlayerPosition(activeKeys, clientID, clientWidths) {
  const player = players.get(clientID);
  if (!player) return;

  const totalWidth = getTotalWidth(clientWidths);

  if (activeKeys.has("w")) player.y -= stepSize;
  if (activeKeys.has("a")) player.x -= stepSize;
  if (activeKeys.has("s")) player.y += stepSize;
  if (activeKeys.has("d")) player.x += stepSize;

  if (player.x < 0) player.x += totalWidth;
  if (player.x > totalWidth) player.x -= totalWidth;

  players.set(clientID, player);
}

function startUpdatingPlayerPosition(activeKeys, wss, clientWidths, isOpen, clientID, clients) {
  if (intervalId !== null) {
    clearInterval(intervalId);
  }
  intervalId = setInterval(() => {
    updatePlayerPosition(activeKeys, clientID, clientWidths);
    sendPlayerPositions(wss, clientWidths, isOpen, clients);
  }, 16);
}

function stopUpdatingPlayerPosition(clientID) {
  if (intervalId !== null) {
    clearInterval(intervalId);
    intervalId = null;
  }
}

function sendPlayerPositions(wss, clientWidths, isOpen, clients) {
  let cumulativeWidth = 0;

  for (const [client, clientId] of clients.entries()) {
    if (!clientId || !clientWidths.has(clientId) || !isOpen(client)) continue;

    const clientWidth = clientWidths.get(clientId);
    const sendPosition = (player) => {
      if (
        player.x >= cumulativeWidth &&
        player.x < cumulativeWidth + clientWidth
      ) {
        const position = {
          id: player.id,
          x: player.x - cumulativeWidth,
          y: player.y,
        };
        client.send(JSON.stringify({ type: player.type, position }));
      }
    };

    players.forEach(sendPosition);
    cumulativeWidth += clientWidth;
  }
}

module.exports = {
  initializePlayerPosition,
  startUpdatingPlayerPosition,
  stopUpdatingPlayerPosition,
  sendPlayerPositions,
};