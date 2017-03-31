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

var getSlotRarity = (itemRarityCompoundOrLootId, refGear) => {
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
  (gear ? [gear.s0 || gear.slot0, gear.s1 || gear.slot1, gear.s2 || gear.slot2] : [0, 0, 0]).map(s => getSlotRarity(s, refGear));



