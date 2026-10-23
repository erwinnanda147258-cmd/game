SR.validateSave = value => {
  const integer=(n,min,max)=>Number.isInteger(n)&&n>=min&&n<=max;
  if(!value||value.version!==1||typeof value.started!=='boolean'||!integer(value.unlocked,0,8)||!integer(value.coins,0,100000000)||!integer(value.xp,0,100000000))throw new Error('Invalid save');
  if(!Array.isArray(value.completed)||value.completed.length>9||new Set(value.completed).size!==value.completed.length)throw new Error('Invalid stages');
  const completed=[...value.completed].sort((a,b)=>a-b);
  if(completed.some((id,i)=>id!==i)||value.unlocked!==Math.min(8,completed.length))throw new Error('Invalid progression');
  const p=SR.freshProgress();
  Object.assign(p,{started:value.started,unlocked:value.unlocked,coins:value.coins,xp:value.xp,completed});
  for(const k of Object.keys(p.upgrades)){if(!integer(value.upgrades?.[k],0,5))throw new Error('Invalid upgrade');p.upgrades[k]=value.upgrades[k];}
  if(!value.ranks||typeof value.ranks!=='object')throw new Error('Invalid ranks');
  for(const id of completed){if(!['C','B','A','S'].includes(value.ranks[id]))throw new Error('Invalid rank');p.ranks[id]=value.ranks[id];}
  const s=value.settings;
  if(!s||typeof s.volume!=='number'||!Number.isFinite(s.volume)||s.volume<0||s.volume>1||typeof s.music!=='boolean'||typeof s.shake!=='boolean'||!['low','high'].includes(s.effects))throw new Error('Invalid settings');
  p.settings={volume:s.volume,music:s.music,shake:s.shake,effects:s.effects};return p;
};
SR.Save = class {
  constructor(storage){this.storage=storage;this.key='shadow-rift-save-v1';this.backupKey=this.key+'-backup';this.message='';}
  load(){
    this.message='';
    let raw;
    try{
      raw=this.storage.getItem(this.key);
      if(raw)return SR.validateSave(JSON.parse(raw));
    }catch(e){ /* Try the last validated checkpoint below. */ }
    try{
      const backup=this.storage.getItem(this.backupKey);
      if(backup){
        const recovered=SR.validateSave(JSON.parse(backup));
        this.message='Save utama tidak tersedia atau rusak. Cadangan terakhir berhasil dipulihkan; beberapa progres terbaru mungkin belum tercatat.';
        return recovered;
      }
      if(!raw&&this.storage.getItem(this.key)===null)return SR.freshProgress();
    }catch(e){ /* A blocked store must not prevent offline play. */ }
    this.message='Save tidak dapat dibaca atau rusak. Progres baru digunakan; data lama tidak dihapus sampai kamu menyimpan progres baru.';
    return SR.freshProgress();
  }
  write(p){
    try{
      const data=JSON.stringify(SR.validateSave(p));
      // A corrupt primary must never overwrite a healthy backup. Backup quota failures
      // must not prevent a smaller primary update from succeeding.
      try{
        const previous=this.storage.getItem(this.key);
        if(previous){const valid=JSON.stringify(SR.validateSave(JSON.parse(previous)));this.storage.setItem(this.backupKey,valid);}
      }catch(e){}
      this.storage.setItem(this.key,data);this.message='';return true;
    }catch(e){this.message='Save lokal tidak tersedia. Gunakan Export Save sebelum menutup game.';return false;}
  }
};
