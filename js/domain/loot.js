var LootV1 = (function(){
    var my = {};
    my.getSlotRarity = itemRarityCompound => !(itemRarityCompound != null) ? 0 : itemRarityCompound && typeof(itemRarityCompound) === "number" ? itemRarityCompound : +itemRarityCompound[0];
    my.getIsGolden = itemRarityCompound => !(itemRarityCompound != null) || typeof(itemRarityCompound) != "string" || itemRarityCompound.length < 2 || itemRarityCompound[1] !== "g" ? "" : " golden";
    return my;
}());
var LootV2 = (function(){

}());

var decomposeSlotRarity = itemRarityCompound => {
  // rarityvalue, golden _ or g, legendary level opt
  if(typeof(itemRarityCompound) == "number"){
    return {rarity:itemRarityCompound, isGolden:false};
  }
  var info = { rarity: +itemRarityCompound[0], isGolden : itemRarityCompound.indexOf("g") == 1};
  if(info.rarity == 5)
    info.level = +itemRarityCompound.length > 2 ? itemRarityCompound.substring(2) : 1;
  return info;
};

var getSlotRarity = itemRarityCompound => !(itemRarityCompound != null) ? 0 : itemRarityCompound && typeof(itemRarityCompound) === "number" ? itemRarityCompound : +itemRarityCompound[0];
var getSlotRarities = gear => (gear ? [gear.slot0, gear.slot1, gear.slot2]:[0,0,0]).map(getSlotRarity);



