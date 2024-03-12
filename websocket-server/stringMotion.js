// websocket-server/stringMotion.js

const { getTotalWidth } = require('./utils');

let piDigits = [];
let nextPiDigitId = 0;
const digitWidth = 20;
const digitVelocity = 3;

function generatePiDigits() {
  const piString = Math.PI.toString().replace(".", "");
  for (let i = 0; i < 50; i++) {
    const digit = i < piString.length ? piString[i] : Math.floor(Math.random() * 10).toString();
    piDigits.push({
      id: nextPiDigitId++,
      digit,
      x: -digitWidth - i * digitWidth,
      y: 200,
      velocity: digitVelocity,
    });
  }
}

function updatePiDigitsPosition(totalWidth) {
  piDigits.forEach((digit) => {
    digit.x += digit.velocity;
    if (digit.x > totalWidth) {
      digit.x = -digitWidth;
    }
  });
}

function sendPiDigitPositions(wss, isOpen, clientWidths, clients) {
  const totalWidth = getTotalWidth(clientWidths);
  wss.clients.forEach((ws) => {
    if (!isOpen(ws)) return;

    const clientId = clients.get(ws);
    if (!clientId) return;

    const clientWidth = clientWidths.get(clientId);
    if (!clientWidth) return;

    piDigits.forEach((digit) => {
      let adjustedX = digit.x % totalWidth; // 全クライアントの幅に対してモジュロを取る
      if (adjustedX + digitWidth > 0 && adjustedX - digitWidth < clientWidth) {
        ws.send(JSON.stringify({
          type: "updatePiDigit",
          data: {id: digit.id, digit: digit.digit, x: adjustedX, y: digit.y},
        }));
      }
    });
  });
}


module.exports = {
  generatePiDigits,
  updatePiDigitsPosition,
  sendPiDigitPositions,
};
