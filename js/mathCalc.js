(app => {
  app.dpsChar = null;
  //https://github.com/Microsoft/TypeScript/wiki/JsDoc-support-in-JavaScript

/**
 * @typedef {Object} Loot
 * @property {number} lootId
 * @property {number} slot
 * @property {number} rarity
 * @property {string} name
 */
  /**
   * @typedef {Object} Crusader - a crusader object
   * @property {string} id
   * @property {string} displayName
   * @property {Array<Loot>} loot
   */
/**
 * @typedef {Object} World
 * @property {number} spots
 * @property {string} name
 */
  /**
   * 
   * @param {*} name 
   * @param {*} spots 
   */

  // doesn't let me define the function as returning crusader or undefined =(
  /**
   * @param {string} id - a Crusader identifier like 04b
   * @return {Crusader}
   */
  var getCrusader = id => app.jsonData.crusaders.find(c =>  c.id == id);
  app.getCrusader = getCrusader;
  /**
   * 
   * @param {Array<string>} formationIds 
   * @param {string} id 
   */
  var getCrusaderSpot = (formationIds, id) => {
    if(!(id!=null)  || !formationIds || !Array.isArray(formationIds) || !(formationIds.indexOf(id) != null) || formationIds.indexOf(id) < 0) 
      return null;
    var spotMaybe = formationIds.indexOf(id);
    if(spotMaybe === 0 || spotMaybe > 0)
      return spotMaybe;
  };
  app.getCrusaderSpot = getCrusaderSpot;
  /**
   * @return {number}
   */
  var getDpsSpot = () => app.dpsChar != null && app.dpsChar.id ? app.getCrusaderSpot(app.formationIds, app.dpsChar.id) : null;
  app.getDpsSpot = getDpsSpot;
  /**
   * 
   * @param {World} currentWorld 
   * @param {number} spot 
   */
  var getIsValidSpotNumber = (currentWorld, spot) => (spot || spot === 0) && (!(currentWorld != null) || spot < currentWorld.spots);
  app.getIsValidSpotNumber = getIsValidSpotNumber;
  /**
   * 
   * @param {World} currentWorld 
   * @param {number} spot1 
   * @param {number} spot2 
   */
  var getAreInSameColumn = (currentWorld, spot1,spot2) => currentWorld && app.getIsValidSpotNumber(currentWorld, spot1) && app.getIsValidSpotNumber(currentWorld, spot2) && currentWorld.columnNum(spot1) == currentWorld.columnNum(spot2);
  app.getAreInSameColumn = getAreInSameColumn;
  /**
   * 
   * @param {World} currentWorld 
   * @param {number} front 
   * @param {number} maybeBehind 
   */
  var getIsBehind = (currentWorld,front,maybeBehind) => currentWorld && app.getIsValidSpotNumber(currentWorld, front) && app.getIsValidSpotNumber(currentWorld, maybeBehind) && currentWorld.columnNum(front) == currentWorld.columnNum(maybeBehind) + 1;
  app.getIsBehind = getIsBehind;
  //returns the itemId, not the rarity or legendary level
  /**
   * 
   * @param {string} cruId 
   * @param {number} gearSlot 
   * @param {boolean} debug 
   */
  var getItemId = (cruId, gearSlot,debug = false) =>{
    if(gearSlot != 0 && gearSlot != 1 && gearSlot != 2)
      throw "invalid gearSlot passed";
    var result =
      app.crusaderGear &&
      app.crusaderGear[cruId] &&
      (app.crusaderGear[cruId]["s" + gearSlot.toString()] || app.crusaderGear[cruId]["slot" + gearSlot]);
    if(debug)
      console.log('getItemId', cruId, gearSlot, app.crusaderGear && app.crusaderGear[cruId]);
    return result;
  }
  /**
   * 
   * @param {Crusader} crusader 
   */
  var crusaderSetup = crusader => {
      crusader.globalDPS = 1;
      crusader.globalGold = 1;
      crusader.critChance = 0;
      // for momma only
      if(crusader.hasOwnProperty("turkeyApplied"))
        crusader.turkeyApplied = undefined;
      // for any dps that is zapped
      if(crusader.hasOwnProperty("zapped"))
        crusader.zapped = undefined;
      if(!(crusader.gear != null))
        return;
      if(crusader.id == 15)
        console.log('crusaderSetup', crusader.gear);

      crusader.gear.map((gearType,i) =>{
        if(crusader.id == 15)
          console.log('crusaderSetup loop', crusader.gear, i, Array.isArray(crusader.gear));
        switch (crusader.gear[i]) {
          case "clickCrit":
            crusader.critChance += itemCrit(crusader, i);
            break;
          case "alldps":
            var itemId = getItemId(crusader.id,i);
            var rarity = itemId && Loot.getRarityByItemId(itemId,crusader.loot);
            var dps = rarity && itemDPS(rarity) || 1;
            if(dps != 1)
              crusader["s" + i] = dps;
            crusader.globalDPS *= dps;
            break;
          case "gold":
            var slotGold = itemGold(crusader, i) || 1;
            if(slotGold != 1)
              crusader["s" + i] = slotGold;
            crusader.globalGold *= slotGold;
            console.log("gold", crusader.globalGold,globalGold);
            break;
          case "selfdps":
            // can be v1, or V2, compound or not
              var itemId = getItemId(crusader.id, i);
              var selfDpsRarity = itemId && Loot.getRarityByItemId(itemId,crusader.loot);
              var selfIsGolden = itemId && Loot.getIsGolden(itemId,crusader.loot);
              var selfDps = selfDpsRarity && itemSelfDPS(selfDpsRarity,selfIsGolden, crusader.id == 15);
              if(crusader.id == 15)
                console.log('selfdps', itemId, selfDps);
              if((selfDps || 1) != 1)
                crusader["s" + i] = selfDps;
            if (crusader == app.dpsChar) {
              crusader.globalDPS *= selfDps || 1;
            }
            break;
        }
      });
  };

app.crusaderSetup = crusaderSetup;

//for adds to all crusader dps items
/**
 * 
 * @param {number} rarity 
 */
  function itemDPS(rarity) {
    switch (rarity) {
      case 1:
        return 1.05;
      case 2:
        return 1.10;
      case 3:
        return 1.15;
      case 4:
        return 1.4;
      case "Golden Epic":
        return 1.6;
      case 5:
        return 1.8;
      case "Golden Legendary":
        return 2.2;
      default:
        return 1;
    }
  }

  /**
   * 
   * @param {number} rarity 
   * @param {boolean} isGolden 
   * @param {boolean} debug 
   */
  function itemSelfDPS(rarity, isGolden, debug = false) {
    if(!(rarity != null))
      return 1;
    switch (rarity) {
      case 1:
        return 1.25;
      case 2:
        return 1.5;
      case 3:
        return 2;
      case 4:
        if(isGolden === true)
          return 7;
        return 5;
      case 5:
        if(isGolden === true)
          return 13;
        return 9;
      default:
        return 1;
    }
  }

 /**
 * 
 * @param {Crusader} crusader 
 * @param {number} gearSlot 
 */
  function itemGold(crusader, gearSlot) {
    var itemId = getItemId(crusader.id, gearSlot);
    var item = itemId && Loot.getLootFromId(itemId, crusader.loot);
    if(!(item != null))
      return 1;
    switch (item.rarity) {
      case 1:
        return 1.1;
      case 2:
        return 1.25;
      case 3:
        return 1.5;
      case 4:
        if(item.golden === true)
          return 2.5;
        return 2;
      case 5:
        if(item.golden === true)
          return 4;
        return 3;
      default:
        return 1;
    }
  }

 /**
 * 
 * @param {Crusader} crusader 
 * @param {number} gearSlot 
 */
  function itemCrit(crusader, gearSlot) {
    var lootId = getItemId(crusader.id, gearSlot);
    var item = lootId && Loot.getLootFromId(lootId,crusader.loot);
    if(!(item != null))
      return 1;
    switch (item.rarity) {
      case 1:
        return 1;
      case 2:
        return 2;
      case 3:
        return 3;
      case 4:
        if(item.golden === true)
          return 6;
        return 4;
      case 5:
        if(item.golden === true)
          return 12;
        return 8;
      default:
        return 0;
    }
  }

 /**
 * 
 * @param {Crusader} crusader 
 * @param {number} gearSlot 
 */
  function itemAbility(crusader, gearSlot) {
    var lootId = getItemId(crusader.id, gearSlot);
    var item = lootId && Loot.getLootFromId(lootId,crusader.loot);
    if(!(item != null))
      return 1;
    switch (item.rarity) {
      case 1:
        return 1.1;
      case 2:
        return 1.25;
      case 3:
        return 1.5;
      case 4:
        if(item.golden === true)
          return 2.5;
        return 2;
      case 5:
        if(item.golden === true)
          return 4;
        return 3;
      default:
        return 1;
    }
  }

 /**
 * 
 * @param {Crusader} crusader 
 * @param {number} gearSlot 
 */
  function itemGreyShots(crusader, gearSlot) {
    var lootId = getItemId(crusader.id, gearSlot);
    var item = lootId && Loot.getLootFromId(lootId,crusader.loot);
    if(!(item != null))
      return 1;
    switch (item.rarity) {
      case 1:
        return 2;
      case 2:
        return 3;
      case 3:
        return 4;
      case 4:
        return 5;
      case 5:
        return 9;
      default:
        return 1;
    }
  }

 /**
 * 
 * @param {Crusader} crusader 
 * @param {number} gearSlot 
 */
  function legendaryFactor(crusader,gearSlot) {
    if(app.ignoreLegendaryFactor === true)
      return 0;
    var itemId = getItemId(crusader.id, gearSlot);
    var level = Loot.getLLevel(itemId);
    // console.log('legendaryFactor:' + crusader.displayName + " level " + ( level || "unknown") ,gearSlot, itemId);
    if(!(level != null))
      return 0;
    if (level >= 1) {
      var lFactor = Math.pow(2,level-1);
      crusader["l" + gearSlot] = lFactor
     return lFactor;
   } else {
     return 0;
   }
 }

///////// Formation Calculations
//////Slot 1
////bushwhacker
var bushwhacker = getCrusader("01");
bushwhacker.calculate = function() {
  bushwhacker.critChance += 1 * legendaryFactor(bushwhacker,1);
  if (app.dpsChar && app.dpsChar.tags.includes('robot')) {
    bushwhacker.globalDPS *= 1 + 1 * legendaryFactor(bushwhacker,2);
  }
};

////RoboRabbit
var rabbit = getCrusader("01a");
rabbit.calculate = function() {
  if (rabbit.clicking) {
    rabbit.globalDPS *= 1 + 0.25*itemAbility(rabbit,2);
  }
  rabbit.globalDPS *= 1 + 0.25 * currentWorld.countTags('robot') * legendaryFactor(rabbit,0);
};

////Graham
var graham = getCrusader("01b");
graham.calculate = function() {
  graham.globalDPS *= 1.01;
  if (graham.stopped) {
    graham.globalDPS *= 1 + (0.5 * itemAbility(graham,2))*(1 + legendaryFactor(graham,1));
  }
  graham.globalDPS *= 1 + 1 * legendaryFactor(graham,0);
  if (app.dpsChar && app.dpsChar.tags.includes('human')) {
    graham.globalDPS *= 1 + 1 * legendaryFactor(graham,2);
  }
};

////Warwick the Warlock
var warwick = getCrusader('01c');
warwick.calculate = function() {
  var clicking = false;
  if (clicking) {
    warwick.globalDPS *= 1 + 2 * (1+1*legendaryFactor(warwick,0));
  }
  if (app.dpsChar && app.dpsChar.tags.includes('magical')) {
    warwick.globalDPS *= 1 + 1 * legendaryFactor(warwick,1);
  }
  if (app.dpsChar && app.dpsChar.tags.includes('leprechaun')) {
    warwick.globalDPS *= 1 + 1 * legendaryFactor(warwick,2);
  }
};

//////Slot 2
////Jim
var jim = getCrusader("02");
jim.calculate = function() {
//Self Buff
  var spot = app.getCrusaderSpot(app.formationIds, jim.id);
  if (jim == app.dpsChar) {
    if(getIsValidSpotNumber(currentWorld, spot)){
      var adjacent = currentWorld.whatsAdjacent(spot);
      for (var i=0; i<adjacent.length; i++) {
        var adjCruId = app.formationIds[adjacent[i]];
        if (adjCruId != null)
          jim.globalDPS *= 1 + (1 + legendaryFactor(jim,1));
          break;
      }
    }
  }
//Column Buff
  var dpsSpot = app.dpsChar && app.getCrusaderSpot(app.formationIds, app.dpsChar.id);
  var isInColumnWithDps = app.getAreInSameColumn(currentWorld, spot,dpsSpot);
  if (isInColumnWithDps) {
    jim.globalDPS *= 1 + 0.5 * (1 + legendaryFactor(jim,0));
  } else if (karen == app.dpsChar) {
    jim.globalDPS *= 1 + 0.5 * (1 + legendaryFactor(jim,0)) * 0.5 * (itemAbility(karen,0));
    karen.effects += 1;
  }
  var sashaSpot = app.getCrusaderSpot(app.formationIds, sasha.id);
  if (getIsValidSpotNumber(currentWorld, sashaSpot)) {
    jim.globalDPS *= 1 + legendaryFactor(jim,2);
  }
};

////Pam
var pam = getCrusader("02a");
pam.calculate = function() {
  var numInColumn = 0;
  var dpsInColumn = false;
  var numAdjacent =0;
  var spot = app.getCrusaderSpot(app.formationIds, pam.id);
//Focused Teamwork
  app.jsonData.crusaders
    .filter(cru => app.formationIds.includes(cru.id))
    .map(cru =>{
      var cruSpot = app.getCrusaderSpot(app.formationIds, cru.id);
      if (app.getAreInSameColumn(currentWorld, spot,cruSpot)){
        numInColumn += 1;
        if (cru == app.dpsChar) {
          dpsInColumn = true;
        }
      }
    });
  if (numInColumn == 2 && dpsInColumn) {
    pam.globalDPS *= 1 + 1 * itemAbility(pam,1) * (1 + legendaryFactor(pam,0));
  }
  if (numInColumn == 2 && !dpsInColumn && karen == app.dpsChar) {
    pam.globalDPS *= 1 + 1 * itemAbility(pam,1) * (1 + legendaryFactor(pam,0)) * 0.5 * itemAbility(karen,0);
    karen.effects += 1;
  }
//Co-Pilot
  if (pam == app.dpsChar) {
    var adjacent = getIsValidSpotNumber(currentWorld, spot) && currentWorld.whatsAdjacent(spot);
    for (var i = 0; i<adjacent.length; i++ ) {
      var adjCruId = app.formationIds[adjacent[i]];
      if (adjCruId != null)
        numAdjacent += 1;
    }
    if (numAdjacent >= 1) {
      pam.globalDPS *= 2;
    }
  }
  pam.globalDPS *= 1 + 0.25 * currentWorld.countTags('dps') * legendaryFactor(pam,1);
  if (numAdjacent <= 3) {
    pam.globalDPS *= 1 + 1 * legendaryFactor(pam,2);
  }
};

////Veronica
var veronica = getCrusader("02b");
veronica.calculate = function() {
  var dpsAffected = false;
  var spot = app.getCrusaderSpot(app.formationIds, veronica.id);
//Precise Aim
  var adjacent = currentWorld.whatsAdjacent(spot);
  for (var j = 0; j<adjacent.length; j++ ) {
    var adjCru = app.jsonData.crusaders.find(cru => cru.id == app.formationIds[adjacent[j]]);
    if (adjCru && app.dpsChar && adjCru.id == app.dpsChar.id) {
      dpsAffected = true;
    }
  }
  var dpsSpot = getDpsSpot();
  if (getAreInSameColumn(currentWorld, dpsSpot, spot)){
    dpsAffected = true;
  }
  if (dpsAffected) {
    veronica.globalDPS *= 1 + 0.25 * (1+currentWorld.countTags("robot"))*itemAbility(veronica,0)*(1 + legendaryFactor(veronica,0));
  }
  if (!dpsAffected && karen == app.dpsChar) {
    veronica.globalDPS *= 1 + 0.25 * (1+currentWorld.countTags("robot"))*itemAbility(veronica,0)*(1 + legendaryFactor(veronica,0)) * 0.5 * itemAbility(karen,0);
    karen.effects *= 1;
  }
  if (countShots) {
    veronica.globalDPS *= 1 + 2 * itemAbility(veronica,2)/5;
  }
  veronica.globalDPS *= 1 + 0.25 * currentWorld.countTags('robot') * legendaryFactor(veronica,1);
  veronica.globalDPS *= 1 + 0.5 * currentWorld.countTags('elf') * legendaryFactor(veronica,2);
};

////Arachnobuddy
var arachno = getCrusader('02c');
arachno.calculate = function() {
  if (countShots) {
    arachno.globalDPS *= 1 + (2/3) * (1 + 0.05 * itemAbility(arachno,1)) * itemGreyShots(arachno,0) * (1 + legendaryFactor(arachno,0));
  }
  var soldieretteSpot = app.getCrusaderSpot(app.formationIds, soldierette.id);
  if (soldieretteSpot != null) {
    arachno.globalDPS *= 1 + 1 * (1+legendaryFactor(arachno,1));
  }
  arachno.globalDPS *= 1 + 0.25 * (1+legendaryFactor(arachno,2));
};

//////Slot 3
////Emo Werewolf
var emo = getCrusader("03");
emo.test = "test";
emo.calculate = function() {
//Conditional Self Buff
  if (emo == app.dpsChar) {
    var noHumansAdjacent = true;
    var spot = app.getCrusaderSpot(app.formationIds, emo.id);
    var adjacent = currentWorld.whatsAdjacent(spot);
    var numAdjacent = 0;
    for (var i = 0; i<adjacent.length; i++) {
      var adjCruId = app.formationIds[adjacent[i]];
      var adjCru = adjCruId && app.jsonData.crusaders.find(cru => cru.id == adjCruId);
      if (adjCruId != null) {
        numAdjacent += 1;
      }
      if (adjCru && adjCru.tags.includes("human")) {
        noHumansAdjacent = false;
      }
    }
    if (noHumansAdjacent) {
      emo.globalDPS *= 1 + 2*(1+legendaryFactor(emo,0));
    }
    emo.globalDPS *= 1 + 0.25 * numAdjacent * legendaryFactor(emo,1);
  }
  if (app.dpsChar && app.dpsChar.tags.includes('animal')) {
    emo.globalDPS *= 1 + 1 * legendaryFactor(emo,2);
  }
};

////Sally the Succubus
var sally = getCrusader("03a");
sally.calculate = function() {
  var spot = app.getCrusaderSpot(app.formationIds, sally.id);
  if (app.dpsChar && app.dpsChar.tags.includes("female")) {
    sally.globalDPS *= 1.2;
  }
  if (sally == app.dpsChar) {
    var femalesAdjacent = 0;
    var numAdjacent = 0;
    var adjacent = currentWorld.whatsAdjacent(spot);
    for (var i = 0 ; i < adjacent.length; i++ ) {
      var adjCruId = app.formationIds[adjacent[i]];
      var adjCru = adjCruId && app.jsonData.crusaders.find(cru => cru.id == adjCruId);
      if (adjCruId != null) {
        numAdjacent +=1;
      }
      if (adjCru && adjCru.tags.includes("female")) {
        femalesAdjacent += 1;
      }
    }
    sally.globalDPS *= 4 - 0.25 * femalesAdjacent;
    sally.globalDPS *= 1 + 0.2 * currentWorld.countTags('male') * legendaryFactor(sally,0);
    if (numAdjacent >= 4) {
      sally.globalDPS *= 1 + 1 * legendaryFactor(sally,1);
    }
    sally.globalDPS *= 1 + 0.2 * (currentWorld.filled - currentWorld.countTags('supernatural')) * legendaryFactor(sally,2);
  }
};

////Karen, the Cat Teenager
var karen = getCrusader("03b");
karen.effects = 0;
karen.deaths = 0;
karen.calculate = function() {
  karen.globalDPS *= 1 + 0.25 * currentWorld.countTags('animal') * legendaryFactor(karen,1);
  karen.globalDPS *= 1 + karen.deaths * legendaryFactor(karen,2);
};
karen.finalCalculate = function() {
  karen.globalDPS *= 1 + 0.25 * karen.effects * legendaryFactor(karen,0);
};

//////Slot 4
////Sasha the Fierce Warrior
var sasha = getCrusader("04");
sasha.calculate = function() {
  var spot = app.getCrusaderSpot(app.formationIds, sasha.id);
  var numBehind = 0;
  var dpsCharSpot = getDpsSpot();
  if (app.getIsBehind(currentWorld, spot, dpsCharSpot)){
    sasha.globalDPS *=1 + 0.3*itemAbility(sasha,1)*(1+legendaryFactor(sasha,2));
  } else if (karen == app.dpsChar) {
    sasha.globalDPS *=1 + 0.3*itemAbility(sasha,1)*(1+legendaryFactor(sasha,2)) * 0.5 * itemAbility(karen,0);
    karen.effects += 1;
  }
  sasha.globalDPS *= 1 + 0.5 * currentWorld.countTags('tank') * legendaryFactor(sasha,0);
  app.formationIds.map((cruId,i)=> {
    var cruSpot = getCrusaderSpot(cruId);
    if (getIsBehind(currentWorld, spot, cruSpot)){
      numBehind += 1;
    }
  });
  sasha.globalDPS *= 1 + 0.33 * numBehind * legendaryFactor(sasha,1);
};

////Groklok the Orc
var groklok = getCrusader("04a");
groklok.calculate = function() {
  var spot = getCrusaderSpot(app.formationIds, groklok.id);
  var drizzleMult = 1;
  var numAffected = currentWorld.columnTest(currentWorld.columnNum(spot)+1);
  var karenSpot = getCrusaderSpot(app.formationIds, karen.id);
  if (karenSpot != null && currentWorld.columnNum(karenSpot) != currentWorld.columnNum(spot)+1) {
    numAffected +=1;
  }
  var drizzleSpot = getCrusaderSpot(app.formationIds, drizzle.id);
  if (drizzleSpot != null && currentWorld.columnNum(drizzleSpot) > currentWorld.columnNum(spot)) {
    drizzleMult = 2;
  }
//Eligible Receivers
  if (getIsBehind(currentWorld,getDpsSpot(), spot)) {
    groklok.globalDPS *= 1.5 * drizzleMult * itemAbility(groklok,0) * (1 + legendaryFactor(groklok,2)) / numAffected;
  } else if (karen == app.dpsChar) {
    groklok.globalDPS *= 1.5 * drizzleMult * itemAbility(groklok,0) * 0.5 * itemAbility(karen,0) * (1 + legendaryFactor(groklok,2)) / numAffected;
    karen.effects += 1;
  }
//Gunslinger
  if (groklok == app.dpsChar && currentWorld.filled < currentWorld.spots) {
    groklok.globalDPS *= 1 + 1.5 * (1+legendaryFactor());
  }
//Defensive Team
  if (currentWorld.columnNum(spot) == currentWorld.maxColumn) {
    groklok.globalDPS *= 1 + 0.1 * numAttacking * (1+legendaryFactor(groklok,0));
  }
};

////Mindy the Mime
var mindy = getCrusader("04b");
mindy.calculate = function() {
  console.log('mindy is calculating');
  mindy.globalDPS = "Mindy isn't setup for calculations yet";
};

//////Slot 5
////The Washed Up Hermit
var hermit = getCrusader("05");
hermit.calculate = function() {
//Craziness
  if (hermit == app.dpsChar) {
    var noOneAhead = true;
    var spot = getCrusaderSpot(app.formationIds, hermit.id);
    var adjacent = currentWorld.whatsAdjacent(spot);
    for (var i = 0; i < adjacent.length && noOneAhead; i++) {
      var adjCruId = app.formationIds[adjacent[i]];
      if(getIsBehind(currentWorld, getCrusaderSpot(app.formationIds, adjCruId), spot)){
        noOneAhead = false;
      }
    }
    if (hermit.noOneAhead) {
      hermit.globalDPS *= 3;
    }
    hermit.globalDPS *= 1 + (currentWorld.spots - currentWorld.filled) * legendaryFactor(hermit,0);
    hermit.globalDPS *= 1 + 0.25 * currentWorld.countTags('supernatural') * legendaryFactor(hermit,2);
  }
  if (app.dpsChar && app.dpsChar.tags.includes('human')) {
    hermit.globalDPS *= 1 + legendaryFactor(hermit,1);
  }
};

////Kyle
var kyle = getCrusader("05a");
kyle.calculate = function() {
  var spot = getCrusaderSpot(app.formationIds, kyle.id);
  var adjacent = currentWorld.whatsAdjacent(spot);
  var femaleAdjacent = false;
  var leprechaunAdjacent = false;
  var animalAdjacent = false;
  var dpsSmashed = false;
  var numAdjacent = 0;
  var numAhead = 0;
  var numBehind = 0;
  for (var i = 0; i < adjacent.length; i++) {
    var adjCruId = app.formationIds[adjacent[i]];
    if (adjCruId) {
      numAdjacent += 1;
      var adjCru = app.jsonData.crusaders.find(cru => cru.id == adjCruId);
      if(!(adjCru != null))
        continue;
      var adjCruSpot = getCrusaderSpot(app.formationIds, adjCru.id);
      if (adjCru.tags.includes("female")) {femaleAdjacent = true;}
      if (adjCru.tags.includes("leprechaun")) {leprechaunAdjacent = true;}
      if (adjCru.tags.includes("animal")) {animalAdjacent = true;}
      if (app.dpsChar && adjCruId == app.dpsChar.id) {dpsSmashed = true;}
      if (currentWorld.columnNum(spot) > currentWorld.columnNum(adjCruSpot)) {numBehind += 1;}
      if (currentWorld.columnNum(spot) < currentWorld.columnNum(adjCruSpot)) {numAhead += 1;}
    }
  }
//Get Smashed
  if (dpsSmashed && numAdjacent <= 3) {
    kyle.globalDPS *= 1 + 0.25;
  }
  if (kyle == app.dpsChar) {
    if (femaleAdjacent) {kyle.globalDPS *= 2;}
    if (leprechaunAdjacent) {kyle.globalDPS *= 2;}
    if (animalAdjacent) {kyle.globalDPS *= 2;}
    kyle.globalDPS *= 1 + 0.5 * Math.max(numAdjacent,3) * itemAbility(kyle,1) * (1 + legendaryFactor(kyle,2));
    if (numAdjacent >= 4) {
      kyle.globalDPS *= 1 + legendaryFactor(kyle,0);
    }
    if (numBehind > numAhead) {
      kyle.globalDPS *= 1 + legendaryFactor(kyle,1);
    }
  }
  var karenSpot = getCrusaderSpot(app.formationIds, karen.id);
  if (karen == app.dpsChar && !adjacent.includes(karenSpot) && numAdjacent <= 2) {
    kyle.globalDPS *= 1 + 0.25 * 0.5 * itemAbility(karen,0);
    karen.effects += 1;
  }
  if (app.dpsChar && dpsSmashed) {
    app.dpsChar.smashed = true;
  } else if(app.dpsChar) {
    app.dpsChar.smashed = false;
  }
};

////Serpent King Draco
/**
 * @type {Crusader}
 */
var draco = getCrusader("05b");
draco.calculate = function() {
  if (draco == app.dpsChar) {
    var royals = currentWorld.countTags("royal");
    var animals = currentWorld.countTags("animal");
    var robots = currentWorld.countTags("robot");
    var nonRoyalHumans = 0;
    for (var i in app.formationIds) {
      var cru = app.jsonData.crusaders.find(refCru => refCru.id == i);
      if (cru.tags.includes("human") && !cru.tags.includes("royal")) { nonRoyalHumans += 1; }
    }
    draco.globalDPS *= 1 + royals - 0.5 * nonRoyalHumans;
    draco.globalDPS *= 1 + animals - 0.5 * robots;
  }
  if (app.dpsChar && app.dpsChar.tags.includes('royal')) {
    draco.globalDPS *= 1 + legendaryFactor(draco,0);
  }
  if (app.dpsChar && app.dpsChar.tags.includes('animal')) {
    draco.globalDPS *= 1 + legendaryFactor(draco,1);
  }
  draco.globalDPS *= 1 + 0.2 * currentWorld.countTags('human') * legendaryFactor(draco,2);
};


////Henry, the Scaredy-Ghoul
var henry = getCrusader("05c");
/**
 * @type {Crusader}
 */
henry.calculate = function() {
  var spot = getCrusaderSpot(app.formationIds, henry.id);
  if (henry == app.dpsChar) {
    var noOneBehind = true;
    henry.globalDPS *= currentWorld.filled - currentWorld.countTags('human');
    var adjacent = currentWorld.whatsAdjacent(spot);
    for (var i = 0; i < adjacent.length && noOneBehind; i++) {
      var adjCruSpot = getCrusaderSpot(app.formationIds, adjacent[i].id);
      if (currentWorld.columnNum(spot) == currentWorld.columnNum(adjCruSpot) + 1) {noOneBehind = false;}
    }
    henry.globalDPS *= 1 + (currentWorld.spots - currentWorld.filled) * legendaryFactor(henry,2);
  }
  var alanSpot = getCrusaderSpot(app.formationIds, alan.id);
  if (alanSpot != null) {
    henry.globalDPS *= 1 + legendaryFactor(henry,0);
  }
  henry.globalDPS *= 1 + 0.2 * (currentWorld.filled - currentWorld.countTags('human')) * legendaryFactor(henry,1);
};

//////Slot 6
////Detective Kaine
/**
 * @type {Crusader}
 */
var kaine = getCrusader("06");
kaine.calculate = function() {
//A-Ha
  var spot = getCrusaderSpot(app.formationIds, kaine.id);
  // don't use >= because javascript
  if((spot === 0 || spot > 0) && app.formationIds[spot]!= kaine.id)
    throw error("indexOf for kaine failed");
  var numInColumn = currentWorld.columnTest(currentWorld.columnNum(spot));
  kaine.globalGold *= Math.pow(1 + 0.2 * itemAbility(kaine,0),numInColumn) || 1;
//Karen compatability for A-Ha
  var karenSpot = getCrusaderSpot(app.formationIds, karen.id);
  if (karenSpot != null && (currentWorld.columnNum(spot)!=currentWorld.columnNum(karenSpot))) {
    kaine.globalGold *= (1 + 0.2*itemAbility(kaine,0)*0.5*itemAbility(karen,0)) || 1;
    karen.effects += 1;
  }
  var nateSpot = getCrusaderSpot(app.formationIds, nate.id);
  if (nateSpot != null) {
    kaine.globalDPS *= 1 + legendaryFactor(kaine,0) || 1;
  }
  kaine.globalGold *= 1 + 0.25 * kaine.XP * legendaryFactor(kaine,1) || 1;
  kaine.globalGold *= 1 + 0.25 * currentWorld.countTags('gold') * legendaryFactor(kaine,2) || 1;
};

////Mister the Monkey
/**
 * @type {Crusader}
 */
var mister = getCrusader("06a");
mister.calculate = function() {
  var spot = getCrusaderSpot(app.formationIds, mister.id);
  var numAnimals = currentWorld.countTags('animal');
  var numBehind = currentWorld.columnTest(currentWorld.columnNum(spot)-1);
  mister.globalGold *= Math.pow(1 + (0.15 + 0.05 * numAnimals) * itemAbility(mister,1) * (1 + legendaryFactor(mister,2)), numBehind);
  mister.globalDPS *= 1 + 0.25 * numBehind * legendaryFactor(mister,1);
  var karenSpot = getCrusaderSpot(app.formationIds, karen.id);
  if (karenSpot != null && currentWorld.columnNum(karenSpot) != currentWorld.columnNum(spot) - 1) {
    karen.effects += 1;
    mister.globalGold *= 1 + (0.15 + 0.05 * numAnimals) * itemAbility(mister,1) * (1 + legendaryFactor(mister,2)) * 0.5 * itemAbility(karen,0);
  }
  if (app.dpsChar && app.dpsChar.tags.includes('animal')) {
    mister.globalDPS *= 1 + legendaryFactor(mister,0);
  }
};

////Larry the Leprechaun
/**
 * @type {Crusader}
 */
var larry = getCrusader("06b");
larry.calculate = function() {
  var numAdjacent = 0;
  var spot = getCrusaderSpot(app.formationIds, larry.id);
  var adjacent = currentWorld.whatsAdjacent(spot);
  for (var i = 0; i < adjacent.length; i++) {
    var adjCruId = app.formationIds[i];
    if (adjCruId != null) {numAdjacent += 1;}
  }
  larry.globalGold *= Math.pow( 1+ 0.1*1.25*itemAbility(larry,0)*(1 + legendaryFactor(larry,2)),numAdjacent);
  if (numAdjacent <= 3) {larry.globalDPS *= 2;}
  if (numAdjacent >= 6) {larry.globalGold *= 1.25;}
  larry.globalDPS *= 1 + 0.25 * currentWorld.countTags('magic') * legendaryFactor(larry,0);
  larry.globalDPS *= 1 + 0.5 * currentWorld.countTags('leprechaun') * legendaryFactor(larry,1);
  var karenSpot = getCrusaderSpot(app.formationIds, karen.id);
  if (karenSpot != null && !adjacent.includes(karenSpot)) {
    larry.globalGold *= 1+ 0.1*1.25*itemAbility(larry,0)*(1 + legendaryFactor(larry,2)) * 0.5 * itemAbility(karen,0);
  }
};

////Bernard the Bartender
/**
 * @type {Crusader}
 */
var bernard = getCrusader("06c");
bernard.calculate = function() {
  var spot = getCrusaderSpot(app.formationIds, bernard.id);
  var numAdjacent = 0;
  var numFemales = currentWorld.countTags('female');
  var adjacent = currentWorld.whatsAdjacent(spot);
  var tipsPercent = 0.2*itemAbility(bernard,0);
  var tipsGoldPercent = 0.2 * itemAbility(bernard,2) * (1 + numFemales) * (1 + legendaryFactor(bernard,2));
  for (var i = 0; i < adjacent.length; i++) {
    var adjCruId = app.formationIds[i];
    if (adjCruId) {numAdjacent += 1;}
  }
  if (numAdjacent <= 3) {
    tipsPercent += numAdjacent * 0.1;
  } else {
    tipsPercent += 0.6 - numAdjacent * 0.1;
  }
  bernard.globalGold *= 1 + tipsPercent * tipsGoldPercent;
  bernard.globalGold *= 1 + legendaryFactor(bernard,0);
  bernard.globalDPS *= 1 + 0.25 * currentWorld.countTags('female') * legendaryFactor(bernard,1);
};

//////Slot 7
////The Princess
/**
 * @type {Crusader}
 */
var princess = getCrusader("07");
princess.calculate = function() {
//Ignite, Char, Conflagrate (Check if these multiply or add)
  princess.globalDPS *= Math.pow((1 + 0.1 * itemAbility(princess,2)),3);
  var reginaldSpot = getCrusaderSpot(app.formationIds, reginald.id);
  if (reginaldSpot != null) {
    princess.globalDPS *= 1 + legendaryFactor(princess,0);
  }
  if (app.dpsChar && !app.dpsChar.tags.includes('event')) {
    princess.globalDPS *= 1 + legendaryFactor(princess,1);
  }
  princess.globalDPS *= 1 + 0.25 * currentWorld.countTags('royal') * legendaryFactor(princess,2);
};

////RoboTurkey
var turkey = getCrusader("07a");
turkey.calculate = function() {
  var spot = getCrusaderSpot(app.formationIds, turkey.id);
  var adjacent = currentWorld.whatsAdjacent(spot);
  var numAdjacent = 0;
  var dpsZapped = false;
  var dpsSpot = getDpsSpot();
  adjacent.filter(f => f != null).map(adjSpot =>
  {
    numAdjacent += 1;
    if (dpsSpot == adjSpot) {dpsZapped = true;}
  });
  var karenSpot = getCrusaderSpot(app.formationIds, karen.id);
  if (karenSpot != null && adjacent.includes(karenSpot)) {
    numAdjacent += 1;
  }
  if (numAdjacent <= 3 && dpsZapped) {
    turkey.globalDPS *= 1 + 0.2*itemAbility(turkey,1);
    turkey.globalDPS *= 1 + 0.5*itemAbility(turkey,1);
    turkey.globalDPS *= 1 + legendaryFactor(turkey,1);

    var mommaSpot = getCrusaderSpot(app.formationIds, momma.id);
    if (mommaSpot != null && momma.turkeyApplied != true) {
      momma.globalDPS *= 1.5;
      momma.turkeyApplied = true;
    }
  } else if (numAdjacent <= 3 && app.dpsChar == karen) {
    turkey.globalDPS *= 1 + 0.2*itemAbility(turkey,1)*0.5*itemAbility(karen,0);
    turkey.globalDPS *= 1 + 0.5*itemAbility(turkey,1);
    turkey.globalDPS *= 1 + legendaryFactor(turkey,1);
    if (mommaSpot != null && momma.turkeyApplied != true) {
      momma.globalDPS *= 1.5;
      momma.turkeyApplied = true;
    }
    karen.effects += 1;
  } else if (karen == app.dpsChar) {
    if (mommaSpot != null && momma.turkeyApplied != true) {
      momma.globalDPS *= 1 + 0.5 * 0.5 * itemAbility(karen,0);
      momma.turkeyApplied = true;
      karen.effects += 1;
    }
    karen.effects += 1;
    turkey.globalDPS *= 1 + legendaryFactor(turkey,1) * 0.5 * itemAbility(karen,0);
  }
  globalDPS *= 1 + 0.25 * currentWorld.countTags('robot') * legendaryFactor(turkey,0);
  if (mommaSpot != null) {
    globalDPS *= 1 + legendaryFactor(turkey,2);
  }
  if(app.dpsChar){
    app.dpsChar.zapped = dpsZapped;
  }
};

////Ranger Rayna
var rayna = getCrusader("07b");
rayna.calculate = function() {
  var numAnimals = currentWorld.countTags('animal');
  if (rayna == app.dpsChar) {
    rayna.globalDPS *= 1 + 0.2 * numAnimals * itemAbility(rayna,2) * (1 + legendaryFactor(rayna,0));
    if (numAnimals >= 4) {rayna.globalDPS *= 2;}
    var littleFootSpot = getCrusaderSpot(app.formationIds, karen.id);
    if (littleFootSpot != null) {
      rayna.globalDPS *= 1 + legendaryFactor(rayna,1);
    }
  }
  rayna.globalDPS *= 1 + 0.25 * currentWorld.countTags('animal') * legendaryFactor(rayna,2);
};

////Baenarall, Angel of Hope
var bae = getCrusader('07c');
bae.calculate = function() {
  crusaderSetup(bae);
  var diversityTags = {};
  var diversityBonus = 0;
  formationIds.filter(cruId => cruId != null).map(cruId =>{
    var cru = getCrusader(cruId);
    cru.tags.map(tag =>{
      // not really sure the ramification of using a string as a key into an array
      if(!diversityTags.hasOwnProperty(tag)){
        diversityTags[tag] = 0;
      }
      diversityTags[tag] += 1;
    });

  });
  window.diversityTags = diversityTags;
  Object.keys(diversityTags).map(tag =>{
    console.log('diversityTags tag?',tag);
    if (diversityTags[tag] == 1) {
      diversityBonus += 20 * itemAbility(bae,1);
    } else {
      diversityBonus += -5;
    }
  });
  console.log('diversityTags',diversityTags,diversityBonus);
  bae.globalDPS *= 1 + diversityBonus/100;
  bae.globalDPS *= 1 + (currentWorld.filled - currentWorld.countTags('event')) * 0.05 * (1 + legendaryFactor(bae,2));
  if (currentWorld.countTags('supernatural' < 3)) {
    bae.globalDPS *= 1 + legendaryFactor(bae,0);
  }
  if (alan.inFormation) {
    bae.globalDPS *= 1 + legendaryFactor(bae,1);
  }
};
  
//////Slot 8
////Natalie Dragon
var natalie = getCrusader("08");
natalie.calculate = function() {
//Double Dragon

  var nateSpot = getCrusaderSpot(app.formationIds, nate.id);
  if (nateSpot != null && natalie == app.dpsChar){
    natalie.globalDPS *= 1+2*itemAbility(nate,2);
  }
  if (app.dpsChar && app.dpsChar.tags.includes('female')) {
    natalie.globalDPS *= 1 + legendaryFactor(natalie,0);
  }
  natalie.globalGold *= 1 + 0.25 * currentWorld.countTags('human') * legendaryFactor(natalie,1);
  if (nateSpot != null) {
    natalie.globalDPS *= 1 + legendaryFactor(natalie,2);
  }
};

////Jack O'Lantern
var jack = getCrusader("08a");
jack.calculate = function() {
  var spot = getCrusaderSpot(app.formationIds, jack.id);
  if (currentWorld.columnNum(spot) == currentWorld.maxColumn) {
    jack.globalDPS *= 1 + 0.1 * numAttacking * itemAbility(jack,0) * (1 + legendaryFactor(jack,0));
    jack.globalGold *= 1 + 0.1 * numAttacking * legendaryFactor(jack,2);
  }
};

////President Billy Smithsonian
var billy = getCrusader("08b");
billy.calculate = function() {
  if (kiz == app.dpsChar) {billy.globalDPS *= 3;}
  if (app.dpsChar && app.dpsChar.tags.includes("human")) {
    billy.globalDPS *= 1 + 0.5 * (1 + legendaryFactor(billy,0));
  }
  billy.globalDPS *= 1 + 0.1 * currentWorld.countTags('human') * legendaryFactor(billy,1);
  billy.globalGold *= 1 + 0.1 * monstersOnscreen * legendaryFactor(billy,2);
};

////Karl the Kicker
var karl = getCrusader("08c");
karl.calculate = function() {
  karl.globalDPS *= 1.2;
  if (countShots) {karl.globalDPS *= 1 + 2 * itemAbility(karl,2) * (1 + legendaryFactor(karl,2)) / 5;}
  var cindySpot = getCrusaderSpot(app.formationIds, cindy.id);
  if (cindySpot != null) {karl.globalGold *= 1.2;}
  karl.globalDPS *= 1 + 0.5 * currentWorld.countTags('orc') * legendaryFactor(karl,0);
  karl.globalDPS *= 1 + 0.5 * currentWorld.countTags('elf') * legendaryFactor(karl,1);
};

//////Slot 9
////Jason
var jason = getCrusader("09");
jason.calculate = function() {
  var spot = getCrusaderSpot(app.formationIds, jason.id);
  if (currentWorld.columnNum(spot) == currentWorld.maxColumn && jason == app.dpsChar && numAttacking > 0) {
    jason.globalDPS *= 1 + 4 * (1 + legendaryFactor(jason,2));
  }
  var emoSpot = getCrusaderSpot(app.formationIds, emo.id);
  if (emoSpot != null) {
    jason.globalDPS *= 1 + legendaryFactor(jason,0);
  }
  if (numAttacking > 0) {
    jason.globalGold *= 1 + legendaryFactor(jason,1);
  }
};

////Pete the Carney
var pete = getCrusader('09a');
pete.calculate = function() {
  var spot = getCrusaderSpot(app.formationIds, pete.id);
  var numJoked = 0;
  var distances = currentWorld.findDistances(spot);
  var maxDistance = Math.max.apply(null, distances);
  if (app.dpsChar && distances[getDpsSpot()] == maxDistance) {
    pete.globalDPS *= 1 + 0.5 * itemAbility(pete,0) * (1 + legendaryFactor(pete,0));
  }
  var karenSpot = getCrusaderSpot(app.formationIds, karen.id);
  if (karenSpot != null && distances[karenSpot] != maxDistance) {
    numJoked += 1;
    if (karen == app.dpsChar) {
      pete.globalDPS *= 1 + 0.5 * itemAbility(pete,0) * (1 + legendaryFactor(pete,0)) * 0.5 * itemAbility(karen,0);
      karen.effects += 1;
    }
  }
  for (var i in app.formationIds) {
    if (distances[i] == maxDistance) {numJoked += 1}
  }
  pete.globalDPS *= 1 + 0.25 * numJoked * legendaryFactor(pete,1);
  if (karen.inFormation) {
    pete.globalGold *= 1 + 0.1 * (currentWorld.filled - numJoked + 1) * legendaryFactor(pete,2);
  } else {
    pete.globalGold *= 1 + 0.1 * (currentWorld.filled - numJoked) * legendaryFactor(pete,2);
  }
};

////Broot
var broot = getCrusader('09b');
broot.calculate = function() {
  var spot = getCrusaderSpot(app.formationIds, broot.id);
  var maxColumn = currentWorld.maxColumn;
  var adjacent = currentWorld.whatsAdjacent(spot);
  if (currentWorld.columnNum(spot) == maxColumn) {
    if (robbie == app.dpsChar) {broot.globalDPS *= 1 + 0.25 * itemAbility(robbie,2);
    } else {
      broot.globalDPS *= 1.25;
    }
    if (numAttacking > 0) {
      broot.globalDPS *= 1 + legendaryFactor(broot,0);
    }
  }
  if (robbie == app.dpsChar) {
    var robbieSpot = getCrusaderSpot(app.formationIds, robbie.id);
    if (currentWorld.columnNum(spot) > currentWorld.columnNum(robbieSpot)) {
      broot.globalDPS *= 1 + itemAbility(robbie,2);
    }
    if (adjacent.includes(robbieSpot)) {
      broot.globalDPS *= 1 + itemAbility(robbie,2);
    }
  }
  if (robbieSpot != null) {
    broot.globalDPS *= 1 + legendaryFactor(broot,1);
  }
  broot.globalDPS *= 1 + 0.25 * currentWorld.countTags('animal') * legendaryFactor(broot,2);
};

////Paul the Pilgrim
var paul = getCrusader('09c');
paul.calculate = function() {
  var petraBonus = 0;
  var petraSpot = getCrusaderSpot(app.formationIds, petra.id);
  if (petraSpot != null) {
    petraBonus = 1;
    paul.globalDPS *= 1 + legendaryFactor(paul,1);
  }
  paul.globalGold = 1 + 0.33 * itemAbility(paul,0) * (1 + 0.5 * petraBonus);
  paul.globalDPS = 1 + 0.25 * itemAbility(paul,0) * (1 + 0.5 * petraBonus);
  paul.globalDPS *= 1 + 0.5 * currentWorld.countTags('tank') * legendaryFactor(paul,0);
};

//////Slot 10
////Artaxes the Lion
var lion = getCrusader("10");
lion.calculate = function() {
  var numRoared = 0;
  var spot = getCrusaderSpot(app.formationIds, lion.id);
  if (getIsBehind(currentWorld, getDpsSpot(), lion)){
    lion.globalDPS *= 1 + 0.5 * itemAbility(lion,1) * (1 + legendaryFactor(lion,0));
  }
  app.formationIds.map(fCruId =>{
    if (currentWorld.columnNum(i) == currentWorld.columnNum(spot) + 1) {
      numRoared += 1;
    }
  });
  var karenSpot = getCrusaderSpot(app.formationIds, karen.id);
  if (karenSpot != null && currentWorld.columnNum(karenSpot) != currentWorld.columnNum(spot) + 1) {
    numRoared += 1;
    if (karen == app.dpsChar) {
      lion.globalDPS *= 1 + 0.5 * itemAbility(lion,1) * (1 + legendaryFactor(lion,0)) * 0.5 * itemAbility(karen,0);
    }
  }
  lion.globalDPS *= Math.pow(1 + 0.33 * legendaryFactor(lion,1), numRoared);
  if (app.dpsChar && app.dpsChar.tags.includes('animal')) {
    lion.globalDPS *= 1 + legendaryFactor(lion,2);
  }
};

////Drizzle
var drizzle = getCrusader('10a');
drizzle.calculate = function() {
  var spot = getCrusaderSpot(app.formationIds, drizzle.id);
  var adjacent = currentWorld.whatsAdjacent(spot);
  if (adjacent && app.dpsChar && adjacent.includes(getDpsSpot())) {
    drizzle.globalDPS *= 1 + 0.2 * itemAbility(drizzle,1);
  }
  var karenSpot = getCrusaderSpot(app.formationIds, karen.id);
  if (karenSpot != null && karen == app.dpsChar && !adjacent.includes(karenSpot)) {
    drizzle.globalDPS *= 1 + 0.2 * itemAbility(drizzle,1) * 0.5 * itemAbility(karen,0);
    karen.effects += 1;
  }
  var groklokSpot = getCrusaderSpot(app.formationIds, groklok.id);
  if (karenSpot != null && currentWorld.columnNum(spot) < currentWorld.columnNum(groklokSpot) && currentWorld.columnNum(karenSpot) != currentWorld.columnNum(groklokSpot)) {
    karen.effects += 1;
  }
  if (groklok == app.dpsChar && currentWorld.columnNum(spot) == currentWorld.columnNum(groklokSpot)) {
    drizzle.globalDPS *= 5;
  }
  drizzle.globalDPS *= 1 + 0.5 * currentWorld.countTags('orc') * legendaryFactor(drizzle,0);
  drizzle.globalDPS *= 1 + 0.25 * currentWorld.countTags('elf') * legendaryFactor(drizzle,1);
  if (groklokSpot != null) {
    drizzle.globalDPS *= 1 + legendaryFactor(drizzle,2);
  }
};

////Bubba, the Swimming Orc
var bubba = getCrusader('10b');
bubba.calculate = function() {
  var bubbaSpot = getCrusaderSpot(app.formationIds, bubba.id);
  var adjacent = currentWorld.whatsAdjacent(bubbaSpot);
  var numAdjacent = 0;
  for (var i = 0; i < adjacent.length; i++) {
    var adjCruId = app.formationIds[adjacent[i]];
    if (adjCruId) {
      numAdjacent += 1;
    }
  }
  var karenSpot = getCrusaderSpot(app.formationIds, karen.id);
  // is dps in the column behind bubba?
  if (getIsBehind(currentWorld, bubbaSpot, getDpsSpot())){
    bubba.globalDPS *= 1 + 0.25 * numAdjacent * itemAbility(bubba,1) * (1 + legendaryFactor(bubba,0));
  } else if (karenSpot != null && karen == app.dpsChar) {
    bubba.globalDPS *= 1 + 0.25 * numAdjacent * itemAbility(bubba,1) * (1 + legendaryFactor(bubba,0)) * 0.5 * itemAbility(karen,0);
    karen.effects += 1;
  }
  for (i = 0; i < currentWorld.Spots; i++) {
    var cruId = app.formationIds[i];
    if (cruId && currentWorld.columnNum(i) < currentWorld.columnNum(bubbaSpot) - 1 && cruId != karen.id) {
      bubba.globalGold *= 1+ 0.1 * (1 + legendaryFactor(bubba,1));
    }
  }
  if (karenSpot != null) {
    bubba.globalGold *= 1+ 0.1 * (1 + legendaryFactor(bubba,1)) * 0.5 * itemAbility(karen,0);
    karen.effects += 1;
  }
  bubba.globalDPS *= 1 + 0.5 * currentWorld.countTags('orc') * legendaryFactor(bubba,2);
};

////Sisaron the Dragon Sorceress
var sisaron = getCrusader('10c');
sisaron.calculate = function() {
  var sisaronSpot = getCrusaderSpot(app.formationIds, sisaron.id);
  var adjacent = currentWorld.whatsAdjacent(sisaronSpot);
  var numAdjacent = 0;
  var magicModifier = 1;
  for (var i = 0; i < adjacent.length; i++) {
    var adjCruId = app.formationIds[adjacent[i]];
    if (adjCruId) {
      numAdjacent += 1;
    }
  }
  if (numAdjacent == 4) {magicModifier = 4}
  if (adjacent && app.dpsChar && adjacent.includes(getDpsSpot())){
    sisaron.globalDPS *= 1 + magicModifier * itemAbility(sisaron,1) * (1 + legendaryFactor(sisaron,0)) / numAdjacent;
  } else if (karen == app.dpsChar) {
    sisaron.globalDPS *= 1 + magicModifier * itemAbility(sisaron,1) * (1 + legendaryFactor(sisaron,0)) * 0.5 * itemAbility(karen,0) / numAdjacent;
    karen.effects += 1;
  }
  sisaron.globalDPS *= 1 + 0.5 * currentWorld.countTags('dragon') * legendaryFactor(sisaron,1);
  sisaron.globalDPS *= 1 + 0.25 * currentWorld.countTags('magic') * legendaryFactor(sisaron,2);
};

//////Slot 11
////Khouri, the Witch Doctor
var khouri = getCrusader("11");
khouri.calculate = function() {
//Koffee Potion
  var khouriSpot = getCrusaderSpot(app.formationIds, khouri.id);
  var adjacent = currentWorld.whatsAdjacent(khouriSpot);
  if (app.dpsChar && adjacent.includes(getDpsSpot())) {
    khouri.globalDPS *= 1 + 0.3 * itemAbility(khouri,0);
  } else if (karen == app.dpsChar) {
    khouri.globalDPS *= 1 + 0.3 * itemAbility(khouri,0) * 0.5 * itemAbility(karen,0);
    karen.effects += 1;
  }
  if (app.dpsChar && app.dpsChar.tags.includes('magic')) {
    khouri.globalDPS *= 1 + legendaryFactor(khouri,0);
  }
  if (app.dpsChar && app.dpsChar.tags.includes('human')) {
    khouri.globalDPS *= 1 + legendaryFactor(khouri,1);
  }
  if (app.dpsChar && currentWorld.columnNum(khouriSpot) == currentWorld.columnNum(getDpsSpot()) - 1) {
    khouri.globalDPS *= 1 + legendaryFactor(khouri,2);
  }
  var karenSpot = getCrusaderSpot(app.formationIds, karen.id);
  if (karen == app.dpsChar && currentWorld.columnNum(khouriSpot) != currentWorld.columnNum(karenSpot) - 1) {
    karen.effects += 1;
  }
};

////Momma Kaine
var momma = getCrusader('11a');
momma.calculate = function() {
  var mommaSpot = getCrusaderSpot(app.formationIds, momma.id);
  var distances = currentWorld.findDistances(mommaSpot);
  var maxDistance = Math.max.apply(null, distances);
  var turkeySpot = getCrusaderSpot(app.formationIds, turkey.id);
  if (turkeySpot != null) {
    momma.globalDPS *= 1 + legendaryFactor(momma,1);
  }
  if (app.dpsChar && app.dpsChar.tags.includes('robot')) {
    momma.globalDPS *= 1 + legendaryFactor(momma,2);
  }
  if (karenSpot != null && !turkeySpot != null) {
    momma.globalDPS *= 1 + 0.5 * 0.5 * itemAbility(karen,0);
    karen.effects += 1;
  }
  if (karenSpot != null && distances[karenSpot] != maxDistance) {
    karen.effects += 1;
  }
};

////Brogon, Prince of Dragons
var brogon = getCrusader('11a');
brogon.calculate = function() {
  var brogonSpot = getCrusaderSpot(app.formationIds, brogon.id);
  var adjacent = currentWorld.whatsAdjacent(brogonSpot);
  var numAdjacent = 0;
  var numRoyal = currentWorld.countTags('royal');
  
  if (app.dpsChar && getAreInSameColumn(currentWorld, brogonSpot, getDpsSpot())){
    brogon.globalDPS *= 1 + 0.2 * itemAbility(brogon,1) * numRoyal * (1 + legendaryFactor(brogon,0));
  } else if (karen == app.dpsChar) {
    brogon.globalDPS *= 1 + 0.2 * itemAbility(brogon,1) * numRoyal * (1 + legendaryFactor(brogon,0)) * 0.5 * itemAbility(karen,0);
    karen.effects += 1;
  }
  var karenSpot = getCrusaderSpot(app.formationIds, karen.id);
  if (karen == app.dpsChar && !adjacent.includes(karenSpot)) {
    karen.effects += 1;
  }
  brogon.globalDPS *= 1 + 0.5 * currentWorld.countTags('dragon') * legendaryFactor(brogon,1);
  for (var i = 0; i < adjacent.length; i++) {
    var adjCruId = app.formationIds[adjacent[i]];
    if (adjCruId) {
      numAdjacent += 1;
    }
  }
  brogon.globalDPS *= 1 + 0.25 * numAdjacent * legendaryFactor(brogon,2);
};

////The Half-Blood elf
var halfblood = getCrusader('11b');
halfblood.calculate = function() {
  var halfbloodSpot = getCrusaderSpot(app.formationIds, halfblood.id);
  var adjacent = currentWorld.whatsAdjacent(halfbloodSpot);
  if (app.dpsChar && !app.dpsChar.tags.includes('human')) {
    if (adjacent.includes(getDpsSpot())) {
      halfblood.globalDPS *= 1 + 0.5 * itemAbility(halfblood,1);
    } else if (karen == app.dpsChar) {
      halfblood.globalDPS *= 1 + 0.5 * itemAbility(halfblood,1) * 0.5 * itemAbility(karen,0);
      karen.effects += 1;
    }
  }
  if (karen == app.dpsChar) {karen.effects += 1;}
  halfblood.globalDPS *= 1 + 0.25 * currentWorld.countTags('male') * legendaryFactor(halfblood,0);
  halfblood.globalDPS *= 1 + 0.25 * (currentWorld.filled - currentWorld.countTags('human')) * legendaryFactor(halfblood,1);
  if (app.dpsChar && app.dpsChar.tags.includes('male')) {
    halfblood.globalDPS *= 1 + legendaryFactor(halfblood,2);
  }
};

////Foresight
var foresight = getCrusader('11c');
foresight.calculate = function() {
  var foresightSpot = getCrusaderSpot(app.formationIds, foresight.id);
  var adjacent = currentWorld.whatsAdjacent(foresightSpot);
  var humansAdj = 0;
  var nonHumansAdj = 0;
  var malesAdj = 0;
  var femalesAdj = 0;
  if (app.dpsChar && app.dpsChar.tags.includes('supernatural')) {
    foresight.globalDPS *= 1.5;
  }
  for (var i = 0; i < adjacent.length; i++) {
    var adjCruId = formationIds[adjacent[i]];
    var adjCru = adjCruId && app.jsonData.crusaders.find(cru => cru.id == adjCruId);
    if(!(adjCru !=null))
      continue;
    if (adjCru.tags.includes('human')) {
      humansAdj += 1;
    } else {
      nonHumansAdj +=1;
    }
    if (adjCru.tags.includes('female')) {
      femalesAdj += 1;
    }
    if (adjCru.tags.includes('male')) {
      malesAdj += 1;
    }
  }
  if (humansAdj > nonHumansAdj) {
    foresight.globalDPS *= Math.pow(1 + 0.1 * legendaryFactor(foresight,0),currentWorld.countTags('human'));
    foresight.globalGold *= Math.pow(1 + 0.05 * legendaryFactor(foresight,1),currentWorld.countTags('human'));
  }
  var karenSpot = getCrusaderSpot(app.formationIds, karen.id);
  if (humansAdj < nonHumansAdj) {
    foresight.globalDPS *= Math.pow(1 + 0.1 * legendaryFactor(foresight,0),currentWorld.filled - currentWorld.countTags('human'));
    foresight.globalGold *= Math.pow(1 + 0.05 * legendaryFactor(foresight,1),currentWorld.filled - currentWorld.countTags('human'));
  } else if (karenSpot != null) {
    foresight.globalGold *= 1 + 0.1 * legendaryFactor(foresight,0);
    foresight.globalDPS *= 1 + 0.05 * legendaryFactor(foresight,1);
    karen.effects += 1;
  }
  if (malesAdj >= femalesAdj) {
    karen.effects += 1;
  }
  if (currentWorld.countTags('supernatural') >= 4) {
    foresight *= 1 + legendaryFactor(foresight,2);
  }
};

//////Slot 12
////Dark Gryphon
var gryphon = getCrusader("12");
gryphon.calculate = function() {
  var gryphonSpot = getCrusaderSpot(app.formationIds, gryphon.id);
  // if the dps is in the column in front of gryphon
  if (getIsBehind(currentWorld, gryphonSpot, getDpsSpot())){
    gryphon.globalDPS *= 1 + legendaryFactor(gryphon,0);
  }
  gryphon.globalDPS *= 1 + 0.1 * monstersOnscreen * legendaryFactor(gryphon,1);
  if (app.dpsChar && app.dpsChar.tags.includes('supernatural')) {
    gryphon.globalDPS *= 1 + legendaryFactor(gryphon,2);
  }
  var karenSpot = getCrusaderSpot(app.formationIds, karen.id);
  // if karen is dps, and isn't in front of the gryphon, she still gets the L bonus
  if (app.dpsChar && karen == app.dpsChar && getIsBehind(karenSpot,grphyonSpot) === false){
    gryphon.globalDPS *= 1 + legendaryFactor(gryphon,0);
    karen.effects += 1;
  }
};

////Rocky the Rockstar
var rocky = getCrusader('12a');
rocky.calculate = function() {
  var rockySpot = getCrusaderSpot(app.formationIds, rocky.id);
  var adjacent = currentWorld.whatsAdjacent(rockySpot);
  var numFemales = 0;
  if (rocky == app.dpsChar) {
    for (var i =0; i < adjacent.length; i++) {
      var adjCruId = app.formationIds[adjacent[i]];
      var adjCru = app.jsonData.crusaders.find(cru => cru.id == adjCruId);
      if (adjCru) {
      if (adjCru.tags.includes('female')) {
        numFemales += 1;}
      }
    }
    rocky.globalDPS *= 1 + 0.5 * itemAbility(rocky,0) * numFemales;
    rocky.globalDPS *= 1 + 0.2 * currentWorld.countTags('female') * legendaryFactor(rocky,0);
    if (numFemales >= 3) {
      rocky.globalDPS *= 1 + legendaryFactor(rocky,1);
    }
  }
  if (app.dpsChar && app.dpsChar.tags.includes('male')) {
    rocky.globalDPS *= 1 + legendaryFactor(rocky,2);
  }
};

////Montana James
var montana = getCrusader('12b');
montana.calculate = function() {
  if (app.dpsChar && app.dpsChar.tags.includes('animal')) {
    montana.globalDPS *= 1.5;
  }
  var princessSpot = getCrusaderSpot(app.formationIds, princess.id);
  if (princessSpot != null) {
    montana.globalDPS *= 1.4;
  }
  if (countShots) {
    montana.globalDPS *= 1 + 2 * itemAbility(montana,0) * (1 + legendaryFactor(montana,2)) / 5;
  }
  montana.globalDPS *= 1 + 0.25 * currentWorld.countTags('female') * legendaryFactor(montana,0);
  if (app.dpsChar && app.dpsChar.tags.includes('animal')) {
    montana.globalDPS *= 1 + legendaryFactor(montana,1);
  }
};

////The Dark Helper
var helper = getCrusader('12c');
helper.calculate = function() {
  var helperSpot = getCrusaderSpot(app.formationIds, helper.id);
  if (underAttack && currentWorld.columnNum(helperSpot) == currentWorld.maxColumn) {
    helper.globalDPS *= 1 + 0.5 + 0.2 * currentWorld.countTags('tank');
  }
  helper.globalGold *= 1 + 0.1 * monstersOnscreen * itemAbility(helper,1);
  if (numAttacking > 0) {
    helper.globalDPS *= 1 + legendaryFactor(helper,0);
  }
  if (app.dpsChar && app.dpsChar.tags.includes('leprechaun')) {
    helper.globalDPS *= 1 + legendaryFactor(helper,1);
  }
  if (currentWorld.countTags('leprechaun') >= 2) {
    helper.globalDPS *= 1 + legendaryFactor(helper,2);
  }
  var karenSpot = getCrusaderSpot(app.formationIds, karen.id);
  if (karen == app.dpsChar && currentWorld.columnNum(karenSpot) != currentWorld.columnNum(helperSpot)) {
    karen.effects += 1;
  }
};

//////Slot 13
////Sarah, the Collector
var sarah = getCrusader("13");
sarah.calculate = function() {
  if (sarah == app.dpsChar) {
    var formationFull = true;
    for (i=0; i<currentWorld.spots; i++){
      if (!formationIds[i]) {
        formationFull = false;
      }
    }
    if (formationFull) {
      sarah.globalDPS *= 2.5;
    }
    sarah.globalDPS *= 1 + 0.01 * numEpicEquip * legendaryFactor(sarah,1);
    sarah.globalDPS *= 1 + 0.01 * numEpicTrinkets * legendaryFactor(sarah,2);
  }
  if (app.dpsChar && app.dpsChar.tags.includes('female')) {
    sarah.globalDPS *= 1 + legendaryFactor(sarah,0);
  }
};

////The Metal Soldierette
var soldierette = getCrusader('13a');
soldierette.calculate = function() {
  var soldieretteSpot = getCrusaderSpot(app.formationIds, soldierette.id);
  if (soldierette == app.dpsChar) {
    if (currentWorld.columnNum(soldieretteSpot) == currentWorld.maxColumn) {
      soldierette.globalDPS *= 5;
      if (numAttacking > 0) {
        soldierette.globalDPS *= 1 + legendaryFactor(soldierette,0);
      }
    }
    soldierette.globalDPS *= 1 + 0.2 * numAttacking;
    soldierette.globalDPS *= 1 + currentWorld.countTags('healer') * legendaryFactor(soldierette,2);
  }
  soldierette.globalDPS *= 1 + 0.1 * numAttacking * legendaryFactor(soldierette,1);
};

////Snickette the Sneaky
var snickette = getCrusader('13b');
snickette.calculate = function() {
  var snicketteSpot = getCrusaderSpot(app.formationIds, snickette.id);
  var adjacent = currentWorld.whatsAdjacent(snicketteSpot);
  var numAdjacent = 0;
  if (app.dpsChar && app.dpsChar.tags.includes('human')) {
    snickette.globalDPS *= 1 + (0.5 + 0.1 * currentWorld.countTags('human')) * itemAbility(snickette,0);
  }
  if (currentWorld.countTags('leprechaun') >= 2) {
    snickette.globalDPS *= 1 + 0.5;
  }
  for (var i = 0; i < adjacent.length; i++) {
    var adjCruId = app.formationIds[adjacent[i]];
    if (adjCruId) {
      numAdjacent += 1;
    }
  }
  if (numAdjacent <= 4) {
    if (app.dpsChar && adjacent.includes(getDpsSpot())) {
      snickette.globalDPS *= 1 + 0.5 * itemAbility(snickette,1);
    } else if (karen == app.dpsChar) {
      snickette.globalDPS *= 1 + 0.5 * itemAbility(snickette,1) * 0.5 * itemAbility(karen,0);
      karen.effects += 1;
    }
  }
  if (app.dpsChar && currentWorld.columnNum(getDpsSpot()) == currentWorld.columnNum(snicketteSpot)) {
    snickette.globalDPS *= 1 + legendaryFactor(snickette,0);
  }
  snickette.globalGold *= 1 + 0.1 * currentWorld.countTags('human') * legendaryFactor(snickette,1);
  var larrySpot = getCrusaderSpot(app.formationIds, larry.id);
  if (larrySpot != null) {
    snickette.globalDPS *= 1 + legendaryFactor(snickette,2);
  }
};

//////Slot 14
////Gold panda
var panda = getCrusader("14");
panda.calculate = function() {
  if (numAttacking === 0) {
    panda.globalGold *= 1 + legendaryFactor(panda,2);
  }
};

////RoboSanta
var santa = getCrusader('14a');
santa.calculate = function() {
  var santaSpot = getCrusaderSpot(app.formationIds, santa.id);
  var adjacent = currentWorld.whatsAdjacent(santaSpot);
  var numAhead = currentWorld.columnTest(currentWorld.columnNum(santaSpot)+1);
  santa.globalGold *= Math.pow(1 + 0.25 * itemAbility(santa,0) * (1 + legendaryFactor(santa,0)),numAhead);
  var karenSpot = getCrusaderSpot(app.formationIds, karen.id);
  if (getIsBehind(currentWorld, karenSpot, santaSpot)=== false) {
    santa.globalDPS *= 1 + 0.25 * itemAbility(santa,0) * (1 + legendaryFactor(santa,0)) * 0.5 * itemAbility(karen,0);
    karen.effects += 1;
  }
  if (app.dpsChar && adjacent.includes(getDpsSpot())) {
    santa.globalDPS *= 1 + legendaryFactor(santa,1);
  }
  santa.globalGold *= 1 + 0.1 * currentWorld.countTags('robot') * legendaryFactor(santa,2);
};

////Leerion, the Royal Dwarf
var leerion = getCrusader('14b');
leerion.calculate = function() {
  leerion.globalGold *= 1 + (0.25 + 0.1 * currentWorld.countTags('female') + 0.15 * currentWorld.countTags('royal')) * itemAbility(leerion,2) * (1 + legendaryFactor(leerion,0));
  leerion.globalDPS *= 1 + 0.25 * currentWorld.countTags('female') * legendaryFactor(leerion,1);
  var sashaSpot = getCrusaderSpot(app.formationIds, sasha.id);
  if (sashaSpot != null) {
    leerion.globalDPS *= 1 + legendaryFactor(leerion,2);
  }
};

////Katie the Cupid
var katie = getCrusader('14c');
katie.calculate = function() {
  var katieSpot = getCrusaderSpot(app.formationIds, katie.id);
  var animalsAdj = 0;
  var humansAdj = 0;
  var femalesAdj = 0;
  var malesAdj = 0;
  var boost = 0.3 * itemAbility(katie,2);
  var adjacent = currentWorld.whatsAdjacent(katieSpot);
  for (var i = 0; i < adjacent.length; i++) {
    var adjCruId = app.formationIds[adjacent[i]];
    var adjCru = adjCruId && app.jsonData.crusaders.find(cru => cru.id == adjCruId);
    if(!(adjCru != null)) continue;
    if (adjCru.tags.includes('animal')) {animalsAdj += 1;}
    if (adjCru.tags.includes('human')) {humansAdj += 1;}
    if (adjCru.tags.includes('male')) {malesAdj += 1;}
    if (adjCru.tags.includes('female')) {femalesAdj += 1;}
  }
  katie.globalGold *= (1 + boost * Math.min(animalsAdj,2)) * (1 + boost * Math.min(malesAdj,2)) * (1 + boost * Math.min(femalesAdj,2)) * (1 + boost * Math.min(humansAdj,2));
  katie.globalGold *= 1 + 0.25 * currentWorld.countTags('gold') * legendaryFactor(katie,1);
  katie.globalDPS *= 1 + 0.25 * currentWorld.countTags('human') * legendaryFactor(katie,0);
  var dpsBoost = boost/2 * legendaryFactor(katie,2);
  katie.globalDPS *= (1 + dpsBoost * Math.min(animalsAdj,2)) * (1 + dpsBoost * Math.min(malesAdj,2)) * (1 + dpsBoost * Math.min(femalesAdj,2)) * (1 + dpsBoost * Math.min(humansAdj,2));
};

//////Slot 15
////Prince Sal, the Merman
var sal = getCrusader("15");
sal.calculate = function() {
  var salSpot = getCrusaderSpot(app.formationIds, sal.id);
  var adjacent = currentWorld.whatsAdjacent(salSpot);
  var numAdjacent = 0;
  console.log('sal.calculate', app.dpsChar);
  if (sal == app.dpsChar) {
    console.log("calculating sal's selfDpsMods");
    sal.globalDPS *= 1 + 0.25 * currentWorld.countTags('female') * legendaryFactor(sal,0);
    sal.globalDPS *= 1 + 0.25 * currentWorld.countTags('royal') * legendaryFactor(sal,1);
  }
  for (var i = 0; i < adjacent.length; i++) {
    var adjCruId = app.formationIds[adjacent[i]];
    if (adjCruId) {
      numAdjacent += 1;
    }
  }
  if (numAdjacent >= 5 && sal == app.dpsChar) {
    sal.globalDPS *= 1 + legendaryFactor(sal,2);
  }
};

////Wendy the Witch
var wendy = getCrusader('15a');
wendy.calculate = function() {
  var wendySpot = getCrusaderSpot(app.formationIds, wendy.id);
  var columnsAhead = currentWorld.maxColumn - currentWorld.columnNum(wendySpot);
  if (wendy == app.dpsChar) {
    wendy.globalDPS *= 1 + 0.25 * monstersOnscreen * (1 + legendaryFactor(wendy,1));
    wendy.globalDPS *= 1 + 0.5 * currentWorld.countTags('magic') * legendaryFactor(wendy,0);
    wendy.globalDPS *= 1 + 0.25 * columnsAhead * legendaryFactor(wendy,2);
  }
};

////Robbie Raccoon
var robbie = getCrusader('15b');
robbie.calculate = function() {
  if (robbie == app.dpsChar) {
    var brootSpot = getCrusaderSpot(app.formationIds, broot.id);
    if (brootSpot != null) {
      robbie.globalDPS *= 1 + legendaryFactor(robbie,0);
    }
    robbie.globalDPS *= 1 + 0.5 * currentWorld.countTags('tank') * legendaryFactor(robbie,1);
    robbie.globalDPS *= 1 + 0.1 * monstersOnscreen * legendaryFactor(robbie,2);
  }
};

////Princess Val the Mermain
var val = getCrusader('15c');
val.calculate = function() {
  var valSpot = getCrusaderSpot(app.formationIds, val.id);
  var adjacent = currentWorld.whatsAdjacent(valSpot);
  if (currentWorld.countTags('animal') > currentWorld.countTags('human')) {
    val.globalDPS *= 1 + 0.5 * itemAbility(val,2) * (1 + legendaryFactor(val,0));
  }
  if (app.dpsChar && app.dpsChar.tags.includes('royal')) {
    val.globalDPS *= 1 + legendaryFactor(val,1);
  }
  val.globalDPS *= 1 + 0.25 * (currentWorld.filled - currentWorld.countTags('human')) * legendaryFactor(val,2);
  var karenSpot = getCrusaderSpot(app.formationIds, karen.id);
  if (karen == app.dpsChar && !adjacent.includes(karenSpot)) {
    karen.effects += 1;
  }
};

//////Slot 16
////Fire Phoenix
var phoenix = getCrusader("16");
phoenix.calculate = function() {
  phoenix.globalDPS *= 1 + 0.25 * currentWorld.countTags('supernatural') * legendaryFactor(phoenix,0);
  if (app.dpsChar && app.dpsChar.tags.includes('supernatural')) {
    phoenix.globalDPS *= 1 + legendaryFactor(phoenix,2);
  }
};

////Alan the ArchAngel
var alan = getCrusader('16a');
alan.calculate = function() {
  var alanSpot = getCrusaderSpot(app.formationIds, alan.id);
  var adjacent = currentWorld.whatsAdjacent(alanSpot);
  alan.globalDPS *= 1 + 0.5 * currentWorld.countTags('angel') *legendaryFactor(alan,2);
  var karenSpot = getCrusaderSpot(app.formationIds, karen.id);
  if (karen == app.dpsChar && !adjacent.includes(karenSpot)) {
    karen.effects += 2;
  }
};

////Fright-o-Tron
var fright = getCrusader('16b');
fright.calculate = function() {
  fright.globalDPS *= 1/(1-0.15*itemAbility(fright,2));
  fright.globalDPS *= 1 + 0.5 * currentWorld.countTags('robot') * legendaryFactor(fright,0);
  var turkeySpot = getCrusaderSpot(app.formationIds, turkey.id);
  if (turkeySpot != null) {
    fright.globalDPS *= 1 + 0.25 * legendaryFactor(fright,1);
  }
  if (app.dpsChar && app.dpsChar.tags.includes('robot')) {
    fright.globalDPS *= 1 + legendaryFactor(fright,2);
  }
};

//////Slot 17
////King Reginald IV
var reginald = getCrusader("17");
reginald.calculate = function() {
  if (app.dpsChar && app.dpsChar.tags.includes('royal')) {
    reginald.globalDPS *= 1 + 2 * itemAbility(reginald,2) * (1 + legendaryFactor(reginald,1));
  }
  reginald.globalDPS *= 1 + 0.25 * currentWorld.countTags('royal') * legendaryFactor(reginald,0);
};

////Queen Siri
var siri = getCrusader('17a');
siri.calculate = function() {
  if (app.dpsChar && app.dpsChar.tags.includes('female')) {
    siri.globalDPS *= 1 + 1 * itemAbility(siri,2);
    siri.globalDPS *= 1 + legendaryFactor(siri,0);
  }
  var thaliaSpot = getCrusaderSpot(app.formationIds, thalia.id);
  if (thaliaSpot != null) {
    siri.globalDPS *= 1 + legendaryFactor(siri,1);
  }
  if (currentWorld.countTags('female') > currentWorld.countTags('male')) {
    siri.globalDPS *= 1 + legendaryFactor(siri,2);
  }
};

////Mr. Boggins, the Substitute
var boggins = getCrusader('17b');
boggins.calculate = function() {
  var diversityCount = 0;
  if (app.dpsChar && app.dpsChar.tags.includes('animal')) {
    boggins.globalDPS *= 1 + (2 + 0.125 * currentWorld.countTags('human')) * itemAbility(boggins,0) * (1 + legendaryFactor(boggins,1));
  }
  app.formationIds
    .filter(f => f != null)
    .map(cruId => {
      var cru = app.jsonData.crusaders.find(refCru => refCru.id == cruId);
      if (!cru.tags.includes('human') && !cru.tags.includes('animal')) {
        diversityCount += 1;
      }
    });
  boggins.globalGold *= Math.pow(1.1,diversityCount);
  boggins.critChance += 3 * legendaryFactor(boggins,0);
};

////Squiggles the Clown
var squiggles = getCrusader('17c');
squiggles.calculate = function() {
  var squigglesSpot = getCrusaderSpot(app.formationIds, squiggles.id);
  var adjacent = currentWorld.whatsAdjacent(squigglesSpot);
  var humansAdj = 0;
  if (squiggles == app.dpsChar) {
    squiggles.globalDPS *= 1 + (1.5 - 0.25 * currentWorld.countTags('royal')) * itemAbility(squiggles,0);
    squiggles.globalDPS *= 1 + 0.1 * (currentWorld.filled - currentWorld.countTags('royal'));
    for (var i = 0; i < adjacent.length; i++) {
      var adjCruId = app.formationIds[adjacent[i]];
      var adjCru = adjCruId && app.jsonData.crusaders.find(cru => cru.id == adjCruId);
      if (adjCru && adjCru.tags.includes('human')) {humansAdj += 1;}
    }
    if (humansAdj >= 2) {
      squiggles.globalDPS *= 3;
    }
    if (humansAdj >= 4) {
      squiggles.globalDPS *= 1 + legendaryFactor(squiggles,1);
    }
    squiggles.globalDPS *= 1 + (currentWorld.filled - currentWorld.countTags('human')) * legendaryFactor(squiggles,0);
    var peteSpot = getCrusaderSpot(app.formationIds, pete.id);
    if (peteSpot != null) {
      squiggles.globalDPS *= 1 + legendaryFactor(squiggles,2);
    }
  }
};

//////Slot 18
////Thalia, the Thunder King
var thalia = getCrusader("18");
thalia.calculate = function() {
  if (app.dpsChar && app.dpsChar.tags.includes('royal')) {
    thalia.globalDPS *= 1 + legendaryFactor(thalia,1);
  }
};

////Frosty the Snowman
var frosty = getCrusader('18a');
frosty.calculate = function() {
  var adjacent = currentWorld.whatsAdjacent(frosty);
  var numAdjacent = 0;
  if (frosty == app.dpsChar) {
    frosty.globalDPS *= 1 + 2*currentWorld.countTags('supernatural')*itemAbility(frosty,0)* (1 + legendaryFactor(frosty,1));
    for (var i = 0; i < adjacent.length; i++) {
      var adjCruId = app.formationIds[adjacent[i]];
      if (adjCruId) {
        numAdjacent += 1;
      }
    }
    var karenSpot = getCrusaderSpot(app.formationIds, karen.id);
    if (karenSpot != null && !adjacent.includes(karenSpot)) {
      karen.effects += 1;
      numAdjacent += 1;
    }
    frosty.globalDPS *= 1 + numAdjacent;
    frosty.globalDPS *= 1 + 0.25 *numAdjacent * legendaryFactor(frosty,2);
  }
  if (app.dpsChar && adjacent.includes(getDpsSpot())) {
    frosty.globalDPS *= 0.75;
  } else if (karen == app.dpsChar) {
    frosty.globalDPS *= 1 - 0.25 * 0.5 * itemAbility(karen,0);
  }
};

////Littlefoot
var littlefoot = getCrusader('18b');
littlefoot.calculate = function() {
  littlefoot.globalDPS *= 1 + 0.1 *littlefootXP * itemAbility(littlefoot,1) * (1 + legendaryFactor(littlefoot,0));
  var littlefootSpot = getCrusaderSpot(app.formationIds, littlefoot.id);
  if (currentWorld.columnNum(littlefootSpot) == currentWorld.maxColumn) {
    littlefoot.globalDPS *= 1 + 0.1 * numAttacking * legendaryFactor(littlefoot,2);
  }
};

////Cindy the Cheer-Orc
var cindy = getCrusader('18c');
cindy.calculate = function() {
  var cindySpot = getCrusaderSpot(app.formationIds, cindy.id);
  var distances = currentWorld.findDistances(cindySpot);
  var distance = app.dpsChar && distances[getDpsSpot()];
  if (distance > 0) {
    cindy.globalDPS *= 1 + 0.5 * distance * (1+10*currentStage/50) * itemAbility(cindy,1);
  } else if (karen == app.dpsChar) {
    karen.effects += 1;
  }
  cindy.globalDPS *= 1 + Math.min(killedThisStage/100,2) * (1 + legendaryFactor(cindy,0));
  if (app.dpsChar && app.dpsChar.tags.includes('orc')) {
    cindy.globalDPS *= 1 + legendaryFactor(cindy,1);
  }
  cindy.globalGold *= 1 + 0.25 * currentWorld.countTags('orc') * legendaryFactor(cindy,2);
};

//////Slot 19
////Merci, the Mad Wizard
var merci = getCrusader("19");
merci.calculate = function() {
  merci.globalDPS *= 1 + Math.min(0.025 * monstersOnscreen * itemAbility(merci,0) * (1 + legendaryFactor(merci,1)), 1 + legendaryFactor(merci,2)) * monstersOnscreen;
  if (app.dpsChar && app.dpsChar.tags.includes('magic')) {
    merci.globalDPS *= 1 + legendaryFactor(merci,0);
  }
};

////The Bat Billionaire
var bat = getCrusader('19a');
bat.calculate = function() {
};

////Petra The Pilgrim
var petra = getCrusader('19b');
petra.calculate = function() {
  var petraSpot = getCrusaderSpot(app.formationIds, petra.id);
  var adjacent = currentWorld.whatsAdjacent(petraSpot);
  var paulMult = 1;
  var paulSpot = getCrusaderSpot(app.formationIds, paul.id);
  if (paulSpot != null) {paulMult = 1.5;}
  if (petra == app.dpsChar) {
    petra.globalDPS *= 1 + 0.5 * currentWorld.countTags('elf') * paulMult * itemAbility(petra,0);
    if (paulSpot != null && adjacent.includes(paulSpot)) {
      petra.globalDPS *= 1 + 2 * paulMult;
    }
  }
};

//////Slot 20
////Nate Dragon
var nate = getCrusader("20");
nate.calculate = function({nateXP=0} = {}) {
//Double Dragon
  var natalieSpot = getCrusaderSpot(app.formationIds, natalie.id);
  if (natalieSpot != null && nate == app.dpsChar){
    nate.globalDPS *= 1+2*itemAbility(nate,2);
  }
  if (natalieSpot != null) {
    nate.globalDPS *= 1 + legendaryFactor(nate,0);
  }
  nate.globalDPS *= 1 + 0.25 * currentWorld.countTags('male') * legendaryFactor(nate,1);
  if(nateXP)
    nate.globalDPS *= 1 + 0.1 * nateXP * legendaryFactor(nate,2);
};

////Kizlblyp the Alien Traitor
var kiz = getCrusader('20a');
kiz.calculate = function() {
  if (kiz == app.dpsChar) {
    kiz.globalDPS *= 1 + 0.2 * itemAbility(kiz,0) * currentWorld.countTags('male');
    kiz.globalDPS *= 1 + 0.25 * (currentWorld.filled - currentWorld.countTags('human')) * legendaryFactor(kiz,0);
    var billySpot = getCrusaderSpot(app.formationIds, billy.id);
    if (billySpot != null) {
      kiz.globalDPS *= 1 + legendaryFactor(kiz,1);
    }
    if (currentWorld.countTags('royal') === 0) {
      kiz.globalDPS *= 1 + 2 * legendaryFactor(kiz,2);
    }
  }
  kiz.globalDPS *= 1 + 0.1 * (currentWorld.filled - currentWorld.countTags('human'));
};

////Robo-Rudolph
var rudolph = getCrusader('20b');
rudolph.calculate = function() {
  var rudolphSpot = getCrusaderSpot(app.formationIds, rudolph.id);
  var adjacent = currentWorld.whatsAdjacent(rudolphSpot);
  var robotAdj = false;
  if (rudolph == app.dpsChar) {
    for (var i = 0; i < adjacent.length; i++) {
      var adjCruId = app.formationIds[adjacent[i]];
      var adjCru = adjCruId && app.jsonData.crusaders.find(cru => cru.id == adjCruId);
      if (adjCru && adjCru.tags.includes('robot')) {
        robotAdj = true;
      }
    }
    if (robotAdj) {
      rudolph.globalDPS *= 1 + 2 * itemAbility(rudolph,0);
    }
    rudolph.globalDPS *= 1 + 1 * currentWorld.countTags('robot') * itemAbility(rudolph,1);
    rudolph.globalDPS *= 1 + 0.5 * currentWorld.countTags('robot') * legendaryFactor(rudolph,1);
    rudolph.globalDPS *= 1 + 0.25 * currentWorld.countTags('animal') * legendaryFactor(rudolph,2);
  }
  if (app.dpsChar && app.dpsChar.tags.includes('robot')) {
    rudolph.globalDPS *= 1 + legendaryFactor(rudolph,0);
  }
};

//////Slot 21
////The Exterminator
var exterminator = getCrusader('21');
exterminator.calculate = function() {
  var exterminatorSpot = getCrusaderSpot(app.formationIds, exterminator.id);
  var adjacent = currentWorld.whatsAdjacent(exterminatorSpot);
  var robotsAdj = 0;
  for (var i = 0; i < adjacent.length; i++) {
    var adjCruId = app.formationIds[adjacent[i]];
    var adjCru = adjCruId && app.jsonData.crusaders.find(cru => cru.id == adjCruId);

    if (adjCru && adjCru.tags.includes('robot')) {
      robotsAdj = 1;
    }
  }
  if (exterminator == app.dpsChar) {
    exterminator.globalDPS *= 1 + 1 * robotsAdj * itemAbility(exterminator,0) * (1 + legendaryFactor(exterminator,0));
    exterminator.globalDPS *= 1 + 0.5 * currentWorld.countTags('robot') * itemAbility(exterminator,0);
    if (currentWorld.countTags('robot') > currentWorld.countTags('human')) {
      exterminator.globalDPS *= 1 + legendaryFactor(exterminator,2);
    }
  }
  exterminator.globalGold *= 1 + 0.1 * (currentWorld.countTags('robot') - robotsAdj);
  exterminator.globalGold *= 1 + 0.25 * currentWorld.countTags('robot') * legendaryFactor(exterminator,1);
};

////Gloria, the Good Witch
var gloria = getCrusader('21a');
gloria.calculate = function() {
  var gloriaSpot = getCrusaderSpot(app.formationIds, gloria.id);
  var adjacent = currentWorld.whatsAdjacent(gloriaSpot);
  if (karen == app.dpsChar) {
    gloria.globalDPS *= 1 + 0.5 * 0.5 * itemAbility(karen,0);
    karen.effects += 1;
    if (app.dpsChar && currentWorld.columnNum(getDpsSpot()) != currentWorld.columnNum(gloriaSpot) + 1) {
      karen.effects += 1;
    }
  } else if (app.dpsChar && currentWorld.columnNum(getDpsSpot()) != currentWorld.columnNum(gloriaSpot) + 1) {
    gloria.globalDPS *= 1.5;
  }
  if (app.dpsChar && adjacent.includes(getDpsSpot())) {
    gloria.globalDPS *= 1 + legendaryFactor(gloria,1);
  }
  if (app.dpsChar && app.dpsChar.tags.includes('animal')) {
    gloria.globalDPS *= 1 + legendaryFactor(globalDPS,2);
  }
};

//////Slot 22
////The Shadow Queen
var shadow = getCrusader('22');
shadow.calculate = function() {
  var jasonMult = 1;
  var shadowSpot = getCrusaderSpot(app.formationIds, shadow.id);
  var adjacent = currentWorld.whatsAdjacent(shadowSpot);
  var numAdjacent = 0;
  if (app.dpsChar && adjacent.includes(getDpsSpot())) {
    for (var i = 0; i < adjacent.length; i++) {
      var adjCruId = app.formationIds[adjacent[i]];
      if (adjCruId) {
        numAdjacent += 1;
      }
    }
    var karenSpot = getCrusaderSpot(app.formationIds, karen.id);
    if (karenSpot != null && !adjacent.includes(karenSpot)) {
      numAdjacent += 1;
      karen.effects += 1;
    }
    var jasonSpot = getCrusaderSpot(app.formationIds, jason.id);
    if (jasonSpot != null && adjacent.includes(jasonSpot)) {
      jasonMult = 2;
    }
    shadow.globalDPS *= 1 + 3 * jasonMult * itemAbility(shadow,0) * (1 + legendaryFactor(shadow,0)) / numAdjacent;
  }
  if (app.dpsChar && app.dpsChar.tags.includes('supernatural')) {
    shadow.globalDPS *= 1 + legendaryFactor(shadow,1);
  }
  shadow.globalDPS *= 1 + 0.5 * currentWorld.countTags('magic') * legendaryFactor(shadow,2);
};

////Ilsa, the Insane Wizard
var ilsa = getCrusader('22a');
ilsa.calculate = function() {
  var ilsaSpot = getCrusaderSpot(app.formationIds, ilsa.id);
  var adjacent = currentWorld.whatsAdjacent(ilsaSpot);
  var numAdjacent = 0;
  var deflecting = 0;
  var magicMult = 0;
  var correction = 1;
  if (app.dpsChar && app.dpsChar.zapped) {
    correction *= 1 + 0.2 * itemAbility(turkey,1);
  }
  if (app.dpsChar && app.dpsChar.smashed) {
    correction *= 1.25;
  }
  var merciSpot = getCrusaderSpot(app.formationIds, merci.id);
  if (ilsa == app.dpsChar) {
    ilsa.globalDPS *= 1 + (0.5 + currentWorld.countTags('magical'))*itemAbility(ilsa,0);
    if (merciSpot != null) {
      deflecting = Math.min(2.5 * monstersOnscreen * itemAbility(merci,0),100);
    }
    ilsa.globalDPS *= 2 + 2 * deflecting/100;
    ilsa.globalDPS *= 1 + 0.5 * currentWorld.countTags('magic') * legendaryFactor(ilsa,2);
  }
  for (var i = 0; i < adjacent.length; i++) {
    var adjCruId = app.formationIds[adjacent[i]];
    if (adjCruId) {
      numAdjacent += 1;}
  }
  if (numAdjacent == 1) {magicMult = 4 * (1 + legendaryFactor(ilsa,0));}
  if (app.dpsChar && adjacent.includes(getDpsSpot())) {
    ilsa.globalDPS *= 0.5 + 1 * magicMult / correction;
  } else if (karen == app.dpsChar) {
  }
  if (merciSpot != null && ilsa == app.dpsChar) {
    ilsa.globalDPS *= 1 + legendaryFactor(ilsa,1);
  }
};

//////Slot 23
////GreySkull, the Pirate
var greyskull = getCrusader('23');
greyskull.calculate = function() {
  greyskull.globalGold *= 1 + 0.05 * itemAbility(greyskull,0) * numAttacking;
  if (countShots) {
    greyskull.globalDPS *= 1 + 2 *itemGreyShots(greyskull,2)/10;
  }
  greyskull.globalDPS *= 1 + 0.5 * currentWorld.countTags('tank') * legendaryFactor(greyskull,0);
  greyskull.globalDPS *= 1 + 0.2 * currentWorld.countTags('tank') * legendaryFactor(greyskull,1);
  if (app.dpsChar && app.dpsChar.tags.includes('human')) {
    greyskull.globalDPS *= 1 + legendaryFactor(greyskull,2);
  }
};

////Eiralon, the Blood Mage
var eiralon = getCrusader('23a');
eiralon.calculate = function() {
  var eiralonSpot = getCrusaderSpot(app.formationIds, eiralon.id);
  var adjacent = currentWorld.whatsAdjacent(eiralonSpot);
  eiralon.globalDPS *= 1 + 0.5 * itemAbility(eiralon,0);
  if (app.dpsChar && currentWorld.columnNum(eiralonSpot) == currentWorld.columnNum(getDpsSpot())) {
    eiralon.globalDPS *= 1 + 1 * itemAbility(eiralon,0);
  } else if (karen == app.dpsChar) {
    eiralon.globalDPS *= 1 + 1 * itemAbility(eiralon,0) * 0.5 * itemAbility(karen,0);
    karen.effects += 1;
  }
  eiralon.globalDPS *= 1 + currentWorld.countTags('healer') *legendaryFactor(eiralon,0);
  eiralon.globalDPS *= 1 + 0.5 * currentWorld.countTags('magic') * legendaryFactor(eiralon,1);
  if (app.dpsChar && adjacent.includes(getDpsSpot())) {
    eiralon.globalDPS *= 1 + legendaryFactor(eiralon,2);
  }
};

  //Formations

  function World(name, spots) {
    var _this = this;
    this.name = name;
    this.spots = spots;
    this.filled = 0;
    this.maxColumn = 0;
    var adjacent = [];
    var columnNum = [];
    for (i = 0; i < this.spots; i++) {
      adjacent[i] = [];
      columnNum[i] = [];
    }
    this.setAdjacent = function (spot, adjacentArray) {
      adjacent[spot] = adjacentArray;
    };
    this.setColumn = function (spot, columnNumIn) {
      columnNum[spot] = columnNumIn;
      console.log('spot:' + spot + " is in column "+columnNumIn);
      if (columnNumIn > _this.maxColumn) {
        _this.maxColumn = columnNumIn;
      }
    };
    this.isAdjacent = function (spot1, spot2) {
      var adjacentTest = false;
      for (var i in adjacent[spot1]) {
        if (i == spot2) {
          adjacentTest = true;
        }
      }
      return adjacentTest;
    };
    this.whatsAdjacent = function (spot) {
      return adjacent[spot] || [];
    };
    this.columnNum = function (spot) {
      return columnNum[spot];
    };
    this.countTags = function (tag) {
      var count = 0;
      app.formationIds
        .map((cruId, i) => {
          if(!(cruId != null) || cruId == "0")
            return;
          var cru = app.jsonData.crusaders.find(refCru => refCru.id == cruId);
          if(cru){
            cru.tags.map(cruTag => {
              if (tag == cruTag) {
                count += 1;
              }
            });
            if (cru[tag]) {
              count += 1;
            }
          }
        });
      return count;
    };
    this.columnTest = function (column, tag) {
      count = 0;
      for (var i in formationIds) {
        if (_this.columnNum(i) == column) {
          if (!tag) {
            count += 1;
          } else {
            var cruId = app.formationIds[i];
            var cru = cruId && app.jsonData.crusaders.find(refCru => refCru.id == cruId);
            for (var j in cru.tags) {
              if (tag == cru.tags[j]) {
                count += 1;
              }
            }
          }
        }
      }
      return count;
    };
    this.findDistances = function (spot1) {
      var visited = [];
      var distance = [];
      var adjacent = [];
      var current = spot1;
      var running = true;
      var min = 0;
      var minLoc = [];
      for (var i = 0; i < _this.spots; i++) {
        visited[i] = false;
        distance[i] = 100;
      }
      distance[spot1] = 0;
      while (running) {
        adjacent = _this.whatsAdjacent(current);
        visited[current] = true;
        min = 100;
        if (adjacent.length === 0) { running = false; }
        for (var j = 0; j < adjacent.length; j++) {
          distance[adjacent[j]] = Math.min(distance[current] + 1, distance[adjacent[j]]);
        }
        for (j = 0; j <= _this.spots; j++) {
          if (!visited[j] && distance[j] < min) {
            min = distance[j];
            minLoc = j;
          }
        }
        if (current == minLoc) { running = false; }
        current = minLoc;
      }
      for (i = 0; i < distance.length; i++) {
        if (distance[i] == 100) { distance[i] = -1; }
      }
      return distance;
    };
  }


  var worldsWake = new World("World's Wake", 10);
  app.worldsWake = worldsWake;
  worldsWake.setAdjacent(0, [1, 4]);
  worldsWake.setAdjacent(1, [0, 2, 4, 5]);
  worldsWake.setAdjacent(2, [1, 3, 5, 6]);
  worldsWake.setAdjacent(3, [2, 6]);
  worldsWake.setAdjacent(4, [0, 1, 5, 7]);
  worldsWake.setAdjacent(5, [1, 2, 4, 6, 7, 8]);
  worldsWake.setAdjacent(6, [2, 3, 5, 8]);
  worldsWake.setAdjacent(7, [4, 5, 8, 9]);
  worldsWake.setAdjacent(8, [5, 6, 7, 9]);
  worldsWake.setAdjacent(9, [7, 8]);
  for (i = 0; i < 10; i++) {
    switch (true) {
      case (i < 4):
        worldsWake.setColumn(i, 1);
        break;
      case (i > 3 && i < 7):
        worldsWake.setColumn(i, 2);
        break;
      case (i > 6 && i < 9):
        worldsWake.setColumn(i, 3);
        break;
      case (i == 9):
        worldsWake.setColumn(i, 4);
        break;
    }
  }

  var critChance = 1;
  var globalDPS = 1;
  var globalGold = 1;

  app.setDPS = function (id) {
    var crusader = getCrusader(id);
    app.dpsChar = crusader;
  };

  //Set Up Formation
  var currentWorld = worldsWake;
  app.currentWorld = currentWorld;
  // formation[0]=emo;
  // formation[7]=sasha;
  //formation[2]=kaine;
  //formation[3]=panda;
  // setDPS("Emo");
  //Set base values for the formation crusaders and calculate
  var doCalculation = (cru) =>
  {
        if(cru.calculate){

          cru.calculate();
          if(cru.globalDPS > 1)
            console.log('calculated ' + cru.id + ', ' + cru.globalDPS + ', ' + cru.displayName);
        }
  };
  app.calculateMultipliers = () => {
    var globalDPS = 1;
    var globalGold = 1;
    app.jsonData.crusaders
      .filter(cru => app.formationIds.includes(cru.id))
      // reset all the crusader state data for a new formation calculation
      .map(f =>{
        // set them all up BEFORE you do any calculations
        console.log('crusaderSetup');
        crusaderSetup(f);
        return f;
      })
      .map(f => {
          if(app.throw === true)
            doCalculation(f);
          else 
            try
            {
              doCalculation(f);
            } catch(ex){
              console.error('failed to calculate for ', f);
            }

        globalDPS *= f.globalDPS || 1;
        globalGold *= f.globalGold || 1;
    });
    var result = { globalDps: globalDPS, globalGold: globalGold };
    console.log('calculateMultipliers', result);
    return result;
  };
  app.globalDPS = globalDPS;

  //for (var i in formation) {
  //  formation[i].calculate();
  //  globalDPS *= formation[i].globalDPS;
  //  globalGold *= formation[i].globalGold;
  //  critChance += formation[i].critChance;
  // }
  // for (var i in formation) {
  //   formation[i].calculate();
  // }

  //Optional Arguments we might need
  var countShots = true;
  var underAttack = false;
  var monstersOnscreen = 0;
  var numAttacking = 0;
  var littlefootXP = 0;
  var killedThisStage = 0;
  var currentStage = 0;
})(typeof global !== 'undefined' ? global : window);
