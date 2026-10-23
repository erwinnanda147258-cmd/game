// All weapon prices and combat tuning live here. J/K dispatch by equipped class.
SR.weapons = {
 rustblade:{name:'Rustblade',category:'Sword',price:0,description:'Balanced steel. Reliable J → J → K finisher.',damage:1,tempo:1,reach:1,color:'#c5a6ed'},
 nightfang:{name:'Nightfang',category:'Sword',price:250,description:'Short recovery and quick close-range chains.',damage:.88,tempo:.72,reach:.9,color:'#93deca'},
 great_riftblade:{name:'Great Riftblade',category:'Sword',price:500,description:'Slower swings; broad reach and heavy impact.',damage:1.35,tempo:1.3,reach:1.38,color:'#cca5ed'},
 eclipse_edge:{name:'Eclipse Edge',category:'Sword',price:1000,description:'Heavy attacks and finishers release an energy slash.',damage:1.08,tempo:1.05,reach:1.12,slash:true,color:'#e6c9ff'},
 rift_pistol:{name:'Rift Pistol',category:'Gun',price:300,description:'Quick single shots. K fires a stronger double-cost shot.',damage:18,tempo:.42,range:680,speed:850,capacity:8,reload:1.3,burst:1,color:'#e8c997'},
 twin_handcannons:{name:'Twin Handcannons',category:'Gun',price:600,description:'Two-shot bursts; K sends three rounds.',damage:13,tempo:.6,range:610,speed:760,capacity:12,reload:1.65,burst:2,color:'#f4be8f'},
 void_rifle:{name:'Void Rifle',category:'Gun',price:850,description:'Fast precision rounds penetrate up to three enemies.',damage:27,tempo:.75,range:850,speed:1200,capacity:6,reload:1.8,burst:1,pierce:3,color:'#9ed8ec'},
 eclipse_cannon:{name:'Eclipse Cannon',category:'Gun',price:1200,description:'Slow explosive rounds; K breaks guard in a wider blast.',damage:42,tempo:1.15,range:650,speed:450,capacity:4,reload:2.1,burst:1,blast:85,color:'#ffa4bd'},
 apprentice_focus:{name:'Apprentice Focus',category:'Magic',price:350,description:'Efficient arcane bolts; K pierces a second enemy.',damage:22,tempo:.55,range:600,speed:560,cost:8,color:'#ae9cfa'},
 storm_staff:{name:'Storm Staff',category:'Magic',price:650,description:'Lightning chains from impact to two nearby targets.',damage:24,tempo:.7,range:630,speed:800,cost:12,chain:240,color:'#a9e9ff'},
 void_grimoire:{name:'Void Grimoire',category:'Magic',price:900,description:'Area blasts slow enemies; K expands the curse.',damage:21,tempo:.8,range:590,speed:430,cost:13,blast:90,slow:2,color:'#c296ff'},
 astral_catalyst:{name:'Astral Catalyst',category:'Magic',price:1300,description:'Powerful piercing stars with a high energy cost.',damage:43,tempo:1.0,range:720,speed:650,cost:23,pierce:2,blast:60,color:'#ffdbf6'}
};
SR.weaponUpgradeRules={max:5,baseCost:60,costStep:65,priceFactor:.1,damagePerLevel:.08,speedPerLevel:.025,energyPerLevel:.05};
SR.weaponStats = (id,level=0) => {
  const w=SR.weapons[id];if(!w)return null;const u=SR.weaponUpgradeRules;
  return {...w,id,level,damage:w.damage*(1+u.damagePerLevel*level),tempo:w.tempo*(1-u.speedPerLevel*level),
    cost:w.cost?Math.max(1,Math.ceil(w.cost*(1-u.energyPerLevel*level))):0,capacity:w.capacity?w.capacity+level:0};
};
SR.setWeapon = (p,progress) => {
  p.weaponId=progress.equippedWeapon;p.weaponLevel=progress.weaponLevels[p.weaponId];p.weapon=SR.weaponStats(p.weaponId,p.weaponLevel);
  p.magazines ||= {};
  if(p.weapon.category==='Gun')p.magazines[p.weaponId] ||= {ammo:p.weapon.capacity,reload:0};
  p.buffer=null;SR.breakCombo(p);
};
SR.beginReload = p => {
  if(p.weapon?.category!=='Gun'||p.attack||p.dash>0)return false;
  const magazine=p.magazines[p.weaponId];if(magazine.reload>0||magazine.ammo>=p.weapon.capacity)return false;
  magazine.reload=p.weapon.reload;SR.notifyPlayer(p,'RELOADING');return true;
};
SR.updateWeapon = (p,dt,input) => {
  if(p.hp<=0||!p.weapon)return;
  // Reload runs only for the active weapon: changing equipment is not a refill exploit.
  if(p.weapon.category==='Gun'){
    const magazine=p.magazines[p.weaponId];
    if(magazine.reload>0){magazine.reload=Math.max(0,magazine.reload-dt);if(magazine.reload===0)magazine.ammo=p.weapon.capacity;}
    else if(magazine.ammo===0&&!p.attack)SR.beginReload(p);
    if(input.take('KeyR'))SR.beginReload(p);
  }
};
SR.modifySwordAttack = (p,attack) => {
  if(p.weapon?.category!=='Sword')return;
  const w=p.weapon;attack.damage=Math.round(attack.damage*w.damage);attack.windup*=w.tempo;attack.active*=w.tempo;attack.recovery*=w.tempo;attack.range*=w.reach;
  if(w.slash&&['heavy','finisher'].includes(attack.type))attack.bonusProjectile={speed:700,range:420,r:10,pierce:2};
};
SR.weaponAttack = (p,key) => {
  if(p.hp<=0||p.attack||p.cooldown>0||p.stun>0||p.dash>0||p.blocking)return false;
  const w=p.weapon,heavy=key==='K',burst=w.id==='twin_handcannons'?(heavy?3:2):1;
  const rounds=w.category==='Gun'?(w.id==='twin_handcannons'?burst:heavy?2:1):0,cost=Math.ceil(w.cost*(heavy?1.8:1));
  if(w.category==='Gun'){
    const mag=p.magazines[p.weaponId];if(mag.reload>0){SR.notifyPlayer(p,'RELOADING');return false;}
    if(mag.ammo<rounds){SR.beginReload(p);return false;}mag.ammo-=rounds;
  }else if(!SR.spendEnergy(p,cost))return false;
  SR.beginAttack(p,'weaponShot');
  p.attack.damage=Math.round(w.damage*(p.damageScale||1)*(heavy?1.65:1));
  p.attack.windup=heavy?.18:.08;p.attack.active=.1+(burst-1)*.08;p.attack.recovery=w.tempo*(heavy?1.2:1);p.attack.range=w.range;p.attack.burst=burst;
  p.attack.projectile={speed:w.speed,range:w.range,r:w.category==='Magic'?8:4,color:w.color,pierce:heavy&&w.id==='apprentice_focus'?2:w.pierce||1,
    blast:w.blast?(heavy?w.blast*1.4:w.blast):0,chain:w.chain?(heavy?340:w.chain):0,slow:w.slow?(heavy?3:w.slow):0,guardBreak:heavy};
  SR.breakCombo(p);return true;
};
SR.moves.weaponShot={windup:.08,active:.1,recovery:.3,damage:20,range:650,knock:120,stun:.2};
