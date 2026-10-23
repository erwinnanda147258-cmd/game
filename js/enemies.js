SR.enemyTypes={
 scout:{name:'Shadow Stalker',hp:45,speed:180,range:105,rest:.7,coins:12,xp:8,color:'#db829f'},
 guard:{name:'Rift Sentinel',hp:80,speed:110,range:130,rest:.9,coins:20,xp:14,color:'#cc8192'},
 caster:{name:'Hex Weaver',hp:55,speed:120,range:340,rest:1.3,coins:22,xp:16,color:'#bc86ee'},
 archer:{name:'Dread Archer',hp:50,speed:140,range:450,rest:1.5,coins:20,xp:14,color:'#e0b57f'},
 assassin:{name:'Void Assassin',hp:65,speed:190,range:110,rest:.8,coins:25,xp:18,color:'#89b9e9'},
 brute:{name:'Abyss Brute',hp:125,speed:85,range:165,rest:1.2,coins:40,xp:28,color:'#f2a16b'}
};
SR.makeEnemy = () => ({team:'enemy',x:1050,y:570,w:50,h:108,vx:0,vy:0,face:-1,hp:180,maxHp:180,speed:145,grounded:true,attack:null,cooldown:.7,stun:0,invuln:0,flash:0,walk:0,attacks:0,intent:'APPROACH',guardLock:0,slow:0,flankCooldown:0});
SR.updateEnemy = (e,p,dt,game) => {
  e.guarding=false;e.guardLock=Math.max(0,(e.guardLock||0)-dt);e.flankCooldown=Math.max(0,(e.flankCooldown||0)-dt);
  if(e.hp<=0){e.intent='DEATH';return;}if(e.stun>0){e.intent='STUN';return;}
  e.vx=0;if(p.hp<=0){e.intent='IDLE';return;}
  if(e.attack){e.intent=e.attack.time<e.attack.windup?'WINDUP':e.attack.time<e.attack.windup+e.attack.active?'ATTACK':'RECOVERY';
    if(e.attack.type==='lunge'&&e.intent==='ATTACK')e.vx=e.face*370;
    return;
  }
  if(e.dash>0){e.dash=Math.max(0,e.dash-dt);e.vx=e.dashFace*700;e.intent='FLANK';return;}
  if(e.flankPrep>0){e.flankPrep-=dt;e.intent='FLANK WINDUP';if(e.flankPrep<=0){e.dash=.25;e.dashFace=p.x<e.x?-1:1;e.flankCooldown=4;e.cooldown=.5;}return;}
  if(game&&(e.spawnGrace>0||e.x<game.camera+25||e.x>game.camera+1255)){e.vx=(p.x<e.x?-1:1)*e.speed;e.intent='APPROACH';return;}
  e.face=p.x<e.x?-1:1;const d=Math.abs(p.x-e.x),kind=e.kind;
  if(kind==='assassin'&&e.flankCooldown===0&&d>80&&d<210){e.flankPrep=.45;e.intent='FLANK WINDUP';return;}
  if(kind==='guard'&&e.guardLock===0&&e.cooldown>0&&d<210)e.guarding=true;
  if(e.cooldown>0&&d<150){e.vx=-e.face*e.speed*.55;e.intent='RECOVERY';return;}
  const reach=SR.enemyTypes[kind]?.range||110;
  if(d>reach){e.vx=e.face*e.speed;e.intent='APPROACH';return;}
  if(e.cooldown>0){e.intent='IDLE';return;}
  if(Math.abs(p.y-e.y)>170){e.intent='IDLE';return;}
  let type=kind==='scout'?'lunge':kind==='brute'?'bruteSmash':e.attacks%3===2?'enemyHeavy':'enemy';
  if(kind==='archer')type='arrow';if(kind==='caster')type=e.attacks%2?'hexZone':'hexBolt';
  if(SR.beginAttack(e,type)){
    e.attacks++;e.intent='WINDUP';
    if(e.attack.projectile){const dy=p.y-p.h/2-(e.y-65);e.attack.projectile={...e.attack.projectile,angle:Math.atan2(dy,Math.max(1,d))};}
    if(type==='hexZone'&&game)game.hazards.push({x:p.x,y:570,r:70,wait:1.2,life:.25,damage:12,hit:false});
  }
};
