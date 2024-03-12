// websocket-server/stringMotion.js

let piDigits = [];
let nextPiDigitId = 0;
const digitWidth = 200;
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
      clientId: null,
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
  wss.clients.forEach((ws) => {
    if (!isOpen(ws)) {
      console.log('WebSocket is not open');
      return;
    }

    const clientId = clients.get(ws);
    if (clientId === undefined) {
      console.log('No clientId found for an open WebSocket instance');
      return;
    }

    const clientWidth = clientWidths.get(clientId);
    if (clientWidth === undefined) {
      console.log(`No clientWidth found for clientId: ${clientId}`);
      return;
    }

    piDigits.forEach((digit) => {
      if (digit.x + digitWidth > 0 && digit.x - digitWidth < clientWidth) {
        ws.send(JSON.stringify({
          type: "updatePiDigit",
          data: {
            id: digit.id,
            digit: digit.digit,
            x: digit.x,
            y: digit.y,
          },
        }));
        console.log(`Sending digit ${digit.digit} to client ${clientId}, x: ${digit.x}, y: ${digit.y}`);
      }
    });
  });
}


module.exports = {
  generatePiDigits,
  updatePiDigitsPosition,
  sendPiDigitPositions,
};
