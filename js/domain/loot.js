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
      if(itemIdentifier.length > 1 && (itemIdentifier[1] =="_" || itemIdentifier[1] == "g"))
        return true;
    }
    return false;
  };
  my.getSlotRarity = itemRarityCompound => !(itemRarityCompound != null) ? 0 : itemRarityCompound && typeof (itemRarityCompound) === "number" ? itemRarityCompound : +itemRarityCompound[0];
  my.getIsGolden = itemRarityCompound => !(itemRarityCompound != null) || typeof (itemRarityCompound) != "string" || itemRarityCompound.length < 2 || itemRarityCompound[1] !== "g" ? "" : " golden";
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
  my.getSlotRarity = (refGear,lootIdOrCompound) => {
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
  my.getSlotRarity = (refGear,lootIdOrCompound) =>{
    var lootId = my.getLootIdFromLootIdOrCompound(lootIdOrCompound);
    var item = refGear.find(g => g.lootId == lootId);
    return item && item.rarity;
  };
  my.getLegendaryLevel = compound =>{
    var compoundIndex = compound.indexOf("_");
    if(compoundIndex >=0 && compound.length > compoundIndex)
      return compound.slice(compoundIndex + 1);
    return null;
  };
  return my;
}());

var Loot = (function(){
  var my = {};
  // id can be V1 compound, lootId, or lootIdCompound (containing legendary level)
  my.getSlotRarity = (id,refGear) => {
    if(!(id != null))
      return null;
    if(LootV1.getIsV1(id)) {
      return LootV1.getSlotRarity(id);
    }
    return LootV2.getSlotRarity(refGear, id);
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
    (my.getGearInfo(id)).map(s => my.getSlotRarity(s,refGear));
  // this doesn't try to be v1 compatible
  my.getLootFromLootId = (id,refGear) =>{
    if(LootV1.getIsV1(id))
      return null;
    return refGear.find(g => g.lootId == id);
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
  (Loot.getGearInfo(gear)).map(s => Loot.getSlotRarity(s, refGear));




