// websocket-server/stringMotion.js

let strings = [];
let nextStringId = 0;
let fontSize = 360;
const digitVelocity = -10;

const piString = "Thank you for your attention! "// This is the first 100 digits of pi: 3.1415926535 8979323846 2643383279 5028841971 6939937510 5820974944 5923078164 0628620899 8628034825 3421170679 ";
let currentStringIndex = 0;

function setFontSize(newFontSize) {
  fontSize = newFontSize;
}

function createCharacter(totalWidth, maxWidth) {
  if (currentStringIndex >= piString.length) {
    currentStringIndex = 0;
  }
  const digit = piString[currentStringIndex++];
  const newDigit = {
    id: nextStringId++,
    digit: digit,
    x: totalWidth + fontSize + maxWidth,
    y: 200,
    velocity: digitVelocity,
  };
  strings.push(newDigit);
}

function generateCharactors(totalWidth, maxWidth, interval = 300) {
  setInterval(() => {
    createCharacter(totalWidth, maxWidth);
  }, interval);
}

function updateCharactorPositions() {
  strings.forEach((digit) => {
    digit.x += digit.velocity;
  });
  strings = strings.filter((digit) => digit.x + fontSize >= 0);
}

function sendCharactorPositions(wss, isOpen, clients, clientWidths) {
  let cumulativeWidth = 0;
  wss.clients.forEach((client) => {
    const clientId = clients.get(client);
    if (!clientId || !clientWidths.has(clientId) || !isOpen(client)) return;
    const clientWidth = clientWidths.get(clientId);
    strings.forEach((digit) => {
      const adjustedX = digit.x - cumulativeWidth;
      if (adjustedX + fontSize > 0 && adjustedX < clientWidth) {
        client.send(JSON.stringify({
          type: "updateCharactor",
          data: {
            id: digit.id,
            digit: digit.digit,
            x: adjustedX,
            y: digit.y,
          },
        }));
      }
    });
    cumulativeWidth += clientWidth;
  });
}

module.exports = {
  generateCharactors,
  updateCharactorPositions,
  sendCharactorPositions,
  setFontSize,
};
