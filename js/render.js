SR.Renderer = class {
  constructor(canvas){this.ctx=canvas.getContext('2d');this.canvas=canvas;}
  draw(g){
    const c=this.ctx,t=g.elapsed,region=g.stage?.region||0; c.clearRect(0,0,1280,720);
    const sky=c.createLinearGradient(0,0,0,720);sky.addColorStop(0,['#100f20','#071d2b','#210e19'][region]);sky.addColorStop(.65,['#3c284b','#164659','#62313c'][region]);sky.addColorStop(1,'#140f1d');c.fillStyle=sky;c.fillRect(0,0,1280,720);
    const moonX=880-g.camera*.08;
    const halo=c.createRadialGradient(moonX,181,42,moonX,181,240);halo.addColorStop(0,'#bd87e62c');halo.addColorStop(1,'#aa65ff00');c.fillStyle=halo;c.fillRect(0,0,1280,500);
    c.fillStyle='#b497c4';c.beginPath();c.arc(moonX,181,63,0,Math.PI*2);c.fill();c.fillStyle='#211a30';c.beginPath();c.arc(moonX-19,169,59,0,Math.PI*2);c.fill();
    for(let layer=0;layer<3;layer++){
      c.save();c.translate(-g.camera*(.12+layer*.18),0);c.fillStyle=['#242035','#292137','#201a2b'][layer];
      for(let i=0;i<19;i++){const x=i*177-140,y=355+layer*66,h=65+((i*71+layer*43)%143);c.fillRect(x,y-h,99,h+220);c.beginPath();c.moveTo(x-10,y-h);c.lineTo(x+36,y-h-54);c.lineTo(x+110,y-h);c.fill();if(layer===2){c.fillStyle='#71546b33';c.fillRect(x+40,y-h+22,10,24);c.fillStyle='#201a2b';}}
      c.restore();
    }
    c.save();c.translate(-g.camera,0);
    if(region===1){for(let i=0;i<18;i++){const x=i*135;c.fillStyle=i%2?'#4185a355':'#63b8bf55';c.beginPath();c.moveTo(x,570);c.lineTo(x+30,400-i%3*30);c.lineTo(x+60,570);c.fill();}}
    if(region===2){for(let i=0;i<20;i++){const x=i*120;c.fillStyle='#ce563e44';c.fillRect(x,520,5,50);c.fillStyle='#e2884a44';c.fillRect(x-3,500+Math.sin(t+i)*8,11,25);}}
    if(g.stageId===1){for(let i=0;i<12;i++){const x=i*205;c.strokeStyle='#160f1e';c.lineWidth=15;c.beginPath();c.moveTo(x,570);c.lineTo(x+12,300);c.lineTo(x-35,250);c.moveTo(x+10,370);c.lineTo(x+75,285);c.stroke();}}

    // Broken stone arches, dead branches and the sealed rift are all local geometry.
    for(let i=0;i<7;i++){const x=i*360+80;c.fillStyle='#15121f';c.fillRect(x,330,28,240);c.fillRect(x+126,310,33,260);c.strokeStyle='#171320';c.lineWidth=23;c.beginPath();c.arc(x+78,335,64,Math.PI,Math.PI*2);c.stroke();c.fillStyle='#31263d';c.fillRect(x-5,426,40,8);}
    c.save();c.translate(1970,420);c.strokeStyle='#9c66d8';c.shadowColor='#9e52ff';c.shadowBlur=26;c.lineWidth=3;c.beginPath();c.ellipse(0,0,36+Math.sin(t)*3,131,0,0,Math.PI*2);c.stroke();c.shadowBlur=0;c.fillStyle='#b38be622';c.fill();c.restore();
    c.fillStyle='#12101a';c.fillRect(0,570,2200,150);c.fillStyle='#65506d';c.fillRect(0,570,2200,3);c.fillStyle='#2b2236';c.fillRect(0,577,2200,5);
    for(let i=0;i<90;i++){const x=i*29;c.fillStyle=i%3?'#31253b':'#47334c';c.fillRect(x,580+(i*31)%115,12+(i%4)*8,2);}
    c.strokeStyle='#8f66b955';c.lineWidth=2;for(const x of [5,2195]){c.beginPath();c.moveTo(x,330);c.lineTo(x,570);c.stroke();}
    c.save();if(g.shake>0)c.translate(Math.sin(t*113)*g.shake*10,Math.cos(t*89)*g.shake*7);
    for(const h of g.hazards||[]){c.fillStyle=h.wait>0?'#ff3e5a44':'#ff436caa';c.strokeStyle='#ff839b';c.lineWidth=3;c.beginPath();c.ellipse(h.x,565,h.r,12,0,0,Math.PI*2);c.fill();c.stroke();c.font='bold 15px Arial';c.textAlign='center';c.fillStyle='#ffd2db';c.fillText(h.wait>0?'DODGE':'RIFT',h.x,535);if(h.wait<=0){c.fillStyle='#ff3e5a77';c.fillRect(h.x-h.r,460,h.r*2,110);}}
    for(const e of g.enemies||[g.enemy])this.actor(e,t);this.actor(g.player,t);
    for(const p of g.particles){c.globalAlpha=Math.max(0,p.life/p.max);c.fillStyle=p.color;c.fillRect(p.x,p.y,p.size,p.size);}c.globalAlpha=1;
    for(const n of g.numbers){c.globalAlpha=Math.min(1,n.life*2);c.fillStyle=n.color;c.font='bold 26px Georgia';c.textAlign='center';c.fillText(n.text,n.x,n.y);}c.globalAlpha=1;
    c.restore();c.restore();
    for(let i=0;i<(g.progress?.settings.effects==='low'?8:34);i++){const x=((i*173+t*(7+i%5))%1320)-20,y=170+(i*79)%370+Math.sin(t+i)*10;c.fillStyle=i%3?'#bd91e02e':'#ddaeec55';c.fillRect(x,y,2,2);}
    const shade=c.createLinearGradient(0,590,0,720);shade.addColorStop(0,'#08060b00');shade.addColorStop(1,'#08060bcc');c.fillStyle=shade;c.fillRect(0,590,1280,130);
  }
  actor(a,t){
    const c=this.ctx,enemy=a.team==='enemy',color=enemy?'#ec708a':'#c99aff';
    c.save();c.translate(a.x,a.y);c.fillStyle='#05040888';c.beginPath();c.ellipse(0,2,40,9,0,0,Math.PI*2);c.fill();
    if(a.hp<=0){c.globalAlpha=.45;c.translate(0,-12);c.rotate(a.face*1.35);}
    if (a.dash > 0) {
      for (let i = 1; i <= 4; i++) {
        c.fillStyle = `rgba(172,113,238,${.18 - i * .025})`;
        c.fillRect(-a.face * i * 25 - 15, -a.h + 10, 30, a.h - 10);
      }
    }
    if(enemy&&a.hp>0){c.fillStyle='#08060c';c.fillRect(-30,-a.h-38,60,4);c.fillStyle=a.boss?'#ff6a89':'#b46988';c.fillRect(-30,-a.h-38,60*a.hp/a.maxHp,4);}
    if(a.boss){c.strokeStyle='#ff8499';c.lineWidth=3;c.beginPath();c.moveTo(-15,-a.h);c.lineTo(-22,-a.h-23);c.lineTo(0,-a.h-12);c.lineTo(22,-a.h-23);c.lineTo(15,-a.h);c.stroke();}
    c.scale(a.face,1);
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
    c.save();c.translate(8,-64);c.rotate(active?-.8:atk?-1.9:.55);c.strokeStyle='#14111f';c.lineWidth=10;c.beginPath();c.moveTo(0,0);c.lineTo(28,12);c.stroke();c.strokeStyle='#8b729a';c.lineWidth=5;c.beginPath();c.moveTo(28,25);c.lineTo(28,-35);c.stroke();c.strokeStyle=color;c.lineWidth=2;c.beginPath();c.moveTo(31,12);c.lineTo(31,-43);c.stroke();c.restore();
    if(atk){
      if(atk.time<atk.windup){c.strokeStyle=enemy?'#ff496d':'#caa0ff';c.globalAlpha=.4+.5*atk.time/atk.windup;c.lineWidth=3;c.beginPath();c.ellipse(atk.radial?0:atk.range/2,-3,atk.radial?atk.range:atk.range/2,8,0,0,Math.PI*2);c.stroke();c.globalAlpha=1;if(enemy){c.fillStyle='#ff8296';c.font='bold 26px Arial';c.textAlign='center';c.fillText(atk.guardBreak?'BREAK':'!',0,-a.h-18);}}
      if(active){c.strokeStyle=color;c.shadowColor=color;c.shadowBlur=18;c.lineWidth=['heavy','finisher','eclipse'].includes(atk.type)?13:7;c.beginPath();c.ellipse(atk.radial?0:12,-58,atk.radial?atk.range:atk.range-12,atk.radial?100:62,0,atk.radial?0:-1.3,atk.radial?Math.PI*2:1.2);c.stroke();c.shadowBlur=0;}
    }
    c.restore();
  }
};
