// Original procedural environments. Only the current stage's three static planes
// are cached; particles are analytic and bounded (no growing particle arrays).
SR.backgroundThemes = [
  {sky:['#210e18','#853735'],ink:'#28151f',accent:'#ec9d6c',particle:'ash'},
  {sky:['#0e1827','#34253d'],ink:'#22152c',accent:'#cf6179',particle:'mist'},
  {sky:['#111728','#435063'],ink:'#202737',accent:'#c59dbe',particle:'rain'},
  {sky:['#0b1c28','#285250'],ink:'#142e34',accent:'#79dbbb',particle:'runes'},
  {sky:['#101027','#3a3671'],ink:'#202246',accent:'#8dcff8',particle:'frost'},
  {sky:['#130b29','#4d1f65'],ink:'#231331',accent:'#c382ef',particle:'rift'},
  {sky:['#270d17','#7b3025'],ink:'#321922',accent:'#ff9c54',particle:'embers'},
  {sky:['#130d1d','#421b30'],ink:'#241425',accent:'#db8d9d',particle:'candles'},
  {sky:['#070b24','#30244f'],ink:'#17142c',accent:'#d2b9ff',particle:'stars'}
];
SR.Backgrounds = class {
  constructor(){this.stage=-1;this.planes=[];this.parallax=[.12,.35,.68];}
  polygon(c,points,fill){c.fillStyle=fill;c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fill();}
  line(c,points,color,width=2){c.strokeStyle=color;c.lineWidth=width;c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.stroke();}
  ring(c,x,y,rx,ry,color,width=2){c.strokeStyle=color;c.lineWidth=width;c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.stroke();}
  build(id){
    this.stage=id;const theme=SR.backgroundThemes[id];this.planes=[];
    for(let layer=0;layer<3;layer++){
      const canvas=document.createElement('canvas');canvas.width=2400;canvas.height=570;const c=canvas.getContext('2d');
      const base=570,ink=layer===0?theme.ink+'88':layer===1?theme.ink: '#10101cd9';
      for(let i=0;i<14;i++){
        const x=i*195-60+(layer%2)*60,h=110+(i*71+layer*47)%150,y=base-layer*15;
        if(id===0){ // Burned cottages, broken rafters, collapsed chimneys.
          c.fillStyle=ink;c.fillRect(x,y-h,130,h+40);this.polygon(c,[[x-12,y-h],[x+45,y-h-45],[x+72,y-h-15],[x+100,y-h-40],[x+140,y-h]],ink);
          c.fillRect(x+90,y-h-65,18,75);this.line(c,[[x+10,y-h-6],[x+60,y-h-40],[x+111,y-h]],theme.accent+'33',3);
          c.fillStyle=theme.accent+'33';c.fillRect(x+25,y-h+40,17,23);c.fillRect(x+76,y-h+34,13,30);
        }else if(id===1){ // Forked red trees and thick sweeping roots.
          this.line(c,[[x,y],[x+25,y-h],[x+6,y-h-150]],ink,layer===2?24:15);
          this.line(c,[[x+19,y-h+45],[x-40,y-h-70],[x-66,y-h-130]],ink,10);
          this.line(c,[[x+23,y-h],[x+86,y-h-80],[x+109,y-h-150]],ink,8);
          this.polygon(c,[[x-92,y-h-90],[x-30,y-h-180],[x+52,y-h-210],[x+130,y-h-112],[x+38,y-h-132]],theme.accent+(layer===0?'15':'28'));
          this.line(c,[[x-85,570],[x-28,546],[x+10,529],[x+55,554],[x+100,570]],ink,12);
        }else if(id===2){ // Battlements, portcullises, torn standards.
          c.fillStyle=ink;c.fillRect(x,y-h,145,h+40);for(let j=0;j<5;j++)c.fillRect(x+j*29,y-h-20,18,28);
          c.fillStyle='#070c1688';c.fillRect(x+40,y-h+25,60,h);for(let j=0;j<5;j++)this.line(c,[[x+42+j*13,y-h+30],[x+42+j*13,y]],theme.accent+'28');
          this.line(c,[[x+130,y-h],[x+130,y-h-100]],ink,5);this.polygon(c,[[x+132,y-h-98],[x+190,y-h-82],[x+171,y-h-55],[x+188,y-h-42],[x+132,y-h-55]],'#6e354755');
        }else if(id===3){ // Carved pillars, fallen stones and luminous rune circles.
          c.fillStyle=ink;c.fillRect(x+20,y-h-70,35,h+70);c.fillRect(x+6,y-h-85,64,16);c.fillRect(x+7,y-20,64,25);
          this.line(c,[[x+25,y-h-62],[x+25,y-28]],theme.accent+'22',3);
          this.polygon(c,[[x+90,y],[x+118,y-110],[x+145,y-100],[x+120,y]],ink);
          if(layer===1){this.ring(c,x+38,y-h+10,14,18,theme.accent+'66');this.line(c,[[x+25,y-h+10],[x+51,y-h+10],[x+38,y-h-8],[x+38,y-h+28]],theme.accent+'55');}
        }else if(id===4){ // Faceted crystals and ceiling stalactites.
          this.polygon(c,[[x,y],[x+25,y-h],[x+58,y-h-60],[x+90,y-10]],ink);
          this.polygon(c,[[x+25,y-h],[x+58,y-h-60],[x+52,y]],theme.accent+'30');
          this.line(c,[[x+58,y-h-60],[x+90,y-10]],theme.accent+'66',2);
          this.polygon(c,[[x-30,0],[x+75,0],[x+25,90+h*.35]],ink);
        }else if(id===5){ // Broken cliffs over a chasm, forked energy cracks.
          this.polygon(c,[[x,y],[x-10,y-h],[x+40,y-h-50],[x+70,y-h+10],[x+110,y-h-20],[x+150,y]],ink);
          this.line(c,[[x+42,y-h-35],[x+50,y-h+30],[x+24,y-h+65],[x+60,y-10]],theme.accent+'55',2);
        }else if(id===6){ // Iron towers and bridge supports above lava.
          c.fillStyle=ink;c.fillRect(x+20,y-h,100,h);c.fillRect(x+3,y-h-14,135,20);this.line(c,[[x+25,y-h],[x+110,y]],theme.accent+'22',5);
          c.fillStyle='#f5743c33';c.fillRect(x+48,y-h+35,14,65);c.fillRect(x+82,y-h+35,14,65);
          this.line(c,[[x,550],[x+180,550]],ink,12);this.line(c,[[x,550],[x+100,420],[x+180,550]],ink,6);
        }else if(id===7){ // Gothic arches, giant chains and candle brackets.
          c.strokeStyle=ink;c.lineWidth=22;c.beginPath();c.moveTo(x+12,570);c.lineTo(x+12,320);c.quadraticCurveTo(x+72,180,x+132,320);c.lineTo(x+132,570);c.stroke();
          for(let j=0;j<8;j++)this.ring(c,x+165,30+j*43,9,24,theme.accent+'24',4);
          if(layer===1){c.fillStyle=theme.accent+'44';c.fillRect(x+65,350,7,25);}
        }else{ // Floating shards of worlds, orbital structures.
          const yy=210+(i*83)%260;
          this.polygon(c,[[x,yy],[x+100,yy-20],[x+165,yy+10],[x+80,yy+65]],ink);
          this.line(c,[[x,yy],[x+100,yy-20],[x+165,yy+10]],theme.accent+'55',2);
          if(layer===1){c.fillStyle=ink;c.fillRect(x+50,yy-55,20,45);this.ring(c,x+100,yy-110,44,16,theme.accent+'22');}
        }
      }
      this.planes.push(canvas);
    }
  }
  draw(c,g){
    const id=g.stageId||0,t=g.elapsed,theme=SR.backgroundThemes[id];if(this.stage!==id)this.build(id);
    const sky=c.createLinearGradient(0,0,0,570);sky.addColorStop(0,theme.sky[0]);sky.addColorStop(1,theme.sky[1]);c.fillStyle=sky;c.fillRect(0,0,1280,720);
    const x=870-g.camera*.06;
    if([0,1,2,8].includes(id)){
      const radius=id===8?120:58;
      const glow=c.createRadialGradient(x,170,radius*.7,x,170,radius*2);glow.addColorStop(0,theme.accent+'55');glow.addColorStop(1,theme.accent+'00');c.fillStyle=glow;c.fillRect(x-radius*2,0,radius*4,460);
      c.fillStyle=theme.accent;c.beginPath();c.arc(x,170,radius,0,Math.PI*2);c.fill();c.fillStyle=theme.sky[0];c.beginPath();c.arc(x-(id===8?0:18),id===8?170:157,radius-(id===8?5:0),0,Math.PI*2);c.fill();
    }
    if(id===5){for(let i=0;i<4;i++)this.ring(c,850-g.camera*.18,305,80+i*18+Math.sin(t+i)*3,180+i*13,theme.accent+(i%2?'44':'77'),3);}
    for(let i=0;i<3;i++)c.drawImage(this.planes[i],-g.camera*this.parallax[i],0);
    if(id===2&&g.progress.settings.effects!=='low'&&Math.sin(t*.8)>.997)this.line(c,[[630,0],[600,85],[648,80],[618,170]],'#d7ddf688',3);
    const count=g.progress.settings.effects==='low'?10:36;
    for(let i=0;i<count;i++){
      const px=((i*173+t*(id===2?-45:9+i%5)-g.camera*.22)%1340+1340)%1340-30;
      const py=100+(i*79)%430+Math.sin(t+i)*9;c.fillStyle=theme.accent+'44';
      if(id===1||id===4){c.fillStyle=theme.accent+'08';c.beginPath();c.ellipse(px,py+80,120,18,0,0,Math.PI*2);c.fill();}
      else if(id===2)this.line(c,[[px,py],[px-8,py+20]],theme.accent+'22');
      else if(id===7){c.fillRect(px,py,4,13);c.fillStyle='#ffd9a977';c.fillRect(px,py-5,4,5);}
      else{c.fillRect(px,py,id===8?2:3,id===6?5:2);}
    }
    c.save();c.translate(-g.camera,0);c.fillStyle='#0f0d18';c.fillRect(0,570,2200,150);c.fillStyle=theme.accent+'77';c.fillRect(0,570,2200,3);
    for(let i=0;i<70;i++){c.fillStyle=theme.accent+(id===6?'77':'18');c.fillRect(i*34,587+(i*31)%110,id===6?28:18,id===6?3:2);}
    if(id===4){c.fillStyle=theme.accent+'0c';for(let i=0;i<14;i++)this.polygon(c,[[i*170,578],[i*170+60,650],[i*170+90,578]],theme.accent+'12');}
    if(id===8){this.ring(c,1980,414,45,144,theme.accent+'aa',3);this.ring(c,1980,414,57,154,theme.accent+'33',2);}
    c.restore();
  }
};
