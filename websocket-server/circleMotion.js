// websocket-server/circleMotion.js

let circles = [];
const circleVelocity = { x: 1, y: 0 };
const circleLifetime = 6000;
let currentPatternMultiplier = 1;
const colors = [
  "#F44336",
  "#E91E63",
  "#9C27B0",
  "#673AB7",
  "#3F51B5",
  "#2196F3",
];
let currentColorIndex = 0;

function createCircle(windowInfo) {
  if (windowInfo.width > 0) {
    console.log(`windowInfo: ${JSON.stringify(windowInfo)}`);
    const initialCirclePosition = { x: 0, y: windowInfo.innerHeight / 2 };
    const color = colors[currentColorIndex];
    currentColorIndex = (currentColorIndex + 1) % colors.length;
    const createTime = Date.now();
    circles.push({
      position: { ...initialCirclePosition },
      velocity: circleVelocity,
      createTime,
      color,
    });
    console.log(`create circle.color: ${color}`);
  }
}

function updateCirclePosition(circle, multiplier) {
  circle.position.x += circle.velocity.x * multiplier;
}

function updateCircles() {
  circles.forEach((circle) =>
    updateCirclePosition(circle, currentPatternMultiplier)
  );
}

function sendCirclePositions(wss, clientWindowInfo, isOpen) {
  wss.clients.forEach((client) => {
    if (isOpen(client)) {
      const clientInfo = clientWindowInfo.get(client);
      if (clientInfo) {
        const { x: baseX } = clientInfo;
        const positions = circles.map((circle) => ({
          x: circle.position.x + baseX,
          y: circle.position.y,
          color: circle.color,
        }));
        client.send(JSON.stringify(positions));
      }
    }
  });
}

function removeOldCircles() {
  const currentTime = Date.now();
  circles = circles.filter(
    (circle) => currentTime - circle.createTime <= circleLifetime
  );
}

module.exports = {
  createCircle,
  updateCircles,
  sendCirclePositions,
  removeOldCircles,
  circles,
};
