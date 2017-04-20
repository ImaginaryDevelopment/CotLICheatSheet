//loot tracking will use V1 whenever the crusader's loot data isn't in data.js (simple compound string of rarity,isGolden,legendary level)
var LootV1 = (function () {
  var my = {};
  // 0 is none, 1 is common, 2 is uncommon, 3 is rare, 4 epic, 5 legendary
  // examples 1, "1", "4g", "5g2"
  my.getIsV1 = itemIdentifier => {
    if(!itemIdentifier)
      return itemIdentifier == 0;
    if(typeof(itemIdentifier) == "number" && itemIdentifier <= 5)
      return true;
    if(typeof(itemIdentifier) == "string"){
      if(itemIdentifier.length == 1 && +itemIdentifier <= 5)
        return true;
      // V2 loot can have an _ now
      var index1 = itemIdentifier.indexOf("_");
      var index2 = itemIdentifier.indexOf("g");
      if(index1 == 1 ||  index2 == 1 || (index1 < 0 && index2 < 0 && +itemIdentifier <= 5))
        return true;
    }
    return false;
  };
  my.getRarityByItemId = itemRarityCompound => !(itemRarityCompound != null) ? 0 : itemRarityCompound && typeof (itemRarityCompound) === "number" ? itemRarityCompound : +itemRarityCompound[0];
  my.getIsGolden = itemRarityCompound => !(itemRarityCompound != null) || typeof (itemRarityCompound) != "string" || itemRarityCompound.length < 2 || itemRarityCompound[1] !== "g" ? "" : " golden";
  my.getLLevel = (id) =>{
    if(!id)
      return undefined;
    if(typeof(id) != "string")
      return null;
    var lIndex = id.indexOf("_");
    if(lIndex < 1)
      lIndex = id.indexOf("g");
    if(lIndex < 1 || id.length <= lIndex + 1)
      return null;
    var lLevel = id.slice(lIndex + 1);
    console.log('found lLevel!', lLevel, +lLevel);
    return +lLevel;

  }
  my.changeLLevel = (id,level) =>{
    var rarity = my.getRarityByItemId(id);
    var isGolden = my.getIsGolden(id);
    var result = rarity + (isGolden? "g" : "_") + level;
    console.log('LootV1.changeLLevel', id,level,rarity,isGolden,result);
    return result;
  }
  return my;
}());

var LootV2 = (function () {
  var my = {};
  my.getLootIdFromLootIdOrCompound = lootIdOrCompound =>
  {
    var lootId = lootIdOrCompound;
    var isCompoundish = typeof(lootIdOrCompound) == "string";
    var compoundIndex = isCompoundish && lootIdOrCompound.indexOf("_");
    if(isCompoundish && compoundIndex >=0)
    {
      lootId = lootIdOrCompound.slice(0,compoundIndex);
    }
    return lootId;
  };
  my.getRarityByItemId = (lootIdOrCompound,refGear) => {
    var lootId = my.getLootIdFromLootIdOrCompound(lootIdOrCompound);
    var item = refGear.find(g => g.lootId==lootId);
    return item && item.rarity;
  };
  my.getIsGolden = (refGear,lootIdOrCompound) => {
    var lootId = my.getLootIdFromLootIdOrCompound(lootIdOrCompound);
    var item = refGear.find(g => g.lootId == lootId);
    return item && item.golden === true;
  };
  // how would we define a V2? as a valid lootId or an item obtained from looking up the lootId?
  // my.getIsV2 = ???
  my.getRarityByItemId = (lootIdOrCompound,refGear) =>{
    var lootId = my.getLootIdFromLootIdOrCompound(lootIdOrCompound);
    var item = refGear.find(g => g.lootId == lootId);
    return item && item.rarity;
  };
  my.getLLevel = compound =>{
    if(!compound)
      return undefined;
    if(typeof(compound) != "string")
      return null;
    var compoundIndex = compound.indexOf("_");
    if(compoundIndex >=0 && compound.length > compoundIndex)
      return compound.slice(compoundIndex + 1);
    return null;
  };
  my.changeLLevel = (lootIdOrCompound,level) =>{
    var lootId = my.getLootIdFromLootIdOrCompound(lootIdOrCompound);
    if(lootIdOrCompound != null && !(lootId != null) )
      console.warn('changeLLevel', lootIdOrCompound, level);
    if(level != null && level > 1)
      return lootId+"_"+level;
    return lootId;
  };
  return my;
}());

var Loot = (function(){
  var my = {};
  // id can be V1 compound, lootId, or lootIdCompound (containing legendary level)
  my.getRarityByItemId = (id,refGear) => {
    if(!(id != null))
      return null;
    if(LootV1.getIsV1(id)) {
      return LootV1.getRarityByItemId(id);
    }
    return LootV2.getRarityByItemId(id,refGear);
  };
  my.getIsGolden = (id,refGear) =>{
    if(!(id != null))
      return null;
    if(LootV1.getIsV1(id)){
      return LootV1.getIsGolden(id);
    }
    return LootV2.getIsGolden(refGear,id);
  };
  // return either the rarity compound like we used to store, or the lootId
  my.getGearInfo = g => g ? [g.s0 || g.slot0, g.s1 || g.slot1, g.s2 || g.slot2] : [0, 0, 0];
  my.getSlotRarities = (id,refGear) =>
    (my.getGearInfo(id)).map(s => my.getRarityByItemId(s,refGear));
  my.getLootFromId = (id,refGear) =>{
    // this could try to go get a lootId, why doesn't it try?
    if(LootV1.getIsV1(id)){
      console.warn('getLootFromId found V1Loot, ignoring', id);

      return null;
    }
    var lootId = LootV2.getLootIdFromLootIdOrCompound(id);
    return refGear.find(g => g.lootId == lootId);
  };
  my.getLLevel = id => {
    if(LootV1.getIsV1(id))
      return LootV1.getLLevel(id);
    return LootV2.getLLevel(id);
  };
  my.changeLLevel = (id,level) =>{
    if(LootV1.getIsV1(id)){
      var result = LootV1.changeLLevel(id,level);
      console.log("Loot.V1.changeLLevel",id,level,result);
      return result;
    }
    console.log('Loot.changeLLevel going V2', id,level);
    var result = LootV2.changeLLevel(id,level);
    console.log('changeLLevel', id,level, result);
    return result;
  };
  return my;

}());

var decomposeSlotRarity = itemRarityCompound => {
  // rarityvalue, golden _ or g, legendary level opt
  if (typeof (itemRarityCompound) == "number") {
    return { rarity: itemRarityCompound, isGolden: false };
  }
  var info = { rarity: +itemRarityCompound[0], isGolden: itemRarityCompound.indexOf("g") == 1 };
  if (info.rarity == 5)
    info.level = +itemRarityCompound.length > 2 ? itemRarityCompound.substring(2) : 1;
  return info;
};
var getSlotRarities = (gear, refGear) =>
  (Loot.getGearInfo(gear)).map(s => Loot.getRarityByItemId(s, refGear));




