// websocket-server/stringMotion.js

let piDigits = [];
let nextPiDigitId = 0;
let fontSize = 360;
const digitVelocity = 6;

const piString = "Thank you for your attention! This is the first 100 digits of pi: 3.1415926535 8979323846 2643383279 5028841971 6939937510 5820974944 5923078164 0628620899 8628034825 3421170679 ";
let currentStringIndex = 0;

function setFontSize(newFontSize) {
  fontSize = newFontSize;
}

function createCharacter() {
  if (currentStringIndex >= piString.length) {
    currentStringIndex = 0;
  }
  const digit = piString[currentStringIndex++];
  const newDigit = {
    id: nextPiDigitId++,
    digit: digit,
    x: -fontSize,
    y: 200,
    velocity: digitVelocity,
  };
  piDigits.push(newDigit);
}

function generateCharactors(interval = 500) {
  setInterval(() => {
    createCharacter();
  }, interval);
}

function updateCharactorPositions(totalWidth) {
  piDigits.forEach((digit) => {
    digit.x += digit.velocity;
  });
  piDigits = piDigits.filter((digit) => digit.x <= totalWidth + fontSize);
}

function sendCharactorPositions(wss, isOpen, clientWidths, clients) {
  let cumulativeWidth = 0;
  wss.clients.forEach((client) => {
    const clientId = clients.get(client);
    if (!clientId || !clientWidths.has(clientId) || !isOpen(client)) return;
    const clientWidth = clientWidths.get(clientId);
    piDigits.forEach((digit) => {
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
