// websockets server/utils.js
function getTotalWidth(clientWidths) {
  return Array.from(clientWidths.values()).reduce((acc, width) => acc + width, 0);
}

function getMaxWidth(clientWidths) {
  return Math.max(...clientWidths.values());
}

module.exports = {
  getTotalWidth,
  getMaxWidth,
};
