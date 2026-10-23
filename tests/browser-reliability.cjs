const {chromium}=require(process.env.SR_PLAYWRIGHT||'playwright');
const assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.SR_CHROMIUM_PATH||undefined,headless:true,args:['--no-sandbox']});
 try{
  const context=await browser.newContext(),page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  if(process.env.SR_STANDALONE){await context.setOffline(true);await page.setContent(fs.readFileSync(process.env.SR_STANDALONE,'utf8'));}
  else{await page.goto(process.argv[2]||'http://127.0.0.1:8765');await context.setOffline(true);}
  await page.click('#primary');await page.waitForFunction(()=>game.state==='playing');
  await page.click('#sound');assert.equal(await page.evaluate(()=>document.activeElement===game.canvas),true);
  assert.ok(Math.abs(await page.evaluate(()=>game.audio.master.gain.value)-.45)<.0001);
  await page.waitForTimeout(100);await page.keyboard.press('Escape');await page.waitForFunction(()=>game.state==='paused');
  assert.equal(await page.evaluate(()=>game.audio.master.gain.value),0);
  const before=await page.evaluate(()=>{window.originalPlayer=game.player;return {time:game.elapsed,hp:game.player.hp,enemy:game.enemy.hp,energy:game.player.energy};});
  await page.click('#settings');await page.locator('#volume').fill('17');await page.locator('#music').uncheck();await page.locator('#effects').selectOption('low');
  assert.equal(await page.evaluate(()=>game.audio.musicBus.gain.value),0);
  await page.waitForTimeout(150);await page.keyboard.press('Escape');await page.waitForFunction(()=>game.state==='paused');
  assert.deepEqual(await page.evaluate(()=>({time:game.elapsed,hp:game.player.hp,enemy:game.enemy.hp,energy:game.player.energy})),before);
  await page.click('#back');assert.match(await page.textContent('#primary'),/RESUME/);await page.waitForTimeout(100);
  assert.equal(await page.evaluate(()=>game.elapsed),before.time);
  await page.click('#primary');await page.waitForFunction(()=>game.state==='playing');assert.equal(await page.evaluate(()=>game.player===window.originalPlayer),true);
  assert.ok(Math.abs(await page.evaluate(()=>game.audio.master.gain.value)-.17)<.0001);
  await page.click('#sound');assert.equal(await page.evaluate(()=>game.audio.master.gain.value),0);await page.click('#sound');
  // Brand navigation must not reload the document and discard the current battle.
  await page.click('.brand');assert.equal(await page.evaluate(()=>game.state),'menu');assert.equal(await page.evaluate(()=>game.player===window.originalPlayer),true);
  await page.click('#settings');
  for(const content of ['{broken',await page.evaluate(()=>JSON.stringify({...game.progress,coins:999}))]){
   await page.evaluate(()=>{
    const el=document.getElementById('import-file');
    window.importPending=el.onchange({target:{files:[{size:100,text:()=>new Promise(resolve=>{window.releaseImport=resolve;})}]}});
   });
   const snapshot=await page.evaluate(()=>JSON.stringify(game.progress));await page.click('#back');
   await page.evaluate(async text=>{window.releaseImport(text);await window.importPending;},content);
   assert.equal(await page.evaluate(()=>JSON.stringify(game.progress)),snapshot);assert.equal(await page.evaluate(()=>game.state),'menu');
   await page.click('#settings');
  }
  await page.click('#back');await page.click('#new-game');await page.click('#primary');
  assert.equal(await page.evaluate(()=>game.state),'playing');assert.equal(await page.evaluate(()=>game.player===window.originalPlayer),false);
  assert.equal(await page.evaluate(()=>game.progress.settings.volume),.17);assert.equal(await page.evaluate(()=>game.progress.settings.music),false);assert.equal(await page.evaluate(()=>game.progress.settings.effects),'low');
  assert.deepEqual(errors,[]);
  console.log('PASS: pause/settings/menu resume without reset; brand navigation; live mute/volume/music buses; stale async imports ignored; New Game preserves preferences; no browser errors.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
