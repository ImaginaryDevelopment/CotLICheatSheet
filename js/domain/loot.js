/**
 * @typedef {Object} Loot
 * @property {number} lootId
 * @property {number} slot
 * @property {number} rarity
 * @property {string} name
*/

//loot tracking will use V1 whenever the crusader's loot data isn't in data.js (simple compound string of rarity,isGolden,legendary level)
var LootV1 = (function () {
  var my = {};
  // 0 is none, 1 is common, 2 is uncommon, 3 is rare, 4 epic, 5 legendary
  // examples 1, "1", "4g", "5g2"
  /**
   *
   * @param {number | string} itemIdentifier
   */
  var getIsV1 = itemIdentifier => {
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
  my.getIsV1 = getIsV1;
  /**
   *
   * @param {number | string} itemRarityCompound
   * @return {number}
   */
  var getRarityByItemId = itemRarityCompound => !(itemRarityCompound != null) ? 0 : itemRarityCompound && typeof (itemRarityCompound) === "number" ? itemRarityCompound : +itemRarityCompound[0];
  my.getRarityByItemId = getRarityByItemId;
  /**
   *
   * @param {number | string} itemRarityCompound
   */
  var getIsGolden = itemRarityCompound => !(itemRarityCompound != null) || typeof (itemRarityCompound) != "string" || itemRarityCompound.length < 2 || itemRarityCompound[1] !== "g" ? "" : " golden";
  my.getIsGolden = getIsGolden;
  /**
   * @param {number | string} id
   * @return {number}
   */
  var getLLevel = (id) =>{
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
    return +lLevel;
  };

  my.getLLevel = getLLevel;
  /**
   * @param {number | string} id
   * @param {number} level
   */
  var changeLLevel = (id,level) =>{
    var rarity = my.getRarityByItemId(id);
    var isGolden = my.getIsGolden(id);
    var result = rarity + (isGolden? "g" : "_") + level;
    return result;
  };

  my.changeLLevel = changeLLevel;
  return my;
}());

var LootV2 = (function () {
  var my = {};
  /**
   * @param {number | string} lootIdOrCompound
  */
  var getLootIdFromLootIdOrCompound  = lootIdOrCompound =>
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
  my.getLootIdFromLootIdOrCompound = getLootIdFromLootIdOrCompound;
  /**
   * @param {number | string} lootIdOrCompound
   * @param {Array<Loot>} refGear
   */
  var getRarityByItemId = (lootIdOrCompound,refGear) => {
    var lootId = my.getLootIdFromLootIdOrCompound(lootIdOrCompound);
    var item = refGear.find(g => g.lootId==lootId);
    return item && item.rarity;
  };

  my.getRarityByItemId = getRarityByItemId;

  /**
  * @param {Array<Loot>} refGear
  * @param {number | string} lootIdOrCompound
  * @return boolean
  */
  var getIsGolden = (refGear,lootIdOrCompound) => {
    var lootId = my.getLootIdFromLootIdOrCompound(lootIdOrCompound);
    var item = refGear.find(g => g.lootId == lootId);
    return item && item.golden === true;
  };
  my.getIsGolden = getIsGolden;

  // how would we define a V2? as a valid lootId or an item obtained from looking up the lootId?
  // my.getIsV2 = ???
  /**
   * @param {number | string} lootIdOrCompound
   * @param {Array<Loot>} refGear
   */
  var getRarityByItemId = (lootIdOrCompound,refGear) =>{
    var lootId = my.getLootIdFromLootIdOrCompound(lootIdOrCompound);
    if(!(refGear != null)){
      console.warn('no refGear provided', lootIdOrCompound);
      if(app.throw === true)
        throw error('no refGear provided'+ lootIdOrCompound);
      return 0;
    }
    var item = refGear.find(g => g.lootId == lootId);
    return item && item.rarity;
  };
  my.getRarityByItemId = getRarityByItemId;

  my.getLLevel = (compound, refGear) =>{
    if(!compound)
      return undefined;
    if(typeof(compound) != "string" && typeof(compound) != "number")
      return null;
    var x = compound.toString();
    var compoundIndex = x.indexOf("_");
    if(compoundIndex >=0 && x.length > compoundIndex)
      return x1.slice(compoundIndex + 1);
    // if there is no _ and it is rarity 5, then fallback to 1
    var rarity = getRarityByItemId(compound, refGear);
    if(rarity == 5)
      return 1;

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
  my.getLLevel =
  /**
   * @param {string | number} id
   * @param {Array<Loot>} refGear
   */
  (id, refGear) => {
    if(LootV1.getIsV1(id))
      return LootV1.getLLevel(id);
    return LootV2.getLLevel(id, refGear);
  };
  my.changeLLevel = (id,level) =>{
    if(LootV1.getIsV1(id)){
      var result = LootV1.changeLLevel(id,level);
      return result;
    }
    var result = LootV2.changeLLevel(id,level);
    return result;
  };
  return my;

}());
