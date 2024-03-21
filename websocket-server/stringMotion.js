// websocket-server/stringMotion.js

let strings = [];
let nextStringId = 0;
let fontSize = 360;
const digitVelocity = -18;

const piString = "Thank you for your attention! This is the first 100 digits of pi: 3.1415926535 8979323846 2643383279 5028841971 6939937510 5820974944 5923078164 0628620899 8628034825 3421170679 ";
let currentStringIndex = 0;

function setFontSize(newFontSize) {
  fontSize = newFontSize;
  strings.forEach((digit) => {
    digit.fontSize = fontSize;
  });
}

function createCharacter(totalWidth, maxWidth) {
  if (currentStringIndex >= piString.length) {
    currentStringIndex = 0;
  }
  const digit = piString[currentStringIndex++];
  const newDigit = {
    id: nextStringId++,
    digit: digit,
    x: totalWidth + 500,
    y: 200,
    velocity: digitVelocity,
    fontSize: fontSize,
  };
  strings.push(newDigit);
}

let charactorsIntervalId = null;

function generateCharactors(totalWidth, maxWidth, interval = 150) {
  if (charactorsIntervalId !== null) {
    clearInterval(charactorsIntervalId);
  }
  charactorsIntervalId = setInterval(() => {
    createCharacter(totalWidth, maxWidth);
  }, interval);
  return charactorsIntervalId;
}

function updateCharactorPositions() {
  strings.forEach((digit) => {
    digit.x += digit.velocity;
  });
  strings = strings.filter((digit) => digit.x + fontSize >= 0);
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

    strings.forEach((digit) => {
      const adjustedX = digit.x - adjustedWidth;

      if (adjustedX + digit.fontSize > 0 && adjustedX < clientWidth) {
        client.send(JSON.stringify({
          type: "updateCharactor",
          data: { id: digit.id, digit: digit.digit, x: adjustedX, y: digit.y, clientId: clientId, fontSize: digit.fontSize },
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
