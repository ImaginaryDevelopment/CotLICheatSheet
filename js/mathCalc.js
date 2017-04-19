(app => {
  app.dpsChar = null;
  app.getCrusader = id => app.jsonData.crusaders.find(c =>  c.id == id);

  // returns the lootId, not the rarity or legendary level
  var getLootId = (cruId, gearSlot) =>
    app.crusaderGear &&
    app.crusaderGear[cruId] &&
    inspect(app.crusaderGear[cruId]["s" + gearSlot.toString()],"getLootId found gear");

var getRarity = (loot,lootId) => {
  var item = Loot.getLootFromLootId(lootId,loot);
  return item && item.rarity;
};

  app.crusaderSetup = crusader => {
      crusader.globalDPS = 1;
      crusader.globalGold = 1;
      crusader.critChance = 0;
      // for momma only
      if(crusader.hasOwnProperty("turkeyApplied"))
        crusader.turkeyApplied = undefined;
      // for any dps that is zapped
      if(crusader.hasOwnProperty("zapped"))
        crusader.zapped = undefined;
      for (var i in crusader.gear) {
        switch (crusader.gear[i]) {
          case "clickCrit":
            crusader.critChance += itemCrit(crusader, i);
            break;
          case "alldps":
            var lootId = getLootId(crusader.id,i);
            var rarity = lootId && getRarity(crusader.loot, lootId);
            var dps = rarity && itemDPS(rarity) || 1;
            // console.log('alldps', dps,rarity,lootId, crusader.id,i);
            crusader.globalDPS *= dps;
            break;
          case "gold":
            crusader.globalGold *= itemGold(crusader, i) || 1;
            console.log("gold", crusader.globalGold,globalGold);
            break;
          case "selfdps":
            if (crusader == app.dpsChar) {
              var lootId = getLootId(crusader.id, i);
              crusader.globalDPS *= itemSelfDPS(crusader.loot, lootId) || 1;
            }
            break;
        }
      }
  };

//for adds to all crusader dps items
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

  function itemSelfDPS(crusader, gearSlot) {
    var lootId = getLootId(crusader.id, gearSlot);
    var item = lootId && Loot.getLootFromLootId(lootId, crusader.loot);
    if(!(item != null))
      return 1;
    switch (item.rarity) {
      case 1:
        return 1.25;
      case 2:
        return 1.5;
      case 3:
        return 2;
      case 4:
        if(item.golden === true)
          return 7;
        return 5;
      case 5:
        if(item.golden === true)
          return 13;
        return 9;
      default:
        return 1;
    }
  }

  function itemGold(crusader, gearSlot) {
    var lootId = getLootId(crusader.id, gearSlot);
    var item = lootId && Loot.getLootFromLootId(lootId, crusader.loot);
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

  function itemCrit(crusader, gearSlot) {
    var lootId = getLootId(crusader.id, gearSlot);
    var item = lootId && Loot.getLootFromLootId(lootId,crusader.loot);
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

  function itemAbility(crusader, gearSlot) {
    var lootId = getLootId(crusader.id, gearSlot);
    var item = lootId && Loot.getLootFromLootId(lootId,crusader.loot);
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

  function itemGreyShots(crusader, gearSlot) {
    var lootId = getLootId(crusader.id, gearSlot);
    var item = lootId && Loot.getLootFromLootId(lootId,crusader.loot);
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

  function legendaryFactor(crusader,gearSlot) {
    var lootId = getLootId(crusader.id, gearSlot);
    var item = lootId && Loot.getLootFromLootId(lootId, crusader.loot);
    if(!(item != null))
      return 0;
    if (item.level >= 1) {
     return Math.pow(2,legendaryLevel-1);
   } else {
     return 0;
   }
 }

  ///////// Formation Calculations
//////Slot 1
////bushwhacker
var bushwhacker = getCrusader("01");
bushwhacker.calculate = function() {
  crusaderSetup(bushwhacker);
  bushwhacker.critChance += 1 * legendaryFactor(bushwhacker,1);
  if (app.dpsChar && app.dpsChar.tags.includes('robot')) {
    bushwhacker.globalDPS *= 1 + 1 * legendaryFactor(bushwhacker,2);
  }
};

////RoboRabbit
var rabbit = getCrusader("01a");
rabbit.calculate = function() {
  crusaderSetup(rabbit);
  if (rabbit.clicking) {
    rabbit.globalDPS *= 1 + 0.25*itemAbility(rabbit,2);
  }
  rabbit.globalDPS *= 1 + 0.25 * currentWorld.countTags('robot') * legendaryFactor(rabbit,0);
};

////Graham
var graham = getCrusader("01b");
graham.calculate = function() {
  crusaderSetup(graham);
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
  crusaderSetup(warwick);
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
  crusaderSetup(jim);
//Self Buff
  if (jim == app.dpsChar) {
    var adjacent = currentWorld.whatsAdjacent(jim.spot);
    for (var i=0; i<adjacent.length; i++) {
      var adjCruId = app.formationIds[adjacent[i]];
      if (adjCruId != null)
        jim.globalDPS *= 1 + (1 + legendaryFactor(jim,1));
        break;
    }
  }
//Column Buff
  if (app.dpsChar && currentWorld.columnNum(jim.spot) == currentWorld.columnNum(app.dpsChar.spot)) {
    jim.globalDPS *= 1 + 0.5 * (1 + legendaryFactor(jim,0));
  } else if (karen == app.dpsChar) {
    jim.globalDPS *= 1 + 0.5 * (1 + legendaryFactor(jim,0)) * 0.5 * (itemAbility(karen,0));
    karen.effects += 1;
  }
  if (sasha.spot != null) {
    jim.globalDPS *= 1 + legendaryFactor(jim,2);
  }
};

////Pam
var pam = getCrusader("02a");
pam.calculate = function() {
  crusaderSetup(pam);
  var numInColumn = 0;
  var dpsInColumn = false;
  var numAdjacent =0;
//Focused Teamwork
  app.jsonData.crusaders
    .filter(cru => app.formationIds.includes(cru.id))
    .map(cru =>{
      if (currentWorld.columnNum(pam.spot) == currentWorld.columnNum(cru.spot)){
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
    var adjacent = currentWorld.whatsAdjacent(pam.spot);
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
  crusaderSetup(veronica);
  var dpsAffected = false;
//Precise Aim
  var adjacent = currentWorld.whatsAdjacent(veronica.spot);
  for (var j = 0; j<adjacent.length; j++ ) {
    var adjCru = app.jsonData.crusaders.find(cru => cru.id == app.formationIds[adjacent[j]]);
    if (adjCru && app.dpsChar && adjCru == app.dpsChar.id) {
      dpsAffected = true;
    }
  }
  if (app.dpsChar && currentWorld.columnNum(veronica.spot) == currentWorld.columnNum(app.dpsChar.spot)) {
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
  crusaderSetup(arachno);
  if (countShots) {
    arachno.globalDPS *= 1 + (2/3) * (1 + 0.05 * itemAbility(arachno,1)) * itemGreyShots(arachno,0) * (1 + legendaryFactor(arachno,0));
  }
  if (soldierette.spot != null) {
    arachno.globalDPS *= 1 + 1 * (1+legendaryFactor(arachno,1));
  }
  arachno.globalDPS *= 1 + 0.25 * (1+legendaryFactor(arachno,2));
};

//////Slot 3
////Emo Werewolf
var emo = getCrusader("03");
emo.test = "test";
emo.calculate = function() {
  crusaderSetup(emo);
//Conditional Self Buff
  if (emo == app.dpsChar) {
    var noHumansAdjacent = true;
    var adjacent = currentWorld.whatsAdjacent(emo.spot);
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
  crusaderSetup(sally);
  if (app.dpsChar && app.dpsChar.tags.includes("female")) {
    sally.globalDPS *= 1.2;
  }
  if (sally == app.dpsChar) {
    var femalesAdjacent = 0;
    var numAdjacent = 0;
    var adjacent = currentWorld.whatsAdjacent(sally.spot);
    for (var i = 0 ; i < adjacent.length; i++ ) {
      var adjCruId = formationIds[adjacent[i]];
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
  crusaderSetup(karen);
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
  crusaderSetup(sasha);
  var numBehind = 0;
  if (app.dpsChar && currentWorld.columnNum(sasha.spot)==currentWorld.columnNum(app.dpsChar.spot)+1) {
    sasha.globalDPS *=1 + 0.3*itemAbility(sasha,1)*(1+legendaryFactor(sasha,2));
  } else if (karen == app.dpsChar) {
    sasha.globalDPS *=1 + 0.3*itemAbility(sasha,1)*(1+legendaryFactor(sasha,2)) * 0.5 * itemAbility(karen,0);
    karen.effects += 1;
  }
  sasha.globalDPS *= 1 + 0.5 * currentWorld.countTags('tank') * legendaryFactor(sasha,0);
  app.formationIds.map((_,i)=> {
    if (currentWorld.columnNum(i) + 1 == currentWorld.columnNum(sasha)) {
      numBehind += 1;
    }
  });
  sasha.globalDPS *= 1 + 0.33 * numBehind * legendaryFactor(sasha,1);
};

////Groklok the Orc
var groklok = getCrusader("04a");
groklok.calculate = function() {
  crusaderSetup(groklok);
  var drizzleMult = 1;
  var numAffected = currentWorld.columnTest(currentWorld.columnNum(groklok.spot)+1);
  if (karen.spot != null && currentWorld.columnNum(karen.spot) != currentWorld.columnNum(groklok.spot)+1) {
    numAffected +=1;
  }
  if (drizzle.spot != null && currentWorld.columnNum(drizzle.spot) > currentWorld.columnNum(groklok.spot)) {
    drizzleMult = 2;
  }
//Eligible Receivers
  if (app.dpsChar && currentWorld.columnNum[groklok.spot]==currentWorld.columnNum[app.dpsChar.spot]-1) {
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
  if (currentWorld.columnNum(groklok.spot) == currentWorld.maxColumn) {
    groklok.globalDPS *= 1 + 0.1 * numAttacking * (1+legendaryFactor(groklok,0));
  }
};

////Mindy the Mime
var mindy = getCrusader("04b");
mindy.calculate = function() {
  crusaderSetup(mindy);
};

//////Slot 5
////The Washed Up Hermit
var hermit = getCrusader("05");
hermit.calculate = function() {
  crusaderSetup(hermit);
//Craziness
  if (hermit == app.dpsChar) {
    var noOneAhead = true;
    var adjacent = currentWorld.whatsAdjacent(hermit.spot);
    for (var i = 0; i < adjacent.length && noOneAhead; i++) {
      var adjCruId = formationIds[adjacent[i]];
      if (adjCruId && (currentWorld.columnNum(adjacent[i])==currentWorld.columnNum(hermit.spot)+1)) {
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
  crusaderSetup(kyle);
  var adjacent = currentWorld.whatsAdjacent(kyle.spot);
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
      if (adjCru.tags.includes("female")) {femaleAdjacent = true;}
      if (adjCru.tags.includes("leprechaun")) {leprechaunAdjacent = true;}
      if (adjCru.tags.includes("animal")) {animalAdjacent = true;}
      if (app.dpsChar && adjCruId == app.dpsChar.id) {dpsSmashed = true;}
      if (currentWorld.columnNum(kyle.spot) > currentWorld.columnNum(adjCru.spot)) {numBehind += 1;}
      if (currentWorld.columnNum(kyle.spot) < currentWorld.columnNum(adjCru.spot)) {numAhead += 1;}
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
  if (karen == app.dpsChar && !adjacent.includes(karen.spot) && numAdjacent <= 2) {
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
var draco = getCrusader("05b");
draco.calculate = function() {
  crusaderSetup(draco);
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
henry.calculate = function() {
  crusaderSetup(henry);
  if (henry == app.dpsChar) {
    var noOneBehind = true;
    henry.globalDPS *= currentWorld.filled - currentWorld.countTags('human');
    var adjacent = currentWorld.whatsAdjacent(henry.spot);
    for (var i = 0; i < adjacent.length && noOneBehind; i++) {
      if (currentWorld.columnNum(henry.spot) == currentWorld.columnNum(adjacent[i].spot) + 1) {noOneBehind = false;}
    }
    henry.globalDPS *= 1 + (currentWorld.spots - currentWorld.filled) * legendaryFactor(henry,2);
  }
  if (alan.spot != null) {
    henry.globalDPS *= 1 + legendaryFactor(henry,0);
  }
  henry.globalDPS *= 1 + 0.2 * (currentWorld.filled - currentWorld.countTags('human')) * legendaryFactor(henry,1);
};

//////Slot 6
////Detective Kaine
var kaine = getCrusader("06");
kaine.calculate = function() {
  crusaderSetup(kaine);
//A-Ha
  var numInColumn = currentWorld.columnTest(currentWorld.columnNum(kaine.spot));
  kaine.globalGold *= Math.pow(1 + 0.2 * itemAbility(kaine,0),numInColumn) || 1;
//Karen compatability for A-Ha
  if (karen.spot != null && (currentWorld.columnNum(kaine.spot)!=currentWorld.columnNum(karen.spot))) {
    kaine.globalGold *= (1 + 0.2*itemAbility(kaine,0)*0.5*itemAbility(karen,0)) || 1;
    karen.effects += 1;
  }
  if (nate.spot != null) {
    kaine.globalDPS *= 1 + legendaryFactor(kaine,0) || 1;
  }
  kaine.globalGold *= 1 + 0.25 * kaine.XP * legendaryFactor(kaine,1) || 1;
  kaine.globalGold *= 1 + 0.25 * currentWorld.countTags('gold') * legendaryFactor(kaine,2) || 1;
};

////Mister the Monkey
var mister = getCrusader("06a");
mister.calculate = function() {
  crusaderSetup(mister);
  var numAnimals = currentWorld.countTags('animal');
  var numBehind = currentWorld.columnTest(currentWorld.columnNum(mister.spot)-1);
  mister.globalGold *= Math.pow(1 + (0.15 + 0.05 * numAnimals) * itemAbility(mister,1) * (1 + legendaryFactor(mister,2)), numBehind);
  mister.globalDPS *= 1 + 0.25 * numBehind * legendaryFactor(mister,1);
  if (karen.spot != null && currentWorld.columnNum(karen.spot) != currentWorld.columnNum(mister.spot) - 1) {
    karen.effects += 1;
    mister.globalGold *= 1 + (0.15 + 0.05 * numAnimals) * itemAbility(mister,1) * (1 + legendaryFactor(mister,2)) * 0.5 * itemAbility(karen,0);
  }
  if (app.dpsChar && app.dpsChar.tags.includes('animal')) {
    mister.globalDPS *= 1 + legendaryFactor(mister,0);
  }
};

////Larry the Leprechaun
var larry = getCrusader("06b");
larry.calculate = function() {
  crusaderSetup(larry);
  var numAdjacent = 0;
  var adjacent = currentWorld.whatsAdjacent(larry.spot);
  for (var i = 0; i < adjacent.length; i++) {
    var adjCruId = app.formationIds[i];
    if (adjCruId != null) {numAdjacent += 1;}
  }
  larry.globalGold *= Math.pow( 1+ 0.1*1.25*itemAbility(larry,0)*(1 + legendaryFactor(larry,2)),numAdjacent);
  if (numAdjacent <= 3) {larry.globalDPS *= 2;}
  if (numAdjacent >= 6) {larry.globalGold *= 1.25;}
  larry.globalDPS *= 1 + 0.25 * currentWorld.countTags('magic') * legendaryFactor(larry,0);
  larry.globalDPS *= 1 + 0.5 * currentWorld.countTags('leprechaun') * legendaryFactor(larry,1);
  if (karen.spot != null && !adjacent.includes(karen.spot)) {
    larry.globalGold *= 1+ 0.1*1.25*itemAbility(larry,0)*(1 + legendaryFactor(larry,2)) * 0.5 * itemAbility(karen,0);
  }
};

////Bernard the Bartender
var bernard = getCrusader("06c");
bernard.calculate = function() {
  crusaderSetup(bernard);
  var numAdjacent = 0;
  var numFemales = currentWorld.countTags('female');
  var adjacent = currentWorld.whatsAdjacent(bernard.spot);
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
var princess = getCrusader("07");
princess.calculate = function() {
  crusaderSetup(princess);
//Ignite, Char, Conflagrate (Check if these multiply or add)
  princess.globalDPS *= Math.pow((1 + 0.1 * itemAbility(princess,2)),3);
  if (reginald.spot != null) {
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
  crusaderSetup(turkey);
  var adjacent = currentWorld.whatsAdjacent(turkey.spot);
  var numAdjacent = 0;
  var dpsZapped = false;
  adjacent.filter(f => f != null).map(adjSpot =>
  {
    numAdjacent += 1;
    if (app.dpsChar && app.dpsChar.spot == adjSpot) {dpsZapped = true;}
  });
  if (karen.spot != null && adjacent.includes(karen.spot)) {
    numAdjacent += 1;
  }
  if (numAdjacent <= 3 && dpsZapped) {
    turkey.globalDPS *= 1 + 0.2*itemAbility(turkey,1);
    turkey.globalDPS *= 1 + 0.5*itemAbility(turkey,1);
    turkey.globalDPS *= 1 + legendaryFactor(turkey,1);
    if (momma.spot != null && momma.turkeyApplied != true) {
      momma.globalDPS *= 1.5;
      momma.turkeyApplied = true;
    }
  } else if (numAdjacent <= 3 && app.dpsChar == karen) {
    turkey.globalDPS *= 1 + 0.2*itemAbility(turkey,1)*0.5*itemAbility(karen,0);
    turkey.globalDPS *= 1 + 0.5*itemAbility(turkey,1);
    turkey.globalDPS *= 1 + legendaryFactor(turkey,1);
    if (momma.spot != null && momma.turkeyApplied != true) {
      momma.globalDPS *= 1.5;
      momma.turkeyApplied = true;
    }
    karen.effects += 1;
  } else if (karen == app.dpsChar) {
    if (momma.spot != null && momma.turkeyApplied != true) {
      momma.globalDPS *= 1 + 0.5 * 0.5 * itemAbility(karen,0);
      momma.turkeyApplied = true;
      karen.effects += 1;
    }
    karen.effects += 1;
    turkey.globalDPS *= 1 + legendaryFactor(turkey,1) * 0.5 * itemAbility(karen,0);
  }
  globalDPS *= 1 + 0.25 * currentWorld.countTags('robot') * legendaryFactor(turkey,0);
  if (momma.spot != null) {
    globalDPS *= 1 + legendaryFactor(turkey,2);
  }
  if(app.dpsChar){
    app.dpsChar.zapped = dpsZapped;
  }
};

////Ranger Rayna
var rayna = getCrusader("07b");
rayna.calculate = function() {
  crusaderSetup(rayna);
  var numAnimals = currentWorld.countTags('animal');
  if (rayna == app.dpsChar) {
    rayna.globalDPS *= 1 + 0.2 * numAnimals * itemAbility(rayna,2) * (1 + legendaryFactor(rayna,0));
    if (numAnimals >= 4) {rayna.globalDPS *= 2;}
    if (littlefoot.spot != null) {
      rayna.globalDPS *= 1 + legendaryFactor(rayna,1);
    }
  }
  rayna.globalDPS *= 1 + 0.25 * currentWorld.countTags('animal') * legendaryFactor(rayna,2);
};


//////Slot 8
////Natalie Dragon
var natalie = getCrusader("08");
natalie.calculate = function() {
  crusaderSetup(natalie);
//Double Dragon
  if (nate.spot != null && natalie == app.dpsChar){
    natalie.globalDPS *= 1+2*itemAbility(nate,2);
  }
  if (app.dpsChar && app.dpsChar.tags.includes('female')) {
    natalie.globalDPS *= 1 + legendaryFactor(natalie,0);
  }
  natalie.globalGold *= 1 + 0.25 * currentWorld.countTags('human') * legendaryFactor(natalie,1);
  if (nate.spot != null) {
    natalie.globalDPS *= 1 + legendaryFactor(natalie,2);
  }
};

////Jack O'Lantern
var jack = getCrusader("08a");
jack.calculate = function() {
  crusaderSetup(jack);
  if (currentWorld.columnNum(jack.spot) == currentWorld.maxColumn) {
    jack.globalDPS *= 1 + 0.1 * numAttacking * itemAbility(jack,0) * (1 + legendaryFactor(jack,0));
    jack.globalGold *= 1 + 0.1 * numAttacking * legendaryFactor(jack,2);
  }
};

////President Billy Smithsonian
var billy = getCrusader("08b");
billy.calculate = function() {
  crusaderSetup(billy);
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
  crusaderSetup(karl);
  karl.globalDPS *= 1.2;
  if (countShots) {karl.globalDPS *= 1 + 2 * itemAbility(karl,2) * (1 + legendaryFactor(karl,2)) / 5;}
  if (cindy.spot != null) {karl.globalGold *= 1.2;}
  karl.globalDPS *= 1 + 0.5 * currentWorld.countTags('orc') * legendaryFactor(karl,0);
  karl.globalDPS *= 1 + 0.5 * currentWorld.countTags('elf') * legendaryFactor(karl,1);
};

//////Slot 9
////Jason
var jason = getCrusader("09");
jason.calculate = function() {
  crusaderSetup(jason);
  if (currentWorld.columnNum(jason.spot) == currentWorld.maxColumn && jason == app.dpsChar && numAttacking > 0) {
    jason.globalDPS *= 1 + 4 * (1 + legendaryFactor(jason,2));
  }
  if (emo.spot != null) {
    jason.globalDPS *= 1 + legendaryFactor(jason,0);
  }
  if (numAttacking > 0) {
    jason.globalGold *= 1 + legendaryFactor(jason,1);
  }
};

////Pete the Carney
var pete = getCrusader('09a');
pete.calculate = function() {
  crusaderSetup(pete);
  var numJoked = 0;
  var distances = currentWorld.findDistances(pete.spot);
  var maxDistance = Math.max.apply(null, distances);
  if (app.dpsChar && distances[app.dpsChar.spot] == maxDistance) {
    pete.globalDPS *= 1 + 0.5 * itemAbility(pete,0) * (1 + legendaryFactor(pete,0));
  }
  if (karen.spot != null && distances[karen.spot] != maxDistance) {
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
  pete.globalGold *= 1 + 0.1 * (currentWorld.filled - numJoked) * legendaryFactor(pete,2);
};

////Broot
var broot = getCrusader('09b');
broot.calculate = function() {
  crusaderSetup(broot);
  var maxColumn = currentWorld.maxColumn;
  var adjacent = currentWorld.whatsAdjacent(broot.spot);
  if (currentWorld.columnNum(broot.spot) == maxColumn) {
    if (robbie == app.dpsChar) {broot.globalDPS *= 1 + 0.25 * itemAbility(robbie,2);
    } else {
      broot.globalDPS *= 1.25;
    }
    if (numAttacking > 0) {
      broot.globalDPS *= 1 + legendaryFactor(broot,0);
    }
  }
  if (robbie == app.dpsChar) {
    if (currentWorld.columnNum(broot.spot) > currentWorld.columnNum(robbie.spot)) {
      broot.globalDPS *= 1 + itemAbility(robbie,2);
    }
    if (adjacent.includes(robbie.spot)) {
      broot.globalDPS *= 1 + itemAbility(robbie,2);
    }
  }
  if (robbie.spot != null) {
    broot.globalDPS *= 1 + legendaryFactor(broot,1);
  }
  broot.globalDPS *= 1 + 0.25 * currentWorld.countTags('animal') * legendaryFactor(broot,2);
};

////Paul the Pilgrim
var paul = getCrusader('09c');
paul.calculate = function() {
  crusaderSetup(paul);
  var petraBonus = 0;
  if (petra.spot != null) {
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
  crusaderSetup(lion);
  var numRoared = 0;
  if (app.dpsChar && currentWorld.columnNum(lion.spot)==currentWorld.columnNum(app.dpsChar.spot)-1) {
    lion.globalDPS *= 1 + 0.5 * itemAbility(lion,1) * (1 + legendaryFactor(lion,0));
  }
  for (var i in formationIds) {
    if (currentWorld.columnNum(i) == currentWorld.columnNum(lion.spot) + 1) {
      numRoared += 1;
    }
  }
  if (karen.spot != null && currentWorld.columnNum(karen.spot) != currentWorld.columnNum(lion.spot) + 1) {
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
  crusaderSetup(drizzle);
  var adjacent = currentWorld.whatsAdjacent(drizzle.spot);
  if (adjacent && app.dpsChar && adjacent.includes(app.dpsChar.spot)) {
    drizzle.globalDPS *= 1 + 0.2 * itemAbility(drizzle,1);
  }
  if (karen.spot != null && karen == app.dpsChar && !adjacent.includes(karen.spot)) {
    drizzle.globalDPS *= 1 + 0.2 * itemAbility(drizzle,1) * 0.5 * itemAbility(karen,0);
    karen.effects += 1;
  }
  if (karen.spot != null && currentWorld.columnNum(drizzle.spot) < currentWorld.columnNum(groklok.spot) && currentWorld.columnNum(karen.spot) != currentWorld.columnNum(groklok.spot)) {
    karen.effects += 1;
  }
  if (groklok == app.dpsChar && currentWorld.columnNum(drizzle.spot) == currentWorld.columnNum(groklok.spot)) {
    drizzle.globalDPS *= 5;
  }
  drizzle.globalDPS *= 1 + 0.5 * currentWorld.countTags('orc') * legendaryFactor(drizzle,0);
  drizzle.globalDPS *= 1 + 0.25 * currentWorld.countTags('elf') * legendaryFactor(drizzle,1);
  if (groklok.spot != null) {
    drizzle.globalDPS *= 1 + legendaryFactor(drizzle,2);
  }
};

////Bubba, the Swimming Orc
var bubba = getCrusader('10b');
bubba.calculate = function() {
  crusaderSetup(bubba);
  var adjacent = currentWorld.whatsAdjacent(bubba.spot);
  var numAdjacent = 0;
  for (var i = 0; i < adjacent.length; i++) {
    var adjCruId = app.formationIds[adjacent[i]];
    if (adjCruId) {
      numAdjacent += 1;
    }
  }
  if (app.dpsChar && currentWorld.columnNum(bubba.spot) - 1 == currentWorld.columnNum(app.dpsChar.spot)) {
    bubba.globalDPS *= 1 + 0.25 * numAdjacent * itemAbility(bubba,1) * (1 + legendaryFactor(bubba,0));
  } else if (karen.spot != null && karen == app.dpsChar) {
    bubba.globalDPS *= 1 + 0.25 * numAdjacent * itemAbility(bubba,1) * (1 + legendaryFactor(bubba,0)) * 0.5 * itemAbility(karen,0);
    karen.effects += 1;
  }
  for (i = 0; i < currentWorld.spots; i++) {
    var cruId = app.formationIds[i];
    if (cruId && currentWorld.columnNum(i) < currentWorld.columnNum(bubba.spot) - 1 && cruId != karen.id) {
      bubba.globalGold *= 1+ 0.1 * (1 + legendaryFactor(bubba,1));
    }
  }
  if (karen.spot != null) {
    bubba.globalGold *= 1+ 0.1 * (1 + legendaryFactor(bubba,1)) * 0.5 * itemAbility(karen,0);
    karen.effects += 1;
  }
  bubba.globalDPS *= 1 + 0.5 * currentWorld.countTags('orc') * legendaryFactor(bubba,2);
};

////Sisaron the Dragon Sorceress
var sisaron = getCrusader('10c');
sisaron.calculate = function() {
  crusaderSetup(sisaron);
  var adjacent = currentWorld.whatsAdjacent(sisaron.spot);
  var numAdjacent = 0;
  var magicModifier = 1;
  for (var i = 0; i < adjacent.length; i++) {
    var adjCruId = app.formationIds[adjacent[i]];
    if (adjCruId) {
      numAdjacent += 1;
    }
  }
  if (numAdjacent == 4) {magicModifier = 4}
  if (adjacent && app.dpsChar && adjacent.includes(app.dpsChar.spot)) {
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
  crusaderSetup(khouri);
//Koffee Potion
  var adjacent = currentWorld.whatsAdjacent(khouri.spot);
  if (app.dpsChar && adjacent.includes(app.dpsChar.spot)) {
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
  if (app.dpsChar && currentWorld.columnNum(khouri.spot) == currentWorld.columnNum(app.dpsChar.spot) - 1) {
    khouri.globalDPS *= 1 + legendaryFactor(khouri,2);
  }
  if (karen == app.dpsChar && currentWorld.columnNum(khouri.spot) != currentWorld.columnNum(karen.spot) - 1) {
    karen.effects += 1;
  }
};

////Momma Kaine
var momma = getCrusader('11a');
momma.calculate = function() {
  crusaderSetup(momma);
  var distances = currentWorld.findDistances(momma.spot);
  var maxDistance = Math.max.apply(null, distances);
  if (turkey.spot != null) {
    momma.globalDPS *= 1 + legendaryFactor(momma,1);
  }
  if (app.dpsChar && app.dpsChar.tags.includes('robot')) {
    momma.globalDPS *= 1 + legendaryFactor(momma,2);
  }
  if (karen.spot != null && !turkey.spot != null) {
    momma.globalDPS *= 1 + 0.5 * 0.5 * itemAbility(karen,0);
    karen.effects += 1;
  }
  if (karen.spot != null && distances[karen.spot] != maxDistance) {
    karen.effects += 1;
  }
};

////Brogon, Prince of Dragons
var brogon = getCrusader('11a');
brogon.calculate = function() {
  crusaderSetup(brogon);
  var adjacent = currentWorld.whatsAdjacent(brogon.spot);
  var numAdjacent = 0;
  var numRoyal = currentWorld.countTags('royal');
  if (app.dpsChar && currentWorld.columnNum(brogon.spot) == currentWorld.columnNum(app.dpsChar.spot)) {
    brogon.globalDPS *= 1 + 0.2 * itemAbility(brogon,1) * numRoyal * (1 + legendaryFactor(brogon,0));
  } else if (karen == app.dpsChar) {
    brogon.globalDPS *= 1 + 0.2 * itemAbility(brogon,1) * numRoyal * (1 + legendaryFactor(brogon,0)) * 0.5 * itemAbility(karen,0);
    karen.effects += 1;
  }
  if (karen == app.dpsChar && !adjacent.includes(karen.spot)) {
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
  crusaderSetup(halfblood);
  var adjacent = currentWorld.whatsAdjacent(halfblood.spot);
  if (app.dpsChar && !app.dpsChar.tags.includes('human')) {
    if (adjacent.includes(app.dpsChar.spot)) {
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
  crusaderSetup(foresight);
  var adjacent = currentWorld.whatsAdjacent(foresight.spot);
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
  if (humansAdj < nonHumansAdj) {
    foresight.globalDPS *= Math.pow(1 + 0.1 * legendaryFactor(foresight,0),currentWorld.filled - currentWorld.countTags('human'));
    foresight.globalGold *= Math.pow(1 + 0.05 * legendaryFactor(foresight,1),currentWorld.filled - currentWorld.countTags('human'));
  } else if (karen.spot != null) {
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
  crusaderSetup(gryphon);
  if (app.dpsChar && currentWorld.columnNum(app.dpsChar.spot) == currentWorld.columnNum(gryphon.spot) + 1) {
    gryphon.globalDPS *= 1 + legendaryFactor(gryphon,0);
  }
  gryphon.globalDPS *= 1 + 0.1 * monstersOnscreen * legendaryFactor(gryphon,1);
  if (app.dpsChar && app.dpsChar.tags.includes('supernatural')) {
    gryphon.globalDPS *= 1 + legendaryFactor(gryphon,2);
  }
  if (app.dpsChar && karen == app.dpsChar && currentWorld.columnNum(app.dpsChar.spot) != currentWorld.columnNum(gryphon.spot) + 1) {
    gryphon.globalDPS *= 1 + legendaryFactor(gryphon,0);
    karen.effects += 1;
  }
};

////Rocky the Rockstar
var rocky = getCrusader('12a');
rocky.calculate = function() {
  crusaderSetup(rocky);
  var adjacent = currentWorld.whatsAdjacent(rocky.spot);
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
  crusaderSetup(montana);
  if (app.dpsChar && app.dpsChar.tags.includes('animal')) {
    montana.globalDPS *= 1.5;
  }
  if (princess.spot != null) {
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
  crusaderSetup(helper);
  if (underAttack && currentWorld.columnNum(helper.spot) == currentWorld.maxColumn) {
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
  if (karen == app.dpsChar && currentWorld.columnNum(karen.spot) != currentWorld.columnNum(helper.spot)) {
    karen.effects += 1;
  }
};

//////Slot 13
////Sarah, the Collector
var sarah = getCrusader("13");
sarah.calculate = function() {
  crusaderSetup(sarah);
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
  crusaderSetup(soldierette);
  if (soldierette == app.dpsChar) {
    if (currentWorld.columnNum(soldierette.spot) == currentWorld.maxColumn) {
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
  crusaderSetup(snickette);
  var adjacent = currentWorld.whatsAdjacent(snickette.spot);
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
    if (app.dpsChar && adjacent.includes(app.dpsChar.spot)) {
      snickette.globalDPS *= 1 + 0.5 * itemAbility(snickette,1);
    } else if (karen == app.dpsChar) {
      snickette.globalDPS *= 1 + 0.5 * itemAbility(snickette,1) * 0.5 * itemAbility(karen,0);
      karen.effects += 1;
    }
  }
  if (app.dpsChar && currentWorld.columnNum(app.dpsChar.spot) == currentWorld.columnNum(snickette.spot)) {
    snickette.globalDPS *= 1 + legendaryFactor(snickette,0);
  }
  snickette.globalGold *= 1 + 0.1 * currentWorld.countTags('human') * legendaryFactor(snickette,1);
  if (larry.spot != null) {
    snickette.globalDPS *= 1 + legendaryFactor(snickette,2);
  }
};

//////Slot 14
////Gold panda
var panda = getCrusader("14");
panda.calculate = function() {
  crusaderSetup(panda);
  if (numAttacking === 0) {
    panda.globalGold *= 1 + legendaryFactor(panda,2);
  }
};

////RoboSanta
var santa = getCrusader('14a');
santa.calculate = function() {
  crusaderSetup(santa);
  var adjacent = currentWorld.whatsAdjacent(santa.spot);
  var numAhead = currentWorld.columnTest(currentWorld.columnNum(santa.spot)+1);
  santa.globalGold *= Math.pow(1 + 0.25 * itemAbility(santa,0) * (1 + legendaryFactor(santa,0)),numAhead);
  if (karen.spot != null && currentWorld.columnNum(santa.spot)+1 != currentWorld.columnNum(karen.spot)) {
    santa.globalDPS *= 1 + 0.25 * itemAbility(santa,0) * (1 + legendaryFactor(santa,0)) * 0.5 * itemAbility(karen,0);
    karen.effects += 1;
  }
  if (app.dpsChar && adjacent.includes(app.dpsChar.spot)) {
    santa.globalDPS *= 1 + legendaryFactor(santa,1);
  }
  santa.globalGold *= 1 + 0.1 * currentWorld.countTags('robot') * legendaryFactor(santa,2);
};

////Leerion, the Royal Dwarf
var leerion = getCrusader('14b');
leerion.calculate = function() {
  crusaderSetup(leerion);
  leerion.globalGold *= 1 + (0.25 + 0.1 * currentWorld.countTags('female') + 0.15 * currentWorld.countTags('royal')) * itemAbility(leerion,2) * (1 + legendaryFactor(leerion,0));
  leerion.globalDPS *= 1 + 0.25 * currentWorld.countTags('female') * legendaryFactor(leerion,1);
  if (sasha.spot != null) {
    leerion.globalDPS *= 1 + legendaryFactor(leerion,2);
  }
};

////Katie the Cupid
var katie = getCrusader('14c');
katie.calculate = function() {
  crusaderSetup(katie);
  var animalsAdj = 0;
  var humansAdj = 0;
  var femalesAdj = 0;
  var malesAdj = 0;
  var boost = 0.3 * itemAbility(katie,2);
  var adjacent = currentWorld.whatsAdjacent(katie.spot);
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
  crusaderSetup(sal);
  var adjacent = currentWorld.whatsAdjacent(sal.spot);
  var numAdjacent = 0;
  if (sal == app.dpsChar) {
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
  crusaderSetup(wendy);
  var columnsAhead = currentWorld.maxColumn - currentWorld.columnNum(wendy.spot);
  if (wendy == app.dpsChar) {
    wendy.globalDPS *= 1 + 0.25 * monstersOnscreen * (1 + legendaryFactor(wendy,1));
    wendy.globalDPS *= 1 + 0.5 * currentWorld.countTags('magic') * legendaryFactor(wendy,0);
    wendy.globalDPS *= 1 + 0.25 * columnsAhead * legendaryFactor(wendy,2);
  }
};

////Robbie Raccoon
var robbie = getCrusader('15b');
robbie.calculate = function() {
  crusaderSetup(robbie);
  if (robbie == app.dpsChar) {
    if (broot.spot != null) {
      robbie.globalDPS *= 1 + legendaryFactor(robbie,0);
    }
    robbie.globalDPS *= 1 + 0.5 * currentWorld.countTags('tank') * legendaryFactor(robbie,1);
    robbie.globalDPS *= 1 + 0.1 * monstersOnscreen * legendaryFactor(robbie,2);
  }
};

////Princess Val the Mermain
var val = getCrusader('15c');
val.calculate = function() {
  crusaderSetup(val);
  var adjacent = currentWorld.whatsAdjacent(val.spot);
  if (currentWorld.countTags('animal') > currentWorld.countTags('human')) {
    val.globalDPS *= 1 + 0.5 * itemAbility(val,2) * (1 + legendaryFactor(val,0));
  }
  if (app.dpsChar && app.dpsChar.tags.includes('royal')) {
    val.globalDPS *= 1 + legendaryFactor(val,1);
  }
  val.globalDPS *= 1 + 0.25 * (currentWorld.filled - currentWorld.countTags('human')) * legendaryFactor(val,2);
  if (karen == app.dpsChar && !adjacent.includes(karen.spot)) {
    karen.effects += 1;
  }
};

//////Slot 16
////Fire Phoenix
var phoenix = getCrusader("16");
phoenix.calculate = function() {
  crusaderSetup(phoenix);
  phoenix.globalDPS *= 1 + 0.25 * currentWorld.countTags('supernatural') * legendaryFactor(phoenix,0);
  if (app.dpsChar && app.dpsChar.tags.includes('supernatural')) {
    phoenix.globalDPS *= 1 + legendaryFactor(phoenix,2);
  }
};

////Alan the ArchAngel
var alan = getCrusader('16a');
alan.calculate = function() {
  crusaderSetup(alan);
  var adjacent = currentWorld.whatsAdjacent(alan.spot);
  alan.globalDPS *= 1 + 0.5 * currentWorld.countTags('angel') *legendaryFactor(alan,2);
  if (karen == app.dpsChar && !adjacent.includes(karen.spot)) {
    karen.effects += 2;
  }
};

////Fright-o-Tron
var fright = getCrusader('16b');
fright.calculate = function() {
  crusaderSetup(fright);
  fright.globalDPS *= 1/(1-0.15*itemAbility(fright,2));
  fright.globalDPS *= 1 + 0.5 * currentWorld.countTags('robot') * legendaryFactor(fright,0);
  if (turkey.spot != null) {
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
  crusaderSetup(reginald);
  if (app.dpsChar && app.dpsChar.tags.includes('royal')) {
    reginald.globalDPS *= 1 + 2 * itemAbility(reginald,2) * (1 + legendaryFactor(reginald,1));
  }
  reginald.globalDPS *= 1 + 0.25 * currentWorld.countTags('royal') * legendaryFactor(reginald,0);
};

////Queen Siri
var siri = getCrusader('17a');
siri.calculate = function() {
  crusaderSetup(siri);
  if (app.dpsChar && app.dpsChar.tags.includes('female')) {
    siri.globalDPS *= 1 + 1 * itemAbility(siri,2);
    siri.globalDPS *= 1 + legendaryFactor(siri,0);
  }
  if (thalia.spot != null) {
    siri.globalDPS *= 1 + legendaryFactor(siri,1);
  }
  if (currentWorld.countTags('female') > currentWorld.countTags('male')) {
    siri.globalDPS *= 1 + legendaryFactor(siri,2);
  }
};

////Mr. Boggins, the Substitute
var boggins = getCrusader('17b');
boggins.calculate = function() {
  crusaderSetup(boggins);
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
  crusaderSetup(squiggles);
  var adjacent = currentWorld.whatsAdjacent(squiggles.spot);
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
    if (pete.spot != null) {
      squiggles.globalDPS *= 1 + legendaryFactor(squiggles,2);
    }
  }

};

//////Slot 18
////Thalia, the Thunder King
var thalia = getCrusader("18");
thalia.calculate = function() {
  crusaderSetup(thalia);
  if (app.dpsChar && app.dpsChar.tags.includes('royal')) {
    thalia.globalDPS *= 1 + legendaryFactor(thalia,1);
  }
};

////Frosty the Snowman
var frosty = getCrusader('18a');
frosty.calculate = function() {
  crusaderSetup(frosty);
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
    if (karen.spot != null && !adjacent.includes(karen.spot)) {
      karen.effects += 1;
      numAdjacent += 1;
    }
    frosty.globalDPS *= 1 + numAdjacent;
    frosty.globalDPS *= 1 + 0.25 *numAdjacent * legendaryFactor(frosty,2);
  }
  if (app.dpsChar && adjacent.includes(app.dpsChar.spot)) {
    frosty.globalDPS *= 0.75;
  } else if (karen == app.dpsChar) {
    frosty.globalDPS *= 1 - 0.25 * 0.5 * itemAbility(karen,0);
  }
};

////Littlefoot
var littlefoot = getCrusader('18b');
littlefoot.calculate = function() {
  crusaderSetup(littlefoot);
  littlefoot.globalDPS *= 1 + 0.1 *littlefootXP * itemAbility(littlefoot,1) * (1 + legendaryFactor(littlefoot,0));
  if (currentWorld.columnNum(littlefoot.spot) == currentWorld.maxColumn) {
    littlefoot.globalDPS *= 1 + 0.1 * numAttacking * legendaryFactor(littlefoot,2);
  }
};

////Cindy the Cheer-Orc
var cindy = getCrusader('18c');
cindy.calculate = function() {
  crusaderSetup(cindy);
  var distances = currentWorld.findDistances(cindy.spot);
  var distance = app.dpsChar && distances[app.dpsChar.spot];
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
  crusaderSetup(merci);
  merci.globalDPS *= 1 + Math.min(0.025 * monstersOnscreen * itemAbility(merci,0) * (1 + legendaryFactor(merci,1)), 1 + legendaryFactor(merci,2)) * monstersOnscreen;
  if (app.dpsChar && app.dpsChar.tags.includes('magic')) {
    merci.globalDPS *= 1 + legendaryFactor(merci,0);
  }
};

////The Bat Billionaire
var bat = getCrusader('19a');
bat.calculate = function() {
  crusaderSetup(bat);
};

////Petra The Pilgrim
var petra = getCrusader('19b');
petra.calculate = function() {
  crusaderSetup(petra);
  var adjacent = currentWorld.whatsAdjacent(petra.spot);
  var paulMult = 1;
  if (paul.spot != null) {paulMult = 1.5;}
  if (petra == app.dpsChar) {
    petra.globalDPS *= 1 + 0.5 * currentWorld.countTags('elf') * paulMult * itemAbility(petra,0);
    if (paul.spot != null && adjacent.includes(paul.spot)) {
      petra.globalDPS *= 1 + 2 * paulMult;
    }
  }
};

//////Slot 20
////Nate Dragon
var nate = getCrusader("20");
nate.calculate = function({nateXP=0} = {}) {
  crusaderSetup(nate);
//Double Dragon
  if (natalie.spot != null && nate == app.dpsChar){
    nate.globalDPS *= 1+2*itemAbility(nate,2);
  }
  if (natalie.spot != null) {
    nate.globalDPS *= 1 + legendaryFactor(nate,0);
  }
  nate.globalDPS *= 1 + 0.25 * currentWorld.countTags('male') * legendaryFactor(nate,1);
  if(nateXP)
    nate.globalDPS *= 1 + 0.1 * nateXP * legendaryFactor(nate,2);
};

////Kizlblyp the Alien Traitor
var kiz = getCrusader('20a');
kiz.calculate = function() {
  crusaderSetup(kiz);
  if (kiz == app.dpsChar) {
    kiz.globalDPS *= 1 + 0.2 * itemAbility(kiz,0) * currentWorld.countTags('male');
    kiz.globalDPS *= 1 + 0.25 * (currentWorld.filled - currentWorld.countTags('human')) * legendaryFactor(kiz,0);
    if (billy.spot != null) {
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
  crusaderSetup(rudolph);
  var adjacent = currentWorld.whatsAdjacent(rudolph.spot);
  var robotAdj = false;
  if (rudolph == app.dpsChar) {
    for (var i = 0; i < adjacent.length; i++) {
      if (Formation[adjacent[i]].tags.includes('robot')) {
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
  crusaderSetup(exterminator);
  var adjacent = currentWorld.whatsAdjacent(rudolph.spot);
  var robotsAdj = 0;
  for (var i = 0; i < adjacent.length; i++) {
    if (Formation[adjacent[i]].tags.includes('robot')) {
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
  crusaderSetup(gloria);
  var adjacent = currentWorld.whatsAdjacent(gloria.spot);
  if (karen == app.dpsChar) {
    gloria.globalDPS *= 1 + 0.5 * 0.5 * itemAbility(karen,0);
    karen.effects += 1;
    if (app.dpsChar && currentWorld.columnNum(app.dpsChar.spot) != currentWorld.columnNum(gloria.spot) + 1) {
      karen.effects += 1;
    }
  } else if (app.dpsChar && currentWorld.columnNum(app.dpsChar.spot) != currentWorld.columnNum(gloria.spot) + 1) {
    gloria.globalDPS *= 1.5;
  }
  if (app.dpsChar && adjacent.includes(app.dpsChar.spot)) {
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
  crusaderSetup(shadow);
  var jasonMult = 1;
  var adjacent = currentWorld.whatsAdjacent(shadow.spot);
  var numAdjacent = 0;
  if (app.dpsChar && adjacent.includes(app.dpsChar.spot)) {
    for (var i = 0; i < adjacent.length; i++) {
      var adjCruId = app.formationIds[adjacent[i]];
      if (adjCruId) {
        numAdjacent += 1;
      }
    }
    if (karen.spot != null && !adjacent.includes(karen.spot)) {
      numAdjacent += 1;
      karen.effects += 1;
    }
    if (jason.spot != null && adjacent.includes(jason.spot)) {
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
  crusaderSetup(ilsa);
  var adjacent = currentWorld.whatsAdjacent(ilsa.spot);
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
  if (ilsa == app.dpsChar) {
    ilsa.globalDPS *= 1 + (0.5 + currentWorld.countTags('magical'))*itemAbility(ilsa,0);
    if (merci.spot != null) {
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
  if (app.dpsChar && adjacent.includes(app.dpsChar.spot)) {
    ilsa.globalDPS *= 0.5 + 1 * magicMult / correction;
  } else if (karen == app.dpsChar) {
  }
  if (merci.spot != null && ilsa == app.dpsChar) {
    ilsa.globalDPS *= 1 + legendaryFactor(ilsa,1);
  }
};

//////Slot 23
////GreySkull, the Pirate
var greyskull = getCrusader('23');
greyskull.calculate = function() {
  crusaderSetup(greyskull);
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
  crusaderSetup(eiralon);
  var adjacent = currentWorld.whatsAdjacent(eiralon.spot);
  eiralon.globalDPS *= 1 + 0.5 * itemAbility(eiralon,0);
  if (app.dpsChar && currentWorld.columnNum(eiralon.spot) == currentWorld.columnNum(app.dpsChar.spot)) {
    eiralon.globalDPS *= 1 + 1 * itemAbility(eiralon,0);
  } else if (karen == app.dpsChar) {
    eiralon.globalDPS *= 1 + 1 * itemAbility(eiralon,0) * 0.5 * itemAbility(karen,0);
    karen.effects += 1;
  }
  eiralon.globalDPS *= 1 + currentWorld.countTags('healer') *legendaryFactor(eiralon,0);
  eiralon.globalDPS *= 1 + 0.5 * currentWorld.countTags('magic') * legendaryFactor(eiralon,1);
  if (app.dpsChar && adjacent.includes(app.dpsChar.spot)) {
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
      return adjacent[spot] || {};
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

  app.setDPS = function (name, id) {
    var crusader = name != null ? jsonData.crusaders.find(c => c.displayName == name) : getCrusader(id);
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
  app.calculateMultipliers = () => {
    var globalDPS = 1;
    var globalGold = 1;
    app.jsonData.crusaders
      .filter(cru => app.formationIds.includes(cru.id))
      .map(f => {
        crusaderSetup(f);
        if(f.calculate)
          try
          {
            f.calculate();
          } catch(ex){
            console.error('failed to calculate for ', f);
            if(app.throw === true)
              throw ex;
          }

        console.log('formation calculate', globalDPS, f);
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
})(window)
