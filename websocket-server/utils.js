// websockets server/utils.js
function getTotalWidth(clientWidths) {
  return Array.from(clientWidths.values()).reduce((acc, width) => acc + width, 0);
}

module.exports = {
  getTotalWidth,
};
