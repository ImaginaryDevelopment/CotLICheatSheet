// any adapter code or functionality that doesn't need jsx
// on the fence about domain layer code
var getTalentsAsArray = talents =>
{
  return Object.keys(talents).map( k => copyObject(talents[k], {name:k}));
};
// talent reference data
var parseTalents = (talents,data) =>{
  if(!(data != null))
    return;
  console.log('attempting to parse talents');
  var talentArray = getTalentsAsArray(talents);
  var parsedTalents = Object.keys(data).map(k =>{

    var talent = talentArray.find(t => t.talentId && t.talentId == k);
    var result = {name:talent && talent.name, level: +data[k], talentId:+k};
    return result;
  });
  console.log('talents parsed into', parsedTalents, talentArray, talents);
  return parsedTalents;
};
var parseLoot = (crusaders,lootData) =>{
    if(!(lootData != null))
      return;
    console.log('attempting to parse loot');
    var refC = crusaders;
    var lootComparer = (a,b) =>{
      if(a.heroBenchSlot > b.heroBenchSlot)
        return 1;
      if(a.heroBenchSlot < b.heroBenchSlot)
        return -1;
      if(a.slotId > b.slotId)
        return 1;
      if(a.slotId < b.slotId)
        return -1;
      if(a.slot != null && !(b.slot != null))
        return 1;
      if(!(a.slot != null) && b.slot != null)
        return -1;
      if(a.slot > b.slot)
        return 1;
      if(a.slot < b.slot)
        return -1;

      return 0;
    };
    var unMapped = [];
    var lootMapped =
      lootData
        .map(l =>
        {
          var crusader = refC.find(cru => cru.loot.find(cl => cl.lootId == l.loot_id));
          var lootItem = crusader && crusader.loot.find(cl => cl.lootId == l.loot_id);
          // console.log('lootDataMap',l, crusader,lootItem);
          if(!(crusader != null)){
            unMapped.push(l);
          }

          return {loot:l, crusader:crusader,lootItem:lootItem};
        })
        .filter(l => l.crusader != null)
        .map(x =>
        {
          var result = {heroBenchSlot : x.crusader.slot,heroName: x.crusader.displayName, heroSlotId : x.crusader.id, slot: x.lootItem.slot, lootId : x.lootItem.lootId, rarity: x.lootItem.rarity};
          // console.log('lootmapping working on x', x);
          if(x.loot.count)
            result.countOrLegendaryLevel=x.loot.count;
          if(x.lootItem.golden)
            result.isGolden = true;
          if(x.crusader.id ==="18")
            console.log('lootmapping',result,x);
          return result;
        }
        ).sort(lootComparer);

        var items = unMapped.map(l =>
        {
          switch (l.loot_id){
            case 249:
              return {lootId:l.loot_id,type:"cooldownCommon", count:l.count, rarity:1};
            case 250:
              return {lootId:l.loot_id,type:"cooldownUncommon", count:l.count,rarity:2};
            case 251:
              return {lootId:l.loot_id,type:"cooldownRare", count:l.count,rarity:3};
            case 252:
              return {lootId:l.loot_id,type:"cooldownEpic", count:l.count,rarity:4};

          }
          }).filter(l => l != null);

      // console.log('lootMapped',lootMapped);
      return {gear:lootMapped,items:items};
};

var mergeImportLoot = (data,loot) => {
      console.log('mergeImportLoot',data);
      if(loot.gear)
      {
        try{
          var crusaderGear = {};
          loot.gear.map(l =>{

            if(!crusaderGear.hasOwnProperty(l.heroSlotId))
              crusaderGear[l.heroSlotId] = {slot0:0, slot1:0,slot2:0};
            if(l.slot != null){
              var rarity = l.rarity;
              if(l.isGolden || l.rarity === 5){
                rarity = rarity + (l.isGolden? "g":"_");
                if(rarity === 5 && !(l.countOrLegendaryLevel != null))
                  console.log('failing to map properly', l);
                rarity = rarity + (l.rarity === 5 ? (l.countOrLegendaryLevel || 1) : "");
              }

              crusaderGear[l.heroSlotId]["slot" + l.slot] = rarity;
            }
            if(l.heroSlotId==="18")
            console.log('mapped loot?', l, crusaderGear[l.heroSlotId]);
          });
          data.crusaderGear = crusaderGear;
          console.log('loot import phase 1 complete', data.crusaderGear);
        } catch(ex){
          console.error('could not import loot game data', ex);
        }
      }
      if(loot.items){
        loot.items.map(l =>
        {
          data[l.type] = l.count;
        });
      }
};
var mergeImportTalents = (data,talents) =>{
  console.log('mergeImportTalents',talents);
  if(!(talents!= null))
    return;
  talents.filter(t =>
    t.name != null
  ).map(t =>
    data[inspect(t,'importing talent level').name] = t.level
  )

};

