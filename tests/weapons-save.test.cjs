const {test}=require('node:test'),assert=require('node:assert/strict');
for(const f of ['input','player','enemies','combat','weapons','shop','projectiles','stages','progression','save','bosses'])require('../js/'+f+'.js');
const S=globalThis.SR;
function ready(id){const save=S.freshProgress();save.ownedWeapons.push(...Object.keys(S.weapons).filter(k=>k!=='rustblade'));for(const k of save.ownedWeapons)save.weaponLevels[k]=0;save.equippedWeapon=id;const p=S.makePlayer();S.applyProgress(p,save);return {save,p};}
function game(p){return {player:p,enemies:[],projectiles:[],beams:[],blasts:[],hit(){}};}
const noInput={take(){return false;},down(){return false;}};
test('twelve configured weapons all cause real damage through J and K',()=>{
 assert.equal(Object.keys(S.weapons).length,12);
 for(const id of Object.keys(S.weapons))for(const key of ['J','K']){
  const {p}=ready(id),g=game(p),e=S.makeEnemy();e.x=p.x+(p.weapon.category==='Sword'?70:180);g.enemies=[e];
  assert.ok(S.playerAttack(p,key),id+key);
  for(let n=0;n<300;n++){S.resolveAttack(p,g.enemies,1/120,()=>{},g);S.updateProjectiles(g,1/120);S.tickActor(e,1/120);}
  assert.ok(e.hp<e.maxHp,id+key+' must hit');
 }
});
test('swords change speed/reach, preserve JJK and Eclipse Edge launches a moving slash',()=>{
 const fast=ready('nightfang').p,heavy=ready('great_riftblade').p;S.playerAttack(fast,'J');S.playerAttack(heavy,'J');assert.ok(fast.attack.recovery<heavy.attack.recovery);assert.ok(fast.attack.range<heavy.attack.range);
 const {p}=ready('eclipse_edge');p.combo='JJ';p.comboWindow=1;assert.ok(S.playerAttack(p,'K'));assert.equal(p.attack.type,'finisher');const g=game(p);S.resolveAttack(p,[],.3,()=>{},g);assert.equal(g.projectiles.length,1);
});
test('gun ammo, timed reload, burst and equip restrictions prevent free refills',()=>{
 const {p,save}=ready('twin_handcannons'),g=game(p);S.playerAttack(p,'J');assert.equal(p.magazines[p.weaponId].ammo,10);S.resolveAttack(p,[],.09,()=>{},g);assert.equal(g.projectiles.length,1);S.resolveAttack(p,[],.08,()=>{},g);assert.equal(g.projectiles.length,2);
 assert.equal(S.equipWeapon(save,'rustblade',p).ok,false);p.attack=null;p.cooldown=0;assert.ok(S.beginReload(p));assert.equal(S.playerAttack(p,'J'),false);assert.equal(S.equipWeapon(save,'rustblade',p).ok,false);
 S.updateWeapon(p,2,noInput);assert.equal(p.magazines[p.weaponId].ammo,12);assert.ok(S.equipWeapon(save,'rustblade',p).ok);assert.ok(S.equipWeapon(save,'twin_handcannons',p).ok);assert.equal(p.magazines[p.weaponId].ammo,12);
 p.magazines[p.weaponId].ammo=5;S.equipWeapon(save,'rustblade',p);S.equipWeapon(save,'twin_handcannons',p);assert.equal(p.magazines[p.weaponId].ammo,5);
});
test('magic uses finite energy, staff chains and grimoire slows groups',()=>{
 for(const id of ['storm_staff','void_grimoire']){
  const {p}=ready(id),g=game(p),a=S.makeEnemy(),b=S.makeEnemy();a.x=p.x+180;b.x=a.x+50;g.enemies=[a,b];
  assert.ok(S.playerAttack(p,'J'));assert.equal(p.energy,p.maxEnergy-p.weapon.cost);for(let n=0;n<120;n++){S.resolveAttack(p,g.enemies,1/120,()=>{},g);S.updateProjectiles(g,1/120);}
  assert.ok(a.hp<a.maxHp&&b.hp<b.maxHp);if(id==='void_grimoire')assert.ok(a.slow>0&&b.slow>0);
 }
 const {p}=ready('astral_catalyst');p.energy=5;assert.equal(S.playerAttack(p,'K'),false);assert.equal(p.energy,5);assert.equal(p.attack,null);
});
test('purchase/equip/upgrade enforce balances, ownership and level five',()=>{
 const p=S.freshProgress();assert.equal(S.buyWeapon(p,'rift_pistol').ok,false);p.coins=300;assert.ok(S.buyWeapon(p,'rift_pistol').ok);assert.equal(p.coins,0);assert.equal(S.buyWeapon(p,'rift_pistol').ok,false);assert.equal(S.equipWeapon(p,'void_rifle').ok,false);
 assert.ok(S.equipWeapon(p,'rift_pistol').ok);assert.equal(S.upgradeWeapon(p,'rift_pistol').ok,false);p.coins=5000;
 let last=0;for(let i=0;i<5;i++){const cost=S.weaponUpgradeCost(p,'rift_pistol');assert.ok(cost>last);last=cost;assert.ok(S.upgradeWeapon(p,'rift_pistol').ok);}assert.equal(S.upgradeWeapon(p,'rift_pistol').ok,false);
 const leveled=S.weaponStats('rift_pistol',5);assert.ok(leveled.damage>18&&leveled.capacity>8&&leveled.tempo<.42);
 assert.equal(S.buyWeapon(p,'__proto__').ok,false);
});
test('v1 save migrates all campaign fields and settings without mutation',()=>{
 const current=S.freshProgress();for(let i=0;i<6;i++)S.finishStage(current,i,{time:90,damageTaken:0});current.upgrades.hp=3;current.settings.volume=.12;
 const old={...current,version:1};delete old.ownedWeapons;delete old.equippedWeapon;delete old.weaponLevels;const snapshot=JSON.stringify(old),migrated=S.validateSave(old);
 assert.equal(migrated.version,2);assert.deepEqual(migrated.ownedWeapons,['rustblade']);assert.equal(migrated.equippedWeapon,'rustblade');
 for(const key of ['completed','unlocked','coins','xp','upgrades','ranks','settings'])assert.deepEqual(migrated[key],old[key]);assert.equal(JSON.stringify(old),snapshot);
});
test('v2 roundtrip, invalid inventory and invalid import cannot replace backup',()=>{
 const data=new Map(),save=new S.Save({getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v)}),p=S.freshProgress();p.coins=2000;S.buyWeapon(p,'storm_staff');S.equipWeapon(p,'storm_staff');S.upgradeWeapon(p,'storm_staff');assert.ok(save.write(p));save.write(p);assert.deepEqual(save.load(),S.validateSave(p));
 const backup=data.get(save.backupKey);
 for(const bad of [{...p,ownedWeapons:['storm_staff']},{...p,equippedWeapon:'void_rifle'},{...p,weaponLevels:{...p.weaponLevels,storm_staff:6}},{...p,ownedWeapons:['rustblade','rustblade']}]){assert.throws(()=>S.validateSave(bad));assert.equal(save.write(bad),false);assert.equal(data.get(save.backupKey),backup);}
 data.set(save.key,'{broken');assert.equal(save.load().equippedWeapon,'storm_staff');
});
test('equipping every class retains legacy skill unlocks and cooldowns',()=>{
 const {p,save}=ready('rustblade');p.unlockedSkills={rift:true,nova:true,eclipse:true};p.skillCooldowns.nova=4;
 for(const id of ['rift_pistol','storm_staff','rustblade']){assert.ok(S.equipWeapon(save,id,p).ok);assert.ok(p.unlockedSkills.eclipse);assert.equal(p.skillCooldowns.nova,4);}
});

test('both burst rounds damage a target; player protection remains intact',()=>{
 const {p}=ready('twin_handcannons'),g=game(p),e=S.makeEnemy();e.x=p.x+180;g.enemies=[e];S.playerAttack(p,'J');
 for(let n=0;n<120;n++){S.resolveAttack(p,g.enemies,1/120,()=>{},g);S.updateProjectiles(g,1/120);S.tickActor(e,1/120);}
 assert.equal(e.hp,e.maxHp-26);
 S.dealHit(e,p,{damage:1,knock:0,stun:0,type:'projectile'});assert.equal(p.invuln,.24);
});
test('boss later-phase volley retains a readable windup and original phase count',()=>{
 for(let region=0;region<3;region++){const e=S.makeBoss({region}),p=S.makePlayer(),g=game(p);g.hazards=[];g.camera=0;e.x=p.x+180;e.hp=e.maxHp*.5;e.attacks=3;e.cooldown=0;S.updateBoss(e,p,1/120,g);assert.equal(e.phase,2);assert.ok(e.attack.projectile);assert.ok(e.attack.windup>.7);}
});
