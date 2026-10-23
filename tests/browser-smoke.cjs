// Optional test dependency; never loaded by the game.
const {chromium}=require(process.env.SR_PLAYWRIGHT||'playwright');
const assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.SR_CHROMIUM_PATH||undefined,headless:true,args:['--no-sandbox']});
 try{
  const context=await browser.newContext({viewport:{width:1440,height:1050}}),page=await context.newPage(),errors=[],remote=[];
  const base=process.argv[2]||'http://127.0.0.1:8765',origin=new URL(base).origin;
  page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(/^https?:/.test(r.url())&&new URL(r.url()).origin!==origin)remote.push(r.url());});
  if(process.env.SR_STANDALONE){await context.setOffline(true);await page.setContent(fs.readFileSync(process.env.SR_STANDALONE,'utf8'));}
  else{await page.goto(base);await context.setOffline(true);}
  await page.click('#stages');assert.equal(await page.locator('[data-stage="1"]').isDisabled(),true);await page.click('#back');
  await page.click('#primary');await page.waitForFunction(()=>game.state==='playing');
  assert.equal(await page.evaluate(()=>game.player.unlockedSkills.nova),false);
  await page.keyboard.press('i');await page.waitForTimeout(60);assert.equal(await page.evaluate(()=>game.player.attack),null);
  const x=await page.evaluate(()=>game.player.x);await page.keyboard.down('d');await page.waitForTimeout(200);await page.keyboard.up('d');assert.ok(await page.evaluate(()=>game.player.x)>x+25);
  await page.keyboard.down('a');await page.waitForTimeout(200);await page.keyboard.up('a');assert.ok(await page.evaluate(()=>game.player.x)<x+25);
  await page.keyboard.press('w');await page.waitForTimeout(120);assert.ok(await page.evaluate(()=>game.player.y)<530);await page.waitForFunction(()=>game.player.grounded);
  await page.evaluate(()=>game.start(0));
  for(const key of ['j','j','k']){await page.keyboard.press(key);await page.waitForTimeout(60);if(key!=='k')await page.waitForFunction(()=>!game.player.attack&&game.player.cooldown===0);}
  assert.equal(await page.evaluate(()=>game.player.attack?.type),'finisher');
  await page.evaluate(()=>game.start(0));await page.keyboard.press('l');await page.waitForFunction(()=>game.player.dashCooldown>0);await page.waitForTimeout(210);assert.ok(await page.evaluate(()=>game.player.x)>440);
  await page.keyboard.down('Space');await page.waitForFunction(()=>game.player.blocking);await page.keyboard.up('Space');await page.waitForFunction(()=>!game.player.blocking);
  await page.keyboard.press('u');await page.waitForFunction(()=>game.player.attack?.type==='rift');
  await page.keyboard.press('Escape');await page.waitForFunction(()=>game.state==='paused');
  const frozen=await page.evaluate(()=>[game.elapsed,game.player.energy,game.player.skillCooldowns.rift]);await page.waitForTimeout(150);assert.deepEqual(await page.evaluate(()=>[game.elapsed,game.player.energy,game.player.skillCooldowns.rift]),frozen);
  await page.click('#primary');await page.evaluate(()=>window.dispatchEvent(new Event('blur')));assert.equal(await page.evaluate(()=>game.state),'paused');await page.click('#primary');
  const campaign=await page.evaluate(()=>{
   game.newGame();const out=[];
   for(let id=0;id<9;id++){
    if(id===0)game.start(0);else document.getElementById('primary').click();if(game.stageId!==id||game.state!=='playing')throw Error('Stage transition failed');const phases=new Set();
    for(let n=0;n<60000&&game.state==='playing';n++){
     const p=game.player,e=game.enemies.reduce((a,b)=>!a||Math.abs(b.x-p.x)<Math.abs(a.x-p.x)?b:a,null);game.input.held.clear();
     if(e){
      if(e.boss)phases.add(e.phase);const distance=Math.abs(e.x-p.x);
      if(distance>72)game.input.held.add(e.x>p.x?'KeyD':'KeyA');
      if(e.boss&&p.grounded)game.input.pressed.add('KeyW');
      if(!p.attack&&p.cooldown===0){
       if(distance<260&&p.unlockedSkills.eclipse&&p.energy>=85&&p.skillCooldowns.eclipse===0)game.input.pressed.add('KeyO');
       else if(distance<180&&p.unlockedSkills.nova&&p.energy>=40&&p.skillCooldowns.nova===0)game.input.pressed.add('KeyI');
       else if(distance<280&&p.energy>=25&&p.skillCooldowns.rift===0)game.input.pressed.add('KeyU');
       else if(distance<130)game.input.pressed.add('KeyK');
      }
     }
     game.step(1/120);game.input.endFrame();
    }
    const coins=game.progress.coins;game.finish(true);if(game.progress.coins!==coins)throw Error('Double reward');
    out.push({stage:id+1,state:game.state,hp:game.player.hp,kills:game.kills,phases:[...phases]});
    if(game.state!=='victory')break;
    for(const key of ['damage','hp','energy','cooldown'])if(SR.buyUpgrade(game.progress,key))game.save.write(game.progress);
   }return out;
  });
  assert.equal(campaign.length,9);for(const s of campaign)assert.equal(s.state,'victory');assert.deepEqual(campaign[8].phases,[1,2,3]);
  // All skills now unlocked from real wins; test their physical key bindings.
  for(const [key,type] of [['i','nova'],['o','eclipse']]){await page.evaluate(()=>game.start(0));await page.keyboard.press(key);await page.waitForFunction(t=>game.player.attack?.type===t,type);}
  const defeat=await page.evaluate(()=>{game.start(8);const before=game.progress.coins;for(let n=0;n<60000&&game.state==='playing';n++){game.step(1/120);game.input.endFrame();}return {state:game.state,coinsUnchanged:before===game.progress.coins};});
  assert.equal(defeat.state,'defeat');assert.ok(defeat.coinsUnchanged);await page.click('#primary');assert.equal(await page.evaluate(()=>game.player.hp),await page.evaluate(()=>game.player.maxHp));
  await page.keyboard.press('Escape');await page.waitForFunction(()=>game.state==='paused');await page.click('#back');
  await page.click('#stages');assert.equal(await page.locator('[data-stage="8"]').isDisabled(),false);await page.click('#back');
  await page.click('#upgrades');assert.match(await page.textContent('.menu'),/COINS/);await page.click('#back');
  await page.click('#settings');await page.locator('#shake').uncheck();await page.locator('#effects').selectOption('low');await page.locator('#volume').fill('20');
  assert.equal(await page.evaluate(()=>game.progress.settings.effects),'low');assert.equal(await page.evaluate(()=>game.progress.settings.shake),false);
  await page.click('#sound');assert.equal(await page.getAttribute('#sound','aria-pressed'),'true');
  const progress=await page.evaluate(()=>JSON.stringify(game.progress));
  const downloadPromise=page.waitForEvent('download');await page.click('#export-save');const download=await downloadPromise;assert.equal(download.suggestedFilename(),'Shadow-Rift-save.json');
  await page.locator('#import-file').setInputFiles({name:'invalid.json',mimeType:'application/json',buffer:Buffer.from('{broken')});await page.waitForFunction(()=>document.getElementById('import-message').textContent.includes('tidak valid'));assert.deepEqual(await page.evaluate(()=>game.progress),JSON.parse(progress));
  await page.locator('#import-file').setInputFiles({name:'valid.json',mimeType:'application/json',buffer:Buffer.from(progress)});await page.waitForFunction(()=>document.getElementById('import-message').textContent==='Import berhasil.');
  if(!process.env.SR_STANDALONE){
   await context.setOffline(false);await page.reload();await context.setOffline(true);assert.deepEqual(await page.evaluate(()=>game.progress),JSON.parse(progress));
   const backup=await page.evaluate(()=>JSON.parse(localStorage.getItem(game.save.backupKey)));
   await page.evaluate(()=>localStorage.setItem('shadow-rift-save-v1','{broken'));await context.setOffline(false);await page.reload();await context.setOffline(true);assert.deepEqual(await page.evaluate(()=>game.progress),backup);assert.match(await page.evaluate(()=>game.save.message),/cadangan/i);
   await page.evaluate(()=>localStorage.setItem(game.save.backupKey,'{broken'));await context.setOffline(false);await page.reload();await context.setOffline(true);assert.equal(await page.evaluate(()=>game.progress.completed.length),0);assert.ok(await page.evaluate(()=>game.save.message.length>0));
   await page.evaluate(data=>{game.progress=SR.validateSave(JSON.parse(data));game.save.write(game.progress);game.ui.screen('menu');},progress);
  }
  if(await page.evaluate(()=>game.state!=='menu'))await page.click('#back');
  await page.click('#new-game');await page.click('#back');assert.equal(await page.evaluate(()=>game.progress.completed.length),9);
  await page.click('#exit');assert.equal(await page.evaluate(()=>game.state),'exit');await page.click('#back');
  if(process.env.SR_SCREENSHOT)await page.screenshot({path:process.env.SR_SCREENSHOT});
  assert.deepEqual(errors,[]);assert.deepEqual(remote,[]);
  console.log(JSON.stringify({result:'PASS',campaign,checks:'controls, waves, bosses, phase 3, reward guard, upgrades, skill unlock, defeat, retry, settings, export/import, new game cancel, exit',persistence:process.env.SR_STANDALONE?'not available on about:blank; blocked storage handled':'reload, backup recovery and corrupt save passed',errors,remote},null,2));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
