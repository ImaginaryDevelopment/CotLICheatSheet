function getCrusader(id) {return jsonData.crusaders.find(function(c){ return c.id == id; }); } 

function crusaderSetup(crusader) {
  if (!crusader.globalDPS) {crusader.globalDPS = 1;}
  if (!crusader.globalGold) {crusader.globalGold = 1;}
  if (!crusader.critChance) {crusader.critChance = 0;}
  for (var i in crusader.gear) {
    switch (crusader.gear[i]) {
      case "clickCrit":
        crusader.critChance += itemCrit(crusader,i);
        break;
      case "alldps":
        crusader.globalDPS *= itemDPS(crusader,i);
        break;
      case "gold":
        crusader.globalGold *= itemGold(crusader,i);
        break;
      case "selfdps":
        if (crusader.isDPS) {crusader.globalDPS *= itemSelfDPS(crusader,i);}
        break;
    }
  }
}

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

function itemGold(crusader,gearSlot) {
  switch(appGameState.crusaderGear[crusader.id]["slot"+gearSlot.toString()]){
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
  switch(appGameState.crusaderGear[crusader.id]["slot"+gearSlot.toString()]){
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
  switch(appGameState.crusaderGear[crusader.id]["slot"+gearSlot.toString()]){
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
  princess.globalDPS *= (1 + 0.1 * itemAbility(princess,2))^3;
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
  if (numAdjacent<= 3 && dpsZapped) {
    turkey.globalDPS *= 1.2*1.5*Math.pow(itemAbility(turkey,1),2);
    dpsChar.zapped = true;
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
  
};

//////Slot 10
////Artaxes the Lion
var lion = getCrusader("10");
lion.calculate = function() {
  crusaderSetup(lion);
  if (currentWorld.columnNum[lion.spot]==currentWorld.columnNum[dpsChar.spot]-1) {
    lion.globalDPS *= 1 + 0.5*itemAbility(lion,1);
  }
};

//////Slot 11
////Khouri, the Witch Doctor
var khouri = getCrusader("11");
khouri.calculate = function() {
  crusaderSetup(khouri);
//Koffee Potion  
  var adjacent = currentWorld.whatsAdjacent(khouri.spot);
  for (var i = 0; i < adjacent.length && noOneAhead; i++) {
    if ((formation[adjacent[i]] && formation[adjacent[i]].isDPS)) {
      khouri.globalDPS *= 1 + 0.3*itemAbility(khouri,0);
    }
  } 
};


//////Slot 12
////Dark Gryphon
var gryphon = getCrusader("12");
gryphon.calculate = function() {
  crusaderSetup(gryphon);
  gryphon.globalDPS *= 1.15;
};


//////Slot 13
////Sarah, the Collector
var sarah = getCrusader("13");
sarah.calculate = function() {
  crusaderSetup(sarah);
  sarah.globalDPS *= 1.15;
  sarah.critChance += 3;
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

//////Slot 14
////Gold panda
var panda = getCrusader("14");
panda.calculate = function() {
  crusaderSetup(panda);
  panda.globalGold *= 1.5*1.25^3;
  panda.critChance += 3;
};

//////Slot 15
////Prince Sal, the Merman
var sal = getCrusader("15");
sal.calculate = function() {
  crusaderSetup(sal);
  sal.globalDPS *= 1.1;
};

//////Slot 16
////Fire Phoenix
var phoenix = getCrusader("16");
phoenix.calculate = function() {
  crusaderSetup(phoenix);
};

//////Slot 17
////King Reginald IV
var reginald = getCrusader("17");
reginald.calculate = function() {
  crusaderSetup(reginald);
  if (dpsChar.royal) {
    reginald.globalDPS *= 1 + 2*itemAbility(reginald,2);
  }
};

//////Slot 18
////Thalia, the Thunder King
var thalia = getCrusader("18");
thalia.calculate = function() {
  crusaderSetup(thalia);
};

//////Slot 19
////Merci, the Mad Wizard
var merci = getCrusader("19");
merci.calculate = function() {
  crusaderSetup(merci);
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


















//Formations
function World(name,spots) {
  var _this = this;
  this.name = name;
  this.spots = spots;
  this.filled = 0;
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

var formation = [];
var critChance = 1;
var globalDPS = 1;
var globalGold = 1;

setDPS = function(name) {
  for (var i in jsonData.crusaders) {
    crusader = jsonData.crusaders[i];
    if (crusader.displayName.search(name) != -1) {
      crusader.isDPS = true;
      dpsChar = crusader;
    }
  }
};

//Set Up Formation
var currentWorld = worldsWake;
formation[0]=emo;
formation[7]=sasha;
//formation[2]=kaine;
//formation[3]=panda;
setDPS("Emo");
//Set base values for the formation crusaders and calculate
for (var i in formation) {
  formation[i].inFormation = true;
  formation[i].spot = i;
  currentWorld.filled += 1;
}
for (var i in formation) {
  formation[i].calculate();
}
