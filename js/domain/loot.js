var LootV1 = (function () {
  var my = {};
  my.getSlotRarity = itemRarityCompound => !(itemRarityCompound != null) ? 0 : itemRarityCompound && typeof (itemRarityCompound) === "number" ? itemRarityCompound : +itemRarityCompound[0];
  my.getIsGolden = itemRarityCompound => !(itemRarityCompound != null) || typeof (itemRarityCompound) != "string" || itemRarityCompound.length < 2 || itemRarityCompound[1] !== "g" ? "" : " golden";
  return my;
}());
var LootV2 = (function () {

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
// return either the rarity compound like we used to store, or the lootId
var getGearInfo = g => g ? [g.s0 || g.slot0, g.s1 || g.slot1, g.s2 || g.slot2] : [0, 0, 0];

var getIsGolden = (itemRarityCompoundOrLootId,refGear) =>{
  // detect loot V2
  if (typeof (itemRarityCompoundOrLootId) === "number" && itemRarityCompoundOrLootId > 5) {
    var lootId = itemRarityCompoundOrLootId;
    if (refGear) {
      var item = refGear.find(g => g.lootId == lootId);
      return item.golden ? true : false;
    } else {
      console.warn("no ref gear passed");
      return null;
    }
  }

}
var getSlotRarity = (itemRarityCompoundOrLootId, refGear) => {
  if(itemRarityCompoundOrLootId === 8)
  console.log('getSlotRarity', itemRarityCompoundOrLootId, refGear );
  if (typeof (itemRarityCompoundOrLootId) === "number" && itemRarityCompoundOrLootId > 5) {
    var lootId = itemRarityCompoundOrLootId;
    // assumes format :  { "slot": 0, "rarity": 1, "name": "Rusted Gear", "lootId": 474 },
    if (refGear) {
      var item = refGear.find(g => g.lootId == lootId);
      return item.rarity;
    } else {
      console.warn("no ref gear passed");
      return null;
    }
  }
  else {
    var rarityCompound = itemRarityCompoundOrLootId;
    LootV1.getSlotRarity(rarityCompound);
  }
}
var getSlotRarities = (gear, refGear) =>
  (getGearInfo(gear)).map(s => getSlotRarity(s, refGear));