var parseNetworkDataHeroesSection = (heroMap, heroes) => {
  if(!(heroes != null))
    return;
  console.log('parseNetworkDataHeroesSection', heroes.length);
    var mapped = Array.isArray(heroes) ?
      heroes.map(h => {
        var crusader = heroMap[h.hero_id];
        return {Name:crusader && crusader.displayName,Slot:(crusader && crusader.id),HeroId:h.hero_id,Ep:h.disenchant,Owned:h.owned?true:false};
        }
      ) : [];
    return mapped;
};
// expect data is a string, and it starts with { or [
var exportToUrl = (key,data) =>
{
  if(!data.startsWith("{") && !data.startsWith("["))
    throw "error data is bad";
  // hints from http://stackoverflow.com/questions/6807180/how-to-escape-a-json-string-to-have-it-in-a-url
  var encoded = encodeURIComponent(data);
  var decoded = decodeURIComponent(encoded);
  if(data != decoded)
    throw "Decoded didn't match original data";
  return '?' + key + '=' + encoded;
};
// from http://stackoverflow.com/questions/901115/how-can-i-get-query-string-values-in-javascript
var getParameterByName = (name, url) => {
    if (!url) {
      url = window.location.href;
    }
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}
var importFromUrl = key =>
{
    return getParameterByName(key);
};
// var ImportExporter = React.createClass({

// });
// assumes anything with a query on it, is a url loaded/loading app state
var getIsUrlLoaded = () =>
  window.location.search !== null && window.location.search !== "";

var getIsLocalFileSystem = () => window.location.protocol && window.location.protocol == "file:" ;
var tryInitializeClipboard = () =>
  Clipboard && new Clipboard('.btn');
var crusaderFilter = (ownedCrusaderIds,crusader,filterOwned,filterTags,isBuildingFormation,formationIds) =>{
  var owned = ownedCrusaderIds.indexOf(crusader.id) != -1 || (crusader.slot == crusader.id && crusader.slot < 21);
  var ownershipFilter =
    (filterOwned == 0)
    || (filterOwned == 1 && (owned || (crusader.slot == crusader.id && crusader.slot < 21)))
    || (filterOwned == -1 && !owned);
  // if(!ownershipFilter)
  //   console.log('ownershipFilter', filterOwned, owned, crusader.slot,crusader.id);
  var tagFilter =
    Object.keys(filterTags).map(function(tagId) {
      return !filterTags[tagId] || crusader.tags.indexOf(tagId) > -1;
    })
    .reduce(function(a,b){ return a && b},true);

  var formationFilter = !isBuildingFormation
    || //nothing in slot selected
      (!(formationIds[crusader.slot] != null)
      ||  // this one is not selected
      formationIds[crusader.slot] === crusader.id);
  var result = ownershipFilter && tagFilter && formationFilter;
  // console.log('filteringCheck',crusader.id,ownershipFilter, tagFilter, formationFilter, result);
  return result;
};

var getStormRiderValue = (allCruGear,id) =>{
  var cruGear = allCruGear[id];
  if(!cruGear)
    return 0;
  if(id.toString().indexOf("18") !== 0)
    return 0;
  var gear;
  switch (id){
    case "18": gear = cruGear.slot2 || 0;
    case "18a": gear = cruGear.slot2 || 0;
    case "18b": gear = cruGear.slot0 || 0;
    case "18c": gear = cruGear.slot0 || 0;
 }
  // console.log('getStormRiderValue', id, cruGear, gear);
 return gear;
};

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
// var getSlotRarity2 = itemRarityCompound =>
var getSlotRarities = gear => (gear ? [gear.slot0, gear.slot1, gear.slot2]:[0,0,0]).map(getSlotRarity);

var comparer =
  (a,b) =>
    (a < b ? -1 : b < a ? 1 : 0);

var getSortMult = sortType => (sortType ==="up"? 1 : sortType ==="desc"? -1 : 0);

var slotComparer = sortType =>
  (a,b) => getSortMult(sortType) * comparer(a.slot,b.slot);

