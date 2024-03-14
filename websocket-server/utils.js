// websockets server/utils.js
function getTotalWidth(clientWidths) {
  return Array.from(clientWidths.values()).reduce((acc, width) => acc + width, 0);
}

function getMaxWidth(clientWidths) {
  let maxWidth = 0;
  clientWidths.forEach((width) => {
    if (width > maxWidth) {
      maxWidth = width;
    }
  });
  return maxWidth;
}

module.exports = {
  getTotalWidth,
  getMaxWidth,
};
