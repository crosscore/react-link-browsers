// websocket-server/stringMotion.js

// websocket-server/stringMotion.js

const { getTotalWidth } = require('./utils');

let piDigits = [];
let nextPiDigitId = 0;
const digitWidth = 20;
const digitVelocity = 3;

function generatePiDigits() {
  const piString = Math.PI.toString().replace(".", "");
  for (let i = 0; i < 100; i++) {
    const digit = i < piString.length ? piString[i] : Math.floor(Math.random() * 10).toString();
    piDigits.push({
      id: nextPiDigitId++,
      digit,
      x: -digitWidth - i * digitWidth, // 各数字が一定間隔で配置されるように変更
      y: 300,
      velocity: digitVelocity,
    });
  }
}

function updatePiDigitsPosition(totalWidth) {
  piDigits.forEach((digit) => {
    digit.x += digit.velocity;
    if (digit.x > totalWidth) {
      digit.x = -digitWidth; // x座標をリセットする際に、全クライアントの幅を超えた場合の処理
    }
  });
}

function sendPiDigitPositions(wss, isOpen, clientWidths, clients) {
  let cumulativeWidth = 0;

  wss.clients.forEach((client) => {
    const clientId = clients.get(client);
    if (!clientId || !clientWidths.has(clientId) || !isOpen(client)) return;

    const clientWidth = clientWidths.get(clientId);
    piDigits.forEach((digit) => {
      if (
        digit.x + digitWidth > cumulativeWidth &&
        digit.x - digitWidth < cumulativeWidth + clientWidth
      ) {
        client.send(
          JSON.stringify({
            type: "updatePiDigit",
            data: {
              id: digit.id,
              digit: digit.digit,
              x: digit.x - cumulativeWidth,
              y: digit.y,
            },
          })
        );
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
