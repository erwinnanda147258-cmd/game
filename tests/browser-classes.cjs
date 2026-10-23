const {chromium}=require(process.env.SR_PLAYWRIGHT||'playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.SR_CHROMIUM_PATH,headless:true,args:['--no-sandbox']});
 try {
  const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(process.argv[2]||'http://127.0.0.1:8765');
  for(const weapon of ['rift_pistol','apprentice_focus']){
   const result=await page.evaluate(weapon=>{
    game.newGame();const results=[];
    for(let stage=0;stage<9;stage++){
     game.start(stage);
     for(let n=0;n<90000&&game.state==='playing';n++){
      const p=game.player,e=game.enemies.reduce((a,b)=>!a||Math.abs(b.x-p.x)<Math.abs(a.x-p.x)?b:a,null);game.input.held.clear();
      if(e){
       const d=Math.abs(e.x-p.x),ranged=p.weapon.category!=='Sword';
       p.face=e.x>p.x?1:-1;
       if(d>(ranged?260:72))game.input.held.add(e.x>p.x?'KeyD':'KeyA');
       if(e.boss&&p.grounded&&( !ranged || (e.attack&&e.attack.time<e.attack.windup&&d<e.attack.range+40) || game.hazards.some(h=>h.wait<.3&&Math.abs(h.x-p.x)<h.r+30)))game.input.pressed.add('KeyW');
       if(!p.attack&&p.cooldown===0){
        if(d<260&&p.unlockedSkills.eclipse&&p.energy>=85&&p.skillCooldowns.eclipse===0)game.input.pressed.add('KeyO');
        else if(d<180&&p.unlockedSkills.nova&&p.energy>=40&&p.skillCooldowns.nova===0)game.input.pressed.add('KeyI');
        else if(d<280&&p.energy>=25&&p.skillCooldowns.rift===0)game.input.pressed.add('KeyU');
        else if(d<(ranged?600:130)&&(!ranged||p.grounded))game.input.pressed.add(ranged?'KeyJ':'KeyK');
       }
      }
      game.step(1/120);game.input.endFrame();
     }
     results.push({stage:stage+1,state:game.state,weapon:game.player.weaponId,hp:game.player.hp});if(game.state!=='victory')break;
     if(!game.progress.ownedWeapons.includes(weapon)){if(SR.buyWeapon(game.progress,weapon).ok)SR.equipWeapon(game.progress,weapon);}
     if(game.progress.ownedWeapons.includes(weapon))for(const key of ['damage','hp','energy','cooldown'])SR.buyUpgrade(game.progress,key);
    }
    return results;
   },weapon);
   console.log(JSON.stringify({weapon,result}));assert.equal(result.length,9);assert.ok(result.every(s=>s.state==='victory'));assert.equal(result[8].weapon,weapon);
  }
  assert.deepEqual(errors,[]);
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
