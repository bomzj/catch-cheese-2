import Mouse from "./mouse";

export default class Player extends Mouse {
  lastKeyDown;

  constructor(position) {
    this.position = position;
    document.addEventListener('keydown', this.onKeyDown.bind(this));
    //document.addEventListener('keyup', this.onKeyUp.bind(this));
  }

  onKeyDown(e) {
    //this.keyDown[e.code] = true;
    this.lastKeyDown = e.code;
    // prevent the browser’s default action (scrolling the page) 
    const keysToHandle = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];
    if (keysToHandle.includes(e.code)) e.preventDefault();
  }

  // onKeyUp(e) {
  //   this.keyDown[e.code] = false;
  //   // prevent the browser’s default action (e.g. scrolling the page) 
  //   //e.preventDefault();
  // }

  update() {
    if (this.lastKeyDown =='ArrowLeft') this.position.x--;
    if (this.lastKeyDown == 'ArrowRight') this.position.x++;
    if (this.lastKeyDown =='ArrowUp') this.position.y--;
    if (this.lastKeyDown == 'ArrowDown') this.position.y++;
    
    this.lastKeyDown = null;
  }
}