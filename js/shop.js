SR.weaponUpgradeCost = (p,id) => Math.round(SR.weaponUpgradeRules.baseCost+SR.weapons[id].price*SR.weaponUpgradeRules.priceFactor+(p.weaponLevels[id]||0)*SR.weaponUpgradeRules.costStep);
SR.buyWeapon = (p,id) => {
  const w=Object.hasOwn(SR.weapons,id)?SR.weapons[id]:null;
  if(!w)return {ok:false,message:'Senjata tidak ditemukan.'};
  if(p.ownedWeapons.includes(id))return {ok:false,message:'Senjata sudah dimiliki.'};
  if(p.coins<w.price)return {ok:false,message:'Koin tidak cukup.'};
  p.coins-=w.price;p.ownedWeapons.push(id);p.weaponLevels[id]=0;return {ok:true,message:w.name+' dibeli.'};
};
SR.weaponBusy = p => !!p&&(!!p.attack||p.dash>0||p.stun>0||p.cooldown>0||(p.weapon?.category==='Gun'&&p.magazines[p.weaponId].reload>0));
SR.equipWeapon = (progress,id,player=null) => {
  if(!progress.ownedWeapons.includes(id)||!Object.hasOwn(SR.weapons,id))return {ok:false,message:'Beli senjata terlebih dahulu.'};
  if(SR.weaponBusy(player))return {ok:false,message:'Lanjutkan pertarungan sampai serangan/reload selesai sebelum equip.'};
  progress.equippedWeapon=id;if(player)SR.setWeapon(player,progress);return {ok:true,message:SR.weapons[id].name+' equipped.'};
};
SR.upgradeWeapon = (p,id,player=null) => {
  if(!p.ownedWeapons.includes(id)||!Object.hasOwn(SR.weapons,id))return {ok:false,message:'Senjata belum dimiliki.'};
  if(p.weaponLevels[id]>=SR.weaponUpgradeRules.max)return {ok:false,message:'Level maksimum tercapai.'};
  if(player&&id===p.equippedWeapon&&SR.weaponBusy(player))return {ok:false,message:'Selesaikan aksi aktif sebelum upgrade.'};
  const cost=SR.weaponUpgradeCost(p,id);if(p.coins<cost)return {ok:false,message:'Koin tidak cukup.'};
  p.coins-=cost;p.weaponLevels[id]++;if(player&&id===p.equippedWeapon)SR.setWeapon(player,p);
  return {ok:true,message:SR.weapons[id].name+' naik ke level '+p.weaponLevels[id]+'.'};
};
