const {chromium}=require(process.env.SR_PLAYWRIGHT||'playwright');const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({executablePath:process.env.SR_CHROMIUM_PATH||undefined,args:['--no-sandbox']});try{
const page=await browser.newPage({viewport:{width:1280,height:900}}),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(process.argv[2]||'http://127.0.0.1:8765');
const result=await page.evaluate(()=>{
 const canvas=document.createElement('canvas');canvas.width=960;canvas.height=540;const cc=canvas.getContext('2d'),hashes=[];
 game.state='paused';
 for(let id=0;id<9;id++){
  game.stageId=id;game.stage=SR.stages[id];game.camera=400;game.elapsed=2;game.renderer.draw(game);
  const data=game.canvas.getContext('2d').getImageData(0,0,1280,570).data;let hash=2166136261;for(let i=0;i<data.length;i+=16)hash=Math.imul(hash^data[i],16777619);hashes.push(hash);
  cc.drawImage(game.canvas,0,0,1280,720,id%3*320,Math.floor(id/3)*180,320,180);cc.fillStyle='white';cc.font='12px Arial';cc.fillText(game.stage.name,id%3*320+8,Math.floor(id/3)*180+20);
 }
 const bg=game.renderer.backgrounds,c=game.canvas.getContext('2d'),original=c.drawImage,offsets=[];c.drawImage=function(...args){offsets.push(args[1]);return original.apply(this,args);};bg.draw(c,game);c.drawImage=original;
 document.body.replaceChildren(canvas);return {hashes,offsets,planes:bg.planes.length};
});assert.equal(new Set(result.hashes).size,9);assert.deepEqual(result.offsets,[-48,-140,-272]);assert.equal(result.planes,3);assert.deepEqual(errors,[]);await page.screenshot({path:process.env.SR_SCREENSHOT||'/tmp/shadow-backgrounds.png'});console.log('PASS: nine distinct renders; three camera-linked planes; no browser errors.');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
