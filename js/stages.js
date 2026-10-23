SR.regions = ['The Fallen Kingdom', 'The Cursed Abyss', 'The Eternal Eclipse'];
SR.stages = [
  {name:'Ashen Village', waves:[['scout'],['scout','guard']]},
  {name:'Bloodwood Forest', waves:[['scout','scout'],['guard','caster']]},
  {name:'Ruined Citadel', waves:[['guard','scout'],['boss']], boss:'Veyr, the Hollow Crown'},
  {name:'Hollow Temple', waves:[['caster','scout'],['guard','caster']]},
  {name:'Crystal Catacombs', waves:[['scout','caster'],['guard','scout','caster']]},
  {name:'Abyss Gate', waves:[['caster','guard'],['boss']], boss:'Nhal, Abyss Keeper'},
  {name:'Ember Fortress', waves:[['guard','guard'],['scout','caster','guard']]},
  {name:'Throne of Shadows', waves:[['scout','caster','scout'],['guard','caster','guard']]},
  {name:'The Last Eclipse', waves:[['guard','caster'],['boss']], boss:'Astrael, Eclipse Sovereign'}
].map((s,i)=>({...s,id:i,region:Math.floor(i/3),coins:70+i*15,xp:90+i*20}));
SR.spawnWave = (stage, wave, player) => stage.waves[wave].map((type,i)=>{
  const e = type === 'boss' ? SR.makeBoss(stage) : SR.makeEnemy();
  e.kind=type; e.name=type==='boss'?stage.boss:{scout:'Ash Stalker',guard:'Rift Sentinel',caster:'Hex Weaver'}[type];
  if(type!=='boss'){
    e.maxHp=e.hp=({scout:45,guard:75,caster:55}[type])+stage.region*12;
    e.speed={scout:180,guard:125,caster:125}[type];
    e.damageScale=.65+stage.region*.12;
  }
  const side=player.x>1450?-1:1;
  e.x=Math.max(70,Math.min(2130,player.x+side*(360+i*105)));
  e.cooldown=1.1+i*.4; e.spawnGrace=.8; return e;
});
