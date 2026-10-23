SR.Audio = class {
  constructor(){
    this.enabled=false;this.context=null;this.master=null;this.musicBus=null;
    this._settings={volume:.45,music:true};this.suspended=true;this.beat=0;this.clock=0;
  }
  get settings(){return this._settings;}
  set settings(value){this._settings=value;this.sync();}
  setSuspended(value){this.suspended=value;this.sync();}
  sync(){
    if(!this.context||!this.master)return;
    const now=this.context.currentTime;
    this.master.gain.cancelScheduledValues(now);
    this.master.gain.setValueAtTime(this.enabled&&!this.suspended?this.settings.volume:0,now);
    this.musicBus.gain.cancelScheduledValues(now);
    this.musicBus.gain.setValueAtTime(this.settings.music?1:0,now);
  }
  toggle(){
    this.enabled=!this.enabled;
    if(this.enabled){
      const C=globalThis.AudioContext||globalThis.webkitAudioContext;
      if(C){
        if(!this.context){this.context=new C();this.master=this.context.createGain();this.master.connect(this.context.destination);this.musicBus=this.context.createGain();this.musicBus.connect(this.master);}
        this.context.resume().catch(()=>{});
      }else this.enabled=false;
    }
    this.sync();return this.enabled;
  }
  tone(frequency,duration,gain,type='sine',end=frequency,music=false){
    if(!this.enabled||!this.context||this.suspended||this.settings.volume===0)return;
    const c=this.context,o=c.createOscillator(),g=c.createGain(),now=c.currentTime;
    o.type=type;o.frequency.setValueAtTime(frequency,now);o.frequency.exponentialRampToValueAtTime(end,now+duration);
    g.gain.setValueAtTime(.001,now);g.gain.linearRampToValueAtTime(gain,now+.02);g.gain.exponentialRampToValueAtTime(.001,now+duration);
    o.connect(g);g.connect(music?this.musicBus:this.master);o.start();o.stop(now+duration+.02);o.onended=()=>{o.disconnect();g.disconnect();};
  }
  hit(enemy){this.tone(enemy?140:220,.16,.2,'triangle',40);}
  update(dt,playing){
    if(!playing||this.suspended||!this.enabled||!this.settings.music)return;
    this.clock-=dt;if(this.clock>0)return;this.clock=.48;
    const notes=[146.83,220,174.61,220,130.81,196,164.81,196,146.83,233.08,220,174.61,130.81,164.81,196,110];
    const note=notes[this.beat%notes.length];
    this.tone(note,.43,.055,'sine',note,true);
    if(this.beat%4===0)this.tone(note/2,1.4,.06,'triangle',note/2,true);this.beat++;
  }
};
