(app =>
{
  var dpsChar;
  app.getCrusader = id => {return app.jsonData.crusaders.find(function(c){ return c.id == id; }); };

  app.crusaderSetup = crusader => {
  if (!crusader.setup) {
    if (!crusader.globalDPS) {crusader.globalDPS = 1;}
    if (!crusader.globalGold) {crusader.globalGold = 1;}
    if (!crusader.critChance) {crusader.critChance = 0;}
    for (var i in crusader.gear) {
      switch (crusader.gear[i]) {
        case "clickCrit":
          crusader.critChance += itemCrit(crusader,i);
          break;
        case "alldps":
          crusader.globalDPS *= itemDPS(crusader,i) || 1;
          break;
        case "gold":
          crusader.globalGold *= itemGold(crusader,i);
          break;
        case "selfdps":
          if (crusader.isDPS) {crusader.globalDPS *= itemSelfDPS(crusader,i) || 1;}
          break;
      }
    }
    crusader.setup = true;
  }
};

function itemDPS(rarity) {
  switch(rarity){
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

function itemSelfDPS(crusader,gearSlot) {
  switch(appGameState.crusaderGear[crusader.id]["slot"+gearSlot.toString()]){
    case 1:
      return 1.25;
    case 2:
      return 1.5;
    case 3:
      return 2;
    case 4:
      return 5;
    case "Golden Epic":
      return 7;
    case 5:
      return 9;
    case "Golden Legendary":
      return 13;
    default:
      return 1;
  }
}
var getGear = (cruId,gearSlot) => 
  app.crusaderGear && 
  app.crusaderGear[cruId] && 
  app.crusaderGear[cruId]["s"+ gearSlot.toString()];

function itemGold(crusader,gearSlot) {
  switch(getGear(crusader.id,gearSlot)){
    case 1:
      return 1.1;
    case 2:
      return 1.25;
    case 3:
      return 1.5;
    case 4:
      return 2;
    case "Golden Epic":
      return 2.5;
    case 5:
      return 3;
    case "Golden Legendary":
      return 4;
    default:
      return 1;
  }
}

function itemCrit(crusader,gearSlot) {
  switch(getGear(crusader.id,gearSlot)){
    case 1:
      return 1;
    case 2:
      return 2;
    case 3:
      return 3;
    case 4:
      return 4;
    case "Golden Epic":
      return 6;
    case 5:
      return 8;
    case "Golden Legendary":
      return 12;      
    default:
      return 0;
  }
}

function itemAbility(crusader,gearSlot) {
  switch(getGear(crusader.id,gearSlot)){
    case 1:
      return 1.1;
    case 2:
      return 1.25;
    case 3:
      return 1.5;
    case 4:
      return 2;
    case "Golden Epic":
      return 2.5;
    case 5:
      return 3;
    case "Golden Legendary":
      return 4;      
    default:
      return 1;
  }
}

function itemGreyShots(crusader,gearSlot) {
  switch(getGear(crusader.id,gearSlot)){
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

///////// Formation Calculations
//////Slot 1
////bushwhacker
var bushwhacker = getCrusader("01");
bushwhacker.calculate = function() {
  crusaderSetup(bushwhacker);
};

////RoboRabbit
var rabbit = getCrusader("01a");
rabbit.calculate = function() {
  crusaderSetup(rabbit);
  if (rabbit.clicking) {
    rabbit.globalDPS *= 1 + 0.25*itemAbility(rabbit,2);
  }
};

////Graham
var graham = getCrusader("01b");
graham.calculate = function() {
  crusaderSetup(graham);
  graham.globalDPS *= 1.01;
  if (graham.stopped) {
    graham.globalDPS *= 1 + 0.5 * itemAbility(graham,2);
  }
};

//////Slot 2
////Jim
var jim = getCrusader("02");
jim.calculate = function() {
  crusaderSetup(jim);
//Self Buff
  if (jim.isDPS) {
    var adjacent = currentWorld.whatsAdjacent(jim.spot);
    for (var i=0; i<adjacent.length; i++) {
      if (formation[adjacent[i]].inFormation)
        jim.globalDPS *= 2;
        break;
    }
  }
//Column Buff
  for (var j in formation) {
    if (formation[j] && formation[j].isDPS) {
      if (currentWorld.columnNum(jim.spot) == currentWorld.columnNum(dpsChar.spot)) {
        jim.globalDPS *= 1.5;
      }
    }
  }
};

////Pam
var pam = getCrusader("02a");
pam.calculate = function() { 
  crusaderSetup(pam);
  pam.numInColumn = 0;
  pam.dpsInColumn = false;
//Focused Teamwork  
  for (var j in formation) {
    if (currentWorld.columnNum(pam.spot) == currentWorld.columnNum(formation[j].spot)){
      pam.numInColumn += 1;
      if (formation[j].isDPS) {
        pam.dpsInColumn = true;
      }
    }
  }
  if (pam.numInColumn == 2 && pam.dpsInColumn) {
    pam.globalDPS *= 1 + 1 * itemAbility(pam,1);
  }
//Co-Pilot  
  if (pam.isDPS) {
    var adjacent = currentWorld.whatsAdjacent(pam.spot)
    for (var i = 0; i<adjacent.length; i++ ) {
      if (formation[adjacent[i]].inFormation)
        pam.globalDPS *= 2;
        break;
    }    
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
    if (formation[adjacent[j]] && formation[adjacent[j]].isDPS) {
      dpsAffected = true;
    }
  }
  if (currentWorld.columnNum(veronica.spot) == currentWorld.columnNum(dpsChar.spot)) {
    dpsAffected = true;
  }
  if (dpsAffected) {
    veronica.globalDPS *= 1 + 0.25 * (2+currentWorld.countTags("robot"))*itemAbility(veronica,0);
  }
};

//////Slot 3
////Emo Werewolf 
var emo = getCrusader("03");
emo.test = "test";
emo.calculate = function() {
  crusaderSetup(emo);
//Conditional Self Buff
  if (emo.isDPS) {
    var noHumansAdjacent = true;
    var adjacent = currentWorld.whatsAdjacent(emo.spot);
    for (var i = 0; i<adjacent.length; i++) {
      if (formation[adjacent[i]] && formation[adjacent[i]].tags.includes("human")) {
        noHumansAdjacent = false;
      }
    }
    if (noHumansAdjacent) {
      emo.globalDPS *= 3;
    }
  }
};

////Sally the Succubus
var sally = getCrusader("03a");
sally.calculate = function() {
  crusaderSetup(sally);
  if (dpsChar.tags.includes("female")) {
    sally.globalDPS *= 1.2;
  }
  if (sally.isDPS) {
    var femalesAdjacent = 0;
    var adjacent = currentWorld.whatsAdjacent(sally.spot);
    for (var i = 0 ; i < adjacent.length; i++ ) {
      if (formation[adjacent[i]] && formation[adjacent[i]].tags.includes("female")) {
        femalesAdjacent += 1;
      }
    }
    sally.globalDPS *= 4 - 0.25 * femalesAdjacent;
  }
};

////Karen, the Cat Teenager
var karen = getCrusader("03b");
karen.calculate = function() {
  crusaderSetup(karen);
};

//////Slot 4
////Sasha the Fierce Warrior
var sasha = getCrusader("04");
sasha.calculate = function() {
  crusaderSetup(sasha);
  if (currentWorld.columnNum[sasha.spot]==currentWorld.columnNum[dpsChar.spot]+1) {
    sasha.globalDPS *=1 + 0.3*itemAbility(sasha,1);
  }
};

////Groklok the Orc
var groklok = getCrusader("04a");
groklok.calculate = function() {
  crusaderSetup(groklok);
//Eligible Receivers  
  if (currentWorld.columnNum[groklok.spot]==currentWorld.columnNum[dpsChar.spot]-1) {
    var numAffected = currentWorld.columnTest(currentWorld.columnNum[dpsChar.spot]);
    var drizzleMult = 1;
    if (drizzle.inFormation && currentWorld.columnNum(drizzle.spot) > currentWorld.columnNum(groklok.spot)) {
      drizzleMult = 2; 
    }
    groklok.globalDPS *= 1.5 * drizzleMult * itemAbility(groklok,0) / numAffected;
  }
//Gunslinger  
  if (groklok.isDPS && currentWorld.filled < currentWorld.spots) {
    groklok.globalDPS *= 2.5;
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
  if (hermit.isDPS) {
    var noOneAhead = true;
    var adjacent = currentWorld.whatsAdjacent(hermit.spot);
    for (var i = 0; i < adjacent.length && noOneAhead; i++) {
      if (formation[adjacent[i]] && (currentWorld.columnNum(adjacent[i])==currentWorld.columnNum(hermit.spot)+1)) {
        noOneAhead = false;
      }
    }
    if (hermit.noOneAhead) {
      hermit.globalDPS *= 3;
    }
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
  for (var i = 0; i < adjacent.length; i++) {
    if (formation[adjacent[i]]) {
      numAdjacent += 1;
      if (formation[adjacent[i]].tags.includes("female")) {femaleAdjacent = true;}
      if (formation[adjacent[i]].tags.includes("leprechaun")) {leprechaunAdjacent = true;}
      if (formation[adjacent[i]].tags.includes("animal")) {animalAdjacent = true;}
      if (formation[adjacent[i]].isDPS) {dpsSmashed = true;}
    }
  }
//Get Smashed
  if (dpsSmashed && numAdjacent <= 3) {
    kyle.globalDPS *= 1 + 0.25;
  }
  if (kyle.isDPS) {
    if (femaleAdjacent) {kyle.globalDPS *= 2;}
    if (leprechaunAdjacent) {kyle.globalDPS *= 2;}    
    if (animalAdjacent) {kyle.globalDPS *= 2;}
    kyle.globalDPS *= 1 + 0.5 * Math.max(numAdjacent,3) * itemAbility(kyle,1); 
  }
};

////Serpent King Draco
var draco = getCrusader("05b");
draco.calculate = function() {
  crusaderSetup(draco);
  if (draco.isDPS) {
    var royals = currentWorld.countTags("royal");
    var animals = currentWorld.countTags("animal");
    var robots = currentWorld.countTags("robot");
    var nonRoyalHumans = 0;
    for (var i in formation) {
      if (formation[i].tags.includes("human") && !formation[i].tags.includes("royal")) { nonRoyalHumans += 1; }
    }
    draco.globalDPS *= 1 + royals - 0.5 * nonRoyalHumans;
    draco.globalDPS *= 1 + animals - 0.5 * robots;
  }
};


////Henry, the Scaredy-Ghoul
var henry = getCrusader("05c");
henry.calculate = function() {
  crusaderSetup(henry);
  if (henry.isDPS) {
    var noOneBehind = true;
    henry.globalDPS *= currentWorld.filled - currentWorld.countTags('human');
    var adjacent = currentWorld.whatsAdjacent(henry.spot);
    for (var i = 0; i < adjacent.length && noOneBehind; i++) {
      if (currentWorld.columnNum(henry.spot) == currentWorld.columnNum(adjacent[i].spot) + 1) {noOneBehind = false;}
    }
  }
};

//////Slot 6
////Detective Kaine
var kaine = getCrusader("06");
kaine.calculate = function() {
  crusaderSetup(kaine);
//A-Ha
  var numInColumn = currentWorld.columnTest(currentWorld.columnNum(kaine.spot));
  kaine.globalGold *= Math.pow(1 + 0.2 * itemAbility(kaine,0),numInColumn);
//Karen compatability for A-Ha
  if (karen.inFormation && (currentWorld.columnNum(kaine.spot)!=currentWorld.columnNum(karen.spot))) {
    kaine.globalGold *= (1 + 0.2*itemAbility(kaine,0)*0.5*itemAbility(karen,0));
  }
};

////Mister the Monkey
var mister = getCrusader("06a");
mister.calculate = function() {
  crusaderSetup(mister);
  var numAnimals = currentWorld.countTags('animal');
  var numBehind = currentWorld.columnTest(currentWorld.columnNum(mister.spot)-1);
  mister.globalGold *= Math.pow(1 + (0.15 + 0.05 * numAnimals) * itemAbility(mister,1), numBehind);
};

////Larry the Leprechaun
var larry = getCrusader("06b");
larry.calculate = function() {
  crusaderSetup(larry);
  var numAdjacent = 0;
  var adjacent = currentWorld.whatsAdjacent(larry.spot);
  for (var i = 0; i < adjacent.length; i++) {
    if (formation[i]) {numAdjacent += 1;}
  }
  larry.globalGold *= Math.pow(1.1*1.25*itemAbility(larry,0),numAdjacent);
  if (numAdjacent <= 3) {larry.globalDPS *= 2;}
  if (numAdjacent >= 6) {larry.globalGold *= 1.25;}
};

////Bernard the Bartender
var bernard = getCrusader("06c");
bernard.calculate = function() {
  crusaderSetup(berndard);
  var numAdjacent = 0;
  var numFemales = currentWorld.countTags('female');
  var adjacent = currentWorld.whatsAdjacent(bernard.spot);
  var tipsPercent = 0.2*itemAbility(bernard,0);
  var tipsGoldPercent = 0.2 * itemAbility(bernard,2) * (1 + numFemales);
  for (var i = 0; i < adjacent.length; i++) {
    if (formation[i]) {numAdjacent += 1;}
  }
  if (numAdjacent <= 3) {
    tipsPercent += numAdjacent * 0.1;
  } else { 
    tipsPercent += 0.6 - numAdjacent * 0.1;
  }
  bernard.globalGold *= 1 + tipsPercent * tipsGoldPercent;
};

//////Slot 7
////The Princess
var princess = getCrusader("07");
princess.calculate = function() {
  crusaderSetup(princess);
//Ignite, Char, Conflagrate (Check if these multiply or add)  
  princess.globalDPS *= Math.pow((1 + 0.1 * itemAbility(princess,2)),3);
};

////RoboTurkey
var turkey = getCrusader("07a");
turkey.calculate = function() {
  crusaderSetup(turkey);
  var adjacent = currentWorld.whatsAdjacent(turkey.spot);
  var numAdjacent = 0;
  var dpsZapped = false;
  for (var i =0; i < adjacent.length; i++) {
    if (formation[i]) {numAdjacent +=1}
    if (formation[i].isDPS) {dpsZapped = true;}
  }
  if (numAdjacent <= 3 && dpsZapped) {
    turkey.globalDPS *= 1.2*1.5*Math.pow(itemAbility(turkey,1),2);
    dpsChar.zapped = true;
    if (momma.inFormation) {
      crusaderSetup(momma);
      momma.globalDPS *= 1.5;
    }
  }
};

////Ranger Rayna
var rayna = getCrusader("07b");
rayna.calculate = function() {
  crusaderSetup(rayna);
  var numAnimals = currentWorld.countTags('animal');
  if (rayna.isDPS) {
    rayna.globalDPS *= 1 + 0.2 * numAnimals * itemAbility(rayna,2);
    if (numAnimals >= 4) {rayna.globalDPS *= 2;}
  }
};


//////Slot 8
////Natalie Dragon
var natalie = getCrusader("08");
natalie.calculate = function() {
  crusaderSetup(natalie);
//Double Dragon  
  if (nate.inFormation && natalie.isDPS){
    natalie.globalDPS *= 1+2*itemAbility(nate,2);
  }
};

////Jack O'Lantern
var jack = getCrusader("08a");
jack.calculate = function() {
  crusaderSetup(jack);
  var numAttackJack = 0;
  jack.globalDPS *= 1 + 0.1 * numAttackJack * itemAbility(jack,0);
};

////President Billy Smithsonian
var billy = getCrusader("08b");
billy.calculate = function() {
  crusaderSetup(billy);
  if (kiz.isDPS) {billy.globalDPS *= 3;}
  if (dpsChar.tags.includes("human")) {billy.globalDPS *= 1.5;}
};

////Karl the Kicker
var karl = getCrusader("08c");
karl.calculate = function() {
  crusaderSetup(karl);
  karl.globalDPS *= 1.2;
  if (countShots) {karl.globalDPS *= 1 + 2 * itemAbility(karl,2) / 5;}
  if (cindy.inFormation) {karl.globalGold *= 1.2;}
};

//////Slot 9
////Jason
var jason = getCrusader("09");
jason.calculate = function() {
  crusaderSetup(jason);
//Ambush not included due to it's limited usefulness  
};

////Pete the Carney
var pete = getCrusader('09a');
pete.calculate = function() {
  crusaderSetup(pete);
  var distances = currentWorld.findDistances(pete.spot);
  var maxDistance = Math.max.apply(null, distances);
  if (distances[dpsChar.spot] == maxDistance) {pete.globalDPS *= 1 + 0.5 * itemAbility(pete,0);
  }
};

////Broot
var broot = getCrusader('09b');
broot.calculate = function() {
  crusaderSetup(broot);
  var maxColumn = currentWorld.maxColumn;
  var adjacent = currentWorld.whatsAdjacent(broot.spot);
  if (currentWorld.columnNum(broot.spot) == maxColumn) {
    if (robbie.isDPS) {broot.globalDPS *= 1 + 0.25 * itemAbility(robbie,2);
    } else {
      broot.globalDPS *= 1.25;
    }
  }
  if (robbie.isDPS) {
    if (currentWorld.columnNum(broot.spot) > currentWorld.columnNum(robbie.spot)) {
      broot.globalDPS *= 1 + itemAbility(robbie,2);
    }
    if (adjacent.includes(robbie.spot)) {
      broot.globalDPS *= 1 + itemAbility(robbie,2);
    }
  }
};

////Paul the Pilgrim
var paul = getCrusader('09c');
paul.calculate = function() {
  crusaderSetup(paul);
  var petraBonus = 0;
  if (petra.inFormation) { petraBonus = 1; }
  paul.globalGold = 1 + 0.33 * itemAbility(paul,0) * (1 + 0.5 * petraBonus);
  paul.globalDPS = 1 + 0.25 * itemAbility(paul,0) * (1 + 0.5 * petraBonus);
};

//////Slot 10
////Artaxes the Lion
var lion = getCrusader("10");
lion.calculate = function() {
  crusaderSetup(lion);
  if (currentWorld.columnNum(lion.spot)==currentWorld.columnNum(dpsChar.spot)-1) {
    lion.globalDPS *= 1 + 0.5*itemAbility(lion,1);
  }
};

////Drizzle
var drizzle = getCrusader('10a');
drizzle.calculate = function() {
  crusaderSetup(drizzle);
  var adjacent = currentWorld.whatsAdjacent(drizzle.spot);
  if (adjacent.includes(dpsChar.spot)) {
    drizzle.globalDPS *= 1 + 0.2 * itemAbility(drizzle,1);
  }
  if (groklok.isDPS && currentWorld.columnNum(drizzle.spot) == currentWorld.columnNum(groklok.spot)) {
    drizzle.globalDPS *= 5;
  }
};

////Bubba, the Swimming Orc
var bubba = getCrusader('10b');
bubba.calculate = function() {
  crusaderSetup(bubba);
  var adjacent = currentWorld.whatsAdjacent(bubba.spot);
  var numAdjacent = 0;
  for (var i = 0; i < adjacent.length; i++) {
    if (formation[adjacent[i]]) {
      numAdjacent += 1;
    }
  }
  if (currentWorld.columnNum(bubba.spot) - 1 == currentWorld.columnNum(dpsChar.spot)) {
    bubba.globalDPS *= 1 + 0.25 * numAdjacent * itemAbility(bubba,1);
  }
  for (i = 0; i < currentWorld.spots; i++) {
    if (formation[i] && currentWorld.columnNum(i) < currentWorld.columnNum(bubba.spot) - 1) {
      bubba.globalGold *= 1.1;
    }
  }
};

////Sisaron the Dragon Sorceress
var sisaron = getCrusader('10c');
sisaron.calculate = function() {
  crusaderSetup(sisaron);
  var adjacent = currentWorld.whatsAdjacent(sisaron.spot);
  var numAdjacent = 0;
  var magicModifier = 1;
  if (adjacent.includes(dpsChar.spot)) {
    for (var i = 0; i < adjacent.length; i++) {
      if (formation[adjacent[i]]) {
        numAdjacent += 1;
      }
    }
    if (numAdjacent == 4) {magicModifier = 4}
    sisaron.globalDPS *= 1 + magicModifier * itemAbility(sisaron,1) / numAdjacent;
  }
};

//////Slot 11
////Khouri, the Witch Doctor
var khouri = getCrusader("11");
khouri.calculate = function() {
  crusaderSetup(khouri);
//Koffee Potion  
  var adjacent = currentWorld.whatsAdjacent(khouri.spot);
  if (adjacent.includes(dpsChar.spot)) {
    khouri.globalDPS *= 1 + 0.3 * itemAbility(khouri,0);
  }
};

////Momma Kaine
var momma = getCrusader('11a');
momma.calculate = function() {
  crusaderSetup(momma);
};

////Brogon, Prince of Dragons
var brogon = getCrusader('11a');
brogon.calculate = function() {
  crusaderSetup(brogon);
  var numRoyal = currentWorld.countTags('royal');
  if (currentWorld.columnNum(brogon.spot) == currentWorld.columnNum(dpsChar.spot)) {
    brogon.globalDPS *= 1 + 0.2 * itemAbility(brogon,1) * numRoyal;
  }
};

////The Half-Blood elf
var halfblood = getCrusader('11b');
halfblood.calculate = function() {
  crusaderSetup(halfblood);
  var adjacent = currentWorld.whatsAdjacent(halfblood.spot);
  if (!dpsChar.tags.includes('human')) {
    if (adjacent.includes(dpsChar.spot)) {
      halfblood.globalDPS *= 1 + 0.5 * itemAbility(halfblood,1);
    }
  }
};

////Foresight
var foresight = getCrusader('11c');
foresight.calculate = function() {
  crusaderSetup(foresight);
  if (dpsChar.tags.includes('supernatural')) {
    foresight.globalDPS *= 1.5;
  }
};

//////Slot 12
////Dark Gryphon
var gryphon = getCrusader("12");
gryphon.calculate = function() {
  crusaderSetup(gryphon);
};

////Rocky the Rockstar
var rocky = getCrusader('12a');
rocky.calculate = function() {
  crusaderSetup(rocky);
  var adjacent = currentWorld.whatsAdjacent(rocky.spot);
  var numFemales = 0;
  if (rocky.isDPS) {
    for (var i =0; i < adjacent.length; i++) {
      if (formation[adjacent[i]].tags.includes('female')) {
        numFemales += 1;
      }
    }
    rocky.globalDPS *= 1 + 0.5 * itemAbility(rocky,0) * numFemales;
  }
};

////Montana James
var montana = getCrusader('12b');
montana.calculate = function() {
  crusaderSetup(montana);
  if (dpsChar.tags.includes('animal')) {
    montana.globalDPS *= 1.5;
  }
  if (princess.inFormation) {
    montana.globalDPS *= 1.4;
  }
  if (countShots) {
    montana.globalDPS *= 1 + 2 * itemAbility(montana,0) / 5;
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
};

//////Slot 13
////Sarah, the Collector
var sarah = getCrusader("13");
sarah.calculate = function() {
  crusaderSetup(sarah);
  if (sarah.isDPS) {
    var formationFull = true;
    for (i=0; i<currentWorld.spots; i++){
      if (!formation[i]) {
        formationFull = false;
      }
    }
    if (formationFull) {
      sarah.globalDPS *= 2.5;
    }
  }
};

////The Metal Soldierette
var soldierette = getCrusader('13a');
soldierette.calculate = function() {
  crusaderSetup(soldierette);
  if (soldierette.isDPS) {
    if (currentWorld.columnNum(soldierette.spot) == currentWorld.maxColumn) {
      soldierette.globalDPS *= 5;
    }
    soldierette.globalDPS *= 1 + 0.2 * numAttacking; 
  }
};

////Snickette the Sneaky
var snickette = getCrusader('13b');
snickette.calculate = function() {
  crusaderSetup(snickette);
  var adjacent = currentWorld.whatsAdjacent(snickette.spot);
  var numAdjacent = 0;
  if (dpsChar.tags.includes('human')) {
    snickette.globalDPS *= 1 + (0.5 + 0.1 * currentWorld.countTags('human')) * itemAbility(snickette,0);
  }
  if (currentWorld.countTags('leprechaun') >= 2) {
    snickette.globalDPS *= 1 + 0.5;
  }
  for (var i = 0; i < adjacent.length; i++) {
    if (formation[adjacent[i]]) {
      numAdjacent += 1;
    }
  }
  if (numAdjacent <= 4) {
    if (adjacent.includes(dpsChar.spot)) {
      snickette.globalDPS *= 1 + 0.5 * itemAbility(snickette,1);
    }
  }
};

//////Slot 14
////Gold panda
var panda = getCrusader("14");
panda.calculate = function() {
  crusaderSetup(panda);
};

////RoboSanta
var santa = getCrusader('14a');
santa.calculate = function() {
  crusaderSetup(santa);
  var numAhead = currentWorld.columnTest(currentWorld.columnNum(santa.spot+1));
  santa.globalGold *= Math.pow(1 + 0.25 * itemAbility(santa,0),numAhead);
};

////Leerion, the Royal Dwarf
var leerion = getCrusader('14b');
leerion.calculate = function() {
  crusaderSetup(leerion);
  leerion.globalGold *= 1 + (0.25 + 0.1 * currentWorld.countTags('female') + 0.15 * currentWorld.countTags('royal')) * itemAbility(leerion,2);
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
    if (formation[adjacent[i]].tags.includes('animal')) {animalsAdj += 1;}
    if (formation[adjacent[i]].tags.includes('human')) {humansAdj += 1;}
    if (formation[adjacent[i]].tags.includes('male')) {malesAdj += 1;}
    if (formation[adjacent[i]].tags.includes('female')) {femalesAdj += 1;}
  }
  katie.globalGold *= (1 + boost * Math.min(animalsAdj,2)) * (1 + boost * Math.min(malesAdj,2)) * (1 + boost * Math.min(femalesAdj,2)) * (1 + boost * Math.min(humansAdj,2));
};

//////Slot 15
////Prince Sal, the Merman
var sal = getCrusader("15");
sal.calculate = function() {
  crusaderSetup(sal);
};

////Wendy the Witch
var wendy = getCrusader('15a');
wendy.calculate = function() {
  crusaderSetup(wendy);
  if (wendy.isDPS) {
    wendy.globalDPS *= 1 + 0.25 * monstersOnscreen;
  }
};

////Robbie Raccoon
var robbie = getCrusader('15b');
robbie.calculate = function() {
  crusaderSetup(robbie);
};

////Princess Val the Mermain
var val = getCrusader('15c');
val.calculate = function() {
  crusaderSetup(val);
  if (currentWorld.countTags('animal') > currentWorld.countTags('human')) {
    val.globalDPS *= 1 + 0.5 * itemAbility(val,2);
  }
};

//////Slot 16
////Fire Phoenix
var phoenix = getCrusader("16");
phoenix.calculate = function() {
  crusaderSetup(phoenix);
};

////Alan the ArchAngel
var alan = getCrusader('16a');
alan.calculate = function() {
  crusaderSetup(alan);
};

////Fright-o-Tron
var fright = getCrusader('16b');
fright.calculate = function() {
  crusaderSetup(fright);
  fright.globalDPS *= 1/(1-0.15*itemAbility(fright,2));
};

//////Slot 17
////King Reginald IV
var reginald = getCrusader("17");
reginald.calculate = function() {
  crusaderSetup(reginald);
  if (dpsChar.tags.includes('royal')) {
    reginald.globalDPS *= 1 + 2 * itemAbility(reginald,2);
  }
};

////Queen Siri
var siri = getCrusader('17a');
siri.calculate = function() {
  crusaderSetup(siri);
  if (dpsChar.tags.includes('female')) {
    siri.globalDPS *= 1 + 1 * itemAbility(siri,2);
  }
};

////Mr. Boggins, the Substitute
var boggins = getCrusader('17b');
boggins.calculate = function() {
  crusaderSetup(boggins);
  var diversityCount = 0;
  if (dpsChar.tags.includes('animal')) {
    boggins.globalDPS *= 1 + (2 + 0.125 * currentWorld.countTags('human')) * itemAbility(boggins,0);
  }
  for (var i in formation) {
    if (!formation[i].tag.includes('human') && !formation[i].tag.includes('animal')) {
      diversityCount += 1;
    }
  }
  boggins.globalGold *= Math.pow(1.1,diversityCount);
};

////Squiggles the Clown
var squiggles = getCrusader('17c');
squiggles.calculate = function() {
  crusaderSetup(squiggles);
  var adjacent = currentWorld.whatsAdjacent(squiggles.spot);
  var humansAdj = 0;
  if (squiggles.isDPS) {
    squiggles.globalDPS *= 1 + (1.5 - 0.25 * currentWorld.countTags('royal')) * itemAbility(squiggles,0);
    squiggles.globalDPS *= 1 + 0.1 * (currentWorld.filled - currentWorld.countTags('royal'));
    for (var i = 0; i < adjacent.length; i++) {
      if (formation[adjacent[i]].tags.includes('human')) {humansAdj += 1;}
    }
    if (humansAdj >= 2) {
      squiggles.globalDPS *= 3;
    }
  }
  
};

//////Slot 18
////Thalia, the Thunder King
var thalia = getCrusader("18");
thalia.calculate = function() {
  crusaderSetup(thalia);
};

////Frosty the Snowman
var frosty = getCrusader('18a');
frosty.calculate = function() {
  crusaderSetup(frosty);
  var adjacent = currentWorld.whatsAdjacent(frosty);
  var numAdjacent = 0;
  if (frosty.isDPS) {
    frosty.globalDPS *= 1 + 2*currentWorld.countTags('supernatural')*itemAbility(frosty,0);
    for (var i = 0; i < adjacent.length; i++) {
      if (formation[adjacent[i]]) {numAdjacent += 1;}
    }
    frosty.globalDPS *= Math.pow(2,numAdjacent);
  }
  if (adjacent.includes(dpsChar.spot)) {
    frosty.globalDPS *= 0.75;
  }
};

////Littlefoot
var littlefoot = getCrusader('18b');
littlefoot.calculate = function() {
  crusaderSetup(littlefoot);
  littlefoot.globalDPS *= 1 + 0.1 *littlefootXP * itemAbility(littlefoot,1);
};

////Cindy the Cheer-Orc
var cindy = getCrusader('18c');
cindy.calculate = function() {
  crusaderSetup(cindy);
  var distances = currentWorld.findDistances(cindy.spot);
  var distance = distances[dpsChar.spot];
  cindy.globalDPS *= 1 + 0.5 * distance * (1+10*currentStage/50) * itemAbility(cindy,1);
  cindy.globalDPS *= 1 + Math.min(killedThisStage/100,2);
};

//////Slot 19
////Merci, the Mad Wizard
var merci = getCrusader("19");
merci.calculate = function() {
  crusaderSetup(merci);
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
  if (paul.inFormation) {paulMult = 1.5;}
  if (petra.isDPS) {
    petra.globalDPS *= 1 + 0.5 * currentWorld.countTags('elf') * paulMult * itemAbility(petra,0);
    if (paul.inFormation && adjacent.includes(paul.spot)) {
      petra.globalDPS *= 1 + 2 * paulMult;
    }
  }
};

//////Slot 20
////Nate Dragon
var nate = getCrusader("20");
nate.calculate = function() {
  crusaderSetup(nate);
//Double Dragon  
  if (natalie.inFormation && nate.isDPS){
    nate.globalDPS *= 1+2*itemAbility(nate,2);
  }
};

////Kizlblyp the Alien Traitor
var kiz = getCrusader('20a');
kiz.calculate = function() {
  crusaderSetup(kiz);
  if (kiz.isDPS) {
    kiz.globalDPS *= 1 + 0.2 * itemAbility(kiz,0) * currentWorld.countTags('male');
  }
  kiz.globalDPS *= 1 + 0.1 * (currentWorld.filled - currentWorld.countTags('human'));
};

////Robo-Rudolph
var rudolph = getCrusader('20b');
rudolph.calculate = function() {
  crusaderSetup(rudolph);
  var adjacent = currentWorld.whatsAdjacent(rudolph.spot);
  var robotAdj = false;
  if (rudolph.isDPS) {
    for (var i = 0; i < adjacent.length; i++) {
      if (Formation[adjacent[i]].tags.includes('robot')) {
        robotAdj = true;
      }
    }
    if (robotAdj) {
      rudolph.globalDPS *= 1 + 2 * itemAbility(rudolph,0);
    }
    rudolph.globalDPS *= 1 + 1 * currentWorld.countTags('robot') * itemAbility(rudolph,1);
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
  if (exterminator.isDPS) {
    exterminator.globalDPS *= 1 + 1 * robotsAdj * itemAbility(exterminator,0);
    exterminator.globalDPS *= 1 + 0.5 * currentWorld.countTags('robot') * itemAbility(exterminator,0);
  }
  exterminator.globalGold *= 1 + 0.1 * (currentWorld.countTags('robot') - robotsAdj);
};

////Gloria, the Good Witch
var gloria = getCrusader('21a');
gloria.calculate = function() {
  crusaderSetup(gloria);
  if (currentWorld.columnNum(dpsChar.spot) != currentWorld.columnNum(gloria.spot) + 1) {
    gloria.globalDPS *= 1.5;
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
  if (adjacent.includes(dpsChar.spot)) {
    for (var i = 0; i < adjacent.length; i++) {
      if (formation[adjacent[i]]) {
        numAdjacent += 1;
      } 
    }
    if (jason.inFormation && adjacent.includes(jason.spot)) {
      jasonMult = 2;
    }
    shadow.globalDPS *= 1 + 3 * jasonMult * itemAbility(shadow,1) / numAdjacent;
  }
};

////Ilsa, the Insane Wizard
var ilsa = getCrusader('22a');
ilsa.calculate = function() {
  crusaderSetup(ilsa);
  var adjacent = currentWorld.whatsAdjacent(ilsa.spot);
  var numAdjacent = 0;
  var deflecting = 0;
  var magicMult = 0;
  if (ilsa.isDPS) {
    ilsa.globalDPS *= 1 + (0.5 + currentWorld.countTags('magical'))*itemAbility(ilsa,0);
    if (merci.inFormation) {
      deflecting = Math.min(2.5 * monstersOnscreen * itemAbility(merci,0),100);
    }
    ilsa.globalDPS *= 2 + 2 * deflecting/100;
  }
  if (adjacent.includes(dpsChar.spot)) {
    for (var i = 0; i < adjacent.length; i++) {
      if (formation[adjacent[i]]) {numAdjacent += 1;}
    }
    if (numAdjacent == 1) {magicMult = 4;}
    ilsa.globalDPS *= 0.5 + 1 * magicMult;
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
};

////Eiralon, the Blood Mage
var eiralon = getCrusader('23a');
eiralon.calculate = function() {
  crusaderSetup(eiralon);
  eiralon.globalDPS *= 1 + 0.5 * itemAbility(eiralon,0);
  if (currentWorld.columnNum(eiralon.spot) == currentWorld.columnNum(dpsChar.spot)) {
    eiralon.globalDPS *= 1 + 1 * itemAbility(eiralon,0);
  }
};








//Formations
function World(name,spots) {
  var _this = this;
  this.name = name;
  this.spots = spots;
  this.filled = 0;
  this.maxColumn = 0;
  var adjacent = [];
  var columnNum = [];
  for (i = 0; i < this.spots; i++) {
    adjacent[i]=[];
    columnNum[i]=[];
  }
  this.setAdjacent = function(spot,adjacentArray) {
    adjacent[spot] = adjacentArray;
  };
  this.setColumn = function(spot,columnNumIn) {
    columnNum[spot] = columnNumIn;
    if (columnNumIn > _this.maxColumn) {
      _this.maxColumn = columnNumIn;
    }
  };
  this.isAdjacent = function(spot1,spot2) {
    var adjacentTest = false;
    for (var i in adjacent[spot1]){
      if (i == spot2) {
        adjacentTest = true;
      }
    }
    return adjacentTest;
  };
  this.whatsAdjacent = function(spot) {
    return adjacent[spot];
  };
  this.columnNum = function(spot) {
    return columnNum[spot];
  };
  this.countTags = function(tag) {
    count = 0;
    for (var i in formation) {
      for (var j in formation[i].tags) {
        if (tag == formation[i].tags[j]) {
          count += 1;
        }
      }
      if (formation[i][tag]) {
        count += 1;
      }
    }
    return count;
  };
  this.columnTest = function (column,tag) {
    count = 0;
    for (var i in formation) {
      if (_this.columnNum(i) == column) {
        if (!tag) {
          count += 1;
        } else {
          for (var j in formation[i].tags) {
            if (tag == formation[i].tags[j]) {
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
      if (adjacent.length === 0) {running =false;}
      for (var j = 0; j<adjacent.length; j++) {
        distance[adjacent[j]] = Math.min(distance[current] + 1 , distance[adjacent[j]]);
      }
      for (j = 0; j <= _this.spots; j++) {
        if (!visited[j] && distance[j] < min) { 
          min = distance[j];
          minLoc = j;
        }
      }
      if (current == minLoc) {running = false;}
      current = minLoc;
    }
    for (i = 0; i < distance.length; i++) {
      if (distance[i] == 100) {distance[i] = -1;}
    }
    return distance;
  };
}


var worldsWake = new World("World's Wake",10);
app.worldsWake = worldsWake;
worldsWake.setAdjacent(0,[1,4]);
worldsWake.setAdjacent(1,[0,2,4,5]);
worldsWake.setAdjacent(2,[1,3,5,6]);
worldsWake.setAdjacent(3,[2,6]);
worldsWake.setAdjacent(4,[0,1,5,7]);
worldsWake.setAdjacent(5,[1,2,4,6,7,8]);
worldsWake.setAdjacent(6,[2,3,5,8]);
worldsWake.setAdjacent(7,[4,5,8,9]);
worldsWake.setAdjacent(8,[5,6,7,9]);
worldsWake.setAdjacent(9,[7,8]);
for (i = 0; i < 10; i++) {
  switch(true){
    case (i<4):
      worldsWake.setColumn(i,1);
      break;
    case (i>3 && i<7):
      worldsWake.setColumn(i,2);
      break;
    case (i>6 && i<9):
      worldsWake.setColumn(i,3);
      break;
    case (i==9):
      worldsWake.setColumn(i,4);
      break;
  }
}

app.formation = [];
var critChance = 1;
var globalDPS = 1;
var globalGold = 1;

app.setDPS = function(name) {
  var crusader = jsonData.crusaders.find(c => c.displayName == name)
  if (crusader != null) {
      crusader.isDPS = true;
      dpsChar = crusader;
    }
  };

//Set Up Formation
var currentWorld = worldsWake;
// formation[0]=emo;
// formation[7]=sasha;
//formation[2]=kaine;
//formation[3]=panda;
// setDPS("Emo");
//Set base values for the formation crusaders and calculate
app.calculate = () =>{
  var globalDPS = 1;
  var globalGold = 0;
  formation.map(f =>{
    f.calculate();
    console.log('formation calculate', globalDPS, f);
    globalDPS *= f.globalDPS || 1;
    globalGold *= f.globalGold || 1;
  });
  return {globalDps:globalDPS, globalGold:globalGold}
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
var killedThisStage =0;
var currentStage = 0;
})(window)
