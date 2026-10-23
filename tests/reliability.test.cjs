const {test}=require('node:test'),assert=require('node:assert/strict');
for(const f of ['input','player','enemies','combat','weapons','shop','stages','progression','save'])require('../js/'+f+'.js');
const S=globalThis.SR;
test('collision resolves fully at both arena walls in either argument order',()=>{
 for(const right of [false,true])for(const reverse of [false,true]){
  const a=S.makePlayer(),b=S.makeEnemy();
  a.x=right?2200-a.w/2:a.w/2;b.x=right?2200-b.w/2:b.w/2;
  S.separate(...(reverse?[b,a]:[a,b]));
  assert.ok(Math.abs(a.x-b.x)>=(a.w+b.w)/2-1e-8);
  for(const c of [a,b])assert.ok(c.x>=c.w/2&&c.x<=2200-c.w/2);
 }
});
test('offscreen enemies retain knockback while stunned and do not slide while attacking',()=>{
 const p=S.makePlayer(),e=S.makeEnemy(),g={camera:1200};e.x=500;e.stun=.4;e.vx=-240;
 S.updateEnemy(e,p,.01,g);assert.equal(e.vx,-240);
 e.stun=0;e.cooldown=0;S.beginAttack(e,'enemy');S.updateEnemy(e,p,.01,g);assert.equal(e.vx,0);
});
function store(){const data=new Map();return {data,getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v)};}
test('corrupt primary restores the last valid backup without overwriting corrupt data',()=>{
 const storage=store(),save=new S.Save(storage),p=S.freshProgress();p.started=true;save.write(p);
 S.finishStage(p,0,{time:10,damageTaken:0});save.write(p);storage.setItem(save.key,'{broken');
 const restored=save.load();assert.equal(restored.started,true);assert.equal(restored.completed.length,0);assert.match(save.message,/cadangan/i);assert.equal(storage.getItem(save.key),'{broken');
});
test('invalid previous data never replaces a valid backup',()=>{
 const storage=store(),save=new S.Save(storage),p=S.freshProgress();p.started=true;save.write(p);save.write(p);
 const backup=storage.getItem(save.backupKey);assert.ok(backup);storage.setItem(save.key,'not json');p.coins=5;assert.ok(save.write(p));assert.equal(storage.getItem(save.backupKey),backup);
});
test('backup failure does not prevent saving the current valid progress',()=>{
 const storage=store(),save=new S.Save(storage),p=S.freshProgress();save.write(p);
 const original=storage.setItem;storage.setItem=(k,v)=>{if(k===save.backupKey)throw Error('quota');original(k,v);};
 p.started=true;assert.ok(save.write(p));assert.equal(save.load().started,true);
});
test('both invalid saves fall back safely and failed writes preserve previous primary',()=>{
 const storage=store(),save=new S.Save(storage);storage.setItem(save.key,'{');storage.setItem(save.backupKey,'[]');assert.deepEqual(save.load(),S.freshProgress());
 const p=S.freshProgress();save.write(p);const old=storage.getItem(save.key);
 storage.setItem=()=>{throw Error('quota');};p.coins=100;assert.equal(save.write(p),false);assert.equal(storage.getItem(save.key),old);
});

test('Escape works from settings inputs while gameplay keys leave form controls alone',()=>{
 const handlers={},i=new S.Input({addEventListener:(name,fn)=>handlers[name]=fn});
 for(const tagName of ['INPUT','SELECT','TEXTAREA']){
  handlers.keydown({code:'KeyA',target:{tagName},preventDefault(){throw Error('Form input intercepted');}});assert.equal(i.down('KeyA'),false);
  let prevented=false;handlers.keydown({code:'Escape',target:{tagName},preventDefault(){prevented=true;}});assert.ok(i.take('Escape'));assert.ok(prevented);handlers.keyup({code:'Escape'});
 }
});
