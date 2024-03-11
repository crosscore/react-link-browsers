// websocket-server/stringMotion.js

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

  wss.clients.forEach((client) => {
    const clientId = clients.get(client);
    if (!clientId) {
      console.log('No clientId found for client');
      return;
    }
    const clientWidth = clientWidths.get(clientId);
    if (!clientWidth) {
      console.log(`No clientWidth found for clientId: ${clientId}`);
      return;
    }
    if (!isOpen(client)) {
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
        client.send(
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
        digit.clientId = client;
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
