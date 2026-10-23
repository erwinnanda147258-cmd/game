const {test} = require('node:test');
const assert = require('node:assert/strict');
require('../js/input.js'); require('../js/player.js'); require('../js/enemies.js'); require('../js/combat.js');
const S = globalThis.SR;
const input = () => new S.Input({addEventListener(){}});
function simulate(p, i, seconds, enemy = S.makeEnemy()) {
  for (let t = 0; t < Math.round(seconds * 120); t++) {
    S.updatePlayer(p, i, 1/120); S.tickActor(p, 1/120);
    S.resolveAttack(p, enemy, 1/120); i.endFrame();
  }
}
function enemyHit(p, {behind = false, heavy = false} = {}) {
  const e = S.makeEnemy(); e.cooldown = 0; e.x = p.x + (behind ? -90 : 90); e.face = behind ? 1 : -1;
  S.beginAttack(e, heavy ? 'enemyHeavy' : 'enemy');
  S.resolveAttack(e, p, heavy ? 1.01 : .66);
}
test('only ordered timely J J K produces damaging finisher', () => {
  const p = S.makePlayer(), i = input();
  assert.ok(S.playerAttack(p, 'J')); simulate(p, i, .55);
  assert.ok(S.playerAttack(p, 'J')); simulate(p, i, .55);
  assert.ok(S.playerAttack(p, 'K')); assert.equal(p.attack.type, 'finisher');
  const e = S.makeEnemy(); e.x = p.x + 110; S.resolveAttack(p, e, .24);
  assert.equal(e.hp, e.maxHp - 52); assert.equal(p.combo, '');
  const other = S.makePlayer(); S.playerAttack(other, 'J'); simulate(other, i, 1.4);
  S.playerAttack(other, 'K'); assert.equal(other.attack.type, 'heavy');
  const wrong = S.makePlayer(); S.playerAttack(wrong, 'J'); simulate(wrong, i, .55);
  S.playerAttack(wrong, 'K'); assert.equal(wrong.attack.type, 'heavy'); assert.equal(wrong.combo, '');
});
test('failed attack does not advance combo and recovery buffer fires once', () => {
  const p = S.makePlayer(), i = input(); S.playerAttack(p, 'J');
  assert.equal(S.playerAttack(p, 'J'), false); assert.equal(p.combo, 'J');
  simulate(p, i, .30); i.pressed.add('KeyJ'); simulate(p, i, .25);
  assert.equal(p.combo, 'JJ'); assert.equal(p.attack.type, 'light');
  simulate(p, i, 1); assert.equal(p.attack, null);
});
test('dash consumes energy, ignores collision and hits, ends and respects cooldown', () => {
  const p = S.makePlayer(), i = input(), e = S.makeEnemy();
  i.pressed.add('KeyL'); S.updatePlayer(p, i, 1/120); i.endFrame();
  assert.equal(p.energy, 80); assert.ok(p.invuln > 0); assert.equal(p.vx, 850);
  e.x = p.x; const x = p.x; S.separate(p, e); assert.equal(p.x, x);
  enemyHit(p); assert.equal(p.hp, 120);
  simulate(p, i, .22); assert.equal(p.dash, 0); assert.ok(p.x > x + 120);
  i.pressed.add('KeyL'); simulate(p, i, .01); assert.equal(p.dash, 0); assert.equal(p.energy, 80);
  const poor = S.makePlayer(); poor.energy = 10; i.pressed.add('KeyL'); simulate(poor, i, .01);
  assert.equal(poor.dash, 0); assert.ok(poor.energy >= 10);
});
test('front guard reduces damage and spends energy, rear hits bypass guard', () => {
  const p = S.makePlayer(), i = input(); i.held.add('Space'); S.updatePlayer(p, i, 1/120);
  assert.ok(p.blocking); enemyHit(p); assert.equal(p.hp, 116); assert.ok(p.energy < 86);
  const back = S.makePlayer(); S.updatePlayer(back, i, 1/120); enemyHit(back, {behind:true}); assert.equal(back.hp, 100);
});
test('guard break and insufficient guard energy cause damage, stun and recovery lock', () => {
  for (const heavy of [false, true]) {
    const p = S.makePlayer(), i = input(); p.energy = heavy ? 100 : 10; i.held.add('Space');
    S.updatePlayer(p, i, 1/120); enemyHit(p, {heavy});
    assert.equal(p.hp, heavy ? 90 : 100); assert.equal(p.blocking, false); assert.equal(p.stun, .7); assert.ok(p.guardBroken > 0);
    simulate(p, i, .75); assert.equal(p.blocking, false); assert.ok(p.energy >= 0);
  }
});
test('guard cannot be held airborne and prevents attacks; jump and dash remain distinct', () => {
  const p = S.makePlayer(), i = input(); i.held.add('Space'); i.pressed.add('KeyJ');
  S.updatePlayer(p, i, 1/120); assert.equal(p.attack, null); i.endFrame();
  p.y = 400; p.grounded = false; S.updatePlayer(p, i, 1/120); assert.equal(p.blocking, false);
});
test('all skills deal their actual damage, use energy and enforce cooldown', () => {
  for (const [type, skill] of Object.entries(S.skills)) {
    const p = S.makePlayer(), e = S.makeEnemy(); e.x = p.x + 160;
    assert.ok(S.useSkill(p, type)); assert.equal(p.energy, 100 - skill.cost);
    assert.equal(p.skillCooldowns[type], skill.cooldown);
    S.resolveAttack(p, e, S.moves[type].windup + .01); assert.equal(e.hp, e.maxHp - S.moves[type].damage);
    simulate(p, input(), 1.5); assert.equal(S.useSkill(p, type), false);
  }
});
test('nova and ultimate hit behind, lance cannot; skills obey vertical range', () => {
  for (const type of ['rift', 'nova', 'eclipse']) {
    const p = S.makePlayer(), e = S.makeEnemy(); e.x = p.x - 100;
    S.useSkill(p, type); S.resolveAttack(p, e, S.moves[type].windup + .01);
    assert.equal(e.hp, type === 'rift' ? e.maxHp : e.maxHp - S.moves[type].damage);
    if (type !== 'rift') assert.ok(e.vx < 0);
  }
  const p = S.makePlayer(), e = S.makeEnemy(); e.x = p.x; e.y = 100;
  S.useSkill(p, 'nova'); S.resolveAttack(p, e, .28); assert.equal(e.hp, e.maxHp);
});
test('skill rejection cannot spend energy; regen is capped and stopped by guard', () => {
  const p = S.makePlayer(), i = input(); p.energy = 20;
  assert.equal(S.useSkill(p, 'rift'), false); assert.equal(p.energy, 20); assert.equal(p.skillCooldowns.rift, 0);
  simulate(p, i, 10); assert.equal(p.energy, 100);
  i.held.add('Space'); simulate(p, i, 1); assert.ok(p.energy < 93); assert.ok(p.energy > 91);
});
test('AI retreats during cooldown and telegraphs every third attack as guard breaker', () => {
  const p = S.makePlayer(), e = S.makeEnemy(); e.x = p.x + 90; S.updateEnemy(e, p, 1/120); assert.ok(e.vx > 0);
  for (let n = 0; n < 3; n++) {
    e.cooldown = 0; e.attack = null; S.updateEnemy(e, p, 1/120);
    assert.equal(e.attack.type, n === 2 ? 'enemyHeavy' : 'enemy');
  }
});
test('fresh player resets energy, timers, combo and guard; new controls ignore repeat', () => {
  const p = S.makePlayer(); assert.equal(p.energy, 100); assert.equal(p.dash, 0); assert.equal(p.combo, '');
  assert.deepEqual(p.skillCooldowns, {rift:0,nova:0,eclipse:0});
  const h = {}, i = new S.Input({addEventListener:(key, fn)=>h[key]=fn});
  for (const code of ['KeyL','KeyU','KeyI','KeyO','Space']) {
    h.keydown({code,preventDefault(){}}); assert.ok(i.take(code));
    h.keydown({code,repeat:true,preventDefault(){}}); assert.equal(i.take(code),false);
    h.keyup({code}); assert.equal(i.down(code),false);
  }
});
