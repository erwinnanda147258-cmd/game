const {test}=require('node:test'),assert=require('node:assert/strict');
for(const f of ['input','player','enemies','combat','projectiles','stages','bosses'])require('../js/'+f+'.js');
const S=globalThis.SR;
const arena=()=>({player:S.makePlayer(),enemies:[],projectiles:[],beams:[],blasts:[],hazards:[],camera:0,hit(){}});
function actor(kind,x){const e=S.spawnWave({...S.stages[0],waves:[[kind]]},0,S.makePlayer())[0];e.x=x;e.cooldown=0;e.spawnGrace=0;return e;}
test('six enemy roles select distinct attacks, guard and flank windups',()=>{
 const g=arena(),p=g.player;
 for(const [kind,type,d] of [['scout','lunge',80],['brute','bruteSmash',140],['archer','arrow',300],['caster','hexBolt',300]]){
  const e=actor(kind,p.x+d);S.updateEnemy(e,p,.01,g);assert.equal(e.attack.type,type);assert.equal(e.intent,'WINDUP');
 }
 const guard=actor('guard',p.x+90);guard.cooldown=1;S.updateEnemy(guard,p,.01,g);assert.ok(guard.guarding);
 const a=actor('assassin',p.x+150);S.updateEnemy(a,p,.01,g);assert.ok(a.flankPrep>0);S.updateEnemy(a,p,.5,g);assert.ok(a.dash>0);
 const caster=actor('caster',p.x+200);caster.attacks=1;S.updateEnemy(caster,p,.01,g);assert.equal(g.hazards.length,1);assert.ok(g.hazards[0].wait>=1);
});
test('projectiles move, use swept collision, and cannot hit through arena bounds',()=>{
 const g=arena(),e=actor('scout',600);g.enemies=[e];S.spawnProjectile(g,g.player,{speed:2000,range:1000,damage:20});S.updateProjectiles(g,.2);assert.equal(e.hp,e.maxHp-20);assert.equal(g.projectiles.length,0);
 e.x=2300;e.hp=e.maxHp;g.player.x=2100;S.spawnProjectile(g,g.player,{speed:2000,range:1000,damage:20});S.updateProjectiles(g,.2);assert.equal(e.hp,e.maxHp);assert.equal(g.projectiles.length,0);
});
test('enemy arrows are emitted after the windup and actual impact damages player',()=>{
 const g=arena(),e=actor('archer',600);S.updateEnemy(e,g.player,.01,g);S.resolveAttack(e,g.player,.5,()=>{},g);assert.equal(g.projectiles.length,0);
 S.resolveAttack(e,g.player,.46,()=>{},g);assert.equal(g.projectiles.length,1);assert.equal(g.player.hp,120);
 S.updateProjectiles(g,.6);assert.ok(g.player.hp<120);
});
test('tank guard rewards heavy attacks or flanking, and slow has finite duration',()=>{
 const p=S.makePlayer(),e=actor('guard',p.x+80);e.face=-1;e.guarding=true;
 S.dealHit(p,e,{damage:20,knock:100,stun:.2,type:'light'});assert.equal(e.hp,e.maxHp-8);
 S.dealHit(p,e,{damage:20,knock:100,stun:.2,type:'heavy',slow:2});assert.equal(e.hp,e.maxHp-28);assert.equal(e.guarding,false);assert.equal(e.slow,2);
 e.vx=100;const x=e.x;S.tickActor(e,1);assert.ok(e.x-x<100);S.tickActor(e,2);assert.equal(e.slow,0);
});
