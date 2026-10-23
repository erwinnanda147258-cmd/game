SR.UI = class {
  constructor(game){
    document.querySelector('.brand').onclick=event=>{event.preventDefault();game.showMenu();};
    this.game=game;this.overlay=document.getElementById('overlay');this.menu=document.getElementById('menu-content');
    document.getElementById('sound').onclick=()=>{const enabled=game.audio.toggle(),b=document.getElementById('sound');b.textContent=enabled?'SOUND ON':'SOUND OFF';b.setAttribute('aria-pressed',String(enabled));if(game.state==='playing')game.canvas.focus();};
  }
  screen(state){
    const g=this.game,p=g.progress;g.state=state;g.audio.setSuspended(state!=='playing');
    this.overlay.hidden=state==='playing';document.getElementById('hud').hidden=!['playing','paused','victory','defeat'].includes(state);document.getElementById('ability-hud').hidden=state!=='playing';
    if(state==='playing')return;
    this.menu.classList.toggle('wide', ['stages','upgrades','settings'].includes(state));
    let title='SHADOW RIFT',sub='LAST ECLIPSE',body='',buttons=[];
    const add=(label,fn,id,disabled=false)=>buttons.push({label,fn,id,disabled});
    if(state==='menu'){
      body=`<p>Sembilan rift. Tiga kerajaan yang runtuh. Satu kesempatan terakhir.</p><p>LEVEL ${SR.level(p)} · ${p.xp} XP · ${p.coins} COINS · ${p.completed.length}/9 STAGES</p>`;
      if(g.activeRun)add('RESUME BATTLE',()=>g.resume(),'primary');else if(p.started)add('CONTINUE',()=>g.start(p.unlocked),'primary');
      add('NEW GAME',()=>p.started?this.screen('confirm'):g.newGame(),p.started?'new-game':'primary');
      add('STAGE SELECT',()=>this.screen('stages'),'stages');add('UPGRADE',()=>this.screen('upgrades'),'upgrades');add('SETTINGS',()=>g.openSettings(),'settings');add('EXIT',()=>this.screen('exit'),'exit');
    }else if(state==='confirm'){
      title='NEW JOURNEY';sub='RESET PROGRESS?';body='<p>New Game menghapus progres dan upgrade saat ini. Export save melalui Settings jika ingin menyimpannya.</p>';
      add('RESET & START',()=>g.newGame(),'primary');
    }else if(state==='stages'){
      title='THE NINE RIFTS';sub='STAGE SELECT';body='<div class="stage-grid">'+SR.stages.map(s=>`<button data-stage="${s.id}" ${s.id>p.unlocked?'disabled':''}><small>${SR.regions[s.region]}</small><strong>${s.id+1}. ${s.name}</strong><span>${s.id>p.unlocked?'LOCKED':p.ranks[s.id]?'RANK '+p.ranks[s.id]:'AVAILABLE'}${s.boss?' · BOSS':''}</span></button>`).join('')+'</div>';
    }else if(state==='upgrades'){
      title='SHADOW FORGE';sub=`LEVEL ${SR.level(p)} · ${p.coins} COINS`;
      const names={hp:'Vitality · +20 HP',damage:'Blade · +12% damage',energy:'Spirit · +15 energy',cooldown:'Focus · −8% skill cooldown'};
      body='<div class="upgrade-grid">'+Object.keys(p.upgrades).map(key=>`<button data-upgrade="${key}" ${p.upgrades[key]>=5||p.coins<SR.upgradeCost(p,key)?'disabled':''}><strong>${names[key]}</strong><span>${p.upgrades[key]}/5 · ${p.upgrades[key]===5?'MAX':SR.upgradeCost(p,key)+' COINS'}</span></button>`).join('')+'</div><p>Upgrade berlaku pada pertarungan berikutnya. Level naik setiap 250 XP: +4 HP dan +2,5% damage.</p>';
    }else if(state==='settings'){
      title='SETTINGS';sub='OFFLINE · YOUR WAY';
      body=`<div class="settings"><label>Volume <input id="volume" type="range" min="0" max="100" value="${p.settings.volume*100}"></label><label><input id="music" type="checkbox" ${p.settings.music?'checked':''}> Musik procedural</label><label><input id="shake" type="checkbox" ${p.settings.shake?'checked':''}> Screen shake</label><label>Kualitas efek <select id="effects"><option value="high" ${p.settings.effects==='high'?'selected':''}>High</option><option value="low" ${p.settings.effects==='low'?'selected':''}>Low</option></select></label></div><p>Save otomatis tersimpan pada browser ini. Export/Import untuk pindah perangkat atau versi HTML/server. Import mengganti progres saat ini dan mengakhiri pertarungan yang masih aktif.</p><input id="import-file" type="file" accept="application/json,.json" hidden><p id="import-message"></p>`;
      add('EXPORT SAVE',()=>this.exportSave(),'export-save');add('IMPORT SAVE',()=>document.getElementById('import-file').click(),'import-save');
    }else if(state==='paused'){
      title='PAUSED';sub='TAKE A BREATH';body='<p>Pertarungan, energi, dan cooldown dijeda.</p>';add('LANJUTKAN',()=>g.resume(),'primary');add('RETRY',()=>g.start(),'retry');add('SETTINGS',()=>g.openSettings(),'settings');
    }else if(state==='victory'){
      title=g.stageId===8?'DAWN RETURNS':'RIFT SILENCED';sub=`VICTORY · RANK ${g.reward.rank}`;
      body=`<p>${g.stage.name} selesai dalam ${g.elapsed.toFixed(1)} detik. ${g.kills} musuh dikalahkan.</p><p>+${g.reward.xp} XP · +${g.reward.coins} COINS · LEVEL ${SR.level(p)}${g.reward.first?' · FIRST CLEAR':''}</p><p>${g.stageId===1?'Umbral Nova (I) unlocked.':g.stageId===5?'Last Eclipse (O) unlocked.':g.stageId===8?'Gerhana berakhir. Semua stage dapat dimainkan ulang.':'Rift berikutnya menunggu.'}</p>`;
      if(g.stageId<8)add('NEXT STAGE',()=>g.start(g.stageId+1),'primary');add('REPLAY',()=>g.start(),'replay');add('UPGRADE',()=>this.screen('upgrades'),'upgrades');
    }else if(state==='defeat'){
      title='NOT THE END';sub='DEFEAT';body='<p>Hindari tanda merah, gunakan dash, dan serang ketika musuh pulih. Tidak ada hadiah diberikan untuk kekalahan.</p>';add('COBA LAGI',()=>g.start(),'primary');
    }else if(state==='exit'){
      title='UNTIL DAWN';sub=g.save.write(p)?'PROGRESS SAVED':'EXPORT SAVE BEFORE CLOSING';body='<p>Kamu boleh menutup tab ini. Browser tidak mengizinkan game menutup tab yang dibuka manual.</p>';
    }
    if(state!=='menu')add(state==='settings'&&g.panelReturn==='paused'&&g.activeRun?'BACK TO PAUSE':'BACK / MENU',()=>g.back(),'back');
    this.menu.innerHTML=`<div class="eyebrow">SHADOW RIFT · CAMPAIGN</div><h1>${title}</h1><h2>${sub}</h2>${body}<p id="save-status"></p><div class="buttons">${buttons.map((b,i)=>`<button id="${b.id}" class="${i===0?'primary':''}" ${b.disabled?'disabled':''}>${b.label}</button>`).join('')}</div>`;
    document.getElementById('save-status').textContent=g.save.message;
    for(const b of buttons)document.getElementById(b.id).onclick=b.fn;
    for(const b of this.menu.querySelectorAll('[data-stage]'))b.onclick=()=>g.start(Number(b.dataset.stage));
    for(const b of this.menu.querySelectorAll('[data-upgrade]'))b.onclick=()=>{if(SR.buyUpgrade(p,b.dataset.upgrade)){g.save.write(p);this.screen('upgrades');}};
    if(state==='settings'){
      for(const key of ['volume','music','shake','effects'])document.getElementById(key).oninput=()=>{
        const el=document.getElementById(key);p.settings[key]=key==='volume'?Number(el.value)/100:key==='effects'?el.value:el.checked;
        g.audio.settings=p.settings;g.save.write(p);document.getElementById('save-status').textContent=g.save.message;
      };
      const fileInput=document.getElementById('import-file');
      fileInput.onchange=async event=>{
        const current=()=>fileInput.isConnected&&g.state==='settings';
        try{
          const file=event.target.files[0];if(!file)return;if(file.size>100000)throw new Error();
          const text=await file.text();
          // A file dialog/read may complete after the user has left this panel.
          if(!current())return;
          const imported=SR.validateSave(JSON.parse(text));
          g.progress=imported;g.activeRun=false;g.panelReturn='menu';g.audio.settings=imported.settings;
          g.save.write(imported);this.screen('settings');document.getElementById('import-message').textContent='Import berhasil.';
        }catch(e){if(current())document.getElementById('import-message').textContent='Save tidak valid; progres saat ini dipertahankan.';}
      };
    }
  }
  exportSave(){const blob=new Blob([JSON.stringify(this.game.progress,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='Shadow-Rift-save.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
  update(){
    const g=this.game,p=g.player,e=g.enemy;
    for(const [name,a] of [['player',p],['enemy',e]]){document.getElementById(name+'-hp').textContent=`${a.hp} / ${a.maxHp}`;document.getElementById(name+'-bar').style.width=`${a.hp/a.maxHp*100}%`;}
    document.querySelector('.enemy-health strong').textContent=e.name||'RIFT SENTINEL';
    document.querySelector('.objective>span').textContent=g.stage.name.toUpperCase();
    document.querySelector('.chapter>span').textContent=`${g.stageId+1} / ${SR.regions[g.stage.region].toUpperCase()}`;
    document.querySelector('.arena-caption>span').textContent=g.stage.name.toUpperCase();
    document.getElementById('enemy-state').textContent=e.boss?`BOSS · PHASE ${e.phase}`:e.attack?.guardBreak?'⚠ GUARD BREAK':e.intent||'';
    document.getElementById('objective').textContent=g.waveDelay>0?'Rift berikutnya terbuka…':`WAVE ${g.wave+1}/${g.stage.waves.length} · ${g.enemies.length} musuh`;
    document.getElementById('energy-value').textContent=`${Math.floor(p.energy)} / ${p.maxEnergy}`;document.getElementById('energy-bar').style.width=`${p.energy/p.maxEnergy*100}%`;
    document.getElementById('combo-state').textContent=p.comboFlash>0?p.comboLabel:p.combo?`${p.combo.split('').join(' → ')} → ${p.combo==='JJ'?'K · FINISHER':'J → K'}`:'COMBO · J → J → K';
    for(const [type,cost,cd] of [['dash',20,p.dashCooldown],...Object.entries(SR.skills).map(([k,s])=>[k,s.cost,p.skillCooldowns[k]])]){
      const locked=type!=='dash'&&!p.unlockedSkills[type];document.getElementById('ability-'+type).classList.toggle('unavailable',locked||cd>0||p.energy<cost);
      document.getElementById(type+'-status').textContent=locked?`CLEAR STAGE ${type==='nova'?2:6}`:`${cost} EN · ${cd>0?cd.toFixed(1)+'s':p.energy<cost?'LOW ENERGY':'READY'}`;
    }
    document.getElementById('action-notice').textContent=p.guardBroken>0?'GUARD BROKEN · EVADE':p.blocking?'GUARD · FRONT ONLY':p.noticeTime>0?p.notice:'';
  }
};
