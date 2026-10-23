SR.ARENA = {width: 2200, ground: 570, gravity: 1850};
SR.skills = {
  rift: {name: 'Rift Lance', cost: 25, cooldown: 4},
  nova: {name: 'Umbral Nova', cost: 40, cooldown: 7},
  eclipse: {name: 'Last Eclipse', cost: 85, cooldown: 16}
};
SR.moves = {
  light: {windup: .10, active: .13, recovery: .20, damage: 15, range: 100, knock: 140, stun: .22},
  heavy: {windup: .34, active: .17, recovery: .38, damage: 32, range: 135, knock: 370, stun: .45},
  finisher: {windup: .23, active: .20, recovery: .40, damage: 52, range: 170, knock: 480, stun: .6},
  rift: {windup: .20, active: .18, recovery: .28, damage: 26, range: 300, knock: 190, stun: .3},
  nova: {windup: .27, active: .22, recovery: .32, damage: 38, range: 185, knock: 430, stun: .5, radial: true},
  eclipse: {windup: .45, active: .25, recovery: .55, damage: 75, range: 360, knock: 540, stun: .8, radial: true},
  enemy: {windup: .65, active: .16, recovery: .65, damage: 20, range: 133, knock: 310, stun: .28},
  enemyHeavy: {windup: 1.0, active: .20, recovery: .85, damage: 30, range: 155, knock: 390, stun: .5, guardBreak: true}
};
Object.assign(SR.moves,{hex:{windup:.85,active:.18,recovery:.7,damage:16,range:280,knock:160,stun:.2},bossSweep:{windup:.9,active:.22,recovery:.8,damage:24,range:210,knock:340,stun:.35,radial:true},bossHex:{windup:1,active:.2,recovery:.6,damage:20,range:200,knock:200,stun:.3}});
Object.assign(SR.moves,{
 lunge:{windup:.5,active:.14,recovery:.55,damage:14,range:100,knock:170,stun:.2},
 bruteSmash:{windup:1.1,active:.2,recovery:.8,damage:27,range:170,knock:380,stun:.4,guardBreak:true},
 arrow:{windup:.95,active:.1,recovery:.5,damage:13,range:500,knock:100,stun:.15,projectile:{speed:490,range:600,r:3}},
 hexBolt:{windup:.85,active:.1,recovery:.5,damage:15,range:380,knock:100,stun:.2,projectile:{speed:300,range:500,r:8,blast:45}},
 hexZone:{windup:1.2,active:.05,recovery:.4,damage:12,range:380,area:true}
});
SR.beginAttack = (actor, type) => {
  if (!SR.moves[type] || actor.hp <= 0 || actor.attack || actor.cooldown > 0 || actor.stun > 0 || actor.dash > 0 || actor.blocking) return false;
  actor.attack = {...SR.moves[type], type, time: 0, hit: false, targets: new Set()};
  actor.attack.damage=Math.round(actor.attack.damage*(actor.damageScale||1));
  actor.vx = 0;
  return true;
};
SR.tickActor = (a, dt) => {
  for (const key of ['cooldown', 'stun', 'invuln', 'flash']) a[key] = Math.max(0, a[key] - dt);
  if (a.hp <= 0) { a.vx *= Math.exp(-10 * dt); a.attack = null; a.blocking = false; }
  if (a.stun > 0) a.vx *= Math.exp(-5 * dt);
  a.vy += SR.ARENA.gravity * dt; a.slow=Math.max(0,(a.slow||0)-dt); a.x += a.vx * dt*(a.slow>0?.55:1); a.y += a.vy * dt;
  a.x = Math.max(a.w / 2, Math.min(SR.ARENA.width - a.w / 2, a.x));
  a.grounded = a.y >= SR.ARENA.ground;
  if (a.grounded) { a.y = SR.ARENA.ground; a.vy = 0; }
  a.walk += Math.abs(a.vx) * dt * .035;
};
SR.attackBox = a => ({
  left: a.attack.radial || a.face < 0 ? a.x - a.attack.range : a.x,
  right: a.attack.radial || a.face > 0 ? a.x + a.attack.range : a.x,
  top: a.y - a.h - (a.attack.radial ? 45 : 12), bottom: a.y - 18
});
SR.dealHit = (a,b,attack,onHit=()=>{}) => {
      let damage = attack.damage, knock = attack.knock, stun = attack.stun, event = 'hit';
      const facingAttacker = (a.x - b.x) * b.face >= 0;
      if (b.blocking && b.grounded && facingAttacker) {
        b.regenDelay = .65;
        if (!attack.guardBreak && b.energy >= 14) {
          b.energy -= 14; damage = Math.ceil(damage * .2); knock *= .2; stun = .06; event = 'block';
        } else {
          b.energy = Math.max(0, b.energy - 25); b.guardBroken = .9; b.blocking = false;
          stun = .7; event = 'break'; SR.notifyPlayer(b, 'GUARD BROKEN');
        }
      }
      if(b.guarding&&facingAttacker){
        if(attack.guardBreak||['heavy','finisher'].includes(attack.type)){b.guardLock=1.4;b.guarding=false;}
        else{damage=Math.max(1,Math.round(damage*.4));knock*=.3;event='block';}
      }
      if(b.armor)damage=Math.max(1,Math.round(damage*(1-b.armor)));
      if(attack.slow)b.slow=Math.max(b.slow||0,attack.slow);
      b.hp = Math.max(0, b.hp - damage); b.stun = stun; b.invuln = .24; b.flash = .12;
      const direction = attack.radial ? (b.x >= a.x ? 1 : -1) : a.face;
      b.vx = direction * knock*(b.boss?.18:1); b.vy = event === 'block'||b.boss ? 0 : -110; if(!b.boss)b.attack = null;else b.stun=0;
      if (b.team === 'player') { SR.breakCombo(b); b.dash = 0; }
      onHit(b, damage, direction, event);
};
SR.resolveAttack = (a, targets, dt, onHit = () => {}, game) => {
  const victims=Array.isArray(targets)?targets:[targets];
  const attack = a.attack;
  if (!attack) return;
  attack.time += dt;
  if(attack.projectile&&game){
    while((attack.emitted||0)<(attack.burst||1)&&attack.time>=attack.windup+(attack.emitted||0)*.08){
      SR.spawnProjectile(game,a,{...attack.projectile,damage:attack.damage});attack.emitted=(attack.emitted||0)+1;
    }
  }
  for(const b of attack.projectile||attack.area?[]:victims){
  if (attack.time >= attack.windup && attack.time < attack.windup + attack.active && !attack.targets.has(b) && b.hp > 0 && b.invuln <= 0) {
    const box = SR.attackBox(a);
    if (box.right > b.x - b.w / 2 && box.left < b.x + b.w / 2 && box.bottom > b.y - b.h && box.top < b.y) {
      attack.hit = true;attack.targets.add(b);
      SR.dealHit(a,b,attack,onHit);
    }
  }
  }
  if (attack.time >= attack.windup + attack.active + attack.recovery) {
    a.attack = null; a.cooldown = a.team === 'enemy' ? (a.rest||.6) : .08;
  }
};
SR.separate = (a, b) => {
  if (a.hp <= 0 || b.hp <= 0 || a.dash > 0 || b.dash > 0 || a.y - a.h >= b.y || b.y - b.h >= a.y) return;
  const [left,right]=a.x<=b.x?[a,b]:[b,a];
  const distance=(left.w+right.w)/2;
  const overlap=distance-(right.x-left.x);
  if(overlap<=0)return;
  // Share the correction, then transfer any wall-constrained remainder to the free actor.
  left.x=Math.max(left.w/2,left.x-overlap/2);
  right.x=Math.min(SR.ARENA.width-right.w/2,right.x+overlap/2);
  const remaining=distance-(right.x-left.x);
  if(remaining>0){
    const moveLeft=Math.min(remaining,left.x-left.w/2);
    left.x-=moveLeft;right.x+=remaining-moveLeft;
  }
};
