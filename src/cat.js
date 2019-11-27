export default class Cat {
  icon = '🐱';
  position = { x: null, y: null };

  update() {
    // Chance to idle
    if (Math.random() > 0.8) return;

    // Move by either X or Y
    let step = Math.random() > 0.5 ? 1 : 1;
    //if (Math.random() > 0.5) this.position.x += Math.random() > 0.5 ? step : -step;
    //else this.position.y += Math.random() > 0.5 ? step : -step;
  }
}