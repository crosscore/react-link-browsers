// websocket-server/player.js
class Player {
  constructor(initialX, initialY) {
    this.position = { x: initialX, y: initialY };
    this.velocity = { x: 0, y: 0 };
  }

  move(direction) {
    const speed = 5;
    switch (direction) {
      case "w": this.velocity.y = -speed; break;
      case "a": this.velocity.x = -speed; break;
      case "s": this.velocity.y = speed; break;
      case "d": this.velocity.x = speed; break;
      default: this.velocity.x = 0; this.velocity.y = 0;
    }
  }

  update() {
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
  }
}

module.exports = Player;
