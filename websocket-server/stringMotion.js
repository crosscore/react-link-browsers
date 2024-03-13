// websocket-server/stringMotion.js

let piDigits = [];
let nextPiDigitId = 0;
const digitWidth = 20;
const digitVelocity = 6;

const piString =
  "Thank you for your attention! This is the first 100 digits of pi: 3.1415926535 8979323846 2643383279 5028841971 6939937510 5820974944 5923078164 0628620899 8628034825 3421170679 ";
let currentStringIndex = 0;

function createPiDigit() {
  if (currentStringIndex >= piString.length) {
    currentStringIndex = 0; // 文字列の先頭に戻る
  }
  const digit = piString[currentStringIndex++];
  const newDigit = {
    id: nextPiDigitId++,
    digit: digit,
    x: -digitWidth * (piDigits.length + 1), // 文字の初期位置を調整
    y: 200,
    velocity: digitVelocity,
  };
  piDigits.push(newDigit);
}

function updatePiDigitsPosition(totalWidth) {
  piDigits.forEach((digit) => {
    digit.x += digit.velocity;
  });
  // 文字が画面の端を超えた場合に配列から削除
  piDigits = piDigits.filter((digit) => digit.x <= totalWidth + digitWidth);
}

function generatePiDigits(interval = 500) {
  setInterval(() => {
    createPiDigit();
  }, interval);
}

function sendPiDigitPositions(wss, isOpen, clientWidths, clients) {
  let cumulativeWidth = 0;
  wss.clients.forEach((client) => {
    const clientId = clients.get(client);
    if (!clientId || !clientWidths.has(clientId) || !isOpen(client)) return;
    const clientWidth = clientWidths.get(clientId);
    piDigits.forEach((digit) => {
      const adjustedX = digit.x - cumulativeWidth;
      if (adjustedX + digitWidth > 0 && adjustedX < clientWidth) {
        client.send(JSON.stringify({
          type: "updatePiDigit",
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
  generatePiDigits,
  updatePiDigitsPosition,
  sendPiDigitPositions,
};
