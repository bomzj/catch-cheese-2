import Mouse from './mouse'
import Cheese from './cheese'

export default class Cat {
  icon = '🐱';
  position = { x: null, y: null };

  update() {
    let random = Math.random();
    
    if (random < 0.1) this.goToRandomPosition();
    else this.goToObject(Mouse);
  }

  goToRandomPosition() {
    if (Math.random() > 0.5) this.position.x += Math.random() > 0.5 ? 1 : -1;
    else this.position.y += Math.random() > 0.5 ? 1 : -1;
  }

  goToObject(objConstructor) {
    let obj = this.game.objects.find(o => o instanceof objConstructor);
    
    // Move by either X or Y
    if (Math.random() > 0.5) {
      this.position.x += this.position.x > obj.position.x ? -1 : 1;
    }
    else {
      this.position.y += this.position.y > obj.position.y ? -1 : 1;
    }
  }
}