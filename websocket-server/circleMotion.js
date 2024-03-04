// websocket-server/circleMotion.js

let circle = { x: -100, y: 300, velocity: 1 };
const circleLifetime = 10000;
const circleRadius = 100;

function createCircle(totalWidth) {
  if (!circle || circle.x > totalWidth) {
    circle = { x: -100, y: 300, velocity: 1 };
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
  let cumulativeWidth = 0; // cumulative width of all connected clients

  wss.clients.forEach((client, index) => {
    const clientId = clients.get(client); // get the client ID from the clients(Map) object
    if (!clientId || !clientWidths.has(clientId) || !isOpen(client)) return;

    const clientWidth = clientWidths.get(clientId);
    if (circle.x + circleRadius >= cumulativeWidth && circle.x - circleRadius < cumulativeWidth + clientWidth) {
      client.send(JSON.stringify({
        type: 'updateCircle',
        data: { x: circle.x - cumulativeWidth, y: circle.y },
      }));
    } else {
      client.send(JSON.stringify({
        type: 'updateCircle',
        data: { x: -100, y: circle.y },
      }));
    }
    cumulativeWidth += clientWidth; // update the cumulative width for the next iteration
  });
}


module.exports = { createCircle, updateCircles, sendCirclePositions };
