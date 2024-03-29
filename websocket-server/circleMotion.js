// websocket-server/circleMotion.js

let circles = [];
let circleRadius = 150;
let nextCircleId = 0;
let circleInterval = 1200;
const circleLifetime = 12000;

function setCircleRadius(newRadius) {
  const scaleFactor = newRadius / circleRadius;
  circleRadius = newRadius;
  circleInterval = Math.round(circleInterval / scaleFactor);
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

function generateCircles(totalWidth) {
  return setInterval(() => {
    createCircle(totalWidth);
  }, circleInterval);
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
        // Send circle information if its left edge is within the range of
        // the current client's width plus an additional client width.
        // This ensures that circles are sent to the client even if they
        // are partially visible and provides a buffer to prevent flickering
        // when resizing the browser window.
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
