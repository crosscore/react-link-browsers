// websocket-server/circleMotion.js

let circle = { x: -50, y: 300, velocity: 1 };
const circleLifetime = 10000;
const circleRadius = 50;

function createCircle(totalWidth) {
  if (!circle || circle.x > totalWidth) {
    circle = { x: -50, y: 300, velocity: 1 };
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

  wss.clients.forEach(client => {
    const clientId = clients.get(client); // get the client ID by clients map
    if (!clientId || !clientWidths.has(clientId) || !isOpen(client)) return;

  

    const clientWidth = clientWidths.get(clientId);
    if (circle.x >= cumulativeWidth && circle.x < cumulativeWidth + clientWidth) {
      client.send(JSON.stringify({
        type: 'updateCircle',
        data: { x: circle.x - cumulativeWidth, y: circle.y },
      }));
    } else { // if the circle is outside the client's viewport, send a message to hide it
      client.send(JSON.stringify({
        type: 'updateCircle',
        data: { x: -100, y: circle.y },
      }));
    }

    cumulativeWidth += clientWidth;
  });
}

module.exports = { createCircle, updateCircles, sendCirclePositions };
