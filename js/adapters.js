// any adapter code or functionality that doesn't need jsx
// on the fence about domain layer code
var parseLoot = (crusaders,lootData) =>{
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
        var lootMapped =
          lootData
            .map(l =>
            {
              var crusader = refC.find(cru => cru.loot.find(cl => cl.lootId == l.loot_id));
              var lootItem = crusader && crusader.loot.find(cl => cl.lootId == l.loot_id);
              // console.log('lootDataMap',l, crusader,lootItem);

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
              if(x.crusader.id ==="15")
              console.log('lootmapping',result,x);
              return result;
            }
            ).sort(lootComparer);
          // console.log('lootMapped',lootMapped);
          return lootMapped;
};

var tryPullLootData = (data,loot) => {
      console.log('tryPullLootData',data);
      try{
        var crusaderGear = {};
        loot.map(l =>{

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
          if(l.heroSlotId==="15")
          console.log('mapped loot?', l, crusaderGear[l.heroSlotId]);
        });
        data.crusaderGear = crusaderGear;
        console.log('loot import phase 1 complete', data.crusaderGear);
      } catch(ex){
        console.error('could not import loot game data', ex);
      }
};
var parseNetworkDataHeroesSection = (heroMap, heroes) => {
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
var getSlotRarity = itemRarityCompound => !(itemRarityCompound != null) ? 0 : itemRarityCompound && typeof(itemRarityCompound) === "number" ? itemRarityCompound : +itemRarityCompound[0];
var getSlotRarities = gear => inspect((gear ? [gear.slot0, gear.slot1, gear.slot2]:[0,0,0]).map(getSlotRarity),'getSlotRarities results');

var filterSortCrusaders = (ownedCrusaderIds, filterOwned, filterTags, isBuildingFormation, formationIds, isDesc,crusaders) => {
  // console.log(ownedCrusaderIds,'filterOwned',filterOwned,'filterTags', filterTags, isBuildingFormation, formationIds, isDesc,crusaders );

    var sortedCrusaders = (!isDesc ? crusaders : crusaders.slice(0).sort(function(a,b){
      return a.slot > b.slot ? -1 : a.slot < b.slot ? 1 : 0;
    }))
      .filter(function(crusader){
        var result = crusaderFilter(ownedCrusaderIds, crusader,filterOwned, filterTags,isBuildingFormation,formationIds);
        // console.log('filter', crusader,filterOwned, filterTags);
        return result;
      });
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
      console.log('saved.ownedIds',x, x.length);
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