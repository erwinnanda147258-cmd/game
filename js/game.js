SR.Game = class {
  constructor(){
    this.canvas=document.getElementById('game');this.input=new SR.Input();this.audio=new SR.Audio();this.renderer=new SR.Renderer(this.canvas);
    let storage;try{storage=localStorage;}catch(e){storage={getItem(){throw e;},setItem(){throw e;}};}
    this.save=new SR.Save(storage);this.progress=this.save.load();this.audio.settings=this.progress.settings;
    this.reset(0);this.state='menu';this.ui=new SR.UI(this);this.ui.screen(this.state);this.last=0;this.accumulator=0;
    window.addEventListener('blur',()=>this.pause());document.addEventListener('visibilitychange',()=>{if(document.hidden)this.pause();});
    requestAnimationFrame(t=>this.frame(t));
  }
  reset(id){
    this.stage=SR.stages[id];this.stageId=id;this.player=SR.makePlayer();SR.applyProgress(this.player,this.progress);
    this.enemies=[];this.enemy=SR.makeEnemy();this.elapsed=0;this.camera=0;this.particles=[];this.numbers=[];this.hazards=[];
    this.shake=0;this.accumulator=0;this.activeRun=false;this.panelReturn='menu';this.wave=0;this.waveDelay=0;this.damageTaken=0;this.kills=0;this.reward=null;this.settled=false;this.input.clear();
  }
  start(id=this.stageId){
    if(!Number.isInteger(id)||id<0||id>this.progress.unlocked||id>=9)return false;
    this.reset(id);this.progress.started=true;this.save.write(this.progress);this.enemies=SR.spawnWave(this.stage,0,this.player);this.enemy=this.enemies[0];
    this.activeRun=true;this.state='playing';this.ui.screen(this.state);this.ui.update();this.canvas.focus();return true;
  }
  newGame(){const settings={...this.progress.settings};this.progress=SR.freshProgress();this.progress.settings=settings;this.audio.settings=this.progress.settings;this.save.write(this.progress);this.start(0);}
  showMenu(){this.state='menu';this.input.clear();this.player.buffer=null;this.ui.screen(this.state);}
  openSettings(){this.panelReturn=this.state==='paused'?'paused':'menu';this.input.clear();this.ui.screen('settings');}
  back(){if(this.state==='settings'&&this.panelReturn==='paused'&&this.activeRun)this.ui.screen('paused');else this.showMenu();}
  pause(){if(this.state!=='playing')return;this.state='paused';this.input.clear();this.player.buffer=null;this.ui.screen(this.state);}
  resume(){if(!this.activeRun||this.settled)return false;this.state='playing';this.input.clear();this.ui.screen(this.state);this.canvas.focus();}
  hit(target,damage,face,event='hit'){
    if(target.team==='player')this.damageTaken+=damage;
    this.audio.hit(target.team==='enemy');this.shake=this.progress.settings.shake?.65:0;
    this.numbers.push({x:target.x,y:target.y-target.h-15,text:event==='block'?`BLOCK −${damage}`:event==='break'?`BREAK −${damage}`:String(damage),color:target.team==='enemy'?'#e5c4ff':'#ff8a9e',life:.85});
    const count=this.progress.settings.effects==='low'?4:15;
    for(let i=0;i<count;i++)this.particles.push({x:target.x,y:target.y-60,vx:face*(40+Math.random()*220)+(Math.random()-.5)*130,vy:(Math.random()-.6)*280,life:.25+Math.random()*.25,max:.5,size:2+Math.random()*3,color:target.team==='enemy'?'#c796ff':'#ff667e'});
    if(this.particles.length>250)this.particles.splice(0,this.particles.length-250);
  }
  finish(won){
    if(this.settled)return;this.settled=true;this.activeRun=false;this.state=won?'victory':'defeat';
    if(won){this.reward=SR.finishStage(this.progress,this.stageId,{time:this.elapsed,damageTaken:this.damageTaken});this.save.write(this.progress);}
    this.input.clear();this.ui.screen(this.state);this.ui.update();
  }
  step(dt){
    if(this.state!=='playing')return;
    this.elapsed+=dt;this.audio.update(dt,true);SR.updatePlayer(this.player,this.input,dt);SR.tickActor(this.player,dt);
    for(const e of this.enemies){
      e.spawnGrace=Math.max(0,(e.spawnGrace||0)-dt);
      if(e.boss)SR.updateBoss(e,this.player,dt,this);else SR.updateEnemy(e,this.player,dt,this);
      SR.tickActor(e,dt);SR.separate(this.player,e);
    }
    for(let i=0;i<this.enemies.length;i++)for(let j=i+1;j<this.enemies.length;j++)SR.separate(this.enemies[i],this.enemies[j]);
    SR.resolveAttack(this.player,this.enemies,dt,(...args)=>this.hit(...args));
    for(const e of this.enemies)if(e.hp>0)SR.resolveAttack(e,this.player,dt,(...args)=>this.hit(...args));
    for(const h of this.hazards){
      h.wait-=dt;if(h.wait>0)continue;h.life-=dt;
      if(!h.hit&&this.player.invuln<=0&&Math.abs(this.player.x-h.x)<h.r+this.player.w/2&&this.player.y>500){
        h.hit=true;this.player.hp=Math.max(0,this.player.hp-h.damage);this.player.invuln=.4;this.player.stun=.25;this.player.attack=null;SR.breakCombo(this.player);this.hit(this.player,h.damage,1);
      }
    }
    this.hazards=this.hazards.filter(h=>h.wait>0||h.life>0);
    const dead=this.enemies.filter(e=>e.hp<=0);this.kills+=dead.length;this.enemies=this.enemies.filter(e=>e.hp>0);
    this.enemy=this.enemies.find(e=>e.boss)||this.enemies.reduce((best,e)=>!best||Math.abs(e.x-this.player.x)<Math.abs(best.x-this.player.x)?e:best,null)||{...this.enemy,hp:0};
    if(this.player.hp<=0){this.finish(false);return;}
    if(this.enemies.length===0){
      if(this.wave===this.stage.waves.length-1){this.finish(true);return;}
      this.waveDelay+=dt;
      if(this.waveDelay>=1.8){this.wave++;this.waveDelay=0;this.hazards=[];this.player.hp=Math.min(this.player.maxHp,this.player.hp+20);this.player.energy=Math.min(this.player.maxEnergy,this.player.energy+25);this.enemies=SR.spawnWave(this.stage,this.wave,this.player);}
    }
    for(const p of this.particles){p.life-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=500*dt;}this.particles=this.particles.filter(p=>p.life>0);
    for(const n of this.numbers){n.life-=dt;n.y-=48*dt;}this.numbers=this.numbers.filter(n=>n.life>0);this.shake=Math.max(0,this.shake-dt*4);
    const target=Math.max(0,Math.min(SR.ARENA.width-1280,this.player.x-480));this.camera+=(target-this.camera)*(1-Math.exp(-8*dt));
  }
  frame(time){
    const dt=Math.min(.1,(time-(this.last||time))/1000);this.last=time;
    if(this.input.take('Escape')){if(this.state==='playing')this.pause();else if(this.state==='paused')this.resume();else if(this.state!=='menu')this.back();}
    if(this.state==='playing'){
      this.accumulator+=dt;while(this.accumulator>=1/120&&this.state==='playing'){this.step(1/120);this.accumulator-=1/120;this.input.endFrame();}this.ui.update();
    }else{this.input.endFrame();this.accumulator=0;}
    this.renderer.draw(this);requestAnimationFrame(t=>this.frame(t));
  }
};
globalThis.game=new SR.Game();
