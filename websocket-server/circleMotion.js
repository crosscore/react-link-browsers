// websocket-server/circleMotion.js

let circle = null;
const circleLifetime = 8000;
const circleRadius = 200;

function createCircle(totalWidth) {
  console.log('createCircle');
  if (!circle || circle.x > totalWidth) {
    circle = { x: -circleRadius, y: 300, velocity: 5, radius: circleRadius };
    setTimeout(() => circle = null, circleLifetime);
  }
}

function updateCircles() {
  if (circle) {
    circle.x += circle.velocity;
  }
}

function sendCirclePositions(wss, isOpen, clientWidths, clients) {
  if (!circle) return;
  let cumulativeWidth = 0;

  wss.clients.forEach((client) => {
    const clientId = clients.get(client);
    if (!clientId || !clientWidths.has(clientId) || !isOpen(client)) return;

    const clientWidth = clientWidths.get(clientId);

    if (circle.x + circle.radius >= cumulativeWidth && circle.x - circle.radius < cumulativeWidth + clientWidth) {
      client.send(JSON.stringify({
        type: 'updateCircle',
        data: { x: circle.x - cumulativeWidth, y: circle.y, radius: circle.radius },
      }));
    } else {
      client.send(JSON.stringify({
        type: 'updateCircle',
        data: { x: -500, y: circle.y, radius: circle.radius },
      }));
    }
    cumulativeWidth += clientWidth;
  });
}

function isCirclePresent() {
  return circle !== null;
}

module.exports = { createCircle, updateCircles, sendCirclePositions, isCirclePresent };
