// any adapter code or functionality that doesn't need jsx
// on the fence about domain layer code
/// <reference path="allHelpers.ts" />


/* global global module window */
declare var global:any;
declare var module:any;

// represents the data in data.js
interface Model{
  crusaders:any[]
  missionTags:any[]
}

interface FormationSave{
  id:number
  f:number[]
}
interface FormationSaveMap{
  campaignX:FormationSave // campaign[x] -- campaign[y]
}
interface PlayerData {
  reset_currency:number // idol count without including unspent idols
  reset_currency_spent:number // unspent idols
  stats:Object // unmapped stats
  formation_saves:FormationSaveMap
}
interface TalentReferenceData{
  talentId:number,
  name:string
}

enum Rarity {
  Common=1,
  Uncommon=2,
  Rare=3,
  Epic=4,
  Legendary=5
}

enum Sorting {
  up,
  down
}

interface CruAppSaveState{
  legendaryReductionDate?:object
  crusaderGear?:object
  mainSelectedTab?:number
  slotSort?:Sorting
  epSort?:Sorting
  nameSort?:Sorting
  mode?: "mine"
  isEpMode?:boolean
  isGearMode?:boolean
  sharingIsCaring?:number
  enchantmentPoints?:number
  ownedCrusaderIds?: string[]
  isBuildingFormation?:"formation"
  formationIds?: string[]
  filterTags?:object
  filterOwned?:number
}
interface CruAppNetworkData{
  networkDataJson?:string
  mappedLoot?:object
  mappedHeroes?:object
  mappedTalents?:object
  mappedFormations?:object
  saved:CruAppSaveState
}
enum Tag{
  alien,
  angel,
  animal,
  dps,
  dragon,
  elf,
  event,
  female,
  gold,
  healer,
  human,
  leprechaun,
  magic,
  male,
  orc,
  robot,
  royal,
  supernatural,
  support,
  tank
}
declare enum Slot{
  Slot0 = 0,
  Slot1 = 1,
  Slot2 = 2

}

// encapsulates Gear, Trinkets, etc..
// is not the same format as gameData.Json loot
interface LootItem{
  lootId:number
  name:string
  rarity:number
  slot:number
  golden?:boolean
}
// data that has come in via network capture, is not the same format as gameData.json
interface HeroLootItem{
  loot_id:number
  count:number
  slot:Slot
  id:number
}
// refers to my reference data
interface Crusader{
  /**
   * @deprecated 01a syntax needs to die, in favor of heroId
   */
  id:string
  displayName:string
  image?:string
  slot:number // benchSlot
  tags:Tag[]
  calculate?: () => void
  gear?:string[]
  heroId:number
  loot:LootItem[]
}

/**
 * @typedef {Object} FormationSave
 * @property {number} save_id - 1 2 or 3
 * @property {Array<number>} formation
 */

/**
 * @typedef {Object} FormationSaveMap - only shows last 4 campaigns visited it seems
 * @property {FormationSave} campaignX - campaign[x] -- campaign[y]
 */

/**
 * @typedef {Object} PlayerData - aka HeroData or the file sampleHeroData.json
 * @property {number} reset_currency - idol count without including unspent idols
 * @property {number} reset_currency_spent -- unspent idols
 * @property {Object} stats - unmapped stats
 * @property {FormationSaveMap} formation_saves
 */

