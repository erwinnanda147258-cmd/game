SR.Renderer = class {
  constructor(canvas){this.ctx=canvas.getContext('2d');this.canvas=canvas;this.backgrounds=new SR.Backgrounds();}
  draw(g){
    const c=this.ctx,t=g.elapsed;c.clearRect(0,0,1280,720);
    this.backgrounds.draw(c,g);
    c.save();c.translate(-g.camera,0);
    c.save();if(g.shake>0)c.translate(Math.sin(t*113)*g.shake*10,Math.cos(t*89)*g.shake*7);
    for(const h of g.hazards||[]){c.fillStyle=h.wait>0?'#ff3e5a44':'#ff436caa';c.strokeStyle='#ff839b';c.lineWidth=3;c.beginPath();c.ellipse(h.x,565,h.r,12,0,0,Math.PI*2);c.fill();c.stroke();c.font='bold 15px Arial';c.textAlign='center';c.fillStyle='#ffd2db';c.fillText(h.wait>0?'DODGE':'RIFT',h.x,535);if(h.wait<=0){c.fillStyle='#ff3e5a77';c.fillRect(h.x-h.r,460,h.r*2,110);}}
    for(const p of g.projectiles||[]){c.fillStyle=p.color;c.beginPath();c.arc(p.x,p.y,p.r,0,Math.PI*2);c.fill();c.strokeStyle=p.color;c.lineWidth=2;c.beginPath();c.moveTo(p.x,p.y);c.lineTo(p.x-Math.sign(p.vx)*18,p.y);c.stroke();}
    for(const b of g.beams||[]){c.strokeStyle='#bce8ff';c.lineWidth=3;c.beginPath();c.moveTo(b.x,b.y);c.lineTo((b.x+b.x2)/2,b.y-15);c.lineTo(b.x2,b.y2);c.stroke();}
    for(const b of g.blasts||[]){c.strokeStyle='#c397ff';c.lineWidth=5;c.beginPath();c.arc(b.x,b.y,b.r*(1-b.life*.5),0,Math.PI*2);c.stroke();}
    for(const e of g.enemies||[g.enemy])this.actor(e,t);this.actor(g.player,t);
    for(const p of g.particles){c.globalAlpha=Math.max(0,p.life/p.max);c.fillStyle=p.color;c.fillRect(p.x,p.y,p.size,p.size);}c.globalAlpha=1;
    for(const n of g.numbers){c.globalAlpha=Math.min(1,n.life*2);c.fillStyle=n.color;c.font='bold 26px Georgia';c.textAlign='center';c.fillText(n.text,n.x,n.y);}c.globalAlpha=1;
    c.restore();c.restore();
    const shade=c.createLinearGradient(0,590,0,720);shade.addColorStop(0,'#08060b00');shade.addColorStop(1,'#08060bcc');c.fillStyle=shade;c.fillRect(0,590,1280,130);
    if(g.transition>0&&g.state==='playing'){c.save();c.globalAlpha=Math.min(1,g.transition);c.textAlign='center';c.fillStyle='#e9d7ff';c.font='24px Georgia';c.fillText(g.transitionTitle,640,155);c.font='10px Arial';c.fillText('SHADOW RIFT · '+SR.regions[g.stage.region].toUpperCase(),640,178);c.restore();}
  }
  actor(a,t){
    const c=this.ctx,enemy=a.team==='enemy',color=enemy?(a.tint||'#ec708a'):'#c99aff';
    c.save();c.translate(a.x,a.y);c.fillStyle='#05040888';c.beginPath();c.ellipse(0,2,40,9,0,0,Math.PI*2);c.fill();
    if(a.hp<=0){c.globalAlpha=.45;c.translate(0,-12);c.rotate(a.face*1.35);}
    if (a.dash > 0) {
      for (let i = 1; i <= 4; i++) {
        c.fillStyle = `rgba(172,113,238,${.18 - i * .025})`;
        c.fillRect(-a.face * i * 25 - 15, -a.h + 10, 30, a.h - 10);
      }
    }
    if(enemy&&a.hp>0){c.fillStyle='#08060c';c.fillRect(-30,-a.h-38,60,4);c.fillStyle=a.boss?'#ff6a89':'#b46988';c.fillRect(-30,-a.h-38,60*a.hp/a.maxHp,4);}
    if(a.boss){c.strokeStyle=['#ffb381','#9dbeff','#dfa6ff'][a.bossRegion];c.save();c.globalAlpha=.4;c.lineWidth=2;for(let ring=0;ring<a.phase;ring++){c.beginPath();c.ellipse(0,-a.h/2,42+ring*8,66+ring*7,Math.sin(t)*.1,0,Math.PI*2);c.stroke();}c.restore();c.lineWidth=3;c.beginPath();c.moveTo(-15,-a.h);c.lineTo(-22,-a.h-23);c.lineTo(0,-a.h-12);c.lineTo(22,-a.h-23);c.lineTo(15,-a.h);c.stroke();}
    c.scale(a.face,1);
    if(a.guarding){c.strokeStyle='#f3c8ac';c.lineWidth=5;c.strokeRect(18,-85,12,70);}
    if(a.kind==='archer'){c.strokeStyle=color;c.lineWidth=3;c.beginPath();c.ellipse(22,-62,19,36,0,-1.3,1.3);c.stroke();}
    if(a.kind==='caster'){c.strokeStyle=color;c.lineWidth=3;c.beginPath();c.moveTo(25,-10);c.lineTo(25,-105);c.stroke();c.beginPath();c.arc(25,-111,10,0,Math.PI*2);c.stroke();}
    if(a.kind==='brute'){c.fillStyle='#65516a';c.fillRect(-24,-85,48,25);}
    if(a.flankPrep>0){c.fillStyle=color;c.font='bold 13px Arial';c.textAlign='center';c.fillText('DASH',0,-a.h-20);}

    if (a.blocking) {
      c.strokeStyle = '#8cdeff'; c.lineWidth = 4; c.shadowColor = '#6bccff'; c.shadowBlur = 16;
      c.beginPath(); c.ellipse(15, -52, 35, 55, 0, -1.4, 1.4); c.stroke(); c.shadowBlur = 0;
    }
    const stride=a.grounded?Math.sin(a.walk)*12:8,bob=a.grounded?Math.sin(a.walk*2)*2:0;c.translate(0,bob);
    // Cloak, articulated legs, hood and a distinct luminous blade.
    c.fillStyle=enemy?'#211724':'#211a34';c.strokeStyle=enemy?'#865062':'#85649f';c.lineWidth=1.5;
    c.beginPath();c.moveTo(-16,-80);c.lineTo(-35-Math.sin(t*4)*5,-16);c.lineTo(4,-32);c.lineTo(15,-75);c.closePath();c.fill();c.stroke();
    c.strokeStyle=a.flash>0?'#fff':'#090910';c.lineWidth=12;c.lineCap='round';c.beginPath();c.moveTo(-8,-40);c.lineTo(-12-stride,-7);c.lineTo(-3-stride,-5);c.moveTo(8,-40);c.lineTo(12+stride,-7);c.lineTo(21+stride,-5);c.stroke();
    c.fillStyle=a.flash>0?'#ede1ff':'#0a0a13';c.beginPath();c.moveTo(-15,-78);c.lineTo(13,-78);c.lineTo(21,-37);c.lineTo(-15,-35);c.closePath();c.fill();c.strokeStyle='#6d506e';c.lineWidth=2;c.stroke();
    c.fillStyle=a.flash>0?'#fff':'#0b0a14';c.beginPath();c.ellipse(0,-a.h+16,15,20,0,0,Math.PI*2);c.fill();c.strokeStyle=color;c.lineWidth=1;c.stroke();
    c.fillStyle=color;c.shadowColor=color;c.shadowBlur=10;c.fillRect(5,-a.h+14,10,3);c.shadowBlur=0;
    c.fillStyle=enemy?'#8f334e':'#7951a1';c.fillRect(-15,-48,32,5);
    const atk=a.attack,active=atk&&atk.time>=atk.windup&&atk.time<atk.windup+atk.active;
    if(!enemy&&a.weapon?.category==='Gun'){
      c.fillStyle='#3d354e';c.fillRect(8,-71,40,11);c.fillStyle=a.weapon.color;c.fillRect(37,-70,15,5);c.fillStyle='#171223';c.fillRect(16,-61,10,15);
    }else if(!enemy&&a.weapon?.category==='Magic'){
      c.strokeStyle=a.weapon.color;c.lineWidth=3;c.beginPath();c.moveTo(22,-12);c.lineTo(22,-103);c.stroke();c.beginPath();c.arc(22,-111,11+Math.sin(t*3)*2,0,Math.PI*2);c.stroke();
    }else{
    c.save();c.translate(8,-64);c.rotate(active?-.8:atk?-1.9:.55);c.strokeStyle='#14111f';c.lineWidth=10;c.beginPath();c.moveTo(0,0);c.lineTo(28,12);c.stroke();c.strokeStyle='#8b729a';c.lineWidth=5;c.beginPath();c.moveTo(28,25);c.lineTo(28,-35);c.stroke();c.strokeStyle=color;c.lineWidth=2;c.beginPath();c.moveTo(31,12);c.lineTo(31,-43);c.stroke();c.restore();
    }

    if(atk?.projectile&&atk.time<atk.windup){c.save();c.strokeStyle=enemy?'#ffb88399':'#c4b0ff88';c.setLineDash([8,8]);c.lineWidth=2;c.beginPath();c.moveTo(25,-65);c.lineTo(atk.range,-65+Math.sin(atk.projectile.angle||0)*atk.range);c.stroke();c.restore();}
    if(atk){
      if(atk.time<atk.windup){c.strokeStyle=enemy?'#ff496d':'#caa0ff';c.globalAlpha=.4+.5*atk.time/atk.windup;c.lineWidth=3;c.beginPath();c.ellipse(atk.radial?0:atk.range/2,-3,atk.radial?atk.range:atk.range/2,8,0,0,Math.PI*2);c.stroke();c.globalAlpha=1;if(enemy){c.fillStyle='#ff8296';c.font='bold 26px Arial';c.textAlign='center';c.fillText(atk.guardBreak?'BREAK':'!',0,-a.h-18);}}
      if(active&&!atk.projectile&&!atk.area){c.strokeStyle=color;c.shadowColor=color;c.shadowBlur=18;c.lineWidth=['heavy','finisher','eclipse'].includes(atk.type)?13:7;c.beginPath();c.ellipse(atk.radial?0:12,-58,atk.radial?atk.range:atk.range-12,atk.radial?100:62,0,atk.radial?0:-1.3,atk.radial?Math.PI*2:1.2);c.stroke();c.shadowBlur=0;}
    }
    c.restore();
  }
};
