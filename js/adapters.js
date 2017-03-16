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

var parseNetworkDataHeroesSection = (heroMap, heroes) => {
  console.log('parseNetworkDataHeroesSection', heroes.length);
    var mapped = Array.isArray(heroes) ?
      heroes.map(h => {
        var crusader;
        try{
          crusader = heroMap[h.hero_id];
        } catch(ex)
        {
          console.error('failed to parse',h,ex);
        }
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