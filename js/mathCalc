function getCrusader(id) { return jsonData.crusaders.find(function(c){ return c.id == id; }); } 


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

function itemSelfDPS(rarity) {
  switch(rarity){
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

function itemGold(rarity) {
  switch(rarity){
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

function itemCrit(rarity) {
  switch(rarity) {
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

function itemAbility(rarity) {
  switch(rarity) {
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

appGameState.crusaderGear[emo.id].slot0


///////// Formation Calculations
//////Slot 1
////bushwhacker
var bushwhacker = getCrusader("01");
bushwhacker.calculate = function() {
//Crit Gear (2nd)
  bushwhacker.critChance += itemCrit(appGameState.crusaderGear[bushwhacker.id].slot1);
};

////RoboRabbit
var rabbit = getCrusader("01a");
rabbit.calculate = function() {
  rabbit.critChance += itemCrit(appGameState.crusaderGear[rabbit.id].slot1);
  if (rabbit.clicking) {
    rabbit.globalDPS *= 1 + 0.25*itemAbility(appGameState.crusaderGear[rabbit.id].slot2);
  }
};

////Graham
var graham = getCrusader("01b");
graham.calculate = function() {
  graham.globalDPS *= 1.01 * itemDPS(appGameState.crusaderGear[graham.id].slot1);
  if (graham.stopped) {
    graham.globalDPS *= 1 + 0.5 * itemAbility(appGameState.crusaderGear[graham.id].slot2);
  }
};

//////Slot 2
////Jim
var jim = getCrusader("02");
jim.calculate = function() {
//Global DPS Item (1st)
  jim.globalDPS *= itemDPS(appGameState.crusaderGear[jim.id].slot0);
//Self Buff
  if (jim.isDPS) {
    for (var i in jim.whatsAdjacent) {
      if (formation[i].inFormation)
        jim.globalDPS *= 2;
        break;
    }
  }
//Column Buff
  for (var j in jim.whatsAdjacent) {
    if (formation[j] && formation[j].isDPS) {
      if (currentWorld.columnNum(jim.slot) == currentWorld.columnNum(dpsChar.slot)) {
        jim.globalDPS *= 1.5;
      }
    }
  }
};

////Pam
var pam = getCrusader("02a");
pam.calculate = function() { 
  pam.globalDPS *= itemDPS(appGameState.crusaderGear[pam.id].slot0);
  pam.numInColumn = 0;
  pam.dpsInColumn = false;
  for (var j in formation) {
    if (currentWorld.columnNum(pam.slot) == currentWorld.columnNum(formation[j].slot)){
      pam.numInColumn += 1;
      if (formation[j].isDPS) {
        pam.dpsInColumn = true;
      }
    }
  }
  if (pam.numInColumn == 2 && pam.dpsInColumn) {
    pam.globalDPS *= 1 + 1 * itemAbility(appGameState.crusaderGear[pam.id].slot1);
  }
  if (pam.isDPS) {
    for (var i in pam.whatsAdjacent) {
      if (formation[i].inFormation)
        pam.globalDPS *= 2;
        break;
    }    
  }
};
////Veronica
var veronica = getCrusader("02b")

//////Slot 3
////Emo Werewolf 
var emo = getCrusader("03");
emo.calculate = function() {
//Global DPS Item (3rd)
  emo.globalDPS *= itemDPS(appGameState.crusaderGear[emo.id].slot2);
//Self DPS Buffs  
  emo.selfDPS *= 2*2*2*2.5*itemSelfDPS(emo.gear[0])*itemSelfDPS(appGameState.crusaderGear[emo.id].slot1);
//Conditional Self Buff
  if (emo.isDPS) {
    var noHumansAdjacent = true;
    for (var i in emo.whatsAdjacent) {
      if ((formation[i] && formation[i].human)) {
        noHumansAdjacent = false;
      }
    }
    if (noHumansAdjacent) {
      emo.globalDPS *= 3;
    }
  }
};

////Sally the Succubus



////Karen, the Cat Teenager

//////Slot 4
////Sasha the Fierce Warrior
var sasha = getCrusader("04");
sasha.calculate = function() {
//Global DPS Item (3rd)
  sasha.globalDPS *= itemDPS(appGameState.crusaderGear[sasha.id].slot2);
//Bulwark  
  if (currentWorld.columnNum[sasha.spot]==currentWorld.columnNum[dpsChar.spot]+1) {
    sasha.globalDPS *=1 + 0.3*itemAbility(appGameState.crusaderGear[sasha.id].slot2);
  }
};

//////Slot 5
////The Washed Up Hermit
var hermit = getCrusader("05");
hermit.calculate = function() {
//Global DPS Item (2nd)
  hermit.globalDPS *= itemDPS(appGameState.crusaderGear[hermit.id].slot1);
//Craziness  
  if (hermit.isDPS) {
    hermit.noOneAhead = true;
    for (var i in hermit.whatsAdjacent) {
      if (formation[i] && (currentWorld.columnNum(i)==currentWorld.columnNum(hermit.spot)+1)) {
        noOneAhead = false;
      }
    }
    if (hermit.noOneAhead) {
      hermit.globalDPS *= 3;
    }
  }
};

//////Slot 6
////Detective Kaine
var kaine = getCrusader("06");
kaine.calculate = function() {
//Global DPS Item (3rd)
  kaine.globalDPS *= itemDPS(appGameState.crusaderGear[kaine.id].slot2);
//A-Ha
  for (var i in kaine.whatsAdjacent) {
    kaine.sameColumn = 0; //Check if this should be 1 or 0 (does kaine count himself)
    if (formation[i] && (currentWorld.columnNum(kaine.spot)==currentWorld.columnNum(i))) {
      kaine.globalGold *= (1 + 0.2*itemAbility(appGameState.crusaderGear[kaine.id].slot0));
    }
//Karen compatability for A-Ha
    if (karen.inFormation && (currentWorld.columnNum(kaine.spot)!=currentWorld.columnNum(karen.spot))) {
      kaine.globalGold *= (1 + 0.2*itemAbility(appGameState.crusaderGear[kaine.id].slot0)*0.5*itemAbility(appGameState.crusaderGear[karen.id].slot0));
    }
  }
};

//////Slot 7
////The Princess
var princess = getCrusader("07");
princess.calculate = function() {
//DPS Gear (2nd)  
  princess.globalDPS *= itemDPS(appGameState.crusaderGear[princess.id].slot1);
//Ignite, Char, Conflagrate (Check if these multiply or add)  
  princess.globalDPS *= (1+0.1*itemAbility(appGameState.crusaderGear[princess.id].slot2))^3;
};

//////Slot 8
////Natalie Dragon
var natalie = getCrusader("08");
natalie.calculate = function() {
//Global DPS Ability  
  natalie.globalDPS *= 1.15;
//Gold Find Gear (2nd)  
  natalie.globalGold *= itemGold(appGameState.crusaderGear[natalie.id].slot1);
//DPS Gear (3rd)
  natlie.globalDPS *= itemDPS(appGameState.crusaderGear[natlie.id].slot2);
//Double Dragon  
  if (nate.inFormation && natalie.isDPS){
    natalie.globalDPS *= 1+2*itemAbility(appGameState.crusaderGear[nate.id].slot2);
  }
};

//////Slot 9
////Jason
var jason = getCrusader("09");
jason.calculate = function() {
//Gold Find Gear (2nd)  
  jason.globalGold *= itemGold(appGameState.crusaderGear[jason.id].slot1);
//DPS Gear (3rd)  
  jason.globalDPS *= itemDPS(appGameState.crusaderGear[jason.id].slot2);
//Ambush not included due to it's limited usefulness  
};

//////Slot 10
////Artaxes the Lion
var lion = getCrusader("10");
lion.calculate = function() {
  lion.critChance = 3;
  if (currentWorld.columnNum[lion.spot]==currentWorld.columnNum[dpsChar.spot]-1) {
    lion.globalDPS *= 1 + 0.5*itemAbility(appGameState.crusaderGear[lion.id].slot1);
  }
  lion.globalDPS *= itemDPS(appGameState.crusaderGear[lion.id].slot2);
};

//////Slot 11
////Khouri, the Witch Doctor
var khouri = getCrusader("11");
khouri.calculate = function() {
//Koffee Potion  
  for (var i in khouri.whatsAdjacent) {
    if ((formation[i] && formation[i].isDPS)) {
      khouri.globalDPS *= 1 + 0.3*itemAbility(appGameState.crusaderGear[khouri.id].slot0);
    }
  } 
//DPS Gear (3rd)
  khouri.globalDPS *= itemDPS(appGameState.crusaderGear[khouri.id].slot2);
};


//////Slot 12
////Dark Gryphon
var gryphon = getCrusader("12");
gryphon.calculate = function() {
  gryphon.globalDPS *= 1.15;
//DPS item (3rd)
  gryphon.globalDPS *= itemDPS(appGameState.crusaderGear[gryphon.id].slot2);
};


//////Slot 13
////Sarah, the Collector
var sarah = getCrusader("13");
sarah.calculate = function() {
  sarah.globalDPS *= 1.15;
  sarah.critChance += 3;
  sarah.globalDPS *= itemDPS(appGameState.crusaderGear[sarah.id].slot2);
  if (sarah.isDPS) {
    var formationFull = true;
    for (i=0; i<currentWorld.slots; i++){
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
  panda.globalGold *= 1.25^3*itemGold(appGameState.crusaderGear[panda.id].slot2);
  panda.globalDPS *= itemDPS(panda.gear[1]);
  panda.critChance += 3;
};

//////Slot 15
////Prince Sal, the Merman
var sal = getCrusader("15");
sal.calculate = function() {
  sal.globalDPS *= 1.1*itemDPS(appGameState.crusaderGear[sal.id].slot1);
};

//////Slot 16
////Fire Phoenix
var phoenix = getCrusader("16");
phoenix.calculate = function() {
  phoenix.globalDPS *= itemDPS(appGameState.crusaderGear[phoenix.id].slot2);
};

//////Slot 17
////King Reginald IV
var reginald = getCrusader("17");
reginald.calculate = function() {
  reginald.globalDPS *= 1.1*itemDPS(appGameState.crusaderGear[reginald.id].slot1);
  if (dpsChar.royal) {
    reginald.globalDPS *= 1 + 2*itemAbility(appGameState.crusaderGear[reginald.id].slot2);
  }
};

//////Slot 18
////Thalia, the Thunder King
var thalia = getCrusader("18");
thalia.calculate = function() {
  thalia.globalDPS *= 1.15*itemDPS(appGameState.crusaderGear[thalia.id].slot1);
};

//////Slot 19
////Merci, the Mad Wizard
var merci = getCrusader("19");
merci.calculate = function() {
  merci.globalDPS *= 1.15*itemDPS(appGameState.crusaderGear[merci.id].slot1);
};

//////Slot 20
////Nate Dragon
var nate = getCrusader("20");
nate.calculate = function() {
  nate.globalDPS = itemDPS(appGameState.crusaderGear[nate.id].slot1);
//Double Dragon  
  if (natalie.inFormation && nate.isDPS){
    nate.globalDPS *= 1+2*itemAbility(appGameState.crusaderGear[nate.id].slot2);
  }
};


















//Formations
function World(name,slots) {
  this.name = name;
  this.slots = slots;
  var adjacent = [];
  var columnNum = [];
  for (i = 0; i < this.slots; i++) {
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
  this.whatsAdjacent = function(spot1) {
    return adjacent[spot1];
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
      if (this.columnNum(formation[i].slot) == column) {
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
//formation[6]=sasha;
//formation[2]=kaine;
//formation[3]=panda;

//Set base values for the formation crusaders and calculate
for (var i in formation) {
  formation[i].critChance = 0;
  formation[i].globalGold = 1;
  formation[i].globalDPS = 1;
  formation[i].calculate();
}
