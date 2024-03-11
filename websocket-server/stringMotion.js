// websocket-server/stringMotion.js

// stringMotion.js
let piDigits = [];
let nextPiDigitId = 0;
const digitWidth = 20;
const digitVelocity = 3;

function generatePiDigits() {
  const piString = Math.PI.toString().replace(".", "");
  for (let i = 0; i < 50; i++) {
    const digit =
      i < piString.length
        ? piString[i]
        : Math.floor(Math.random() * 10).toString();
    piDigits.push({
      id: nextPiDigitId++,
      digit,
      x: -digitWidth,
      y: 200,
      velocity: digitVelocity,
      clientId: null, // clientIdをnullに初期化
    });
  }
}

function updatePiDigitsPosition(clientWidths) {
  const maxClientWidth = Math.max(...clientWidths.values());

  piDigits.forEach((digit) => {
    digit.x += digit.velocity;

    if (digit.x > maxClientWidth) {
      digit.x = -digitWidth;
    }
  });
}

function sendPiDigitPositions(wss, isOpen, clientWidths, clients) {
  let cumulativeWidth = 0;

  wss.clients.forEach((ws) => {
    const clientId = clients.get(ws);
    if (!clientId) {
      console.log('No clientId found for WebSocket instance');
      return;
    }

    const clientWidth = clientWidths.get(clientId);
    if (!clientWidth) {
      console.log(`No clientWidth found for clientId: ${clientId}`);
      return;
    }

    if (!isOpen(ws)) {
      console.log(`Client ${clientId} is closed`);
      return;
    }

    piDigits.forEach((digit, index) => {
      const previousDigit = index > 0 ? piDigits[index - 1] : null;
      const previousClientWidth = previousDigit ? clientWidths.get(clients.get(previousDigit.clientId)) : 0;

      if (
        digit.x + digitWidth > cumulativeWidth &&
        digit.x - digitWidth < cumulativeWidth + clientWidth
      ) {
        const adjustedX = digit.x - cumulativeWidth + (previousDigit ? previousClientWidth : 0);
        ws.send(
          JSON.stringify({
            type: "updatePiDigit",
            data: {
              id: digit.id,
              digit: digit.digit,
              x: adjustedX,
              y: digit.y,
              clientId,
            },
          })
        );
        digit.clientId = ws; // WebSocketインスタンスをclientIdに格納
      } else {
        digit.clientId = null; // 表示範囲外の場合はclientIdをnullに設定
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
