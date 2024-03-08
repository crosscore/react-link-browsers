// websocket-server/stringMotion.js

let piDigits = [];
let nextPiDigitId = 0;

// 円周率の文字列から数字を生成
function generatePiDigits() {
  const piString = Math.PI.toString().replace(".", "");
  for (let i = 0; i < piString.length; i++) {
    piDigits.push({
      id: nextPiDigitId++,
      digit: piString[i],
      x: -10,
      y: 200,
      velocity: 3,
    });
  }
}

// 数字の位置を更新
function updatePiDigitsPosition() {
  piDigits.forEach((digit) => {
    digit.x += digit.velocity;
  });

  piDigits = piDigits.filter((digit) => digit.x < 1300);

  // 新しい数字を追加
  if (piDigits.length < 50) {
    piDigits.push({
      id: nextPiDigitId++,
      digit: Math.floor(Math.random() * 10).toString(),
      x: -10,
      y: 200,
      velocity: 3,
    });
  }
}

// 数字の位置をクライアントに送信
function sendPiDigitPositions(wss, isOpen, clients) {
  piDigits.forEach((digit) => {
    wss.clients.forEach((client) => {
      if (isOpen(client)) {
        client.send(
          JSON.stringify({
            type: "updatePiDigit",
            data: {
              id: digit.id,
              digit: digit.digit,
              x: digit.x,
              y: digit.y,
            },
          })
        );
      }
    });
  });
}

module.exports = {
  generatePiDigits,
  updatePiDigitsPosition,
  sendPiDigitPositions,
};
