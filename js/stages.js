SR.regions = ['The Fallen Kingdom', 'The Cursed Abyss', 'The Eternal Eclipse'];
SR.stages = [
  {name:'Ashen Village', waves:[['scout'],['scout','guard']]},
  {name:'Bloodwood Forest', waves:[['scout','archer'],['guard','caster']]},
  {name:'Ruined Citadel', waves:[['guard','scout'],['boss']], boss:'Veyr, the Hollow Crown'},
  {name:'Hollow Temple', waves:[['caster','assassin'],['guard','archer']]},
  {name:'Crystal Catacombs', waves:[['archer','caster'],['brute','scout','caster']]},
  {name:'Abyss Gate', waves:[['caster','guard'],['boss']], boss:'Nhal, Abyss Keeper'},
  {name:'Ember Fortress', waves:[['brute','guard'],['assassin','archer','guard']]},
  {name:'Throne of Shadows', waves:[['assassin','caster','archer'],['brute','caster','guard']]},
  {name:'The Last Eclipse', waves:[['assassin','brute'],['boss']], boss:'Astrael, Eclipse Sovereign'}
].map((s,i)=>({...s,id:i,region:Math.floor(i/3),coins:70+i*15,xp:90+i*20}));
SR.spawnWave = (stage, wave, player) => stage.waves[wave].map((type,i)=>{
  const e = type === 'boss' ? SR.makeBoss(stage) : SR.makeEnemy();
  e.kind=type;e.name=type==='boss'?stage.boss:SR.enemyTypes[type].name;
  if(type!=='boss'){
    const config=SR.enemyTypes[type];e.maxHp=e.hp=config.hp+stage.region*10;e.speed=config.speed;e.rest=config.rest;e.tint=config.color;
    e.damageScale=.65+stage.region*.10;e.reward={coins:config.coins,xp:config.xp};
    if(type==='brute'){e.armor=.15;e.w=65;e.h=120;}if(type==='assassin')e.w=38;
  }else{e.reward={coins:90+stage.region*35,xp:60+stage.region*20};}
  const side=player.x>1450?-1:1;
  e.x=Math.max(70,Math.min(2130,player.x+side*(360+i*105)));
  e.cooldown=1.1+i*.4; e.spawnGrace=.8; return e;
});
