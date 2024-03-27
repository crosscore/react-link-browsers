// websocket-server/circleMotion.js

let circles = [];
const circleLifetime = 12000;
let circleRadius = 150;
let nextCircleId = 0;

function setCircleRadius(newRadius) {
  circleRadius = newRadius;
  circles.forEach((circle) => {
    circle.radius = circleRadius;
  });
}

function createCircle(totalWidth) {
  const newCircle = {
    id: nextCircleId++,
    x: -circleRadius,
    y: 360,
    velocity: 6,
    radius: circleRadius,
  };
  circles.push(newCircle);
  setTimeout(() => {
    circles = circles.filter((circle) => circle.id !== newCircle.id);
  }, circleLifetime);
}

function generateCircles(totalWidth, interval = 1200) {
  return setInterval(() => {
    createCircle(totalWidth);
  }, interval);
}

function updateCircles() {
  circles.forEach((circle) => {
    circle.x += circle.velocity;
  });
}

function sendCirclePositions(wss, isOpen, clientWidths, clients) {
  let cumulativeWidth = 0;

  wss.clients.forEach((client) => {
    const clientId = clients.get(client);
    if (!clientId || !clientWidths.has(clientId) || !isOpen(client)) return;

    const clientWidth = clientWidths.get(clientId);
    circles.forEach((circle) => {
      if (
        circle.x + circle.radius > cumulativeWidth &&
        circle.x - circle.radius < cumulativeWidth + clientWidth * 2
      ) {
        client.send(
          JSON.stringify({
            type: "updateCircle",
            data: {
              id: circle.id,
              x: circle.x - cumulativeWidth,
              y: circle.y,
              radius: circle.radius,
            },
          })
        );
      }
    });
    cumulativeWidth += clientWidth;
  });
}

module.exports = {
  setCircleRadius,
  generateCircles,
  updateCircles,
  sendCirclePositions,
};
