const {chromium}=require(process.env.SR_PLAYWRIGHT||'playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.SR_CHROMIUM_PATH,headless:true,args:['--no-sandbox']});
 try {
  const page=await browser.newPage({viewport:{width:1440,height:1050}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto(process.argv[2]||'http://127.0.0.1:8765');
  // Explicit transaction fixture; campaign tests earn their own currency.
  await page.evaluate(()=>{game.progress.coins=2000;game.save.write(game.progress);game.ui.screen('menu');});
  await page.click('#arsenal');await page.click('[data-category="Gun"]');
  assert.equal(await page.locator('.weapon-card').count(),4);
  await page.click('[data-buy="rift_pistol"]');assert.equal(await page.evaluate(()=>game.progress.coins),1700);
  assert.ok(await page.locator('[data-buy="rift_pistol"]').isDisabled());
  await page.click('[data-equip="rift_pistol"]');await page.click('[data-weapon-upgrade="rift_pistol"]');
  assert.equal(await page.evaluate(()=>game.progress.weaponLevels.rift_pistol),1);
  await page.click('#back');await page.click('#stages');await page.click('[data-stage="0"]');await page.keyboard.press('j');
  await page.waitForFunction(()=>game.player.magazines.rift_pistol.ammo===8);
  await page.waitForFunction(()=>!game.player.attack);await page.keyboard.press('r');
  await page.waitForFunction(()=>game.player.magazines.rift_pistol.reload>0);
  await page.keyboard.press('Escape');await page.click('#arsenal');await page.click('[data-category="Sword"]');await page.click('[data-equip="rustblade"]');
  assert.equal(await page.evaluate(()=>game.progress.equippedWeapon),'rift_pistol');assert.match(await page.textContent('#shop-message'),/reload/);
  await page.click('#back');await page.click('#primary');await page.waitForFunction(()=>game.player.magazines.rift_pistol.reload===0);
  assert.equal(await page.evaluate(()=>game.player.magazines.rift_pistol.ammo),9);
  await page.keyboard.press('Escape');await page.click('#arsenal');await page.click('[data-category="Magic"]');await page.click('[data-buy="apprentice_focus"]');await page.click('[data-equip="apprentice_focus"]');
  await page.screenshot({path:'/tmp/shadow-arsenal.png'});
  await page.click('#back');await page.click('#primary');
  const energy=await page.evaluate(()=>game.player.energy);await page.keyboard.press('j');await page.waitForFunction(()=>game.player.attack?.type==='weaponShot');assert.ok(await page.evaluate(()=>game.player.energy)<energy);
  await page.reload();assert.equal(await page.evaluate(()=>game.progress.equippedWeapon),'apprentice_focus');assert.equal(await page.evaluate(()=>game.progress.weaponLevels.rift_pistol),1);
  assert.deepEqual(errors,[]);console.log('PASS: Arsenal categories, purchase, duplicate prevention, equip, upgrade, reload lock, ammunition, Magic energy and persisted inventory.');
 } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
