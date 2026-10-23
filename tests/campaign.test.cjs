const {test}=require('node:test'),assert=require('node:assert/strict');
for(const f of ['input','player','enemies','combat','stages','progression','save','bosses'])require('../js/'+f+'.js');
const S=globalThis.SR;
test('nine ordered stages, three bosses, final boss three phases',()=>{
 assert.equal(S.stages.length,9);assert.deepEqual(S.stages.filter(s=>s.boss).map(s=>s.id),[2,5,8]);
 const p=S.makePlayer(),b=S.makeBoss(S.stages[8]),g={camera:0,hazards:[]};
 for(const [hp,phase] of [[440,1],[280,2],[130,3]]){b.hp=hp;S.updateBoss(b,p,.01,g);assert.equal(b.phase,phase);}
});
test('all waves spawn bounded valid actors with expected compositions',()=>{
 for(const stage of S.stages)for(let w=0;w<stage.waves.length;w++)for(const x of [30,1100,2150]){
  const p=S.makePlayer();p.x=x;const enemies=S.spawnWave(stage,w,p);
  assert.equal(enemies.length,stage.waves[w].length);for(const e of enemies){assert.ok(e.x>=e.w/2&&e.x<=2200-e.w/2);assert.ok(e.hp>0);assert.ok(e.spawnGrace>0);}
 }
});
test('one area swing hits multiple targets once with one clock advance',()=>{
 const p=S.makePlayer(),a=S.makeEnemy(),b=S.makeEnemy();a.x=p.x-80;b.x=p.x+90;S.useSkill(p,'nova');
 S.resolveAttack(p,[a,b],.28);assert.equal(p.attack.time,.28);assert.equal(a.hp,142);assert.equal(b.hp,142);
 a.invuln=0;b.invuln=0;S.resolveAttack(p,[a,b],.02);assert.equal(a.hp,142);assert.equal(b.hp,142);
});
test('sequential completion, ranks, reduced replay rewards and skill gates',()=>{
 const p=S.freshProgress(),actor=S.makePlayer();S.applyProgress(actor,p);assert.equal(actor.unlockedSkills.nova,false);assert.equal(S.useSkill(actor,'nova'),false);
 assert.throws(()=>S.finishStage(p,1,{time:20,damageTaken:0}));
 for(let i=0;i<9;i++)S.finishStage(p,i,{time:90,damageTaken:0});
 assert.equal(p.unlocked,8);assert.equal(p.completed.length,9);assert.equal(p.ranks[8],'S');
 S.applyProgress(actor,p);assert.ok(actor.unlockedSkills.nova&&actor.unlockedSkills.eclipse);
 const coins=p.coins;const replay=S.finishStage(p,0,{time:200,damageTaken:150});assert.equal(replay.first,false);assert.equal(p.coins-coins,17);assert.equal(p.ranks[0],'S');
 assert.deepEqual(S.validateSave(p),p);
});
test('upgrades are bounded, charged once and change combat stats',()=>{
 const p=S.freshProgress();assert.equal(S.buyUpgrade(p,'hp'),false);p.coins=5000;
 for(let i=0;i<5;i++)assert.ok(S.buyUpgrade(p,'hp'));assert.equal(S.buyUpgrade(p,'hp'),false);assert.equal(S.buyUpgrade(p,'__proto__'),false);
 for(const key of ['damage','energy','cooldown'])assert.ok(S.buyUpgrade(p,key));
 const actor=S.makePlayer();S.applyProgress(actor,p);assert.equal(actor.hp,220);assert.equal(actor.energy,115);S.beginAttack(actor,'heavy');assert.equal(actor.attack.damage,36);assert.equal(actor.cooldownScale,.92);
});
test('save roundtrip, malformed and malicious saves, blocked storage',()=>{
 let raw=null;const store={getItem:()=>raw,setItem:(key,v)=>raw=v},save=new S.Save(store),p=S.freshProgress();
 S.finishStage(p,0,{time:60,damageTaken:0});assert.ok(save.write(p));assert.deepEqual(save.load(),p);
 raw='{broken';assert.deepEqual(save.load(),S.freshProgress());assert.ok(save.message);assert.equal(raw,'{broken');
 for(const bad of [{...p,coins:-1},{...p,completed:[2]},{...p,unlocked:8},{...p,version:99},{...p,settings:{...p.settings,volume:Infinity}}])assert.throws(()=>S.validateSave(bad));
 const blocked=new S.Save({getItem(){throw Error();},setItem(){throw Error();}});blocked.load();assert.equal(blocked.write(p),false);assert.ok(blocked.message);
});
test('bosses resist stun lock and cast telegraphed hazards',()=>{
 const p=S.makePlayer(),boss=S.makeBoss(S.stages[5]);boss.x=p.x+90;boss.cooldown=0;boss.spawnGrace=0;
 const g={camera:0,hazards:[]};S.updateBoss(boss,p,.01,g);assert.equal(g.hazards.length,1);assert.ok(g.hazards[0].wait>0);assert.equal(g.hazards[0].x,p.x);
 boss.attack=null;boss.cooldown=0;S.beginAttack(boss,'bossSweep');S.beginAttack(p,'heavy');S.resolveAttack(p,boss,.35);assert.equal(boss.stun,0);assert.ok(boss.attack);
});
