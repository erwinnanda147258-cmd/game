SR.makeEnemy = () => ({
  team: 'enemy', x: 1050, y: 570, w: 50, h: 108, vx: 0, vy: 0, face: -1,
  hp: 180, maxHp: 180, speed: 145, grounded: true, attack: null,
  cooldown: .7, stun: 0, invuln: 0, flash: 0, walk: 0, attacks: 0, intent: 'CHASE'
});
SR.updateEnemy = (e, p, dt, game) => {
  if (e.hp <= 0 || e.stun > 0) return;
  e.vx = 0;
  if (e.attack || p.hp <= 0) return;
  if(game&&(e.spawnGrace>0||e.x<game.camera+25||e.x>game.camera+1255)){e.vx=(p.x<e.x?-1:1)*e.speed;return;}
  const distance = Math.abs(p.x - e.x);
  e.face = p.x < e.x ? -1 : 1;
  if(e.kind==='caster'&&distance>150&&distance<260&&e.cooldown<=0){e.vx=0;SR.beginAttack(e,'hex');e.intent='HEX';return;}
  if (e.cooldown > 0 && distance < 155) {
    e.vx = -e.face * e.speed * .65; e.intent = 'REPOSITION';
  } else if (distance > 110) {
    e.vx = e.face * e.speed; e.intent = 'CHASE';
  } else if (e.cooldown <= 0 && Math.abs(p.y - e.y) < 135) {
    const type = e.attacks % 3 === 2 ? 'enemyHeavy' : 'enemy';
    if (SR.beginAttack(e, type)) { e.attacks++; e.intent = type === 'enemyHeavy' ? 'GUARD BREAK' : 'STRIKE'; }
  } else e.intent = 'WAIT';
};
