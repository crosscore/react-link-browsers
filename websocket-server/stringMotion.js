// websocket-server/stringMotion.js

let strings = [];
let nextStringId = 0;
let fontSize = 360;
let charInterval = 150;
let currentStringIndex = 0;
const charVelocity = -18;
const charElements = "Thank you for your attention! This is the first 100 digits of pi: 3.1415926535 8979323846 2643383279 5028841971 6939937510 5820974944 5923078164 0628620899 8628034825 3421170679 ";

function setFontSize(newFontSize) {
  const scaleFactor = newFontSize / fontSize;
  fontSize = newFontSize;
  charInterval = Math.round(charInterval / scaleFactor);
  strings.forEach((char) => {
    char.fontSize = fontSize;
  });
}

function createCharacter(totalWidth, maxWidth) {
  if (currentStringIndex >= charElements.length) {
    currentStringIndex = 0;
  }
  const char = charElements[currentStringIndex++];
  const newChar = {
    id: nextStringId++,
    char: char,
    x: totalWidth + 500,
    y: 200,
    velocity: charVelocity,
    fontSize: fontSize,
  };
  strings.push(newChar);
}

let charactorsIntervalId = null;

function generateCharactors(totalWidth, maxWidth) {
  if (charactorsIntervalId !== null) {
    clearInterval(charactorsIntervalId);
  }
  charactorsIntervalId = setInterval(() => {
    createCharacter(totalWidth, maxWidth);
  }, charInterval);
  return charactorsIntervalId;
}

function updateCharactorPositions() {
  strings.forEach((char) => {
    char.x += char.velocity;
  });
  strings = strings.filter((char) => char.x + fontSize >= 0);
}

function getTotalWidthUpToClientId(clientWidths, clientId) {
  let width = 0;
  for (let [id, clientWidth] of clientWidths) {
    if (id === clientId) break;
    width += clientWidth;
  }
  return width;
}

function sendCharactorPositions(wss, isOpen, clients, clientWidths, maxWidth) {
  wss.clients.forEach((client) => {
    const clientId = clients.get(client);
    if (!clientId || !clientWidths.has(clientId) || !isOpen(client)) return;

    const clientWidth = clientWidths.get(clientId);
    const adjustedWidth = getTotalWidthUpToClientId(clientWidths, clientId);

    strings.forEach((charElement) => {
      const adjustedX = charElement.x - adjustedWidth;

      if (adjustedX + charElement.fontSize > 0 && adjustedX < clientWidth) {
        client.send(JSON.stringify({
          type: "updateCharactor",
          data: { id: charElement.id, char: charElement.char, x: adjustedX, y: charElement.y, clientId: clientId, fontSize: charElement.fontSize },
        }));
      }
    });
  });
}

module.exports = {
  generateCharactors,
  updateCharactorPositions,
  sendCharactorPositions,
  setFontSize,
};
