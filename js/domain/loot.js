var LootV1 = (function () {
  var my = {};
  // 0 is none, 1 is common, 2 is uncommon, 3 is rare, 4 epic, 5 legendary
  // examples 1, "1", "4g", "5g2"
  my.getIsV1 = itemIdentifier => itemIdentifier && (typeof(itemIdentifier) == "number" && itemIdentifier <= 5) || (typeof(itemIdentifier) == "string" && (+itemIdentifier <= 5 || itemIdentifier[1] =="_" || itemIdentifier[1] == "g" ));
  my.getSlotRarity = itemRarityCompound => !(itemRarityCompound != null) ? 0 : itemRarityCompound && typeof (itemRarityCompound) === "number" ? itemRarityCompound : +itemRarityCompound[0];
  my.getIsGolden = itemRarityCompound => !(itemRarityCompound != null) || typeof (itemRarityCompound) != "string" || itemRarityCompound.length < 2 || itemRarityCompound[1] !== "g" ? "" : " golden";
  return my;
}());
var LootV2 = (function () {
  var my = {};
  my.getSlotRarity = (refGear,lootId) => {
    var item = refGear.find(g => g.lootId==lootId);
    return item && item.rarity;
  };
  my.getIsGolden = (refGear,lootId) => {
    var item = refGear.find(g => g.lootId == lootId);
    return item && item.golden === true;
  };
  // how would we define a V2? as a valid lootId or an item obtained from looking up the lootId?
  // my.getIsV2 = ???
  my.getSlotRarity = (refGear,lootId) =>{
    var item = refGear.find(g => g.lootId == lootId);
    return item && item.rarity;
  };
  return my;
}());
var Loot = (function(){
  var my = {};
  // id can be V1 compound, or lootId
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




