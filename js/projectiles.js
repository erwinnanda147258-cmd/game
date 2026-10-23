SR.segmentHit = (x0,y0,x1,y1,b,r=0) => {
  let enter=0,exit=1;
  for(const [start,delta,min,max] of [[x0,x1-x0,b.x-b.w/2-r,b.x+b.w/2+r],[y0,y1-y0,b.y-b.h-r,b.y+r]]){
    if(Math.abs(delta)<1e-8){if(start<min||start>max)return null;continue;}
    const a=(min-start)/delta,z=(max-start)/delta;enter=Math.max(enter,Math.min(a,z));exit=Math.min(exit,Math.max(a,z));if(enter>exit)return null;
  }
  return enter;
};
SR.spawnProjectile = (game,actor,config) => {
  if(!game||game.projectiles.length>=80)return;
  const direction=actor.face,angle=config.angle||0,speed=config.speed||650;
  game.projectiles.push({x:actor.x+direction*25,y:actor.y-65,vx:Math.cos(angle)*speed*direction,vy:Math.sin(angle)*speed,
    team:actor.team,source:actor,life:3,travel:0,targets:new Set(),pierce:config.pierce||1,r:config.r||5,
    range:config.range||650,color:actor.team==='enemy'?'#ffad87':'#c8aeff',...config});
};
SR.updateProjectiles = (game,dt) => {
  for(const shot of game.projectiles){
    const targets=shot.team==='player'?game.enemies:[game.player];
    const x0=shot.x,y0=shot.y,remaining=Math.max(0,shot.range-shot.travel),speed=Math.hypot(shot.vx,shot.vy);
    const step=Math.min(dt,remaining/speed);shot.x=Math.max(0,Math.min(SR.ARENA.width,x0+shot.vx*step));shot.y+=shot.vy*step;shot.travel+=speed*step;shot.life-=dt;
    const collisions=targets.filter(t=>t.hp>0&&!shot.targets.has(t)).map(t=>({t,at:SR.segmentHit(x0,y0,shot.x,shot.y,t,shot.r)})).filter(v=>v.at!==null).sort((a,b)=>a.at-b.at);
    for(const {t,at} of collisions){
      shot.targets.add(t);
      const impactX=x0+(shot.x-x0)*at,impactY=y0+(shot.y-y0)*at;
      const affected=shot.blast?targets.filter(b=>b.hp>0&&Math.abs(b.x-impactX)<shot.blast+b.w/2&&Math.abs(b.y-b.h/2-impactY)<shot.blast):[t];
      for(const victim of affected)if(victim.invuln<=0)SR.dealHit({x:x0,face:shot.vx<0?-1:1},victim,{damage:shot.damage,knock:shot.knock||120,stun:shot.stun||.18,guardBreak:shot.guardBreak,slow:shot.slow,type:'projectile'},(...args)=>game.hit(...args));
      if(shot.chain){const others=targets.filter(b=>b!==t&&b.hp>0&&!shot.targets.has(b)&&Math.abs(b.x-t.x)<shot.chain);for(const other of others.slice(0,2)){shot.targets.add(other);if(other.invuln<=0)SR.dealHit({x:t.x,face:other.x<t.x?-1:1},other,{damage:Math.round(shot.damage*.7),knock:90,stun:.25,type:'projectile'},(...args)=>game.hit(...args));game.beams.push({x:t.x,y:t.y-60,x2:other.x,y2:other.y-60,life:.18});}}
      if(shot.blast)game.blasts.push({x:impactX,y:impactY,r:shot.blast,life:.25});
      if(--shot.pierce<=0){shot.life=0;break;}
    }
    if(shot.x<=0||shot.x>=SR.ARENA.width||shot.travel>=shot.range||shot.y<0||shot.y>720)shot.life=0;
  }
  game.projectiles=game.projectiles.filter(p=>p.life>0);
  for(const group of [game.beams,game.blasts]){for(const p of group)p.life-=dt;}
  game.beams=game.beams.filter(p=>p.life>0);game.blasts=game.blasts.filter(p=>p.life>0);
};
