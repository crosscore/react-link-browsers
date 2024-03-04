// websocket-server/circleMotion.js

let circle = { x: -100, y: 300, velocity: 1, radius: 100 };
const circleLifetime = 10000;

function createCircle(totalWidth) {
  if (!circle || circle.x > totalWidth) {
    circle = { x: -100, y: 300, velocity: 1, radius: circle.radius }; 
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

  wss.clients.forEach((client, index) => {
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
        data: { x: -100, y: circle.y, radius: circle.radius }, 
      }));
    }
    cumulativeWidth += clientWidth;
  });
}

module.exports = { createCircle, updateCircles, sendCirclePositions };

