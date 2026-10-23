// Classic script modules keep the game playable directly from file://, offline.
globalThis.SR = globalThis.SR || {};
SR.Input = class {
  constructor(target = window) {
    this.held = new Set(); this.pressed = new Set();
    const keys = new Set(['KeyA','KeyD','KeyW','KeyJ','KeyK','KeyL','KeyU','KeyI','KeyO','Escape','Space']);
    target.addEventListener('keydown', e => {
      if (!keys.has(e.code) || (e.code !== 'Escape' && /INPUT|TEXTAREA|SELECT/.test(e.target?.tagName))) return;
      if(e.code === 'Space' && e.target?.tagName === 'BUTTON') return;
      e.preventDefault();
      if (!e.repeat && !this.held.has(e.code)) this.pressed.add(e.code);
      this.held.add(e.code);
    });
    target.addEventListener('keyup', e => this.held.delete(e.code));
    target.addEventListener('blur', () => this.clear());
  }
  down(key) { return this.held.has(key); }
  take(key) { const found=this.pressed.has(key); this.pressed.delete(key); return found; }
  endFrame() { this.pressed.clear(); }
  clear() { this.held.clear(); this.pressed.clear(); }
};
