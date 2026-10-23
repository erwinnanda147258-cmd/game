SR.freshProgress = () => ({version:2,ownedWeapons:['rustblade'],equippedWeapon:'rustblade',weaponLevels:{rustblade:0},started:false,unlocked:0,completed:[],coins:0,xp:0,upgrades:{hp:0,damage:0,energy:0,cooldown:0},ranks:{},settings:{volume:.45,music:true,effects:'high',shake:true}});
SR.level = progress => 1+Math.floor(progress.xp/250);
SR.upgradeCost = (p,key) => 70+p.upgrades[key]*50;
SR.buyUpgrade = (p,key) => {
  if(!Object.hasOwn(p.upgrades,key)||p.upgrades[key]>=5)return false;
  const cost=SR.upgradeCost(p,key);if(p.coins<cost)return false;
  p.coins-=cost;p.upgrades[key]++;return true;
};
SR.applyProgress = (player,p) => {
  const level=SR.level(p)-1;
  player.maxHp=player.hp=120+p.upgrades.hp*20+level*4;
  player.maxEnergy=player.energy=100+p.upgrades.energy*15;
  player.damageScale=1+p.upgrades.damage*.12+level*.025;
  player.cooldownScale=1-p.upgrades.cooldown*.08;
  if(SR.setWeapon)SR.setWeapon(player,p);
  player.unlockedSkills={rift:true,nova:p.completed.includes(1),eclipse:p.completed.includes(5)};
};
SR.finishStage = (p,id,stats) => {
  if(!Number.isInteger(id)||id<0||id>p.unlocked||id>=9)throw new Error('Invalid stage completion');
  const rank=stats.damageTaken===0&&stats.time<120?'S':stats.damageTaken<60&&stats.time<160?'A':stats.damageTaken<140?'B':'C';
  const first=!p.completed.includes(id),stage=SR.stages[id];
  const coins=(first?stage.coins:Math.floor(stage.coins*.25))+(stats.threatCoins||0),xp=(first?stage.xp:Math.floor(stage.xp*.3))+(stats.threatXP||0);
  p.coins+=coins;p.xp+=xp;p.started=true;
  if(first)p.completed.push(id);
  p.unlocked=Math.min(8,Math.max(p.unlocked,id+1));
  if(!p.ranks[id]||'CBAS'.indexOf(rank)>'CBAS'.indexOf(p.ranks[id]))p.ranks[id]=rank;
  return {rank,coins,xp,first};
};
