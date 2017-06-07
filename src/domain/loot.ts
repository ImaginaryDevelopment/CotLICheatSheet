/**
 * @typedef {Object} Loot
 * @property {number} lootId
 * @property {number} slot
 * @property {number} rarity
 * @property {string} name
*/
// until this thing is made into more conventional modules

// number or compound
type LootIdentifier = number | string
enum ReferenceChecked {
  Unknown,
  Found,
  NotFound
}
interface LootVItem {
  lLevel:number
  isInReference:ReferenceChecked
  compoundish:LootIdentifier
}
// by definition these can't have a reference
interface LootV1Item extends LootVItem{
  kind: "V1"
  isInReference:ReferenceChecked.Unknown
  isGolden:boolean
  rarity: Rarity
}
// just because it is V2 doesn't mean we found it in a loot lookup to know rarity, or isGolden
interface LootV2Id extends LootVItem{
  kind: "V2"
  lootId:number
  isInReference:ReferenceChecked.Unknown | ReferenceChecked.NotFound
  // compound string may say it is golden
  isGolden?:boolean
}

interface LootV2Item extends LootVItem{
  kind: "V2Found"
  isInReference:ReferenceChecked.Found
  isGolden:boolean
  rarity:Rarity
}

type LootV2ish = LootV2Id | LootV2Item
type LootItemUnion = LootV1Item | LootV2ish;
function assertNever(x: never): never {
    throw new Error("Unexpected object: " + x);
}
var app = (typeof module !== "undefined" && module && module.exports
  || typeof module !== "undefined" && module)
  || typeof global !== "undefined" && global
  || window;

//loot tracking will use V1 whenever the crusader's loot data isn't in data.js (simple compound string of rarity,isGolden,legendary level)
var LootV1 = app.LootV1 = (function () {
  var my:any= {};
  // 0 is none, 1 is common, 2 is uncommon, 3 is rare, 4 epic, 5 legendary
  // examples 1, "1", "4g", "5g2"
  /**
   *
   * @param {number | string} itemIdentifier
   */
  var getIsV1 = (itemIdentifier?:number|string) => {
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

var LootV2 = app.LootV2 = (function () {
  var my:any = {};
  var getIsCompoundish = (lootIdOrCompound:LootIdentifier) => typeof(lootIdOrCompound) == "string" && (lootIdOrCompound.indexOf("_") >= 0 || lootIdOrCompound.indexOf("g") >= 0);
  var decomposeCompoundish = (lootIdOrCompound:LootIdentifier) => {
    if(!(lootIdOrCompound != null))
      return lootIdOrCompound;
    if(getIsCompoundish(lootIdOrCompound))
    {
      var c = lootIdOrCompound as string;
      var compoundIndex_ = c.indexOf("_");
      var compoundIndexG = c.indexOf("g");

      var lootId = +c.slice(0,Math.max(compoundIndex_,compoundIndexG));
      var lLevel:number = +c.slice(Math.max(compoundIndex_,compoundIndexG));

      return {lootId:lootId, isGolden: compoundIndexG >=0, compoundish: lootIdOrCompound, lLevel: lLevel};
    }
    if(typeof lootIdOrCompound === "number")
      return {lootId:lootIdOrCompound as number, isGolden:undefined, compoundish: lootIdOrCompound, lLevel:undefined};
  };

  /**
   * @param {number | string} lootIdOrCompound
  */
  var getLootIdFromLootIdOrCompound  = (lootIdOrCompound:LootIdentifier) : (number|undefined) =>
  {
    if(!(lootIdOrCompound != null))
      return lootIdOrCompound;
   var decomposed = decomposeCompoundish(lootIdOrCompound);
   return decomposed!.lootId;
  };
  my.getLootIdFromLootIdOrCompound = getLootIdFromLootIdOrCompound;

  var getLootishFromId = my.getLootItemFromCompound = (compoundish:LootIdentifier, loot?:LootItem[]) : (LootV2ish | null | undefined) =>{
    if(!(compoundish != null))
      return compoundish;
    if(typeof compoundish != "string" && typeof compoundish != "number"){
      console.warn("bad value passed as compound, expected number, string, or undefined", compoundish);
      return null;
    }
    var decomposed = decomposeCompoundish(compoundish);
    if(!(decomposed != null))
      return decomposed;
    var refLoot = loot != null ? loot.find(l => l.lootId == decomposed!.lootId) : undefined;
    if(!(refLoot != null))
      return {
        kind:"V2",
        lootId:decomposed!.lootId,
        isInReference: ReferenceChecked.NotFound,
        compoundish: compoundish,
        isGolden: decomposed!.isGolden || false,
        lLevel: decomposed!.lLevel || 0,
    };
    var rarity = refLoot!.rarity;
    return {
      kind:"V2Found",
      lootId:decomposed!.lootId,
      isInReference:ReferenceChecked.Found,
      compoundish:compoundish,
      isGolden: refLoot.golden || false,
      lLevel: decomposed!.lLevel || (rarity > 4 ? 1 : 0),
      rarity: rarity as Rarity
      };
    };

  my.getLootishFromId = getLootishFromId;
  /**
  * @param {Array<Loot>} refGear
  * @param {number | string} lootIdOrCompound
  * @return boolean
  */
  var getIsGolden = (loot:[LootItem],compoundish) => {
    let lootish = getLootishFromId(compoundish,loot);
    if(!(lootish!=null))
      return false;
    switch(lootish.kind){
      case "V2Found":
        return lootish.isGolden;
      case "V2":
        return lootish.isGolden;
      default: return assertNever(lootish); // error here if there are missing cases
    }
  };
  my.getIsGolden = getIsGolden;

  // how would we define a V2? as a valid lootId or an item obtained from looking up the lootId?
  // my.getIsV2 = ???
  /**
   * @param {number | string} lootIdOrCompound
   * @param {Array<Loot>} refGear
   */
  var getRarityByItemId = (compoundish:LootIdentifier,loot:LootItem[]):(number|undefined) =>{
    if(!(loot != null)){
      console.warn('no loot provided', compoundish);
      if(app && app.throw === true)
        throw Error('no loot provided'+ compoundish);
      // debugger;
      return 0;
    }
    let lootish = getLootishFromId(compoundish, loot);
    if(!(lootish!=null))
      return 0;
    switch(lootish.kind){
      case "V2Found":
        return lootish.rarity;
      case "V2":
        return undefined;
    }
  };
  my.getRarityByItemId = getRarityByItemId;

  // should return the legendary level if legendary
  // should return 0 on non-legendary rarity items
  // should return undefined if refGear is not provided (in the event refGear for a specific crusader is not loaded)
  // should return 1 for any legendary rarity level where it a legendary level wasn't provided in the compound
  my.getLLevel = (compoundish, loot?:LootItem[]) =>{
    if(!(compoundish != null))
      return undefined;
    // this case is semi-expected, loot may not always be present for a crusader
    if(!(loot != null)){
      return undefined;
    }
    let lootish = getLootishFromId(compoundish, loot)
    if(lootish!= null)
    return lootish!.lLevel;
    return undefined;
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

var Loot = app.Loot = (function(){
  var my:any = {};
  // id can be V1 compound, lootId, or lootIdCompound (containing legendary level)
  my.getRarityByItemId = (id,refGear) => {
    if(!(id != null)){
      return null;
    }
    if(LootV1.getIsV1(id)) {
      var v1Result = LootV1.getRarityByItemId(id);
      return v1Result;
    }
    var v2Result = LootV2.getRarityByItemId(id,refGear);
    return v2Result;
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
