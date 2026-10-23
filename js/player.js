SR.makePlayer = () => ({
  team: 'player', x: 320, y: 570, w: 42, h: 96, vx: 0, vy: 0,
  face: 1, hp: 120, maxHp: 120, speed: 300, grounded: true,
  attack: null, cooldown: 0, stun: 0, invuln: 0, flash: 0, walk: 0,
  energy: 100, maxEnergy: 100, regenDelay: 0,
  dash: 0, dashCooldown: 0, blocking: false, guardBroken: 0,
  skillCooldowns: {rift: 0, nova: 0, eclipse: 0},
  combo: '', comboWindow: 0, comboLabel: '', comboFlash: 0,
  buffer: null, notice: '', noticeTime: 0
});

SR.notifyPlayer = (p, message) => { p.notice = message; p.noticeTime = 1.2; };
SR.spendEnergy = (p, amount) => {
  if (p.energy < amount) { SR.notifyPlayer(p, 'ENERGI KURANG'); return false; }
  p.energy -= amount;
  p.regenDelay = .65;
  return true;
};
SR.breakCombo = p => { p.combo = ''; p.comboWindow = 0; p.buffer = null; };

SR.playerAttack = (p, key) => {
  const finisher = key === 'K' && p.combo === 'JJ' && p.comboWindow > 0;
  if (!SR.beginAttack(p, finisher ? 'finisher' : key === 'J' ? 'light' : 'heavy')) return false;
  if (finisher) {
    p.comboLabel = 'J → J → K · RIFT BREAKER'; p.comboFlash = 1.5;
    SR.breakCombo(p);
  } else if (key === 'J') {
    p.combo = p.combo === 'J' && p.comboWindow > 0 ? 'JJ' : 'J';
    p.comboWindow = 1.25;
  } else SR.breakCombo(p);
  return true;
};

SR.useSkill = (p, type) => {
  const skill = SR.skills[type];
  if (!skill || p.hp <= 0 || p.stun > 0 || p.attack || p.dash > 0 || p.blocking || p.cooldown > 0) return false;
  if(p.unlockedSkills&&!p.unlockedSkills[type]){SR.notifyPlayer(p,'SKILL TERKUNCI');return false;}
  if (p.skillCooldowns[type] > 0) { SR.notifyPlayer(p, 'SKILL BELUM SIAP'); return false; }
  if (!SR.spendEnergy(p, skill.cost)) return false;
  SR.beginAttack(p, type);
  p.skillCooldowns[type] = skill.cooldown*(p.cooldownScale||1);
  SR.breakCombo(p);
  if (type === 'eclipse') p.invuln = .65;
  SR.notifyPlayer(p, skill.name.toUpperCase());
  return true;
};

SR.updatePlayer = (p, input, dt) => {
  // Timers belong to simulation time; pause freezes everything, including regen.
  for (const key of ['dashCooldown', 'guardBroken', 'regenDelay', 'comboWindow', 'comboFlash', 'noticeTime']) {
    p[key] = Math.max(0, p[key] - dt);
  }
  for (const key of Object.keys(p.skillCooldowns)) p.skillCooldowns[key] = Math.max(0, p.skillCooldowns[key] - dt);
  if (p.comboWindow === 0) p.combo = '';
  if (p.buffer) { p.buffer.life -= dt; if (p.buffer.life <= 0) p.buffer = null; }
  p.blocking = false;
  if (p.hp <= 0 || p.stun > 0) { p.buffer = null; return; }
  const direction = Number(input.down('KeyD')) - Number(input.down('KeyA'));
  if (p.dash > 0) {
    p.dash = Math.max(0, p.dash - dt);
    p.vx = p.dash > 0 ? p.face * 850 : 0;
    return;
  }
  if (direction && !p.attack) p.face = direction;
  if (input.take('KeyL') && !p.attack && p.dashCooldown === 0 && SR.spendEnergy(p, 20)) {
    p.dash = .18; p.dashCooldown = .8; p.invuln = Math.max(p.invuln, .16);
    p.vx = p.face * 850; SR.breakCombo(p); return;
  }
  p.blocking = input.down('Space') && p.grounded && !p.attack && p.guardBroken === 0 && p.energy > 0;
  if (p.blocking) {
    p.energy = Math.max(0, p.energy - 8 * dt); p.regenDelay = .65; p.buffer = null;
    if (p.energy === 0) { p.blocking = false; p.guardBroken = .8; SR.notifyPlayer(p, 'GUARD EXHAUSTED'); }
  } else if (!p.attack && p.regenDelay === 0) p.energy = Math.min(p.maxEnergy, p.energy + 13 * dt);
  p.vx = direction * p.speed * (p.attack ? .35 : p.blocking ? .28 : 1);
  if (p.blocking) return;
  if (input.take('KeyW') && p.grounded) { p.vy = -690; p.grounded = false; }
  for (const [key, type] of [['KeyO', 'eclipse'], ['KeyI', 'nova'], ['KeyU', 'rift']]) {
    if (input.take(key) && SR.useSkill(p, type)) return;
  }
  const key = input.take('KeyK') ? 'K' : input.take('KeyJ') ? 'J' : null;
  if (key) {
    if (!SR.playerAttack(p, key)) {
      // A single fresh input can queue during the final 180 ms of recovery.
      const remaining = p.attack ? p.attack.windup + p.attack.active + p.attack.recovery - p.attack.time : p.cooldown;
      if (remaining <= .18) p.buffer = {key, life: .3};
    }
  } else if (p.buffer && !p.attack && p.cooldown === 0) {
    const buffered = p.buffer.key; p.buffer = null; SR.playerAttack(p, buffered);
  }
};
