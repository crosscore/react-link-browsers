// websocket-server/stringMotion.js

let piDigits = [];
let nextPiDigitId = 0;
const digitWidth = 10;
const digitVelocity = 6;

const piString = "Thank you for your attention! This is the first 100 digits of pi: 3.1415926535 8979323846 2643383279 5028841971 6939937510 5820974944 5923078164 0628620899 8628034825 3421170679 ";
let currentStringIndex = 0;

function createPiDigit() {
  if (currentStringIndex >= piString.length) {
    currentStringIndex = 0; // loop back to the beginning
  }
  const digit = piString[currentStringIndex++];
  const newDigit = {
    id: nextPiDigitId++,
    digit: digit,
    x: -digitWidth,
    y: 300,
    velocity: digitVelocity,
  };
  piDigits.push(newDigit);
}

function generatePiDigits(interval = 200) {
  setInterval(() => {
    createPiDigit();
  }, interval);
}

function updatePiDigitsPosition(totalWidth) {
  piDigits.forEach((digit) => {
    digit.x += digit.velocity;
  });
  piDigits = piDigits.filter(digit => digit.x <= totalWidth + digitWidth);
}


function sendPiDigitPositions(wss, isOpen, clientWidths, clients) {
  let cumulativeWidth = 0;
  wss.clients.forEach((client) => {
    const clientId = clients.get(client);
    if (!clientId || !clientWidths.has(clientId) || !isOpen(client)) return;
    const clientWidth = clientWidths.get(clientId);
    piDigits.forEach((digit) => {
      if (digit.x + digitWidth > cumulativeWidth && digit.x < cumulativeWidth + clientWidth) {
        client.send(JSON.stringify({
          type: "updatePiDigit",
          data: {
            id: digit.id,
            digit: digit.digit,
            x: digit.x - cumulativeWidth,
            y: digit.y,
          },
        }));
      }
    });
    cumulativeWidth += clientWidth;
  });
}

module.exports = {
  generatePiDigits,
  updatePiDigitsPosition,
  sendPiDigitPositions,
};

