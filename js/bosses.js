SR.makeBoss = stage => ({...SR.makeEnemy(),boss:true,bossRegion:stage.region,h:128,w:64,maxHp:260+stage.region*90,hp:260+stage.region*90,speed:140,phase:1,attacks:0,damageScale:.85+stage.region*.12});
SR.updateBoss = (e,p,dt,game) => {
  const phases=e.bossRegion===2?3:2;
  const phase=e.hp/e.maxHp<=.33&&phases===3?3:e.hp/e.maxHp<=.66?2:1;
  if(phase>e.phase){e.phase=phase;SR.notifyPlayer(p,`BOSS · PHASE ${phase}`);}
  if(e.stun>0||e.hp<=0)return;
  e.vx=0;if(e.attack)return;
  e.face=p.x<e.x?-1:1;
  const distance=Math.abs(e.x-p.x);
  if(distance>190){e.vx=e.face*(e.speed+phase*12);return;}
  if(e.cooldown>0||e.spawnGrace>0||e.x<game.camera+25||e.x>game.camera+1255)return;
  const patterns=[['enemyHeavy','bossSweep'],['bossHex','bossSweep','enemyHeavy'],['bossSweep','bossHex','enemyHeavy']];
  const pattern=patterns[e.bossRegion];
  const type=pattern[e.attacks++%pattern.length];
  if(SR.beginAttack(e,type)){
    e.attack.windup*=1-(phase-1)*.12;
    e.attack.damage=Math.round(e.attack.damage*(1+(phase-1)*.12));
    if(type==='bossHex'){
      // Telegraph a stationary ground zone; the player can leave it before activation.
      e.attack=null;e.cooldown=1.7-(phase-1)*.2;
      game.hazards.push({x:p.x,y:570,r:65+phase*10,wait:1.05-(phase-1)*.1,life:.35,damage:18+phase*3,hit:false});
      if(phase===3)game.hazards.push({x:Math.max(80,Math.min(2120,p.x+160*p.face)),y:570,r:65,wait:1.25,life:.35,damage:22,hit:false});
    }
  }
};