var epComparer = (sortType,map) =>
  (a,b) => getSortMult(sortType) * comparer(map[a.id], map[b.id]);

var nameComparer = sortType =>
  (a,b) => getSortMult(sortType) * comparer(a.displayName, b.displayName);


// each function in the passed array must return 1, 0, or -1 given 2 crusaders
var sortCrusaders2 = (crusaders, fComparisons) =>{
  if(!fComparisons || !Array.isArray(fComparisons)) return crusaders;
  var copy = crusaders.slice(0);
  return copy.sort((a,b) =>
    fComparisons.reduce((prev,fn) =>
      prev == 0 ? fn(a,b) : prev
     ,0));
};

var filterSortCrusaders = (ownedCrusaderIds, filterOwned, filterTags, isBuildingFormation, formationIds, slotSort,crusaders, epSort, epMap, nameSort) => {

  var filtered = crusaders.filter(function(crusader){
        var result = crusaderFilter(ownedCrusaderIds, crusader,filterOwned, filterTags,isBuildingFormation,formationIds);
        // console.log('filter', crusader,filterOwned, filterTags);
        return result;
      });
  var sortedCrusaders = sortCrusaders2(filtered, [slotComparer(slotSort), epComparer(epSort, epMap), nameComparer(nameSort)]);
  // console.log('filtered count:' + sortedCrusaders.length);
  return sortedCrusaders;
};
var scrubSavedData = saved =>
{
  // consider scrubbing old fields into new name/format, then setting the old field to undefined
  // legacy data coming in may look like this:
  //{slotSort:"up",mode:"",epMode:false,sharingIsCaringLevel:0,enchantmentPoints:{},filterOwned:0,ownedCrusaderIds:[], formation:null, filterTags:{}, formationIds:{}};
    // ownedCrusaderIds:[],
    // only scrub if the property exists, and there are at least 2 crusaders saved.
    if(saved.ownedCrusaderIds && saved.ownedCrusaderIds[0] && saved.ownedCrusaderIds[1])
    {
      var toRemove=[];
      saved.ownedCrusaderIds.sort();
      var x = saved.ownedCrusaderIds;
      x.sort();

      for(var i = 0; i < x.length; i++){
        var value = x[i];

        if(typeof(value) === "number" || value.length < 2 || value.length > 3 || x.indexOf(value,i + 1) >= 0){
          console.log('removing ownedId', value, 'index', i,'dupAt',  x.indexOf(value, i + 1));
          toRemove.push(value);
        }
      }
      toRemove.map(v => x.splice(x.indexOf(v),1));

      for(var i = 1; i <= 20; i++)
      {
        var proposedValue = padLeft(i,2);
        if(x.indexOf(proposedValue) < 0){
          x.push(proposedValue);
        }
      }
      x.sort();
      // console.log('saved.ownedIds',x, x.length);
    }
    if(saved.formation != null){
      saved.isBuildingFormation = saved.formation
      // this should wipe it off the property list when stringified, which would be lovely.
      saved.formation = undefined;
    }
    if(saved.Idols != null){
      saved.idols = saved.Idols;
      saved.Idols = undefined;
    }
    if(saved.epMode != null){
      saved.isEpMode = saved.epMode === true;
      saved.epMode = undefined;
    }
    if(saved.gearMode != null){
      saved.isGearMode = saved.gearMode === true;
      saved.gearMode = undefined;
    }
};

// componentizing
var cruTagGrid = (() => {
  var cruTagGridKey = "cruTagGrid";
  // return {key:cruTagGridKey};
  var exports = {};
  // disable writes to storage if they arrived here from someone else's data link
  exports.store = data => !getIsUrlLoaded() ? storeIt(cruTagGridKey, data) : null;
  exports.readOrDefault = defaultValue => !getIsUrlLoaded() ? readIt(cruTagGridKey, defaultValue) : defaultValue;
  return exports;
})();

var calcEffectiveEP = (sharingIsCaringLevel, cruEP, slotEP) =>
{
  var otherEP = +slotEP - +cruEP;
  var sic = 6 + +(sharingIsCaringLevel || 0);
  // rounding via http://www.jacklmoore.com/notes/rounding-in-javascript/
  var rawSharedEP = +(0.05 * sic * otherEP);
  var effectiveEP = Number(Math.round(+rawSharedEP)) + +cruEP;
  // console.log('calcEffectiveEP', sharingIsCaringLevel, cruEP, slotEP, otherEP, sic, rawSharedEP, effectiveEP);
  return +effectiveEP;
};