(function(app,exposeYourself:boolean){

  var getTalentsAsArray = talents =>
  {
    return Object.keys(talents).map( k => app.copyObject(talents[k], {name:k}));
  };
  if(exposeYourself === true)
    app.getTalentsAsArray = getTalentsAsArray;

  // talent reference data
  // data is an object keyed to talentIds as a string
  app.parseTalents = (talents,data) =>{
    if(!(data != null))
      return;
    console.log('attempting to parse talents');
    var talentArray : Array<TalentReferenceData> = getTalentsAsArray(talents);
    var parsedTalents = Object.keys(data).map(k =>{
      var talent = talentArray.find(t => t.talentId != null && t.talentId == +k);
      var result = {name:talent && talent.name, level: +data[k], talentId:+k};
      return result;
    });
    console.log('talents parsed into', parsedTalents, talentArray, talents);
    return parsedTalents;
  };
  /**
   * @typedef Crusader
   * @property {string} id
   * @property {number} heroId
   */

  app.parseLoot = (crusaders:Crusader[],lootData?:HeroLootItem[]) =>{
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
        if(a.heroName > b.heroName)
          return 1;
        if(a.heroName < b.heroName)
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
      var unMapped:HeroLootItem[] = [];
      var lootMapped =
        lootData
          .map(l =>
          {
            var crusader = refC.find(cru => cru.loot != null && cru.loot.find(cl => cl.lootId == l.loot_id) != null);
            var lootItem = crusader && crusader.loot.find(cl => cl.lootId == l.loot_id);
            // console.log('lootDataMap',l, crusader,lootItem);
            if(!(crusader != null)){
              unMapped.push(l);
            }
            if(!(lootItem != null)){
              console.warn("lootItem not found", l.loot_id, crusader);
              return;
            }

            return {loot:l, crusader:crusader,lootItem:lootItem};
          })
          .filter(l => l != null && l.crusader != null)
          .map(x =>
          {
            var loot = x!.loot;
            var crusader = x!.crusader;
            var lootItem = x!.lootItem;
            var result = {
                heroBenchSlot : crusader!.slot,
                heroName: crusader!.displayName,
                heroSlotId : crusader!.id,
                slot: x!.lootItem!.slot,
                lootId : x!.lootItem!.lootId,
                rarity: x!.lootItem.rarity};
            if(loot.count)
              (result as any).countOrLegendaryLevel=loot.count;
            if(x!.lootItem.golden)
              (result as any).isGolden = true;
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

        return {gear:lootMapped,items:items};
  };

  app.parseFormationSaves = (data) =>{
    console.log('parseFormationSaves');
    if(!(data != null))
      return;
    console.log('attempting to parse formationSaves');
    return data;
  };


  // data is the object to merge the loot into
  // so it will hold save data in the format we will keep it in, in storage
  app.mergeImportLoot = (data,loot) => {
        console.log('mergeImportLoot',data);
        if(loot.gear)
        {
          try{
            var crusaderGear = {};
            loot.gear.map(l =>{

              if(!crusaderGear.hasOwnProperty(l.heroSlotId)){
                crusaderGear[l.heroSlotId] = {s0:0, s1:0,s2:0};
              }
              // this looks to only handle lootV2 ?
              if(l.slot != null){
                var itemId = l.lootId;
                if(l.isGolden || l.rarity === 5){
                  // console.log("itemId", itemId, l);
                  itemId = itemId + (l.isGolden? "g":"_");
                  if(itemId === 5 && !(l.countOrLegendaryLevel != null))
                    console.log('failing to map properly', l);
                  itemId = itemId + (l.rarity === 5 ? (l.countOrLegendaryLevel || 1) : "");
                }
                crusaderGear[l.heroSlotId]["s" + l.slot] = itemId;
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

  app.mergeImportTalents = (data,talents) =>{
    console.log('mergeImportTalents',talents);
    if(!(talents!= null))
      return;
    talents.filter(t =>
      t.name != null
    ).map(t =>
      data[t.name] = t.level
    )
  };

  app.parseNetworkDataHeroesSection = (heroMap, heroes) => {
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
  app.exportToUrl = (key,data) =>
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
  app.getParameterByName = (name, url?:string) => {
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
  app.importFromUrl = key =>
  {
      return app.getParameterByName(key);
  };

  // assumes anything with a query on it, is a url loaded/loading app state
  app.getIsUrlLoaded = () => // probably only works if app === window
    app.location.search !== null && app.location.search !== "";

  app.getIsLocalFileSystem = () => window.location.protocol && window.location.protocol == "file:" ;
  app.tryInitializeClipboard = () =>
    app.Clipboard && new app.Clipboard('.btn');

  app.crusaderFilter = (ownedCrusaderIds,crusader,filterOwned,filterTags,isBuildingFormation,formationIds, ep, epFilterInput) =>{
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
    var epFilter = (() =>{
      switch (epFilterInput){
        case ">200": return ep > 200;
        case ">400": return (ep > 400);
        case "<200": return ep < 200;
        case "<400": return (ep < 400);
        default: return true;
      }
    })();

    var formationFilter = !isBuildingFormation
      || //nothing in slot selected
        (!(formationIds[crusader.slot] != null)
        ||  // this one is not selected
        formationIds[crusader.slot] === crusader.id);
    var result = ownershipFilter && tagFilter && formationFilter && epFilter;
    // console.log('filteringCheck',crusader.id,ownershipFilter, tagFilter, formationFilter, epFilter,epFilterInput, result);
    return result;
  };
  app.heroSelectSorter = (crusaders,dontSort) =>{
    var c = crusaders.slice(0);
      if(!dontSort)
      c.sort((a,b)=> {
          if(a.tags.includes("dps") && !b.tags.includes("dps"))
              return -1;
          if(!a.tags.includes("dps") && b.tags.includes("dps"))
              return 1;
          if(a.slot < b.slot)
              return -1;
          if(a.slot > b.slot)
              return 1;
          return 0;
      });
    return c;
  }

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

  // this doesn't seem to work at all
  /**
   * @callback comparerCallback
   * @param {Crusader} crusader1
   * @param {Crusader} crusader2
   * @return {number}
   *
   */
  // each function in the passed array must return 1, 0, or -1 given 2 crusaders
  app.sortCrusaders2 =
    /**
     * @param {Array<Crusader>} crusaders - the crusaders to sort
     * @param {Array<function(Crusader,Crusader)>} fComparisons
     */
    (crusaders:Crusader[], fComparisons:((cru:Crusader,cru2:Crusader) => number)[]) =>{
      if(!fComparisons || !Array.isArray(fComparisons)) {
        return crusaders;
      }
      var copy = crusaders.slice(0);
      // have to slice the copy, because the upcoming sort results in the log showing the post-sorted results
      // console.log('sliced', copy.slice(0).map(cru => cru.id), copy.slice(0));
      var allCompareResults:number[] = [];
      var sorted = copy.sort((a,b) =>{
        var comparisonResults =
          fComparisons.reduce((prev,fn) =>{
            var compR = prev == 0 ? fn(a,b) : prev;
            // deal with -0
            var result = compR > 0 || compR < 0 ? result : 0;
            return result;
        },0);
        allCompareResults.push(comparisonResults);
        return comparisonResults;
      });
      // this fixes a sort that was supposed to not touch ordering, doing ordering instead
      if(allCompareResults.every( e => e === 0))
        // return a copy, I'm pretty sure outside of this there's mutation to the array going on.
        // which should be handled by the mutator, not here.
        return crusaders.slice(0);
      return sorted;
  };

  app.filterSortCrusaders = (ownedCrusaderIds, filterOwned, filterTags, isBuildingFormation, formationIds, slotSort, crusaders, epSort, epMap, nameSort, epFilter) => {
    var filtered = crusaders.filter(function(crusader){
      var ep= epMap ?
        epMap[crusader.id] : 0;
      var result = app.crusaderFilter(ownedCrusaderIds, crusader,filterOwned, filterTags,isBuildingFormation,formationIds, ep, epFilter);
      // console.log('filter', crusader,filterOwned, filterTags);
      return result;
    });
    var sortedCrusaders = app.sortCrusaders2(filtered, [slotComparer(slotSort), epComparer(epSort, epMap), nameComparer(nameSort)]);
    return sortedCrusaders;
  };

  app.scrubSavedData = saved =>
  {
    // consider scrubbing old fields into new name/format, then setting the old field to undefined
    // legacy data coming in may look like this:
    //{slotSort:"up",mode:"",epMode:false,sharingIsCaringLevel:0,enchantmentPoints:{},filterOwned:0,ownedCrusaderIds:[], formation:null, filterTags:{}, formationIds:{}};
      // ownedCrusaderIds:[],
      // only scrub if the property exists, and there are at least 2 crusaders saved.
      if(saved.ownedCrusaderIds && saved.ownedCrusaderIds[0] && saved.ownedCrusaderIds[1])
      {
        var toRemove :(string|number)[]=[];
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
          var proposedValue = app.padLeft(i,2);
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
      if(saved.crusaderGear != null){
        Object.keys(saved.crusaderGear).map( cruId =>{
          var crusaderGear = saved.crusaderGear[cruId];
          Object.keys(crusaderGear).map( slotKey =>{
            var slotGear = crusaderGear[slotKey];
            var slotNumber = slotKey[slotKey.length];
            // console.log('scrubbing gear', crusaderGear,slotGear,slotNumber);
            if(slotKey.startsWith("slot")){
              // if(!(crusaderGear["s" + slotNumber] != null))
              //   crusaderGear["s" + slotNumber] = slotGear;
              // crusaderGear[slotKey] = undefined;
            }

          });
        });


      }
  };

  // componentizing
  app.cruTagGrid = (() => {
    var cruTagGridKey = "cruTagGrid";
    var my:any = {};
    // disable writes to storage if they arrived here from someone else's data link
    my.store = data => !app.getIsUrlLoaded() ? app.storeIt(cruTagGridKey, data) : null;
    my.readOrDefault = defaultValue => !app.getIsUrlLoaded() ? app.readIt(cruTagGridKey, defaultValue) : defaultValue;
    return my;
  })();

  app.calcEffectiveEP = (sharingIsCaringLevel, cruEP, slotEP) =>
  {
    var otherEP = +slotEP - +cruEP;
    var sic = 6 + +(sharingIsCaringLevel || 0);
    // rounding via http://www.jacklmoore.com/notes/rounding-in-javascript/
    var rawSharedEP = +(0.05 * sic * otherEP);
    var effectiveEP = Number(Math.round(+rawSharedEP)) + +cruEP;
    // console.log('calcEffectiveEP', sharingIsCaringLevel, cruEP, slotEP, otherEP, sic, rawSharedEP, effectiveEP);
    return +effectiveEP;
  };

  /**
   * @module
   */
  app.Formation = (() =>{
    var my:any = {};
    // not for export
    /**
     * @param {number} worldId
     */
    var makeKey = worldId => "worldSaves" + worldId;
    my.getWorldSaves =
      selectedWorldId =>{
          var key = makeKey(selectedWorldId);
          // copyObject will pass the default value through if the read returns nothing
          var oldWorldSaves = app.readIt(key, {});
          return oldWorldSaves;
      };
    /**
     * @param {number} selectedWorldId
     */
    my.getSaveNames =
      selectedWorldId =>{
        var oldWorldSaves = my.getWorldSaves(selectedWorldId);
        return Object.keys(oldWorldSaves);
    };
    /**
     * @param {number} selectedWorldId
     * @param {string} saveName
     * @param {Array<string>} formationIds
     * @param {string} dpsChar
     * @param {number?} kaineXP
     */
    my.saveFormation =
      (selectedWorldId, saveName, formationIds, dpsChar,kaineXP) => {
        var key = makeKey(selectedWorldId);

        // copyObject will pass the default value through if the read returns nothing
        var oldWorldSaves = my.getWorldSaves(selectedWorldId);
        oldWorldSaves[saveName] = {formationIds:formationIds, dpsChar:dpsChar, kaineXP:kaineXP};
        console.log('saving:', oldWorldSaves[saveName], 'to', key,'.',saveName);
        app.storeIt(key, oldWorldSaves);
        return oldWorldSaves;
    };

    /**
     * @param {number} selectedWorldId
     * @param {string} saveName
    */
    my.getFormation =
      (worldId, saveName) =>{
        var key = makeKey(worldId);
        var worldSaves = app.readIt(key);
        console.log('loading',worldSaves);
        var data = worldSaves[saveName];
        return data;
    };
    /**
     * @param {function} getFormationsByCampaignId
     * @param {FormationSaveMap} formationSaves
     * @param {number} formationSaves.campaignId
     * @param {Array<Crusader>} crusaders
     */
    my.mergeImportFormations = (formationSaves,crusaders) =>{
      var result = {};
      Object.keys(formationSaves).map(campaignLongId => {
        // after "formation"
        var campaignId = campaignLongId.slice(1);
        if(!(campaignId != null) || campaignId.length < 1)
        {
          console.error("could not import campaignId", campaignLongId);
          return;
        }
        /**
         * @type {FormationSave}
         */
        var campaignSlotFormations = formationSaves[campaignLongId];

        var oldWorldFormations = app.Formation.getWorldSaves(campaignId);
        result[campaignId] = oldWorldFormations || {};
        campaignSlotFormations.map((slotSave:FormationSave) => {
          var saveSlot = slotSave.id;
          // console.log('mergeImportFormations. slotSave.formation', slotSave.formation);
          // need to adapt this from hero_ids to formationIds ("01a", "11c", ...)
          var formationIds = slotSave.f.map(heroId =>{
            // player data uses -1 for no one in slot
            if(heroId < 1)
              return null;
            var cru = crusaders.find(c => c.heroId == heroId);
            if(cru != null)
              return cru.id;
            return null;
          }
          );
          // console.log('mergeImportFormations formationIds', formationIds);
          // dpsChar is undefined
          result[campaignId][saveSlot] = {formationIds:formationIds, dpsChar:undefined, kaineXP:undefined};
        });
      });
      Object.keys(result).map(campaignId =>{
        var campaignSaves = result[campaignId];
        Object.keys(campaignSaves).map(saveName =>{
          var save = campaignSaves[saveName];
          // (selectedWorldId, saveName, formationIds, dpsChar,kaineXP) => {
            console.log('saving formation campaign/worldId:' + campaignId + ', saveName:' + saveName, save);
          my.saveFormation(campaignId, saveName, save.formationIds, save.dpsChar, save.kaineXP)
        });
      });
      return result;
    };

    return my;
  })();

  app.Talents = (()=>{
    var my : any = {};
    var getTalentMeta = my.getTalentMeta = (fGetDps, value, max, costForNextLevel) =>{
      var dpsBuff = fGetDps(value);
      var nextDps = fGetDps(+value + 1);
      var showingMessage = typeof dpsBuff == "string";
      var showingMax = false;
      // max is sometimes a string
      if(value != null && max != null && value == max){
          showingMax = true;
      }
      // improvement
      var impr = (nextDps - dpsBuff)/(dpsBuff + 1);
      return {
          dpsBuff,
          nextDps,
          showingMessage,
          showingMax,
          impr,
          sortScore: showingMax? null : (impr / costForNextLevel),
          score: showingMax? "max" : (impr / costForNextLevel) * 100000
      };
    };
    var getCooldown = my.getCooldown = (c,u,r,e) => (c * 0.5 + u + r * 1.5 + e * 2) / 100;

    /**
     *
     * @param {number} critChance
     * @param {number} lvl
     * @return {number|string}
     */
    my.getPassiveCrits = (critChance,lvl) => {
      var result = !(critChance !=null) || critChance < 1 ? "no crit chance entered":critChance * lvl / 100;
      return result;
    }

    /**
     * @param {number} cooldown
     * @param {number} lvl
     * @return {number}
     */
    my.getSurplusCooldown = (cooldown,lvl) => (cooldown - 0.5 )* lvl /4;
    my.getWellEquippedDps =
      mainDpsEpics =>
        lvl => 0.2*lvl*mainDpsEpics;

    /**
     * @typedef TrinketContainer
     * @type {Object}
     * @property {number} common
     * @property {number} uncommon
     * @property {number} rare
     * @property {number} epic
     */
    /**
     * @typedef DpsInfo
     * @type {Object}
     * @property {Crusader} cru
     * @property {number} ep
     * @property {number} slotEp
     * @property {number} epics
     * @property {number} slotEpics
     */

    /**
     * @typedef TalentInfo
     * @type {Object}
     * @property {number} level
     * @property {number} max
     * @property {function} getCost
     * @property {string} name
     */

    /**
     * @typedef TalentInputContainer
     * @type {Object}
     * @property {number} critChance
     * @property {number} stormRiderPercentage
     * @property {TrinketContainer} tc
     * @property {DpsInfo} dpsInfo
     * @property {Object<string,TalentInfo>} td
     * @property {Object<number,number>} rarityMultMap
     */

    my.getTalentDisplay =
      /**
       * @param {TalentInputContainer} tic
       */
      tic => {
        var getCanReadTalent = name => tic.td[name].getCost != null;
        var cooldown = getCooldown(tic.tc.common, tic.tc.uncommon, tic.tc.rare, tic.tc.epic) * 100;
        var dpsInfo = tic.dpsInfo;
        var dpsHero = dpsInfo.cru; //props.crusaders.find(cru => cru.id === props.selectedHeroId);
        var effectiveEP = app.calcEffectiveEP(tic.td.sharingIsCaring.level, dpsInfo.ep, dpsInfo.slotEp);
        var getCumulativeCost = name => getCanReadTalent(name) ? app.createRange(tic.td[name].level).map(i => tic.td[name].getCost(i + 1)).reduce((a,b) => a + b,0) : null;
        var getEnchantBuff = olvl => (olvl * 0.2 + 1) * 0.25;
        var currentEnchantBuff = getEnchantBuff(tic.td.overenchanted.level);
        var idkMyBffJill = (() =>{
          var toRound = (tic.dpsInfo.slotEp - tic.dpsInfo.ep)*6*0.05;
          var mathRound = (Math.round as any);
          return tic.dpsInfo.ep + mathRound(toRound,0);
        })();
        var getFastLearnerMinutes = x => (1-0.05*x) * 300;
        var getFastLearnersDps = x => 300 / (getFastLearnerMinutes(x) - 1);
        // var getWellEquippedDps = x => 0.2*x*tic.dpsInfo.epics;
        var srp = tic.stormRiderPercentage;
        var getCurrentStormRider = x => srp * (x*0.1 + 1);
        var getTimePerStormRider = x => 480*(1-Math.min(cooldown / 100 ,0.5))*(1-0.05*x);
        var getRideTheStormDps = x => (getCurrentStormRider(x) - srp) / (srp+1);

        var getStormRiderPercentageFromRarity = rarity =>
          {
              var map = tic.rarityMultMap[rarity];
              return map? map.mult : undefined;
          };
        var spent = 0;
        Object.keys(tic.td).map(name =>{
          /**
           * @type {number => number}
           */
          var data = (() =>{
            switch(name){
              case "passiveCriticals": return x => my.getPassiveCrits(tic.critChance,x); //spent: getCumulativeCost(name)};
              case "surplusCooldown": return x => my.getSurplusCooldown(cooldown,x);
              case "overenchanted": return x => ((1 + getEnchantBuff(x)*tic.dpsInfo.ep) - (1 + 0.25*tic.dpsInfo.ep)) / (1 + 0.25 * tic.dpsInfo.ep);
              // assumes they have at least common gear in all slots
              case "setBonus": return x => x * 0.2
              case "sharingIsCaring": return x => (app.calcEffectiveEP(x, tic.dpsInfo.ep, tic.dpsInfo.slotEp)*currentEnchantBuff  - currentEnchantBuff * idkMyBffJill) / (currentEnchantBuff * (idkMyBffJill)+1);
              case "fastLearners": return getFastLearnersDps;
              case "wellEquipped": return my.getWellEquippedDps(tic.dpsInfo.epics);
              case "swapDay": return x => 0.2*x*(tic.dpsInfo.slotEpics - tic.dpsInfo.epics);
              case "rideTheStorm":
                // store sub-calculations or intermediary formulas
                tic.td[name].formulas = tic.td[name].formulas || {};
                tic.td[name].formulas.getRideTheStormDps = getRideTheStormDps;
                // uses magnified dps not regular
                return x => ((getCurrentStormRider(x)*1.5 + 1) - (1 + srp * 1.5)) / (srp * 1.5 + 1);
              case "stormsBuilding": return x => 480*(1-(Math.min(cooldown / 100,0.5)))/getTimePerStormRider(x) - 1;
              default: return () => undefined;
            }
          })();
          var t = tic.td[name];
          //  var getNextCost = name => getCanReadTalent(name) ? props.talents[name].costs[props[name] + 1] : undefined;

          t.nextCost = getCanReadTalent(name) && t.level < t.max ? t.getCost(+t.level + 1) : null;
          t.getDps = data;
          t.spent = getCumulativeCost(name);
          if(!Number.isNaN(+t.spent) && !isNaN(+t.spent))
            spent += +t.spent;
          t.score = my.getTalentMeta(data,t.level, t.max, t.nextCost);
        });
        var defaultOrder = [
              "passiveCriticals",
              "surplusCooldown",
              "overenchanted",
              "setBonus",
              "sharingIsCaring",
              "fastLearners",
              "wellEquipped",
              "swapDay",
              "rideTheStorm",
              "stormsBuilding"
        ];
        var currentStormRider = getCurrentStormRider(tic.td.rideTheStorm.level);
        var nextStormRider = getCurrentStormRider(tic.td.rideTheStorm.level + 1);
        return {cooldown, dpsHero, effectiveEP, getStormRiderPercentageFromRarity, spent, currentStormRider, nextStormRider, defaultOrder, talentDict:tic.td};
    }
    return my;

  })();

  app.NetworkData = (()=>{

    var my:any = {};
    var loadNetworkData = (parsedOrUnparsedData,referenceData,setState,mergeSaveState) => {
      // console.log('loadNetworkData',parsedOrUnparsedData);
      var json = typeof(parsedOrUnparsedData) != "string" ? parsedOrUnparsedData : null;
      if(!(json != null))
      try{
        json = JSON.parse(parsedOrUnparsedData);
        console.log('parse success');
      } catch (ex){
        console.error(ex);
        setState({error:ex});
        return;
      }
      if(app.getIsLocalFileSystem()){
        app.storeIt("gameDataJson",json);
      }
      var heroMap = {};
      referenceData.crusaders.map(c =>{
        heroMap[c.heroId] = c;
      });
      var legendaryReductionDate = json && json.details && json.details.stats && json.details.stats.legendary_reduction_date ? new Date(+json.details.stats.legendary_reduction_date * 1000): null;
      console.log("legendaryReductionImport", legendaryReductionDate || json.details.stats);
      var getOrGetFromDetails = name => json[name] || (json.details && json.details[name]);

      // account for pasting just the heroes section of json, or the whole data packet
      var mappedHeroes = app.parseNetworkDataHeroesSection(heroMap, getOrGetFromDetails("heroes"));
      var mappedLoot = app.parseLoot(referenceData.crusaders,getOrGetFromDetails("loot"));
      var mappedTalents = app.parseTalents(referenceData.talents,getOrGetFromDetails("talents"));
      app.mappedTalents=mappedTalents;
      var mappedFormations = app.parseFormationSaves(getOrGetFromDetails("formation_saves"));
      console.log('loadNetworkData.mappedFormations', mappedFormations);
      app.mappedFormations = mappedFormations;

      app.heroMap = heroMap;
      var stateMods:CruAppNetworkData = {networkDataJson:json, mappedLoot:mappedLoot, mappedHeroes:mappedHeroes, mappedTalents:mappedTalents,
        mappedFormations:mappedFormations,
        saved:mergeSaveState({legendaryReductionDate: legendaryReductionDate})};
      console.log('loadNetworkData setting state', stateMods);
      setState(stateMods);
    };
    my.findNetworkData = (networkDataRaw,referenceData,setState,mergeSaveState) => {
      console.group("findNetworkData");
      if(networkDataRaw){
        console.log('findNetworkData: using networkDataRaw');
        loadNetworkData(networkDataRaw,referenceData,setState,mergeSaveState);
      }
      else if (app.heroesRaw || app.lootRaw){
        var data:any= {};
        data.details = {};
        if(app.heroesRaw){
          try{
            if(typeof(app.heroesRaw) == "string"){
              console.log('starting heroesRaw parse');
              data.details.heroes = JSON.parse(app.heroesRaw);
            }
            else{
              console.log('starting heroesRaw import');
              data.details.heroes = app.heroesRaw;
            }
          } catch (ex){
            console.error(ex);
          }
        }
        if(app.lootRaw){
          try{
          if(typeof(app.lootRaw) == "string"){
          console.log('starting lootRaw parse');
          data.details.loot = JSON.parse(app.lootRaw);
          } else {
            console.log('starting lootRaw import');
            data.details.loot = app.lootRaw;
          }
          } catch (ex){
            console.error(ex);
          }
        }
        if(app.talentsRaw){
          try{
          if(typeof(app.talentsRaw) == "string"){
          console.log('starting talentsRaw parse');
          data.details.talents = JSON.parse(app.talentsRaw);
          } else {
            console.log('starting talentsRaw import');
            data.details.talents = app.talentsRaw;
          }
          } catch (ex){
            console.error(ex);
          }
        }
        loadNetworkData(data,referenceData,setState,mergeSaveState);
      }
      console.groupEnd();
    }

    return my;

  })();
})(findJsParent(), false);
