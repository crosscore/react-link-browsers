// websocket-server/playerMotion.js

const { getTotalWidth } = require("./utils");
const players = new Map();
const stepSize = 10;
const playerRadius = 60;
let intervalId = null;

function initializePlayerPosition(clientWindowSize, clientID, clientWidths) {
  const totalWidth = getTotalWidth(clientWidths);
  const player = {
    x: (totalWidth - playerRadius) / 2,
    y: clientWindowSize.innerHeight / 2,
    id: clientID,
    type: "player",
  };
  players.set(clientID, player);
}

function updatePlayerPosition(
  activeKeys,
  clientID,
  clientWidths,
  clientHeight
) {
  const player = players.get(clientID);
  if (!player) return;

  const totalWidth = getTotalWidth(clientWidths);

  if (activeKeys.has("w")) player.y -= stepSize;
  if (activeKeys.has("a")) player.x -= stepSize;
  if (activeKeys.has("s")) player.y += stepSize;
  if (activeKeys.has("d")) player.x += stepSize;

  // If the player moves beyond the left edge of the total width,
  // wrap the player's position to the right edge.
  if (player.x < -playerRadius) player.x = totalWidth - playerRadius;

  // If the player moves beyond the right edge of the total width,
  // wrap the player's position to the left edge.
  if (player.x > totalWidth - playerRadius) player.x = -playerRadius;

  // Constrain the player's vertical movement within the client's height.
  // Ensure the player stays within the top and bottom boundaries,
  // taking into account the player's radius.
  player.y = Math.max(
    playerRadius,
    Math.min(player.y, clientHeight - playerRadius)
  );

  players.set(clientID, player);
}

function startUpdatingPlayerPosition(
  activeKeys,
  wss,
  clientWidths,
  clientHeights,
  isOpen,
  clientID,
  clients
) {
  if (intervalId !== null) {
    clearInterval(intervalId);
  }
  intervalId = setInterval(() => {
    const clientHeight = clientHeights.get(clientID);
    updatePlayerPosition(activeKeys, clientID, clientWidths, clientHeight);
    sendPlayerPositions(wss, clientWidths, isOpen, clients);
  }, 16);
}

function stopUpdatingPlayerPosition(clientID) {
  if (intervalId !== null) {
    clearInterval(intervalId);
    intervalId = null;
  }
}

function sendPlayerPositions(
  wss,
  clientWidths,
  isOpen,
  clients,
  cumulativeWidth = 0,
  index = 0
) {
  if (index >= clients.size) return;

  const [client, clientId] = Array.from(clients.entries())[index];

  if (!clientId || !clientWidths.has(clientId) || !isOpen(client)) {
    sendPlayerPositions(
      wss,
      clientWidths,
      isOpen,
      clients,
      cumulativeWidth + (clientWidths.get(clientId) || 0),
      index + 1
    );
    return;
  }

  const clientWidth = clientWidths.get(clientId);

  players.forEach((player) => {
    const position = {
      id: player.id,
      x: player.x - cumulativeWidth,
      y: player.y,
      visible:
        player.x + playerRadius > cumulativeWidth - playerRadius &&
        player.x - playerRadius < cumulativeWidth + clientWidth + playerRadius,
        // Send player position information if the player is within the range
        // of the current client's width, considering an additional player radius
        // on both sides. This ensures that the player is sent to the client when
        // it is fully or partially visible within the client's screen, providing
        // a smooth transition when the player moves between clients.
    };
    client.send(JSON.stringify({ type: player.type, position }));
  });

  sendPlayerPositions(
    wss,
    clientWidths,
    isOpen,
    clients,
    cumulativeWidth + clientWidth,
    index + 1
  );
}

module.exports = {
  initializePlayerPosition,
  startUpdatingPlayerPosition,
  stopUpdatingPlayerPosition,
  sendPlayerPositions,
  playerRadius,
};
