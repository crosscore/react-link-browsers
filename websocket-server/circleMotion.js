// websocket-server/circleMotion.js

let circles = [];
const circleLifetime = 12000;
const circleRadius = 60;
let nextCircleId = 0;

function createCircle(totalWidth) {
  const newCircle = {
    id: nextCircleId++,
    x: -circleRadius,
    y: 300,
    velocity: 3,
    radius: circleRadius,
  };
  circles.push(newCircle);
  console.log(`Created circle ${newCircle.id}`);
  setTimeout(() => {
    circles = circles.filter((circle) => circle.id !== newCircle.id);
  }, circleLifetime);
}

function generateCircles(totalWidth, interval = 800) {
  setInterval(() => {
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
        //console.log(`Sending circle ${circle.id} to client ${clientId}`);
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
  createCircle,
  generateCircles,
  updateCircles,
  sendCirclePositions,
};
