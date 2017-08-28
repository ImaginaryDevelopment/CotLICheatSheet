/**
   * @typedef {Object} Loot
   * @property {number} lootId
   * @property {number} slot
   * @property {number} rarity
   * @property {string} name
   */
// interface WorldConstructor {
//   new(id:number,name:string,spots:number):World
// }
/**
   * @typedef {Object} Crusader - a crusader object
   * @property {string} id
   * @property {string} displayName
   * @property {Array<Loot>} loot
   * @property {Array<string>} tags
   */
/**
   * @typedef {Object} JsonData
   * @property {string} wikibase
   * @property {Array<Crusader>} crusaders
   */
/**
   * @typedef {Object} App
   * @property {JsonData} jsonData
   * @property {?string} dpsChar
   */
/** @param {App} app */
(function (app, exposeYourself) {
    /** module mathCalc */
    var my = app.mathCalc = {};
    var dpsChar = null;
    //https://github.com/Microsoft/TypeScript/wiki/JsDoc-support-in-JavaScript
    var jsonData = app.jsonData;
    // doesn't let me define the function as returning crusader or undefined =(
    /**
     * @param {string} id - a Crusader identifier like 04b
     * @return {Crusader}
     */
    var getCrusader = my.getCrusader = id => jsonData
        .crusaders
        .find(c => c.id == id);
    var getCrusaderSpot = 
    /**
     *
     * @param {Array<string>} formationIds
     * @param {string} id
     */
    (formationIds, id) => {
        if (!(id != null) || !formationIds || !Array.isArray(formationIds) || !(formationIds.indexOf(id) != null) || formationIds.indexOf(id) < 0)
            return null;
        var spotMaybe = formationIds.indexOf(id);
        if (spotMaybe === 0 || spotMaybe > 0)
            return spotMaybe;
    };
    /**
     * @return {number}
     */
    var getDpsSpot = (formationIds, dpsChar) => dpsChar != null && dpsChar.id
        ? getCrusaderSpot(formationIds, dpsChar.id)
        : null;
    /**
     * @typedef {Object} World
     * @property {number} spots
     * @property {string} name
     * @property {number} id
     * @property {number} filled how many slots are filled
     * @property {number} maxColumn
     * @property {function} setAdjacent
      this.setAdjacent = function (spot, adjacentArray) {
        adjacent[spot] = adjacentArray;
      };
     */
    /**
     * @constructor
     * @param {number} id
     * @param {string} name
     * @param {number} spots
     * @return {World}
     */
    class World {
        constructor(id, name, spots) {
            var _this = this;
            this.id = id;
            this.name = name;
            this.spots = spots;
            this.filled = 0;
            this.maxColumn = 0;
            this.adjacent = [];
            this.columnNum = [];
            for (var i = 0; i < this.spots; i++) {
                this.adjacent[i] = [];
                this.columnNum[i] = NaN;
            }
        }
        setColumn(spot, columnNumIn) {
            this.columnNum[spot] = columnNumIn;
            if (columnNumIn > this.maxColumn) {
                this.maxColumn = columnNumIn;
            }
        }
        isAdjacent(spot1, spot2) {
            var adjacentTest = false;
            for (var i in this.adjacent[spot1]) {
                if (i == spot2) {
                    adjacentTest = true;
                }
            }
            return adjacentTest;
        }
        whatsAdjacent(spot) {
            return spot != null && this.adjacent[spot] || [];
        }
        /**
         * @param {number} spot
         * @return {number} what column number a slot belongs to
         */
        getColumnNum(spot) {
            if (spot == NaN)
                return NaN;
            var result = this.columnNum[spot];
            if (typeof result !== "number") {
                console.warn("columnNum is invalid", { worldId: this.id, spots: this.spots, spot, result, maxCol: this.maxColumn });
            }
            return this.columnNum[spot];
        }
        countTags(tag) {
            var count = 0;
            app
                .formationIds
                .map((cruId, i) => {
                if (!(cruId != null) || cruId == "0")
                    return;
                var cru = jsonData
                    .crusaders
                    .find(refCru => refCru.id == cruId);
                if (cru) {
                    cru
                        .tags
                        .map(cruTag => {
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
        }
        getFilledColumnSpots(column, tag) {
            var count = 0;
            app
                .formationIds
                .map((cruId, i) => {
                if (i != column)
                    return;
                if (!tag) {
                    count += 1;
                }
                else {
                    var cru = cruId && jsonData
                        .crusaders
                        .find(refCru => refCru.id == cruId);
                    if (!cru)
                        return;
                    if (cru.tags.includes(tag))
                        count += 1;
                }
            });
            return count;
        }
        findDistances(spot1) {
            var visited = [];
            var distance = [];
            var adjacent = [];
            var current = spot1;
            var running = true;
            var min = 0;
            // no idea why this is being initialized as an array, then later set to a number
            var minLoc = [];
            for (var i = 0; i < this.spots; i++) {
                visited[i] = false;
                distance[i] = 100;
            }
            distance[spot1] = 0;
            while (running) {
                adjacent = this.whatsAdjacent(current);
                visited[current] = true;
                min = 100;
                if (adjacent.length === 0) {
                    running = false;
                }
                for (var j = 0; j < adjacent.length; j++) {
                    distance[adjacent[j]] = Math.min(distance[current] + 1, distance[adjacent[j]]);
                }
                for (j = 0; j <= this.spots; j++) {
                    if (!visited[j] && distance[j] < min) {
                        min = distance[j];
                        minLoc = j;
                    }
                }
                if (current == minLoc) {
                    running = false;
                }
                if (typeof minLoc == "number")
                    current = minLoc;
            }
            for (i = 0; i < distance.length; i++) {
                if (distance[i] == 100) {
                    distance[i] = -1;
                }
            }
            return distance;
        }
        setAdjacent(spot, adjacentArray) {
            this.adjacent[spot] = adjacentArray;
        }
    }
    app.World = World;
    /**
     *
     * @param {World} currentWorld
     * @param {number} spot
     */
    var getIsValidSpotNumber = (currentWorld, spot) => (spot || spot === 0) && (!(currentWorld != null) || spot < currentWorld.spots);
    /**
     *
     * @param {World} currentWorld
     * @param {number} spot1
     * @param {number} spot2
     */
    var getAreInSameColumn = (currentWorld, spot1, spot2) => currentWorld != null && getIsValidSpotNumber(currentWorld, spot1) && getIsValidSpotNumber(currentWorld, spot2) && currentWorld.getColumnNum(spot1) == currentWorld.getColumnNum(spot2);
    /**
     *
     * @param {World} currentWorld
     * @param {number} front
     * @param {number} maybeBehind
     */
    var getIsBehind = (currentWorld, 
        /*: World */
        front, maybeBehind) => currentWorld != null && getIsValidSpotNumber(currentWorld, front) && getIsValidSpotNumber(currentWorld, maybeBehind) && currentWorld.getColumnNum(front) == currentWorld.getColumnNum(maybeBehind) + 1;
    //returns the itemId, not the rarity or legendary level
    /**
     *
     * @param {string} cruId
     * @param {number} gearSlot
     * @param {?boolean} debug
     * @return {string}
     */
    var getItemId = my.getItemId = (cruId, gearSlot, debug = false) => {
        if (gearSlot != 0 && gearSlot != 1 && gearSlot != 2)
            throw "invalid gearSlot passed";
        var result = app.crusaderGear && app.crusaderGear[cruId] && (app.crusaderGear[cruId]["s" + gearSlot.toString()] || app.crusaderGear[cruId]["slot" + gearSlot]);
        if (debug)
            console.log('getItemId', cruId, gearSlot, app.crusaderGear && app.crusaderGear[cruId], result);
        return result;
    };
    /**
     *
     * @param {Crusader} crusader
     */
    var crusaderSetup = crusader => {
        crusader.globalDps = 1;
        crusader.globalGold = 1;
        crusader.critChance = 0;
        // for momma only
        if (crusader.hasOwnProperty("turkeyApplied"))
            crusader.turkeyApplied = undefined;
        // for any dps that is zapped
        if (crusader.hasOwnProperty("zapped"))
            crusader.zapped = undefined;
        if (!(crusader.gear != null))
            return;
        crusader
            .gear
            .map((gearType, i) => {
            switch (crusader.gear[i]) {
                case "clickCrit":
                    crusader.critChance += itemCrit(crusader, i);
                    break;
                case "alldps":
                    var itemId = getItemId(crusader.id, i);
                    var rarity = itemId && app.Loot.getRarityByItemId(itemId, crusader.loot);
                    var dps = rarity && itemDPS(rarity) || 1;
                    if (dps != 1)
                        crusader["s" + i] = dps;
                    crusader.globalDps *= dps;
                    break;
                case "gold":
                    var slotGold = itemGold(crusader, i) || 1;
                    if (slotGold != 1)
                        crusader["s" + i] = slotGold;
                    crusader.globalGold *= slotGold;
                    break;
                case "selfdps":
                    // can be v1, or V2, compound or not
                    var itemId = getItemId(crusader.id, i);
                    var selfDpsRarity = itemId && app.Loot.getRarityByItemId(itemId, crusader.loot);
                    var selfIsGolden = itemId && app.Loot.getIsGolden(itemId, crusader.loot);
                    var selfDps = selfDpsRarity && itemSelfDPS(selfDpsRarity, selfIsGolden, crusader.id == 15);
                    if ((selfDps || 1) != 1)
                        crusader["s" + i] = selfDps;
                    if (crusader == dpsChar) {
                        crusader.globalDps *= selfDps || 1;
                    }
                    break;
            }
        });
    };
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
        if (!(rarity != null))
            return 1;
        switch (rarity) {
            case 1:
                return 1.25;
            case 2:
                return 1.5;
            case 3:
                return 2;
            case 4:
                if (isGolden === true)
                    return 7;
                return 5;
            case 5:
                if (isGolden === true)
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
        var item = itemId && app.Loot.getLootFromId(itemId, crusader.loot);
        if (!(item != null))
            return 1;
        switch (item.rarity) {
            case 1:
                return 1.1;
            case 2:
                return 1.25;
            case 3:
                return 1.5;
            case 4:
                if (item.golden === true)
                    return 2.5;
                return 2;
            case 5:
                if (item.golden === true)
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
        var item = lootId && app.Loot.getLootFromId(lootId, crusader.loot);
        if (!(item != null))
            return 1;
        switch (item.rarity) {
            case 1:
                return 1;
            case 2:
                return 2;
            case 3:
                return 3;
            case 4:
                if (item.golden === true)
                    return 6;
                return 4;
            case 5:
                if (item.golden === true)
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
        var item = lootId && app.Loot.getLootFromId(lootId, crusader.loot);
        if (!(item != null))
            return 1;
        switch (item.rarity) {
            case 1:
                return 1.1;
            case 2:
                return 1.25;
            case 3:
                return 1.5;
            // epic
            case 4:
                if (item.golden === true)
                    return 2.5;
                return 2;
            case 5:
                if (item.golden === true)
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
        var item = lootId && app.Loot.getLootFromId(lootId, crusader.loot);
        if (!(item != null))
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
    function legendaryFactor(crusader, gearSlot, debug = false) {
        if (app.disableLegendaries === true)
            return 0;
        var itemId = getItemId(crusader.id, gearSlot);
        var level = app.Loot.getLLevel(itemId, crusader.loot);
        if (debug)
            console.log('legendaryFactor for ', crusader.id, gearSlot, itemId, level);
        if (!(level != null))
            return 0;
        if (level >= 1) {
            var lFactor = Math.pow(2, level - 1);
            crusader["l" + gearSlot] = lFactor;
            return lFactor;
        }
        else {
            return 0;
        }
    }
    ///////// Formation Calculations ////Slot 1 //bushwhacker
    var bushwhacker = getCrusader("01");
    bushwhacker.calculate = function () {
        bushwhacker.critChance += 1 * legendaryFactor(bushwhacker, 1);
        if (dpsChar != null && dpsChar.tags.includes(Tag.robot)) {
            bushwhacker.globalDps *= 1 + 1 * legendaryFactor(bushwhacker, 2);
        }
    };
    ////RoboRabbit
    var rabbit = getCrusader("01a");
    rabbit.calculate = function () {
        if (rabbit.clicking) {
            rabbit.globalDps *= 1 + 0.25 * itemAbility(rabbit, 2);
        }
        rabbit.globalDps *= 1 + 0.25 * currentWorld.countTags(Tag.robot) * legendaryFactor(rabbit, 0);
    };
    ////Graham
    var graham = getCrusader("01b");
    graham.calculate = function () {
        graham.globalDps *= 1.01;
        if (graham.stopped) {
            graham.globalDps *= 1 + (0.5 * itemAbility(graham, 2)) * (1 + legendaryFactor(graham, 1));
        }
        graham.globalDps *= 1 + 1 * legendaryFactor(graham, 0);
        if (dpsChar && dpsChar.tags.includes(Tag.human)) {
            graham.globalDps *= 1 + 1 * legendaryFactor(graham, 2);
        }
    };
    ////Warwick the Warlock
    var warwick = getCrusader('01c');
    warwick.calculate = function () {
        var clicking = false;
        if (clicking) {
            warwick.globalDps *= 1 + 2 * (1 + 1 * legendaryFactor(warwick, 0));
        }
        if (dpsChar && dpsChar.tags.includes(Tag.magic)) {
            warwick.globalDps *= 1 + 1 * legendaryFactor(warwick, 1);
        }
        if (dpsChar && dpsChar.tags.includes(Tag.leprechaun)) {
            warwick.globalDps *= 1 + 1 * legendaryFactor(warwick, 2);
        }
    };
    //////Slot 2 //Jim
    var jim = getCrusader("02");
    jim.calculate = function () {
        //Self Buff - buddy system
        var spot = getCrusaderSpot(app.formationIds, jim.id);
        if (jim == dpsChar) {
            if (getIsValidSpotNumber(currentWorld, spot)) {
                var adjacent = currentWorld.whatsAdjacent(spot || NaN);
                for (var i = 0; i < adjacent.length; i++) {
                    var adjCruId = app.formationIds[adjacent[i]];
                    if (adjCruId != null)
                        jim.globalDps *= 1 + (1 + legendaryFactor(jim, 1));
                    break;
                }
            }
        }
        //Column Buff
        var dpsSpot = dpsChar && getCrusaderSpot(app.formationIds, dpsChar.id);
        var isInColumnWithDps = getAreInSameColumn(currentWorld, spot, dpsSpot);
        if (isInColumnWithDps) {
            jim.globalDps *= 1 + 0.5 * (1 + legendaryFactor(jim, 0));
        }
        else if (karen == dpsChar) {
            jim.globalDps *= 1 + 0.5 * (1 + legendaryFactor(jim, 0)) * 0.5 * (itemAbility(karen, 0));
            karen.effects += 1;
        }
        var sashaSpot = getCrusaderSpot(app.formationIds, sasha.id);
        if (getIsValidSpotNumber(currentWorld, sashaSpot)) {
            jim.globalDps *= 1 + legendaryFactor(jim, 2);
        }
    };
    ////Pam
    var pam = getCrusader("02a");
    pam.calculate = function () {
        var numInColumn = 0;
        var dpsInColumn = false;
        var numAdjacent = 0;
        var spot = getCrusaderSpot(app.formationIds, pam.id);
        //Focused Teamwork
        jsonData
            .crusaders
            .filter(cru => app.formationIds.includes(cru.id))
            .map(cru => {
            var cruSpot = getCrusaderSpot(app.formationIds, cru.id);
            if (getAreInSameColumn(currentWorld, spot, cruSpot)) {
                numInColumn += 1;
                if (cru == dpsChar) {
                    dpsInColumn = true;
                }
            }
        });
        if (numInColumn == 2 && dpsInColumn) {
            pam.globalDps *= 1 + 1 * itemAbility(pam, 1) * (1 + legendaryFactor(pam, 0));
        }
        if (numInColumn == 2 && !dpsInColumn && karen == dpsChar) {
            pam.globalDps *= 1 + 1 * itemAbility(pam, 1) * (1 + legendaryFactor(pam, 0)) * 0.5 * itemAbility(karen, 0);
            karen.effects += 1;
        }
        //Co-Pilot
        if (pam == dpsChar) {
            var adjacent = getIsValidSpotNumber(currentWorld, spot) && currentWorld.whatsAdjacent(spot || NaN);
            if (adjacent !== false)
                for (var i = 0; i < adjacent.length; i++) {
                    var adjCruId = app.formationIds[adjacent[i]];
                    if (adjCruId != null)
                        numAdjacent += 1;
                }
            if (numAdjacent >= 1) {
                pam.globalDps *= 2;
            }
        }
        pam.globalDps *= 1 + 0.25 * currentWorld.countTags(Tag.dps) * legendaryFactor(pam, 1);
        if (numAdjacent <= 3) {
            pam.globalDps *= 1 + 1 * legendaryFactor(pam, 2);
        }
    };
    ////Veronica
    var veronica = getCrusader("02b");
    veronica.calculate = function () {
        var dpsAffected = false;
        var spot = getCrusaderSpot(app.formationIds, veronica.id);
        //Precise Aim
        var adjacent = currentWorld.whatsAdjacent(spot);
        for (var j = 0; j < adjacent.length; j++) {
            var adjCru = jsonData
                .crusaders
                .find(cru => cru.id == app.formationIds[adjacent[j]]);
            if (adjCru && dpsChar && adjCru.id == dpsChar.id) {
                dpsAffected = true;
            }
        }
        var dpsSpot = dpsChar && getDpsSpot(app.formationIds, dpsChar);
        if (getAreInSameColumn(currentWorld, dpsSpot, spot)) {
            dpsAffected = true;
        }
        if (dpsAffected) {
            veronica.globalDps *= 1 + 0.25 * (1 + currentWorld.countTags(Tag.robot)) * itemAbility(veronica, 0) * (1 + legendaryFactor(veronica, 0));
        }
        if (!dpsAffected && karen == dpsChar) {
            veronica.globalDps *= 1 + 0.25 * (1 + currentWorld.countTags(Tag.robot)) * itemAbility(veronica, 0) * (1 + legendaryFactor(veronica, 0)) * 0.5 * itemAbility(karen, 0);
            karen.effects *= 1;
        }
        if (countShots) {
            veronica.globalDps *= 1 + 2 * itemAbility(veronica, 2) / 5;
        }
        veronica.globalDps *= 1 + 0.25 * currentWorld.countTags(Tag.robot) * legendaryFactor(veronica, 1);
        veronica.globalDps *= 1 + 0.5 * currentWorld.countTags(Tag.elf) * legendaryFactor(veronica, 2);
    };
    ////Arachnobuddy
    var arachno = getCrusader('02c');
    arachno.calculate = function () {
        if (countShots) {
            arachno.globalDps *= 1 + (2 / 3) * (1 + 0.05 * itemAbility(arachno, 1)) * itemGreyShots(arachno, 0) * (1 + legendaryFactor(arachno, 0));
        }
        var soldieretteSpot = getCrusaderSpot(app.formationIds, soldierette.id);
        if (soldieretteSpot != null) {
            arachno.globalDps *= 1 + 1 * (1 + legendaryFactor(arachno, 1));
        }
        arachno.globalDps *= 1 + 0.25 * (1 + legendaryFactor(arachno, 2));
    };
    //////Slot 3 //Emo Werewolf
    var emo = getCrusader("03");
    emo.test = "test";
    emo.calculate = function () {
        //Conditional Self Buff
        if (emo == dpsChar) {
            var noHumansAdjacent = true;
            var spot = getCrusaderSpot(app.formationIds, emo.id);
            var adjacent = currentWorld.whatsAdjacent(spot);
            var numAdjacent = 0;
            for (var i = 0; i < adjacent.length; i++) {
                var adjCruId = app.formationIds[adjacent[i]];
                var adjCru = adjCruId && jsonData
                    .crusaders
                    .find(cru => cru.id == adjCruId);
                if (adjCruId != null) {
                    numAdjacent += 1;
                }
                if (adjCru && adjCru.tags.includes(Tag.human)) {
                    noHumansAdjacent = false;
                }
            }
            if (noHumansAdjacent) {
                emo.globalDps *= 1 + 2 * (1 + legendaryFactor(emo, 0));
            }
            emo.globalDps *= 1 + 0.25 * numAdjacent * legendaryFactor(emo, 1);
        }
        if (dpsChar && dpsChar.tags.includes(Tag.animal)) {
            emo.globalDps *= 1 + 1 * legendaryFactor(emo, 2);
        }
    };
    ////Sally the Succubus
    var sally = getCrusader("03a");
    sally.calculate = function () {
        var spot = getCrusaderSpot(app.formationIds, sally.id);
        if (dpsChar && dpsChar.tags.includes(Tag.female)) {
            sally.globalDps *= 1.2;
        }
        if (sally == dpsChar) {
            var femalesAdjacent = 0;
            var numAdjacent = 0;
            var adjacent = currentWorld.whatsAdjacent(spot);
            for (var i = 0; i < adjacent.length; i++) {
                var adjCruId = app.formationIds[adjacent[i]];
                var adjCru = adjCruId && jsonData
                    .crusaders
                    .find(cru => cru.id == adjCruId);
                if (adjCruId != null) {
                    numAdjacent += 1;
                }
                if (adjCru && adjCru.tags.includes(Tag.female)) {
                    femalesAdjacent += 1;
                }
            }
            sally.globalDps *= 4 - 0.25 * femalesAdjacent;
            sally.globalDps *= 1 + 0.2 * currentWorld.countTags(Tag.male) * legendaryFactor(sally, 0);
            if (numAdjacent >= 4) {
                sally.globalDps *= 1 + 1 * legendaryFactor(sally, 1);
            }
            sally.globalDps *= 1 + 0.2 * (currentWorld.filled - currentWorld.countTags(Tag.supernatural)) * legendaryFactor(sally, 2);
        }
    };
    ////Karen, the Cat Teenager
    var karen = getCrusader("03b");
    karen.effects = 0;
    karen.deaths = 0;
    karen.calculate = function () {
        karen.globalDps *= 1 + 0.25 * currentWorld.countTags(Tag.animal) * legendaryFactor(karen, 1);
        karen.globalDps *= 1 + karen.deaths * legendaryFactor(karen, 2);
    };
    karen.finalCalculate = function () {
        karen.globalDps *= 1 + 0.25 * karen.effects * legendaryFactor(karen, 0);
    };
    //////Slot 4 //Sasha the Fierce Warrior
    var sasha = getCrusader("04");
    sasha.calculate = function () {
        var spot = getCrusaderSpot(app.formationIds, sasha.id);
        var numBehind = 0;
        var dpsCharSpot = dpsChar && getDpsSpot(app.formationIds, dpsChar);
        if (getIsBehind(currentWorld, spot, dpsCharSpot)) {
            sasha.globalDps *= 1 + 0.3 * itemAbility(sasha, 1) * (1 + legendaryFactor(sasha, 2));
        }
        else if (karen == dpsChar) {
            sasha.globalDps *= 1 + 0.3 * itemAbility(sasha, 1) * (1 + legendaryFactor(sasha, 2)) * 0.5 * itemAbility(karen, 0);
            karen.effects += 1;
        }
        sasha.globalDps *= 1 + 0.5 * currentWorld.countTags(Tag.tank) * legendaryFactor(sasha, 0);
        app
            .formationIds
            .map((cruId, i) => {
            var cruSpot = getCrusaderSpot(app.formationIds, cruId);
            if (getIsBehind(currentWorld, spot, cruSpot)) {
                numBehind += 1;
            }
        });
        sasha.globalDps *= 1 + 0.33 * numBehind * legendaryFactor(sasha, 1);
    };
    ////Groklok the Orc
    var groklok = getCrusader("04a");
    groklok.calculate = function () {
        var spot = getCrusaderSpot(app.formationIds, groklok.id);
        var column = currentWorld.getColumnNum(spot);
        var drizzleMult = 1;
        var numAffected = currentWorld.getFilledColumnSpots(column + 1);
        var karenSpot = getCrusaderSpot(app.formationIds, karen.id);
        if (karenSpot != null && currentWorld.getColumnNum(karenSpot) != column + 1) {
            numAffected += 1;
        }
        var drizzleSpot = getCrusaderSpot(app.formationIds, drizzle.id);
        if (drizzleSpot != null && (currentWorld.getColumnNum(drizzleSpot) || NaN) > column) {
            drizzleMult = 2;
        }
        //Eligible Receivers
        var dpsCharSpot = dpsChar && getDpsSpot(app.formationIds, dpsChar);
        if (getIsBehind(currentWorld, dpsCharSpot, spot)) {
            groklok.globalDps *= 1.5 * drizzleMult * itemAbility(groklok, 0) * (1 + legendaryFactor(groklok, 2)) / numAffected;
        }
        else if (karen == dpsChar) {
            groklok.globalDps *= 1.5 * drizzleMult * itemAbility(groklok, 0) * 0.5 * itemAbility(karen, 0) * (1 + legendaryFactor(groklok, 2)) / numAffected;
            karen.effects += 1;
        }
        //Gunslinger (bracer)
        if (groklok == dpsChar && currentWorld.filled < currentWorld.spots) {
            groklok.globalDps *= 1 + 1.5 * (1 + legendaryFactor(groklok, 1));
        }
        //Defensive Team
        if (currentWorld.getColumnNum(spot) == currentWorld.maxColumn) {
            groklok.globalDps *= 1 + 0.1 * numAttacking * (1 + legendaryFactor(groklok, 0));
        }
    };
    ////Mindy the Mime
    var mindy = getCrusader("04b");
    mindy.calculate = function () {
        console.log('mindy is calculating');
        mindy.globalDps = "Mindy isn't setup for calculations yet";
    };
    ////Dani the Damsel in Distress
    var dani = getCrusader('04c');
    dani.calculate = function () {
        var spot = getCrusaderSpot(app.formationIds, groklok.id);
        var eyeMult = 1;
        var numMales = currentWorld.countTags(Tag.male);
        var numFemales = currentWorld.countTags(Tag.female);
        var adjacent = currentWorld.whatsAdjacent(spot);
        //flirty
        dani.globalDps *= 1.15;
        // dagger is handled by crusader setup
        if (montana.inFormation) {
            eyeMult = 3;
        }
        // eye candy
        if (dpsChar && dpsChar.tags.includes(Tag.male)) {
            dani.globalDps *= 1 + 0.5 * eyeMult * itemAbility(dani, 1) * (1 + legendaryFactor(dani, 2));
        }
        // penny in your pocket
        dani.globalGold *= 1 + Math.pow(0.1 * itemAbility(dani, 0), numMales);
        // boggins.critChance += 3 * legendaryFactor(boggins, 0);
        dani.critChance += 3;
        if (numMales > numFemales) {
            dani.globalDps *= 1 + legendaryFactor(dani, 1);
            var dpsSpot = dpsChar && getDpsSpot(app.formationIds, dpsChar);
            if (adjacent.includes(dpsSpot || NaN)) {
                dani.globalDps *= 1 + legendaryFactor(dani, 0);
            }
        }
    };
    //////Slot 5 //The Washed Up Hermit
    var hermit = getCrusader("05");
    hermit.calculate = function () {
        //Craziness
        if (hermit == dpsChar) {
            var noOneAhead = true;
            var spot = getCrusaderSpot(app.formationIds, hermit.id);
            var adjacent = currentWorld.whatsAdjacent(spot);
            for (var i = 0; i < adjacent.length && noOneAhead; i++) {
                var adjCruId = app.formationIds[adjacent[i]];
                if (getIsBehind(currentWorld, getCrusaderSpot(app.formationIds, adjCruId), spot)) {
                    noOneAhead = false;
                }
            }
            if (hermit.noOneAhead) {
                hermit.globalDps *= 3;
            }
            hermit.globalDps *= 1 + (currentWorld.spots - currentWorld.filled) * legendaryFactor(hermit, 0);
            hermit.globalDps *= 1 + 0.25 * currentWorld.countTags(Tag.supernatural) * legendaryFactor(hermit, 2);
        }
        if (dpsChar && dpsChar.tags.includes(Tag.human)) {
            hermit.globalDps *= 1 + legendaryFactor(hermit, 1);
        }
    };
    ////Kyle
    var kyle = getCrusader("05a");
    kyle.calculate = function () {
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
                var adjCru = jsonData
                    .crusaders
                    .find(cru => cru.id == adjCruId);
                if (!(adjCru != null))
                    continue;
                var adjCruSpot = getCrusaderSpot(app.formationIds, adjCru.id);
                if (adjCru.tags.includes(Tag.female)) {
                    femaleAdjacent = true;
                }
                if (adjCru.tags.includes(Tag.leprechaun)) {
                    leprechaunAdjacent = true;
                }
                if (adjCru.tags.includes(Tag.animal)) {
                    animalAdjacent = true;
                }
                if (dpsChar && adjCruId == dpsChar.id) {
                    dpsSmashed = true;
                }
                if (currentWorld.getColumnNum(spot) > currentWorld.getColumnNum(adjCruSpot)) {
                    numBehind += 1;
                }
                if (currentWorld.getColumnNum(spot) < currentWorld.getColumnNum(adjCruSpot)) {
                    numAhead += 1;
                }
            }
        }
        //Get Smashed
        if (dpsSmashed && numAdjacent <= 3) {
            kyle.globalDps *= 1 + 0.25;
        }
        if (kyle == dpsChar) {
            if (femaleAdjacent) {
                kyle.globalDps *= 2;
            }
            if (leprechaunAdjacent) {
                kyle.globalDps *= 2;
            }
            if (animalAdjacent) {
                kyle.globalDps *= 2;
            }
            kyle.globalDps *= 1 + 0.5 * Math.max(numAdjacent, 3) * itemAbility(kyle, 1) * (1 + legendaryFactor(kyle, 2));
            if (numAdjacent >= 4) {
                kyle.globalDps *= 1 + legendaryFactor(kyle, 0);
            }
            if (numBehind > numAhead) {
                kyle.globalDps *= 1 + legendaryFactor(kyle, 1);
            }
        }
        var karenSpot = getCrusaderSpot(app.formationIds, karen.id) || NaN;
        if (karen == dpsChar && !adjacent.includes(karenSpot) && numAdjacent <= 2) {
            kyle.globalDps *= 1 + 0.25 * 0.5 * itemAbility(karen, 0);
            karen.effects += 1;
        }
        if (dpsChar && dpsSmashed) {
            dpsChar.smashed = true;
        }
        else if (dpsChar) {
            dpsChar.smashed = false;
        }
    };
    ////Serpent King Draco
    /**
     * @type {Crusader}
     */
    var draco = getCrusader("05b");
    /**
     * @param {Array<String>} formationIds
     */
    draco.calculate = function (formationIds) {
        if (draco == dpsChar) {
            var royals = currentWorld.countTags(Tag.royal);
            var animals = currentWorld.countTags(Tag.animal);
            var robots = currentWorld.countTags(Tag.robot);
            var nonRoyalHumans = 0;
            formationIds
                .filter(cruId => cruId != null && cruId != 0)
                .map(cruId => {
                var cru = jsonData
                    .crusaders
                    .find(refCru => refCru.id == cruId);
                if (cru.tags.includes(Tag.human) && !cru.tags.includes(Tag.royal)) {
                    nonRoyalHumans += 1;
                }
            });
            draco.globalDps *= 1 + royals - 0.5 * nonRoyalHumans;
            draco.globalDps *= 1 + animals - 0.5 * robots;
        }
        if (dpsChar && dpsChar.tags.includes(Tag.royal)) {
            draco.globalDps *= 1 + legendaryFactor(draco, 0);
        }
        if (dpsChar && dpsChar.tags.includes(Tag.animal)) {
            draco.globalDps *= 1 + legendaryFactor(draco, 1);
        }
        draco.globalDps *= 1 + 0.2 * currentWorld.countTags(Tag.human) * legendaryFactor(draco, 2);
    };
    ////Henry, the Scaredy-Ghoul
    var henry = getCrusader("05c");
    /**
     * @type {Crusader}
     */
    henry.calculate = function () {
        var spot = getCrusaderSpot(app.formationIds, henry.id);
        if (henry == dpsChar) {
            var noOneBehind = true;
            henry.globalDps *= currentWorld.filled - currentWorld.countTags(Tag.human);
            var adjacent = currentWorld.whatsAdjacent(spot);
            for (var i = 0; i < adjacent.length && noOneBehind; i++) {
                var adjCruSpot = getCrusaderSpot(app.formationIds, adjacent[i]);
                if (currentWorld.getColumnNum(spot) == currentWorld.getColumnNum(adjCruSpot) + 1) {
                    noOneBehind = false;
                }
            }
            henry.globalDps *= 1 + (currentWorld.spots - currentWorld.filled) * legendaryFactor(henry, 2);
        }
        var alanSpot = getCrusaderSpot(app.formationIds, alan.id);
        if (alanSpot != null) {
            henry.globalDps *= 1 + legendaryFactor(henry, 0);
        }
        henry.globalDps *= 1 + 0.2 * (currentWorld.filled - currentWorld.countTags(Tag.human)) * legendaryFactor(henry, 1);
    };
    //////Slot 6 //Detective Kaine
    /**
     * @type {Crusader}
     */
    var kaine = getCrusader("06");
    kaine.calculate = function () {
        //A-Ha
        var spot = getCrusaderSpot(app.formationIds, kaine.id);
        // don't use >= because javascript
        if (spot == null || (spot === 0 || spot > 0) && app.formationIds[spot] != kaine.id)
            throw Error("indexOf for kaine failed");
        var numInColumn = currentWorld.getFilledColumnSpots(currentWorld.getColumnNum(spot));
        kaine.globalGold *= Math.pow(1 + 0.2 * itemAbility(kaine, 0), numInColumn) || 1;
        //Karen compatability for A-Ha
        var karenSpot = getCrusaderSpot(app.formationIds, karen.id);
        if (karenSpot != null && (currentWorld.getColumnNum(spot) != currentWorld.getColumnNum(karenSpot))) {
            kaine.globalGold *= (1 + 0.2 * itemAbility(kaine, 0) * 0.5 * itemAbility(karen, 0)) || 1;
            karen.effects += 1;
        }
        var nateSpot = getCrusaderSpot(app.formationIds, nate.id);
        if (nateSpot != null) {
            kaine.globalDps *= 1 + legendaryFactor(kaine, 0) || 1;
        }
        var kaineLegendaryFactor = legendaryFactor(kaine, 1, true);
        var xpGold = 1 + 0.25 * kaine.XP * kaineLegendaryFactor;
        console.log('kaine xpGold', xpGold, kaineLegendaryFactor);
        kaine.globalGold *= xpGold || 1;
        kaine.globalGold *= 1 + 0.25 * currentWorld.countTags(Tag.gold) * legendaryFactor(kaine, 2) || 1;
    };
    ////Mister the Monkey
    /**
     * @type {Crusader}
     */
    var mister = getCrusader("06a");
    mister.calculate = function () {
        var spot = getCrusaderSpot(app.formationIds, mister.id);
        var numAnimals = currentWorld.countTags(Tag.animal);
        var numBehind = currentWorld.getFilledColumnSpots(currentWorld.getColumnNum(spot) - 1);
        mister.globalGold *= Math.pow(1 + (0.15 + 0.05 * numAnimals) * itemAbility(mister, 1) * (1 + legendaryFactor(mister, 2)), numBehind);
        mister.globalDps *= 1 + 0.25 * numBehind * legendaryFactor(mister, 1);
        var karenSpot = getCrusaderSpot(app.formationIds, karen.id);
        if (karenSpot != null && currentWorld.getColumnNum(karenSpot) != currentWorld.getColumnNum(spot) - 1) {
            karen.effects += 1;
            mister.globalGold *= 1 + (0.15 + 0.05 * numAnimals) * itemAbility(mister, 1) * (1 + legendaryFactor(mister, 2)) * 0.5 * itemAbility(karen, 0);
        }
        if (dpsChar && dpsChar.tags.includes(Tag.animal)) {
            mister.globalDps *= 1 + legendaryFactor(mister, 0);
        }
    };
    ////Grandmora
    /**
     * @type {Crusader}
     */
    var grandmora = getCrusader('05d');
    grandmora.calculate = function () {
        var spot = getCrusaderSpot(app.formationIds, grandmora.id);
        if (spot == undefined || spot == null)
            return;
        var column = currentWorld.getColumnNum(spot);
        if (column == undefined || column == null)
            return;
        // how many crusaders behind grandmora?
        var numBehind = Math.max(currentWorld.getFilledColumnSpots(currentWorld.getColumnNum(spot || NaN) - 1), 1);
        var numAhead = Math.max(currentWorld.getFilledColumnSpots(currentWorld.getColumnNum(spot || NaN) + 1), 1);
        var adjacent = currentWorld.whatsAdjacent(spot);
        var dpsSpot = dpsChar && getDpsSpot(app.formationIds, dpsChar);
        if (currentWorld.getColumnNum(spot) == currentWorld.getColumnNum(dpsSpot) - 1) {
            grandmora.globalDps *= 1 + 3 * itemAbility(grandmora, 0) / numBehind;
        }
        else if (dpsChar != null && karen == dpsChar) {
            grandmora.globalDps *= 1 + 3 * itemAbility(grandmora, 0) * itemAbility(karen, 0) / numBehind;
        }
        if (currentWorld.getColumnNum(spot) == currentWorld.getColumnNum(dpsSpot) + 1) {
            grandmora.globalDps *= 1 + 0.75 * itemAbility(grandmora, 1) * numAhead;
        }
        else if (karen.isDPS) {
            grandmora.globalDps *= 1 + 0.75 * itemAbility(grandmora, 1) * itemAbility(karen, 0) * numAhead;
        }
        if (currentWorld.countTags(Tag.alien) > 1) {
            grandmora.globalDps *= 1 + legendaryFactor(grandmora, 0);
        }
        if (dpsChar && dpsChar.tags.includes(Tag.human)) {
            grandmora.globalDps *= 1 + legendaryFactor(grandmora, 1);
        }
        if (dpsSpot && adjacent.includes(dpsSpot)) {
            grandmora.globalDps *= 1 + 2 * legendaryFactor(grandmora, 2);
        }
    };
    ////Larry the Leprechaun
    /**
     * @type {Crusader}
     */
    var larry = getCrusader("06b");
    larry.calculate = function () {
        var numAdjacent = 0;
        var spot = getCrusaderSpot(app.formationIds, larry.id);
        var adjacent = currentWorld.whatsAdjacent(spot);
        for (var i = 0; i < adjacent.length; i++) {
            var adjCruId = app.formationIds[i];
            if (adjCruId != null) {
                numAdjacent += 1;
            }
        }
        larry.globalGold *= Math.pow(1 + 0.1 * 1.25 * itemAbility(larry, 0) * (1 + legendaryFactor(larry, 2)), numAdjacent);
        if (numAdjacent <= 3) {
            larry.globalDps *= 2;
        }
        if (numAdjacent >= 6) {
            larry.globalGold *= 1.25;
        }
        larry.globalDps *= 1 + 0.25 * currentWorld.countTags(Tag.magic) * legendaryFactor(larry, 0);
        larry.globalDps *= 1 + 0.5 * currentWorld.countTags(Tag.leprechaun) * legendaryFactor(larry, 1);
        var karenSpot = getCrusaderSpot(app.formationIds, karen.id);
        if (karenSpot != null && !adjacent.includes(karenSpot)) {
            larry.globalGold *= 1 + 0.1 * 1.25 * itemAbility(larry, 0) * (1 + legendaryFactor(larry, 2)) * 0.5 * itemAbility(karen, 0);
        }
    };
    ////Bernard the Bartender
    /**
     * @type {Crusader}
     */
    var bernard = getCrusader("06c");
    bernard.calculate = function () {
        var spot = getCrusaderSpot(app.formationIds, bernard.id);
        var numAdjacent = 0;
        var numFemales = currentWorld.countTags(Tag.female);
        var adjacent = currentWorld.whatsAdjacent(spot);
        var tipsPercent = 0.2 * itemAbility(bernard, 0);
        var tipsGoldPercent = 0.2 * itemAbility(bernard, 2) * (1 + numFemales) * (1 + legendaryFactor(bernard, 2));
        for (var i = 0; i < adjacent.length; i++) {
            var adjCruId = app.formationIds[i];
            if (adjCruId) {
                numAdjacent += 1;
            }
        }
        if (numAdjacent <= 3) {
            tipsPercent += numAdjacent * 0.1;
        }
        else {
            tipsPercent += 0.6 - numAdjacent * 0.1;
        }
        bernard.globalGold *= 1 + tipsPercent * tipsGoldPercent;
        bernard.globalGold *= 1 + legendaryFactor(bernard, 0);
        bernard.globalDps *= 1 + 0.25 * currentWorld.countTags(Tag.female) * legendaryFactor(bernard, 1);
    };
    //////Slot 7 //The Princess
    /**
     * @type {Crusader}
     */
    var princess = getCrusader("07");
    princess.calculate = function () {
        //Ignite, Char, Conflagrate (Check if these multiply or add)
        princess.globalDps *= Math.pow((1 + 0.1 * itemAbility(princess, 2)), 3);
        var reginaldSpot = getCrusaderSpot(app.formationIds, reginald.id);
        if (reginaldSpot != null) {
            princess.globalDps *= 1 + legendaryFactor(princess, 0);
        }
        if (dpsChar && !dpsChar.tags.includes(Tag.event)) {
            princess.globalDps *= 1 + legendaryFactor(princess, 1);
        }
        princess.globalDps *= 1 + 0.25 * currentWorld.countTags(Tag.royal) * legendaryFactor(princess, 2);
    };
    ////RoboTurkey
    var turkey = getCrusader("07a");
    turkey.calculate = function () {
        var spot = getCrusaderSpot(app.formationIds, turkey.id);
        var adjacent = currentWorld.whatsAdjacent(spot);
        var numAdjacent = 0;
        var dpsZapped = false;
        var dpsSpot = dpsChar && getDpsSpot(app.formationIds, dpsChar);
        adjacent
            .filter(f => f != null)
            .map(adjSpot => {
            numAdjacent += 1;
            if (dpsSpot == adjSpot) {
                dpsZapped = true;
            }
        });
        var karenSpot = getCrusaderSpot(app.formationIds, karen.id);
        if (karenSpot != null && adjacent.includes(karenSpot)) {
            numAdjacent += 1;
        }
        if (numAdjacent <= 3 && dpsZapped) {
            turkey.globalDps *= 1 + 0.2 * itemAbility(turkey, 1);
            turkey.globalDps *= 1 + 0.5 * itemAbility(turkey, 1);
            turkey.globalDps *= 1 + legendaryFactor(turkey, 1);
            var mommaSpot = getCrusaderSpot(app.formationIds, momma.id);
            if (mommaSpot != null && momma.turkeyApplied != true) {
                momma.globalDps *= 1.5;
                momma.turkeyApplied = true;
            }
        }
        else if (numAdjacent <= 3 && dpsChar == karen) {
            turkey.globalDps *= 1 + 0.2 * itemAbility(turkey, 1) * 0.5 * itemAbility(karen, 0);
            turkey.globalDps *= 1 + 0.5 * itemAbility(turkey, 1);
            turkey.globalDps *= 1 + legendaryFactor(turkey, 1);
            if (mommaSpot != null && momma.turkeyApplied != true) {
                momma.globalDps *= 1.5;
                momma.turkeyApplied = true;
            }
            karen.effects += 1;
        }
        else if (karen == dpsChar) {
            if (mommaSpot != null && momma.turkeyApplied != true) {
                momma.globalDps *= 1 + 0.5 * 0.5 * itemAbility(karen, 0);
                momma.turkeyApplied = true;
                karen.effects += 1;
            }
            karen.effects += 1;
            turkey.globalDps *= 1 + legendaryFactor(turkey, 1) * 0.5 * itemAbility(karen, 0);
        }
        globalDps *= 1 + 0.25 * currentWorld.countTags(Tag.robot) * legendaryFactor(turkey, 0);
        if (mommaSpot != null) {
            globalDps *= 1 + legendaryFactor(turkey, 2);
        }
        if (dpsChar) {
            dpsChar.zapped = dpsZapped;
        }
    };
    ////Ranger Rayna
    var rayna = getCrusader("07b");
    rayna.calculate = function () {
        var numAnimals = currentWorld.countTags(Tag.animal);
        if (rayna == dpsChar) {
            rayna.globalDps *= 1 + 0.2 * numAnimals * itemAbility(rayna, 2) * (1 + legendaryFactor(rayna, 0));
            if (numAnimals >= 4) {
                rayna.globalDps *= 2;
            }
            var littleFootSpot = getCrusaderSpot(app.formationIds, karen.id);
            if (littleFootSpot != null) {
                rayna.globalDps *= 1 + legendaryFactor(rayna, 1);
            }
        }
        rayna.globalDps *= 1 + 0.25 * currentWorld.countTags(Tag.animal) * legendaryFactor(rayna, 2);
    };
    ////Baenarall, Angel of Hope
    var bae = getCrusader('07c');
    bae.calculate = function () {
        var diversityTags = {};
        var diversityBonus = 0;
        app.formationIds
            .filter(cruId => cruId != null)
            .map(cruId => {
            var cru = getCrusader(cruId);
            cru
                .tags
                .map(tag => {
                // not really sure the ramification of using a string as a key into an array
                if (!diversityTags.hasOwnProperty(tag)) {
                    diversityTags[tag] = 0;
                }
                diversityTags[tag] += 1;
            });
        });
        if (exposeYourself)
            app.diversityTags = diversityTags;
        Object
            .keys(diversityTags)
            .map(tag => {
            if (diversityTags[tag] == 1) {
                diversityBonus += 20 * itemAbility(bae, 1);
            }
            else {
                diversityBonus += -5;
            }
        });
        bae.globalDps *= 1 + diversityBonus / 100;
        bae.globalDps *= 1 + (currentWorld.filled - currentWorld.countTags(Tag.event)) * 0.05 * (1 + legendaryFactor(bae, 2));
        if (currentWorld.countTags(Tag.supernatural) < 3) {
            bae.globalDps *= 1 + legendaryFactor(bae, 0);
        }
        if (alan.inFormation) {
            bae.globalDps *= 1 + legendaryFactor(bae, 1);
        }
    };
    //////Slot 8 //Natalie Dragon
    var natalie = getCrusader("08");
    natalie.calculate = function () {
        //Double Dragon
        var nateSpot = getCrusaderSpot(app.formationIds, nate.id);
        if (nateSpot != null && natalie == dpsChar) {
            natalie.globalDps *= 1 + 2 * itemAbility(nate, 2);
        }
        if (dpsChar && dpsChar.tags.includes(Tag.female)) {
            natalie.globalDps *= 1 + legendaryFactor(natalie, 0);
        }
        natalie.globalGold *= 1 + 0.25 * currentWorld.countTags(Tag.human) * legendaryFactor(natalie, 1);
        if (nateSpot != null) {
            natalie.globalDps *= 1 + legendaryFactor(natalie, 2);
        }
    };
    ////Jack O'Lantern
    var jack = getCrusader("08a");
    jack.calculate = function () {
        var spot = getCrusaderSpot(app.formationIds, jack.id);
        if (currentWorld.getColumnNum(spot) == currentWorld.maxColumn) {
            jack.globalDps *= 1 + 0.1 * numAttacking * itemAbility(jack, 0) * (1 + legendaryFactor(jack, 0));
            jack.globalGold *= 1 + 0.1 * numAttacking * legendaryFactor(jack, 2);
        }
    };
    ////President Billy Smithsonian
    var billy = getCrusader("08b");
    billy.calculate = function () {
        if (kiz == dpsChar) {
            billy.globalDps *= 3;
        }
        if (dpsChar && dpsChar.tags.includes(Tag.human)) {
            billy.globalDps *= 1 + 0.5 * (1 + legendaryFactor(billy, 0));
        }
        billy.globalDps *= 1 + 0.1 * currentWorld.countTags(Tag.human) * legendaryFactor(billy, 1);
        billy.globalGold *= 1 + 0.1 * monstersOnscreen * legendaryFactor(billy, 2);
    };
    ////Karl the Kicker
    var karl = getCrusader("08c");
    karl.calculate = function () {
        karl.globalDps *= 1.2;
        if (countShots) {
            karl.globalDps *= 1 + 2 * itemAbility(karl, 2) * (1 + legendaryFactor(karl, 2)) / 5;
        }
        var cindySpot = getCrusaderSpot(app.formationIds, cindy.id);
        if (cindySpot != null) {
            karl.globalGold *= 1.2;
        }
        karl.globalDps *= 1 + 0.5 * currentWorld.countTags(Tag.orc) * legendaryFactor(karl, 0);
        karl.globalDps *= 1 + 0.5 * currentWorld.countTags(Tag.elf) * legendaryFactor(karl, 1);
    };
    //////Slot 9 //Jason
    var jason = getCrusader("09");
    jason.calculate = function () {
        var spot = getCrusaderSpot(app.formationIds, jason.id);
        if (currentWorld.getColumnNum(spot) == currentWorld.maxColumn && jason == dpsChar && numAttacking > 0) {
            jason.globalDps *= 1 + 4 * (1 + legendaryFactor(jason, 2));
        }
        var emoSpot = getCrusaderSpot(app.formationIds, emo.id);
        if (emoSpot != null) {
            jason.globalDps *= 1 + legendaryFactor(jason, 0);
        }
        if (numAttacking > 0) {
            jason.globalGold *= 1 + legendaryFactor(jason, 1);
        }
    };
    ////Pete the Carney
    var pete = getCrusader('09a');
    pete.calculate = function () {
        var spot = getCrusaderSpot(app.formationIds, pete.id);
        var numJoked = 0;
        var distances = currentWorld.findDistances(spot || NaN);
        var maxDistance = Math
            .max
            .apply(null, distances);
        var dpsSpot = dpsChar && getDpsSpot(app.formationIds, dpsChar);
        if (dpsSpot && distances[dpsSpot] == maxDistance) {
            pete.globalDps *= 1 + 0.5 * itemAbility(pete, 0) * (1 + legendaryFactor(pete, 0));
        }
        var karenSpot = getCrusaderSpot(app.formationIds, karen.id);
        if (karenSpot != null && distances[karenSpot] != maxDistance) {
            numJoked += 1;
            if (karen == dpsChar) {
                pete.globalDps *= 1 + 0.5 * itemAbility(pete, 0) * (1 + legendaryFactor(pete, 0)) * 0.5 * itemAbility(karen, 0);
                karen.effects += 1;
            }
        }
        for (var i in app.formationIds) {
            if (distances[i] == maxDistance) {
                numJoked += 1;
            }
        }
        pete.globalDps *= 1 + 0.25 * numJoked * legendaryFactor(pete, 1);
        if (karen.inFormation) {
            pete.globalGold *= 1 + 0.1 * (currentWorld.filled - numJoked + 1) * legendaryFactor(pete, 2);
        }
        else {
            pete.globalGold *= 1 + 0.1 * (currentWorld.filled - numJoked) * legendaryFactor(pete, 2);
        }
    };
    ////Broot
    var broot = getCrusader('09b');
    broot.calculate = function () {
        var spot = getCrusaderSpot(app.formationIds, broot.id);
        var maxColumn = currentWorld.maxColumn;
        var adjacent = currentWorld.whatsAdjacent(spot);
        if (currentWorld.getColumnNum(spot) == maxColumn) {
            if (robbie == dpsChar) {
                broot.globalDps *= 1 + 0.25 * itemAbility(robbie, 2);
            }
            else {
                broot.globalDps *= 1.25;
            }
            if (numAttacking > 0) {
                broot.globalDps *= 1 + legendaryFactor(broot, 0);
            }
        }
        if (robbie == dpsChar) {
            var robbieSpot = getCrusaderSpot(app.formationIds, robbie.id);
            if (currentWorld.getColumnNum(spot) > currentWorld.getColumnNum(robbieSpot)) {
                broot.globalDps *= 1 + itemAbility(robbie, 2);
            }
            if (adjacent.includes(robbieSpot || NaN)) {
                broot.globalDps *= 1 + itemAbility(robbie, 2);
            }
        }
        if (robbieSpot != null) {
            broot.globalDps *= 1 + legendaryFactor(broot, 1);
        }
        broot.globalDps *= 1 + 0.25 * currentWorld.countTags(Tag.animal) * legendaryFactor(broot, 2);
    };
    ////Paul the Pilgrim
    var paul = getCrusader('09c');
    paul.calculate = function () {
        var petraBonus = 0;
        var petraSpot = getCrusaderSpot(app.formationIds, petra.id);
        if (petraSpot != null) {
            petraBonus = 1;
            paul.globalDps *= 1 + legendaryFactor(paul, 1);
        }
        paul.globalGold = 1 + 0.33 * itemAbility(paul, 0) * (1 + 0.5 * petraBonus);
        paul.globalDps = 1 + 0.25 * itemAbility(paul, 0) * (1 + 0.5 * petraBonus);
        paul.globalDps *= 1 + 0.5 * currentWorld.countTags(Tag.tank) * legendaryFactor(paul, 0);
    };
    //////Slot 10 //Artaxes the Lion
    var lion = getCrusader("10");
    lion.calculate = function () {
        var numRoared = 0;
        var spot = getCrusaderSpot(app.formationIds, lion.id);
        var dpsCharSpot = dpsChar && getDpsSpot(app.formationIds, dpsChar);
        if (getIsBehind(currentWorld, dpsCharSpot, lion)) {
            lion.globalDps *= 1 + 0.5 * itemAbility(lion, 1) * (1 + legendaryFactor(lion, 0));
        }
        app
            .formationIds
            .map((fCruId, i) => {
            if (getIsBehind(currentWorld, i, spot)) {
                numRoared += 1;
            }
        });
        var karenSpot = getCrusaderSpot(app.formationIds, karen.id);
        if (karenSpot != null && currentWorld.getColumnNum(karenSpot) != currentWorld.getColumnNum(spot) + 1) {
            numRoared += 1;
            if (karen == dpsChar) {
                lion.globalDps *= 1 + 0.5 * itemAbility(lion, 1) * (1 + legendaryFactor(lion, 0)) * 0.5 * itemAbility(karen, 0);
            }
        }
        lion.globalDps *= Math.pow(1 + 0.33 * legendaryFactor(lion, 1), numRoared);
        if (dpsChar && dpsChar.tags.includes(Tag.animal)) {
            lion.globalDps *= 1 + legendaryFactor(lion, 2);
        }
    };
    ////Drizzle
    var drizzle = getCrusader('10a');
    drizzle.calculate = function () {
        var spot = getCrusaderSpot(app.formationIds, drizzle.id);
        var adjacent = currentWorld.whatsAdjacent(spot);
        var dpsCharSpot = dpsChar && getDpsSpot(app.formationIds, dpsChar);
        if (adjacent && dpsChar && adjacent.includes(dpsCharSpot || NaN)) {
            drizzle.globalDps *= 1 + 0.2 * itemAbility(drizzle, 1);
        }
        var karenSpot = getCrusaderSpot(app.formationIds, karen.id);
        if (karenSpot != null && karen == dpsChar && !adjacent.includes(karenSpot)) {
            drizzle.globalDps *= 1 + 0.2 * itemAbility(drizzle, 1) * 0.5 * itemAbility(karen, 0);
            karen.effects += 1;
        }
        var groklokSpot = getCrusaderSpot(app.formationIds, groklok.id);
        if (karenSpot != null && currentWorld.getColumnNum(spot) < currentWorld.getColumnNum(groklokSpot) && currentWorld.getColumnNum(karenSpot) != currentWorld.getColumnNum(groklokSpot)) {
            karen.effects += 1;
        }
        if (groklok == dpsChar && currentWorld.getColumnNum(spot) == currentWorld.getColumnNum(groklokSpot)) {
            drizzle.globalDps *= 5;
        }
        drizzle.globalDps *= 1 + 0.5 * currentWorld.countTags(Tag.orc) * legendaryFactor(drizzle, 0);
        drizzle.globalDps *= 1 + 0.25 * currentWorld.countTags(Tag.elf) * legendaryFactor(drizzle, 1);
        if (groklokSpot != null) {
            drizzle.globalDps *= 1 + legendaryFactor(drizzle, 2);
        }
    };
    ////Bubba, the Swimming Orc
    var bubba = getCrusader('10b');
    bubba.calculate = function () {
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
        var dpsCharSpot = dpsChar && getDpsSpot(app.formationIds, dpsChar);
        // is dps in the column behind bubba?
        if (getIsBehind(currentWorld, bubbaSpot, dpsCharSpot)) {
            bubba.globalDps *= 1 + 0.25 * numAdjacent * itemAbility(bubba, 1) * (1 + legendaryFactor(bubba, 0));
        }
        else if (karenSpot != null && karen == dpsChar) {
            bubba.globalDps *= 1 + 0.25 * numAdjacent * itemAbility(bubba, 1) * (1 + legendaryFactor(bubba, 0)) * 0.5 * itemAbility(karen, 0);
            karen.effects += 1;
        }
        for (i = 0; i < currentWorld.spots; i++) {
            var cruId = app.formationIds[i];
            if (cruId && currentWorld.getColumnNum(i) < currentWorld.getColumnNum(bubbaSpot) - 1 && cruId != karen.id) {
                bubba.globalGold *= 1 + 0.1 * (1 + legendaryFactor(bubba, 1));
            }
        }
        if (karenSpot != null) {
            bubba.globalGold *= 1 + 0.1 * (1 + legendaryFactor(bubba, 1)) * 0.5 * itemAbility(karen, 0);
            karen.effects += 1;
        }
        bubba.globalDps *= 1 + 0.5 * currentWorld.countTags(Tag.orc) * legendaryFactor(bubba, 2);
    };
    ////Sisaron the Dragon Sorceress
    var sisaron = getCrusader('10c');
    sisaron.calculate = function () {
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
        if (numAdjacent == 4) {
            magicModifier = 4;
        }
        var dpsCharSpot = dpsChar && getDpsSpot(app.formationIds, dpsChar);
        if (adjacent && dpsChar && adjacent.includes(dpsCharSpot || NaN)) {
            sisaron.globalDps *= 1 + magicModifier * itemAbility(sisaron, 1) * (1 + legendaryFactor(sisaron, 0)) / numAdjacent;
        }
        else if (karen == dpsChar) {
            sisaron.globalDps *= 1 + magicModifier * itemAbility(sisaron, 1) * (1 + legendaryFactor(sisaron, 0)) * 0.5 * itemAbility(karen, 0) / numAdjacent;
            karen.effects += 1;
        }
        sisaron.globalDps *= 1 + 0.5 * currentWorld.countTags(Tag.dragon) * legendaryFactor(sisaron, 1);
        sisaron.globalDps *= 1 + 0.25 * currentWorld.countTags(Tag.magic) * legendaryFactor(sisaron, 2);
    };
    //////Slot 11 //Khouri, the Witch Doctor
    var khouri = getCrusader("11");
    khouri.calculate = function () {
        //Koffee Potion
        var khouriSpot = getCrusaderSpot(app.formationIds, khouri.id);
        var adjacent = currentWorld.whatsAdjacent(khouriSpot);
        var dpsCharSpot = dpsChar && getDpsSpot(app.formationIds, dpsChar);
        if (dpsChar && adjacent.includes(dpsCharSpot || NaN)) {
            khouri.globalDps *= 1 + 0.3 * itemAbility(khouri, 0);
        }
        else if (karen == dpsChar) {
            khouri.globalDps *= 1 + 0.3 * itemAbility(khouri, 0) * 0.5 * itemAbility(karen, 0);
            karen.effects += 1;
        }
        if (dpsChar && dpsChar.tags.includes(Tag.magic)) {
            khouri.globalDps *= 1 + legendaryFactor(khouri, 0);
        }
        if (dpsChar && dpsChar.tags.includes(Tag.human)) {
            khouri.globalDps *= 1 + legendaryFactor(khouri, 1);
        }
        if (dpsChar && currentWorld.getColumnNum(khouriSpot) == currentWorld.getColumnNum(dpsCharSpot) - 1) {
            khouri.globalDps *= 1 + legendaryFactor(khouri, 2);
        }
        var karenSpot = getCrusaderSpot(app.formationIds, karen.id);
        if (karen == dpsChar && currentWorld.getColumnNum(khouriSpot) != currentWorld.getColumnNum(karenSpot) - 1) {
            karen.effects += 1;
        }
    };
    ////Momma Kaine
    var momma = getCrusader('11a');
    momma.calculate = function () {
        var mommaSpot = getCrusaderSpot(app.formationIds, momma.id);
        var distances = currentWorld.findDistances(mommaSpot || NaN);
        var maxDistance = Math
            .max
            .apply(null, distances);
        var turkeySpot = getCrusaderSpot(app.formationIds, turkey.id);
        if (turkeySpot != null) {
            momma.globalDps *= 1 + legendaryFactor(momma, 1);
        }
        if (dpsChar && dpsChar.tags.includes(Tag.robot)) {
            momma.globalDps *= 1 + legendaryFactor(momma, 2);
        }
        var karenSpot = getCrusaderSpot(app.formationIds, karen.id);
        if (karenSpot != null && !turkeySpot != null) {
            momma.globalDps *= 1 + 0.5 * 0.5 * itemAbility(karen, 0);
            karen.effects += 1;
        }
        if (karenSpot != null && distances[karenSpot] != maxDistance) {
            karen.effects += 1;
        }
    };
    ////Brogon, Prince of Dragons
    var brogon = getCrusader('11a');
    brogon.calculate = function () {
        var brogonSpot = getCrusaderSpot(app.formationIds, brogon.id);
        var adjacent = currentWorld.whatsAdjacent(brogonSpot);
        var numAdjacent = 0;
        var numRoyal = currentWorld.countTags(Tag.royal);
        var dpsCharSpot = dpsChar && getDpsSpot(app.formationIds, dpsChar);
        if (dpsChar && getAreInSameColumn(currentWorld, brogonSpot, dpsCharSpot)) {
            brogon.globalDps *= 1 + 0.2 * itemAbility(brogon, 1) * numRoyal * (1 + legendaryFactor(brogon, 0));
        }
        else if (karen == dpsChar) {
            brogon.globalDps *= 1 + 0.2 * itemAbility(brogon, 1) * numRoyal * (1 + legendaryFactor(brogon, 0)) * 0.5 * itemAbility(karen, 0);
            karen.effects += 1;
        }
        var karenSpot = getCrusaderSpot(app.formationIds, karen.id);
        if (karen == dpsChar && !adjacent.includes(karenSpot || NaN)) {
            karen.effects += 1;
        }
        brogon.globalDps *= 1 + 0.5 * currentWorld.countTags(Tag.dragon) * legendaryFactor(brogon, 1);
        for (var i = 0; i < adjacent.length; i++) {
            var adjCruId = app.formationIds[adjacent[i]];
            if (adjCruId) {
                numAdjacent += 1;
            }
        }
        brogon.globalDps *= 1 + 0.25 * numAdjacent * legendaryFactor(brogon, 2);
    };
    ////The Half-Blood elf
    var halfblood = getCrusader('11b');
    halfblood.calculate = function () {
        var halfbloodSpot = getCrusaderSpot(app.formationIds, halfblood.id);
        var adjacent = currentWorld.whatsAdjacent(halfbloodSpot);
        if (dpsChar && !dpsChar.tags.includes(Tag.human)) {
            var dpsCharSpot = dpsChar && getDpsSpot(app.formationIds, dpsChar);
            if (adjacent.includes(dpsCharSpot || NaN)) {
                halfblood.globalDps *= 1 + 0.5 * itemAbility(halfblood, 1);
            }
            else if (karen == dpsChar) {
                halfblood.globalDps *= 1 + 0.5 * itemAbility(halfblood, 1) * 0.5 * itemAbility(karen, 0);
                karen.effects += 1;
            }
        }
        if (karen == dpsChar) {
            karen.effects += 1;
        }
        halfblood.globalDps *= 1 + 0.25 * currentWorld.countTags(Tag.male) * legendaryFactor(halfblood, 0);
        halfblood.globalDps *= 1 + 0.25 * (currentWorld.filled - currentWorld.countTags(Tag.human)) * legendaryFactor(halfblood, 1);
        if (dpsChar && dpsChar.tags.includes(Tag.male)) {
            halfblood.globalDps *= 1 + legendaryFactor(halfblood, 2);
        }
    };
    ////Foresight
    var foresight = getCrusader('11c');
    foresight.calculate = function () {
        var foresightSpot = getCrusaderSpot(app.formationIds, foresight.id);
        var adjacent = currentWorld.whatsAdjacent(foresightSpot);
        var humansAdj = 0;
        var nonHumansAdj = 0;
        var malesAdj = 0;
        var femalesAdj = 0;
        if (dpsChar && dpsChar.tags.includes(Tag.supernatural)) {
            foresight.globalDps *= 1.5;
        }
        for (var i = 0; i < adjacent.length; i++) {
            var adjCruId = app.formationIds[adjacent[i]];
            var adjCru = adjCruId && jsonData
                .crusaders
                .find(cru => cru.id == adjCruId);
            if (!(adjCru != null))
                continue;
            if (adjCru.tags.includes(Tag.human)) {
                humansAdj += 1;
            }
            else {
                nonHumansAdj += 1;
            }
            if (adjCru.tags.includes(Tag.female)) {
                femalesAdj += 1;
            }
            if (adjCru.tags.includes(Tag.male)) {
                malesAdj += 1;
            }
        }
        if (humansAdj > nonHumansAdj) {
            foresight.globalDps *= Math.pow(1 + 0.1 * legendaryFactor(foresight, 0), currentWorld.countTags(Tag.human));
            foresight.globalGold *= Math.pow(1 + 0.05 * legendaryFactor(foresight, 1), currentWorld.countTags(Tag.human));
        }
        var karenSpot = getCrusaderSpot(app.formationIds, karen.id);
        if (humansAdj < nonHumansAdj) {
            foresight.globalDps *= Math.pow(1 + 0.1 * legendaryFactor(foresight, 0), currentWorld.filled - currentWorld.countTags(Tag.human));
            foresight.globalGold *= Math.pow(1 + 0.05 * legendaryFactor(foresight, 1), currentWorld.filled - currentWorld.countTags(Tag.human));
        }
        else if (karenSpot != null) {
            foresight.globalGold *= 1 + 0.1 * legendaryFactor(foresight, 0);
            foresight.globalDps *= 1 + 0.05 * legendaryFactor(foresight, 1);
            karen.effects += 1;
        }
        if (malesAdj >= femalesAdj) {
            karen.effects += 1;
        }
        if (currentWorld.countTags(Tag.supernatural) >= 4) {
            foresight *= 1 + legendaryFactor(foresight, 2);
        }
    };
    //////Slot 12 //Dark Gryphon
    var gryphon = getCrusader("12");
    gryphon.calculate = function () {
        var gryphonSpot = getCrusaderSpot(app.formationIds, gryphon.id);
        var dpsCharSpot = dpsChar && getDpsSpot(app.formationIds, dpsChar);
        // if the dps is in the column in front of gryphon
        console.log('gryhon calc', { gryphonSpot, dpsCharSpot });
        if (getIsBehind(currentWorld, dpsCharSpot, gryphonSpot)) {
            console.log('gryphon is behind dps!');
            var l0DpsMult = 1 + legendaryFactor(gryphon, 0);
            gryphon.globalDps *= l0DpsMult;
            gryphon.l0 = l0DpsMult;
        }
        gryphon.globalDps *= (1 + 0.1 * monstersOnscreen * legendaryFactor(gryphon, 1));
        if (dpsChar && dpsChar.tags.includes(Tag.supernatural)) {
            gryphon.globalDps *= 1 + legendaryFactor(gryphon, 2);
        }
        var karenSpot = getCrusaderSpot(app.formationIds, karen.id);
        // if karen is dps, and isn't in front of the gryphon, she still gets the L
        // bonus
        if (dpsChar && karen == dpsChar && getIsBehind(currentWorld, karenSpot, gryphonSpot) === false) {
            gryphon.globalDps *= 1 + legendaryFactor(gryphon, 0);
            karen.effects += 1;
        }
    };
    ////Rocky the Rockstar
    var rocky = getCrusader('12a');
    rocky.calculate = function () {
        var rockySpot = getCrusaderSpot(app.formationIds, rocky.id);
        var adjacent = currentWorld.whatsAdjacent(rockySpot);
        var numFemales = 0;
        if (rocky == dpsChar) {
            for (var i = 0; i < adjacent.length; i++) {
                var adjCruId = app.formationIds[adjacent[i]];
                var adjCru = jsonData
                    .crusaders
                    .find(cru => cru.id == adjCruId);
                if (adjCru) {
                    if (adjCru.tags.includes(Tag.female)) {
                        numFemales += 1;
                    }
                }
            }
            rocky.globalDps *= 1 + 0.5 * itemAbility(rocky, 0) * numFemales;
            rocky.globalDps *= 1 + 0.2 * currentWorld.countTags(Tag.female) * legendaryFactor(rocky, 0);
            if (numFemales >= 3) {
                rocky.globalDps *= 1 + legendaryFactor(rocky, 1);
            }
        }
        if (dpsChar && dpsChar.tags.includes(Tag.male)) {
            rocky.globalDps *= 1 + legendaryFactor(rocky, 2);
        }
    };
    ////Montana James
    var montana = getCrusader('12b');
    montana.calculate = function () {
        if (dpsChar && dpsChar.tags.includes(Tag.animal)) {
            montana.globalDps *= 1.5;
        }
        var princessSpot = getCrusaderSpot(app.formationIds, princess.id);
        if (princessSpot != null) {
            montana.globalDps *= 1.4;
        }
        if (countShots) {
            montana.globalDps *= 1 + 2 * itemAbility(montana, 0) * (1 + legendaryFactor(montana, 2)) / 5;
        }
        montana.globalDps *= 1 + 0.25 * currentWorld.countTags(Tag.female) * legendaryFactor(montana, 0);
        if (dpsChar && dpsChar.tags.includes(Tag.animal)) {
            montana.globalDps *= 1 + legendaryFactor(montana, 1);
        }
    };
    ////The Dark Helper
    var helper = getCrusader('12c');
    helper.calculate = function () {
        var helperSpot = getCrusaderSpot(app.formationIds, helper.id);
        if (underAttack && currentWorld.getColumnNum(helperSpot) == currentWorld.maxColumn) {
            helper.globalDps *= 1 + 0.5 + 0.2 * currentWorld.countTags(Tag.tank);
        }
        helper.globalGold *= 1 + 0.1 * monstersOnscreen * itemAbility(helper, 1);
        if (numAttacking > 0) {
            helper.globalDps *= 1 + legendaryFactor(helper, 0);
        }
        if (dpsChar && dpsChar.tags.includes(Tag.leprechaun)) {
            helper.globalDps *= 1 + legendaryFactor(helper, 1);
        }
        if (currentWorld.countTags(Tag.leprechaun) >= 2) {
            helper.globalDps *= 1 + legendaryFactor(helper, 2);
        }
        var karenSpot = getCrusaderSpot(app.formationIds, karen.id);
        if (karen == dpsChar && currentWorld.getColumnNum(karenSpot) != currentWorld.getColumnNum(helperSpot)) {
            karen.effects += 1;
        }
    };
    //////Slot 13 //Sarah, the Collector
    var sarah = getCrusader("13");
    sarah.calculate = function () {
        if (sarah == dpsChar) {
            var formationFull = true;
            for (var i = 0; i < currentWorld.spots; i++) {
                if (!app.formationIds[i]) {
                    formationFull = false;
                }
            }
            if (formationFull) {
                sarah.globalDps *= 2.5;
            }
            // this is not implemented (numEpicEquip)
            if (app.numEpicEquip != null)
                sarah.globalDps *= 1 + 0.01 * app.numEpicEquip * legendaryFactor(sarah, 1);
            // this is not implemented (numEpicTrinkets)
            if (app.numEpicTrinkets != null)
                sarah.globalDps *= 1 + 0.01 * app.numEpicTrinkets * legendaryFactor(sarah, 2);
        }
        if (dpsChar && dpsChar.tags.includes(Tag.female)) {
            sarah.globalDps *= 1 + legendaryFactor(sarah, 0);
        }
    };
    ////The Metal Soldierette
    var soldierette = getCrusader('13a');
    soldierette.calculate = function () {
        var soldieretteSpot = getCrusaderSpot(app.formationIds, soldierette.id);
        if (soldierette == dpsChar) {
            if (currentWorld.getColumnNum(soldieretteSpot) == currentWorld.maxColumn) {
                soldierette.globalDps *= 5;
                if (numAttacking > 0) {
                    soldierette.globalDps *= 1 + legendaryFactor(soldierette, 0);
                }
            }
            soldierette.globalDps *= 1 + 0.2 * numAttacking;
            soldierette.globalDps *= 1 + currentWorld.countTags(Tag.healer) * legendaryFactor(soldierette, 2);
        }
        soldierette.globalDps *= 1 + 0.1 * numAttacking * legendaryFactor(soldierette, 1);
    };
    ////Snickette the Sneaky
    var snickette = getCrusader('13b');
    snickette.calculate = function () {
        var snicketteSpot = getCrusaderSpot(app.formationIds, snickette.id);
        var adjacent = currentWorld.whatsAdjacent(snicketteSpot);
        var numAdjacent = 0;
        if (dpsChar && dpsChar.tags.includes(Tag.human)) {
            snickette.globalDps *= 1 + (0.5 + 0.1 * currentWorld.countTags(Tag.human)) * itemAbility(snickette, 0);
        }
        if (currentWorld.countTags(Tag.leprechaun) >= 2) {
            snickette.globalDps *= 1 + 0.5;
        }
        for (var i = 0; i < adjacent.length; i++) {
            var adjCruId = app.formationIds[adjacent[i]];
            if (adjCruId) {
                numAdjacent += 1;
            }
        }
        if (numAdjacent <= 4) {
            var dpsCharSpot = dpsChar && getDpsSpot(app.formationIds, dpsChar);
            if (dpsChar && adjacent.includes(dpsCharSpot || NaN)) {
                snickette.globalDps *= 1 + 0.5 * itemAbility(snickette, 1);
            }
            else if (karen == dpsChar) {
                snickette.globalDps *= 1 + 0.5 * itemAbility(snickette, 1) * 0.5 * itemAbility(karen, 0);
                karen.effects += 1;
            }
        }
        if (dpsChar && currentWorld.getColumnNum(dpsCharSpot) == currentWorld.getColumnNum(snicketteSpot)) {
            snickette.globalDps *= 1 + legendaryFactor(snickette, 0);
        }
        snickette.globalGold *= 1 + 0.1 * currentWorld.countTags(Tag.human) * legendaryFactor(snickette, 1);
        var larrySpot = getCrusaderSpot(app.formationIds, larry.id);
        if (larrySpot != null) {
            snickette.globalDps *= 1 + legendaryFactor(snickette, 2);
        }
    };
    //////Slot 14 //Gold panda
    var panda = getCrusader("14");
    panda.calculate = function () {
        if (numAttacking === 0) {
            panda.globalGold *= 1 + legendaryFactor(panda, 2);
        }
    };
    ////RoboSanta
    var santa = getCrusader('14a');
    santa.calculate = function () {
        var santaSpot = getCrusaderSpot(app.formationIds, santa.id);
        var adjacent = currentWorld.whatsAdjacent(santaSpot);
        var numAhead = currentWorld.getFilledColumnSpots(currentWorld.getColumnNum(santaSpot) + 1);
        santa.globalGold *= Math.pow(1 + 0.25 * itemAbility(santa, 0) * (1 + legendaryFactor(santa, 0)), numAhead);
        var karenSpot = getCrusaderSpot(app.formationIds, karen.id);
        if (getIsBehind(currentWorld, karenSpot, santaSpot) === false) {
            santa.globalDps *= 1 + 0.25 * itemAbility(santa, 0) * (1 + legendaryFactor(santa, 0)) * 0.5 * itemAbility(karen, 0);
            karen.effects += 1;
        }
        var dpsCharSpot = dpsChar && getDpsSpot(app.formationIds, dpsChar);
        if (dpsChar && adjacent.includes(dpsCharSpot || NaN)) {
            santa.globalDps *= 1 + legendaryFactor(santa, 1);
        }
        santa.globalGold *= 1 + 0.1 * currentWorld.countTags(Tag.robot) * legendaryFactor(santa, 2);
    };
    ////Leerion, the Royal Dwarf
    var leerion = getCrusader('14b');
    leerion.calculate = function () {
        leerion.globalGold *= 1 + (0.25 + 0.1 * currentWorld.countTags(Tag.female) + 0.15 * currentWorld.countTags(Tag.royal)) * itemAbility(leerion, 2) * (1 + legendaryFactor(leerion, 0));
        leerion.globalDps *= 1 + 0.25 * currentWorld.countTags(Tag.female) * legendaryFactor(leerion, 1);
        var sashaSpot = getCrusaderSpot(app.formationIds, sasha.id);
        if (sashaSpot != null) {
            leerion.globalDps *= 1 + legendaryFactor(leerion, 2);
        }
    };
    ////Katie the Cupid
    var katie = getCrusader('14c');
    katie.calculate = function () {
        var katieSpot = getCrusaderSpot(app.formationIds, katie.id);
        var animalsAdj = 0;
        var humansAdj = 0;
        var femalesAdj = 0;
        var malesAdj = 0;
        var boost = 0.3 * itemAbility(katie, 2);
        var adjacent = currentWorld.whatsAdjacent(katieSpot);
        for (var i = 0; i < adjacent.length; i++) {
            var adjCruId = app.formationIds[adjacent[i]];
            var adjCru = adjCruId && jsonData
                .crusaders
                .find(cru => cru.id == adjCruId);
            if (!(adjCru != null))
                continue;
            if (adjCru.tags.includes(Tag.animal)) {
                animalsAdj += 1;
            }
            if (adjCru.tags.includes(Tag.human)) {
                humansAdj += 1;
            }
            if (adjCru.tags.includes(Tag.male)) {
                malesAdj += 1;
            }
            if (adjCru.tags.includes(Tag.female)) {
                femalesAdj += 1;
            }
        }
        katie.globalGold *= (1 + boost * Math.min(animalsAdj, 2)) * (1 + boost * Math.min(malesAdj, 2)) * (1 + boost * Math.min(femalesAdj, 2)) * (1 + boost * Math.min(humansAdj, 2));
        katie.globalGold *= 1 + 0.25 * currentWorld.countTags(Tag.gold) * legendaryFactor(katie, 1);
        katie.globalDps *= 1 + 0.25 * currentWorld.countTags(Tag.human) * legendaryFactor(katie, 0);
        var dpsBoost = boost / 2 * legendaryFactor(katie, 2);
        katie.globalDps *= (1 + dpsBoost * Math.min(animalsAdj, 2)) * (1 + dpsBoost * Math.min(malesAdj, 2)) * (1 + dpsBoost * Math.min(femalesAdj, 2)) * (1 + dpsBoost * Math.min(humansAdj, 2));
    };
    //////Slot 15 //Prince Sal, the Merman
    var sal = getCrusader("15");
    sal.calculate = function () {
        var salSpot = getCrusaderSpot(app.formationIds, sal.id);
        var adjacent = currentWorld.whatsAdjacent(salSpot);
        var numAdjacent = 0;
        if (sal == dpsChar) {
            sal.globalDps *= 1 + 0.25 * currentWorld.countTags(Tag.female) * legendaryFactor(sal, 0);
            sal.globalDps *= 1 + 0.25 * currentWorld.countTags(Tag.royal) * legendaryFactor(sal, 1);
        }
        for (var i = 0; i < adjacent.length; i++) {
            var adjCruId = app.formationIds[adjacent[i]];
            if (adjCruId) {
                numAdjacent += 1;
            }
        }
        if (numAdjacent >= 5 && sal == dpsChar) {
            sal.globalDps *= 1 + legendaryFactor(sal, 2);
        }
    };
    ////Wendy the Witch
    var wendy = getCrusader('15a');
    wendy.calculate = function () {
        var wendySpot = getCrusaderSpot(app.formationIds, wendy.id);
        var columnsAhead = currentWorld.maxColumn - currentWorld.getColumnNum(wendySpot);
        if (wendy == dpsChar) {
            wendy.globalDps *= 1 + 0.25 * monstersOnscreen * (1 + legendaryFactor(wendy, 1));
            wendy.globalDps *= 1 + 0.5 * currentWorld.countTags(Tag.magic) * legendaryFactor(wendy, 0);
            wendy.globalDps *= 1 + 0.25 * columnsAhead * legendaryFactor(wendy, 2);
        }
    };
    ////Robbie Raccoon
    var robbie = getCrusader('15b');
    robbie.calculate = function () {
        if (robbie == dpsChar) {
            var brootSpot = getCrusaderSpot(app.formationIds, broot.id);
            if (brootSpot != null) {
                robbie.globalDps *= 1 + legendaryFactor(robbie, 0);
            }
            robbie.globalDps *= 1 + 0.5 * currentWorld.countTags(Tag.tank) * legendaryFactor(robbie, 1);
            robbie.globalDps *= 1 + 0.1 * monstersOnscreen * legendaryFactor(robbie, 2);
        }
    };
    ////Princess Val the Mermain
    var val = getCrusader('15c');
    val.calculate = function () {
        var valSpot = getCrusaderSpot(app.formationIds, val.id);
        var adjacent = currentWorld.whatsAdjacent(valSpot);
        if (currentWorld.countTags(Tag.animal) > currentWorld.countTags(Tag.human)) {
            val.globalDps *= 1 + 0.5 * itemAbility(val, 2) * (1 + legendaryFactor(val, 0));
        }
        if (dpsChar && dpsChar.tags.includes(Tag.royal)) {
            val.globalDps *= 1 + legendaryFactor(val, 1);
        }
        val.globalDps *= 1 + 0.25 * (currentWorld.filled - currentWorld.countTags(Tag.human)) * legendaryFactor(val, 2);
        var karenSpot = getCrusaderSpot(app.formationIds, karen.id);
        if (karen == dpsChar && !adjacent.includes(karenSpot || NaN)) {
            karen.effects += 1;
        }
    };
    //////Slot 16 //Fire Phoenix
    var phoenix = getCrusader("16");
    phoenix.calculate = function () {
        phoenix.globalDps *= 1 + 0.25 * currentWorld.countTags(Tag.supernatural) * legendaryFactor(phoenix, 0);
        if (dpsChar && dpsChar.tags.includes(Tag.supernatural)) {
            phoenix.globalDps *= 1 + legendaryFactor(phoenix, 2);
        }
    };
    ////Alan the ArchAngel
    var alan = getCrusader('16a');
    alan.calculate = function () {
        var alanSpot = getCrusaderSpot(app.formationIds, alan.id);
        var adjacent = currentWorld.whatsAdjacent(alanSpot);
        alan.globalDps *= 1 + 0.5 * currentWorld.countTags(Tag.angel) * legendaryFactor(alan, 2);
        var karenSpot = getCrusaderSpot(app.formationIds, karen.id);
        if (karen == dpsChar && !adjacent.includes(karenSpot || NaN)) {
            karen.effects += 2;
        }
    };
    ////Fright-o-Tron
    var fright = getCrusader('16b');
    fright.calculate = function () {
        // Oogy Boogy + itemAbility (explosions)
        var oogyBoogy = 1 / (1 - 0.15 * itemAbility(fright, 2)) || 1;
        fright.globalDps *= oogyBoogy || 1;
        fright.s2 = "dpsMult:" + oogyBoogy + "\r\n";
        var helmetLegPerRobot = 1 + 0.5 * currentWorld.countTags(Tag.robot) * legendaryFactor(fright, 0) || 1;
        fright.s0 = "dpsMult:" + helmetLegPerRobot + "\r\n";
        fright.globalDps *= helmetLegPerRobot;
        //frightingCircuits?
        fright.globalDps *= 1.15;
        var turkeySpot = getCrusaderSpot(app.formationIds, turkey.id);
        if (turkeySpot != null) {
            fright.globalDps *= 1 + 0.25 * legendaryFactor(fright, 1);
        }
        if (dpsChar && dpsChar.tags.includes(Tag.robot)) {
            fright.globalDps *= 1 + legendaryFactor(fright, 2);
        }
    };
    ////Spaceking
    var spaceking = getCrusader('16c');
    spaceking.calculate = function () {
        if (spaceking.isDPS) {
            spaceking.globalDPS *= 1 + currentWorld.countTags(Tag.alien) * itemAbility(spaceking, 2) * (1 + legendaryFactor(spaceking, 2));
            spaceking.globalDPS *= 1 + 0.25 * currentWorld.countTags(Tag.female) * itemAbility(spaceking, 1) * (1 + legendaryFactor(spaceking, 1));
            if (currentWorld.countTags(Tag.human) == 1) {
                spaceking.globalDPS *= 1 + legendaryFactor(spaceking, 0);
            }
        }
    };
    //////Slot 17 //King Reginald IV
    var reginald = getCrusader("17");
    reginald.calculate = function () {
        if (dpsChar && dpsChar.tags.includes(Tag.royal)) {
            reginald.globalDps *= 1 + 2 * itemAbility(reginald, 2) * (1 + legendaryFactor(reginald, 1));
        }
        reginald.globalDps *= 1 + 0.25 * currentWorld.countTags(Tag.royal) * legendaryFactor(reginald, 0);
    };
    ////Queen Siri
    var siri = getCrusader('17a');
    siri.calculate = function () {
        if (dpsChar && dpsChar.tags.includes(Tag.female)) {
            siri.globalDps *= 1 + 1 * itemAbility(siri, 2);
            siri.globalDps *= 1 + legendaryFactor(siri, 0);
        }
        var thaliaSpot = getCrusaderSpot(app.formationIds, thalia.id);
        if (thaliaSpot != null) {
            siri.globalDps *= 1 + legendaryFactor(siri, 1);
        }
        if (currentWorld.countTags(Tag.female) > currentWorld.countTags(Tag.male)) {
            siri.globalDps *= 1 + legendaryFactor(siri, 2);
        }
    };
    ////Mr. Boggins, the Substitute
    var boggins = getCrusader('17b');
    boggins.calculate = function () {
        var diversityCount = 0;
        if (dpsChar && dpsChar.tags.includes(Tag.animal)) {
            boggins.globalDps *= 1 + (2 + 0.125 * currentWorld.countTags(Tag.human)) * itemAbility(boggins, 0) * (1 + legendaryFactor(boggins, 1));
        }
        app
            .formationIds
            .filter(f => f != null)
            .map(cruId => {
            var cru = jsonData
                .crusaders
                .find(refCru => refCru.id == cruId);
            if (!cru.tags.includes(Tag.human) && !cru.tags.includes(Tag.animal)) {
                diversityCount += 1;
            }
        });
        boggins.globalGold *= Math.pow(1.1, diversityCount);
        boggins.critChance += 3 * legendaryFactor(boggins, 0);
    };
    ////Squiggles the Clown
    var squiggles = getCrusader('17c');
    squiggles.calculate = function () {
        var squigglesSpot = getCrusaderSpot(app.formationIds, squiggles.id);
        var adjacent = currentWorld.whatsAdjacent(squigglesSpot);
        var humansAdj = 0;
        if (squiggles == dpsChar) {
            squiggles.globalDps *= 1 + (1.5 - 0.25 * currentWorld.countTags(Tag.royal)) * itemAbility(squiggles, 0);
            squiggles.globalDps *= 1 + 0.1 * (currentWorld.filled - currentWorld.countTags(Tag.royal));
            for (var i = 0; i < adjacent.length; i++) {
                var adjCruId = app.formationIds[adjacent[i]];
                var adjCru = adjCruId && jsonData
                    .crusaders
                    .find(cru => cru.id == adjCruId);
                if (adjCru && adjCru.tags.includes(Tag.human)) {
                    humansAdj += 1;
                }
            }
            if (humansAdj >= 2) {
                squiggles.globalDps *= 3;
            }
            if (humansAdj >= 4) {
                squiggles.globalDps *= 1 + legendaryFactor(squiggles, 1);
            }
            squiggles.globalDps *= 1 + (currentWorld.filled - currentWorld.countTags(Tag.human)) * legendaryFactor(squiggles, 0);
            var peteSpot = getCrusaderSpot(app.formationIds, pete.id);
            if (peteSpot != null) {
                squiggles.globalDps *= 1 + legendaryFactor(squiggles, 2);
            }
        }
    };
    //////Slot 18 //Thalia, the Thunder King
    var thalia = getCrusader("18");
    thalia.calculate = function () {
        if (dpsChar && dpsChar.tags.includes(Tag.royal)) {
            thalia.globalDps *= 1 + legendaryFactor(thalia, 1);
        }
    };
    ////Frosty the Snowman
    var frosty = getCrusader('18a');
    frosty.calculate = function () {
        var adjacent = currentWorld.whatsAdjacent(frosty);
        var numAdjacent = 0;
        if (frosty == dpsChar) {
            frosty.globalDps *= 1 + 2 * currentWorld.countTags(Tag.supernatural) * itemAbility(frosty, 0) * (1 + legendaryFactor(frosty, 1));
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
            frosty.globalDps *= 1 + numAdjacent;
            frosty.globalDps *= 1 + 0.25 * numAdjacent * legendaryFactor(frosty, 2);
        }
        var dpsCharSpot = dpsChar && getDpsSpot(app.formationIds, dpsChar);
        if (dpsChar && adjacent.includes(dpsCharSpot || NaN)) {
            frosty.globalDps *= 0.75;
        }
        else if (karen == dpsChar) {
            frosty.globalDps *= 1 - 0.25 * 0.5 * itemAbility(karen, 0);
        }
    };
    ////Littlefoot
    var littlefoot = getCrusader('18b');
    littlefoot.calculate = function () {
        littlefoot.globalDps *= 1 + 0.1 * littlefootXP * itemAbility(littlefoot, 1) * (1 + legendaryFactor(littlefoot, 0));
        var littlefootSpot = getCrusaderSpot(app.formationIds, littlefoot.id);
        if (currentWorld.getColumnNum(littlefootSpot) == currentWorld.maxColumn) {
            littlefoot.globalDps *= 1 + 0.1 * numAttacking * legendaryFactor(littlefoot, 2);
        }
    };
    ////Cindy the Cheer-Orc
    var cindy = getCrusader('18c');
    cindy.calculate = function () {
        var cindySpot = getCrusaderSpot(app.formationIds, cindy.id);
        var distances = currentWorld.findDistances(cindySpot || NaN);
        var dpsCharSpot = dpsChar && getDpsSpot(app.formationIds, dpsChar);
        var distance = dpsCharSpot && distances[dpsCharSpot];
        if (distance != null && distance > 0) {
            cindy.globalDps *= 1 + 0.5 * distance * (1 + 10 * currentStage / 50) * itemAbility(cindy, 1);
        }
        else if (karen == dpsChar) {
            karen.effects += 1;
        }
        cindy.globalDps *= 1 + Math.min(killedThisStage / 100, 2) * (1 + legendaryFactor(cindy, 0));
        if (dpsChar && dpsChar.tags.includes(Tag.orc)) {
            cindy.globalDps *= 1 + legendaryFactor(cindy, 1);
        }
        cindy.globalGold *= 1 + 0.25 * currentWorld.countTags(Tag.orc) * legendaryFactor(cindy, 2);
    };
    //////Slot 19 //Merci, the Mad Wizard
    var merci = getCrusader("19");
    merci.calculate = function () {
        merci.globalDps *= 1 + Math.min(0.025 * monstersOnscreen * itemAbility(merci, 0) * (1 + legendaryFactor(merci, 1)), 1 + legendaryFactor(merci, 2)) * monstersOnscreen;
        if (dpsChar && dpsChar.tags.includes(Tag.magic)) {
            merci.globalDps *= 1 + legendaryFactor(merci, 0);
        }
    };
    ////The Bat Billionaire
    var bat = getCrusader('19a');
    bat.calculate = function () { };
    ////Petra The Pilgrim
    var petra = getCrusader('19b');
    petra.calculate = function () {
        var petraSpot = getCrusaderSpot(app.formationIds, petra.id);
        var adjacent = currentWorld.whatsAdjacent(petraSpot);
        var paulMult = 1;
        var paulSpot = getCrusaderSpot(app.formationIds, paul.id);
        if (paulSpot != null) {
            paulMult = 1.5;
        }
        if (petra == dpsChar) {
            petra.globalDps *= 1 + 0.5 * currentWorld.countTags(Tag.elf) * paulMult * itemAbility(petra, 0);
            if (paulSpot != null && adjacent.includes(paulSpot)) {
                petra.globalDps *= 1 + 2 * paulMult;
            }
        }
    };
    ////Polly the Parrot
    var polly = getCrusader('19c');
    polly.calculate = function () {
        polly.globalDps *= 1 + 0.5 * currentWorld.countTags(Tag.tank) * itemAbility(polly, 0);
        polly.globalDps *= 1 + 0.33 * numAttacking * itemAbility(polly, 1) * (1 + legendaryFactor(polly, 2));
        if (currentWorld.countTags(Tag.animal) > 2) {
            polly.globalDps *= 1 + legendaryFactor(polly, 1);
        }
        // Legendary Toy
        var spot = getCrusaderSpot(app.formationIds, polly.id);
        var dpsSpot = dpsChar && getCrusaderSpot(app.formationIds, dpsChar.id);
        var isInColumnWithDps = getAreInSameColumn(currentWorld, spot, dpsSpot);
        if (isInColumnWithDps) {
            polly.globalDps *= 1 + legendaryFactor(polly, 0);
        }
    };
    //////Slot 20 //Nate Dragon
    var nate = getCrusader("20");
    nate.calculate = function ({ nateXP = 0 } = {}) {
        //Double Dragon
        var natalieSpot = getCrusaderSpot(app.formationIds, natalie.id);
        if (natalieSpot != null && nate == dpsChar) {
            nate.globalDps *= 1 + 2 * itemAbility(nate, 2);
        }
        if (natalieSpot != null) {
            nate.globalDps *= 1 + legendaryFactor(nate, 0);
        }
        nate.globalDps *= 1 + 0.25 * currentWorld.countTags(Tag.male) * legendaryFactor(nate, 1);
        if (nateXP)
            nate.globalDps *= 1 + 0.1 * nateXP * legendaryFactor(nate, 2);
    };
    ////Kizlblyp the Alien Traitor
    var kiz = getCrusader('20a');
    kiz.calculate = function () {
        if (kiz == dpsChar) {
            kiz.globalDps *= 1 + 0.2 * itemAbility(kiz, 0) * currentWorld.countTags(Tag.male);
            kiz.globalDps *= 1 + 0.25 * (currentWorld.filled - currentWorld.countTags(Tag.human)) * legendaryFactor(kiz, 0);
            var billySpot = getCrusaderSpot(app.formationIds, billy.id);
            if (billySpot != null) {
                kiz.globalDps *= 1 + legendaryFactor(kiz, 1);
            }
            if (currentWorld.countTags(Tag.royal) === 0) {
                kiz.globalDps *= 1 + 2 * legendaryFactor(kiz, 2);
            }
        }
        kiz.globalDps *= 1 + 0.1 * (currentWorld.filled - currentWorld.countTags(Tag.human));
    };
    ////Robo-Rudolph
    var rudolph = getCrusader('20b');
    rudolph.calculate = function () {
        var rudolphSpot = getCrusaderSpot(app.formationIds, rudolph.id);
        var adjacent = currentWorld.whatsAdjacent(rudolphSpot);
        var robotAdj = false;
        if (rudolph == dpsChar) {
            for (var i = 0; i < adjacent.length; i++) {
                var adjCruId = app.formationIds[adjacent[i]];
                var adjCru = adjCruId && jsonData
                    .crusaders
                    .find(cru => cru.id == adjCruId);
                if (adjCru && adjCru.tags.includes(Tag.robot)) {
                    robotAdj = true;
                }
            }
            if (robotAdj) {
                rudolph.globalDps *= 1 + 2 * itemAbility(rudolph, 0);
            }
            rudolph.globalDps *= 1 + 1 * currentWorld.countTags(Tag.robot) * itemAbility(rudolph, 1);
            rudolph.globalDps *= 1 + 0.5 * currentWorld.countTags(Tag.robot) * legendaryFactor(rudolph, 1);
            rudolph.globalDps *= 1 + 0.25 * currentWorld.countTags(Tag.animal) * legendaryFactor(rudolph, 2);
        }
        if (dpsChar && dpsChar.tags.includes(Tag.robot)) {
            rudolph.globalDps *= 1 + legendaryFactor(rudolph, 0);
        }
    };
    //////Slot 21 //The Exterminator
    var exterminator = getCrusader('21');
    exterminator.calculate = function () {
        var exterminatorSpot = getCrusaderSpot(app.formationIds, exterminator.id);
        var adjacent = currentWorld.whatsAdjacent(exterminatorSpot);
        var robotsAdj = 0;
        for (var i = 0; i < adjacent.length; i++) {
            var adjCruId = app.formationIds[adjacent[i]];
            var adjCru = adjCruId && jsonData
                .crusaders
                .find(cru => cru.id == adjCruId);
            if (adjCru && adjCru.tags.includes(Tag.robot)) {
                robotsAdj = 1;
            }
        }
        if (exterminator == dpsChar) {
            exterminator.globalDps *= 1 + 1 * robotsAdj * itemAbility(exterminator, 0) * (1 + legendaryFactor(exterminator, 0));
            exterminator.globalDps *= 1 + 0.5 * currentWorld.countTags(Tag.robot) * itemAbility(exterminator, 0);
            if (currentWorld.countTags(Tag.robot) > currentWorld.countTags(Tag.human)) {
                exterminator.globalDps *= 1 + legendaryFactor(exterminator, 2);
            }
        }
        exterminator.globalGold *= 1 + 0.1 * (currentWorld.countTags(Tag.robot) - robotsAdj);
        exterminator.globalGold *= 1 + 0.25 * currentWorld.countTags(Tag.robot) * legendaryFactor(exterminator, 1);
    };
    ////Gloria, the Good Witch
    var gloria = getCrusader('21a');
    gloria.calculate = function () {
        var gloriaSpot = getCrusaderSpot(app.formationIds, gloria.id);
        var adjacent = currentWorld.whatsAdjacent(gloriaSpot);
        var dpsCharSpot = dpsChar && getDpsSpot(app.formationIds, dpsChar);
        if (karen == dpsChar) {
            gloria.globalDps *= 1 + 0.5 * 0.5 * itemAbility(karen, 0);
            karen.effects += 1;
            if (dpsChar && currentWorld.getColumnNum(dpsCharSpot) != currentWorld.getColumnNum(gloriaSpot) + 1) {
                karen.effects += 1;
            }
        }
        else if (dpsChar && currentWorld.getColumnNum(dpsCharSpot) != currentWorld.getColumnNum(gloriaSpot) + 1) {
            gloria.globalDps *= 1.5;
        }
        if (dpsChar && adjacent.includes(dpsCharSpot || NaN)) {
            gloria.globalDps *= 1 + legendaryFactor(gloria, 1);
        }
        if (dpsChar && dpsChar.tags.includes(Tag.animal)) {
            gloria.globalDps *= 1 + legendaryFactor(globalDps, 2);
        }
    };
    //////Slot 22 //The Shadow Queen
    var shadow = getCrusader('22');
    shadow.calculate = function () {
        var jasonMult = 1;
        var shadowSpot = getCrusaderSpot(app.formationIds, shadow.id);
        var adjacent = currentWorld.whatsAdjacent(shadowSpot);
        var numAdjacent = 0;
        var dpsCharSpot = dpsChar && getDpsSpot(app.formationIds, dpsChar);
        if (dpsChar && adjacent.includes(dpsCharSpot || NaN)) {
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
            shadow.globalDps *= 1 + 3 * jasonMult * itemAbility(shadow, 0) * (1 + legendaryFactor(shadow, 0)) / numAdjacent;
        }
        if (dpsChar && dpsChar.tags.includes(Tag.supernatural)) {
            shadow.globalDps *= 1 + legendaryFactor(shadow, 1);
        }
        shadow.globalDps *= 1 + 0.5 * currentWorld.countTags(Tag.magic) * legendaryFactor(shadow, 2);
    };
    ////Ilsa, the Insane Wizard
    var ilsa = getCrusader('22a');
    ilsa.calculate = function () {
        var ilsaSpot = getCrusaderSpot(app.formationIds, ilsa.id);
        var adjacent = currentWorld.whatsAdjacent(ilsaSpot);
        var numAdjacent = 0;
        var deflecting = 0;
        var magicMult = 0;
        var correction = 1;
        if (dpsChar && dpsChar.zapped) {
            correction *= 1 + 0.2 * itemAbility(turkey, 1);
        }
        if (dpsChar && dpsChar.smashed) {
            correction *= 1.25;
        }
        var merciSpot = getCrusaderSpot(app.formationIds, merci.id);
        if (ilsa == dpsChar) {
            ilsa.globalDps *= 1 + (0.5 + currentWorld.countTags(Tag.magic)) * itemAbility(ilsa, 0);
            if (merciSpot != null) {
                deflecting = Math.min(2.5 * monstersOnscreen * itemAbility(merci, 0), 100);
            }
            ilsa.globalDps *= 2 + 2 * deflecting / 100;
            ilsa.globalDps *= 1 + 0.5 * currentWorld.countTags(Tag.magic) * legendaryFactor(ilsa, 2);
        }
        for (var i = 0; i < adjacent.length; i++) {
            var adjCruId = app.formationIds[adjacent[i]];
            if (adjCruId) {
                numAdjacent += 1;
            }
        }
        var dpsCharSpot = dpsChar && getDpsSpot(app.formationIds, dpsChar);
        if (numAdjacent == 1) {
            magicMult = 4 * (1 + legendaryFactor(ilsa, 0));
        }
        if (dpsChar && adjacent.includes(dpsCharSpot || NaN)) {
            ilsa.globalDps *= 0.5 + 1 * magicMult / correction;
        } // else if (karen == dpsChar) {}
        if (merciSpot != null && ilsa == dpsChar) {
            ilsa.globalDps *= 1 + legendaryFactor(ilsa, 1);
        }
    };
    //////Slot 23 //GreySkull, the Pirate
    var greyskull = getCrusader('23');
    greyskull.calculate = function () {
        greyskull.globalGold *= 1 + 0.05 * itemAbility(greyskull, 0) * numAttacking;
        if (countShots) {
            greyskull.globalDps *= 1 + 2 * itemGreyShots(greyskull, 2) / 10;
        }
        greyskull.globalDps *= 1 + 0.5 * currentWorld.countTags(Tag.tank) * legendaryFactor(greyskull, 0);
        greyskull.globalDps *= 1 + 0.2 * currentWorld.countTags(Tag.tank) * legendaryFactor(greyskull, 1);
        if (dpsChar && dpsChar.tags.includes(Tag.human)) {
            greyskull.globalDps *= 1 + legendaryFactor(greyskull, 2);
        }
    };
    ////Eiralon, the Blood Mage
    var eiralon = getCrusader('23a');
    eiralon.calculate = function () {
        var eiralonSpot = getCrusaderSpot(app.formationIds, eiralon.id);
        var adjacent = currentWorld.whatsAdjacent(eiralonSpot);
        eiralon.globalDps *= 1 + 0.5 * itemAbility(eiralon, 0);
        var dpsCharSpot = dpsChar && getDpsSpot(app.formationIds, dpsChar);
        if (dpsChar && currentWorld.getColumnNum(eiralonSpot) == currentWorld.getColumnNum(dpsCharSpot)) {
            eiralon.globalDps *= 1 + 1 * itemAbility(eiralon, 0);
        }
        else if (karen == dpsChar) {
            eiralon.globalDps *= 1 + 1 * itemAbility(eiralon, 0) * 0.5 * itemAbility(karen, 0);
            karen.effects += 1;
        }
        eiralon.globalDps *= 1 + currentWorld.countTags(Tag.healer) * legendaryFactor(eiralon, 0);
        eiralon.globalDps *= 1 + 0.5 * currentWorld.countTags(Tag.magic) * legendaryFactor(eiralon, 1);
        if (dpsChar && adjacent.includes(dpsCharSpot || NaN)) {
            eiralon.globalDps *= 1 + legendaryFactor(eiralon, 2);
        }
    };
    //Formations 0, x, x, x x, 4, x, x 1, x, 7, x x, 5, x, 9 2, x, 8, x 3, x, x, x
    var worldsWake = app.worldsWake = new World(1, "World's Wake", 10);
    (() => {
        var x = null;
        worldsWake.layout = [
            [
                0, x, x, x
            ],
            [
                x, 4, x, x
            ],
            [
                1, x, 7, x
            ],
            [
                x, 5, x, 9
            ],
            [
                2, x, 8, x
            ],
            [
                x, 6, x, x
            ],
            [3, x, x, x]
        ];
        worldsWake.setAdjacent(0, [1, 4]);
        worldsWake.setAdjacent(1, [0, 2, 4, 5]);
        worldsWake.setAdjacent(2, [1, 3, 5, 6]);
        worldsWake.setAdjacent(3, [2, 6]);
        worldsWake.setAdjacent(4, [0, 1, 5, 7]);
        worldsWake.setAdjacent(5, [
            1,
            2,
            4,
            6,
            7,
            8
        ]);
        worldsWake.setAdjacent(6, [2, 3, 5, 8]);
        worldsWake.setAdjacent(7, [4, 5, 8, 9]);
        worldsWake.setAdjacent(8, [5, 6, 7, 9]);
        worldsWake.setAdjacent(9, [7, 8]);
        for (var i = 0; i < 10; i++) {
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
    })();
    // X X 3 X X | 0 X 1 X 6 X | 1 O X 4 X 8 | 2 X 2 X 7 X | 3 X X 5 X X | 4
    var descent = app.descent = new World(2, "Descent into Darkness", 9);
    (() => {
        var x = null;
        descent.layout = [
            [
                x, x, 3, x, x
            ],
            [
                x, 1, x, 6, x
            ],
            [
                0, x, 4, x, 8
            ],
            [
                x, 2, x, 7, x
            ],
            [x, x, 5, x, x] // |, 4
        ];
        descent.setAdjacent(0, [1, 2]);
        descent.setAdjacent(1, [0, 2, 3, 4]);
        descent.setAdjacent(2, [0, 1, 4, 5]);
        descent.setAdjacent(3, [1, 4, 6]);
        descent.setAdjacent(4, [
            1,
            2,
            3,
            5,
            6,
            7
        ]);
        descent.setAdjacent(5, [2, 4, 7]);
        descent.setAdjacent(6, [3, 4, 7, 8]);
        descent.setAdjacent(7, [4, 5, 6, 8]);
        descent.setAdjacent(8, [6, 7]);
        for (var i = 0; i < descent.spots; i++) {
            switch (true) {
                case (i === 0):
                    descent.setColumn(i, 1);
                    break;
                case (i < 3):
                    descent.setColumn(i, 2);
                    break;
                case (i < 6):
                    descent.setColumn(i, 3);
                    break;
                case (i < 8):
                    descent.setColumn(i, 4);
                    break;
                case (i == 9):
                    descent.setColumn(i, 5);
                    break;
            }
        }
    })();
    // 0 X 5 X A | 0 X 3 X 8 X | 1 1 X 6 X B | 2 X 4 X 9 X | 3 2 X 7 X C | 4
    var ghostbeard = app.ghostbeard = new World(3, "Ghostbeard's Greed", 13);
    (() => {
        var x = null;
        ghostbeard.layout = [
            [
                0, x, 5, x, 10
            ],
            [
                x, 3, x, 8, x
            ],
            [
                1, x, 6, x, 11
            ],
            [
                x, 4, x, 9, x
            ],
            [2, x, 7, x, 12] // | 4,
        ];
        ghostbeard.setAdjacent(0, [1, 3]);
        ghostbeard.setAdjacent(1, [0, 2, 3, 4]);
        ghostbeard.setAdjacent(2, [1, 4]);
        ghostbeard.setAdjacent(3, [0, 1, 4, 5, 6]);
        ghostbeard.setAdjacent(4, [1, 2, 3, 6, 7]);
        ghostbeard.setAdjacent(5, [3, 6, 8]);
        ghostbeard.setAdjacent(6, [
            3,
            4,
            5,
            7,
            8,
            9
        ]);
        ghostbeard.setAdjacent(7, [4, 6, 9]);
        ghostbeard.setAdjacent(8, [5, 6, 9, 10, 11]);
        ghostbeard.setAdjacent(9, [6, 7, 8, 11, 12]);
        ghostbeard.setAdjacent(10, [8, 11]);
        ghostbeard.setAdjacent(11, [8, 9, 10, 12]);
        ghostbeard.setAdjacent(12, [9, 11]);
        for (var i = 0; i < ghostbeard.spots; i++) {
            switch (true) {
                case (i < 3):
                    ghostbeard.setColumn(i, 1);
                    break;
                case (i < 5):
                    ghostbeard.setColumn(i, 2);
                    break;
                case (i < 8):
                    ghostbeard.setColumn(i, 3);
                    break;
                case (i < 10):
                    ghostbeard.setColumn(i, 4);
                    break;
                case (i < 13):
                    ghostbeard.setColumn(i, 5);
                    break;
            }
        }
    })();
    //Grimm X 2 X X X X, 0 X 5 X 8 X, X 3 X 7 X A, 1 X 6 X 9 X, X 4 X X X X
    var grimm = app.grimm = new World(6, "Grimm's Idle Tales", 6);
    (() => {
        var x = null;
        grimm.layout = [
            [
                x,
                2,
                x,
                x,
                x,
                x
            ],
            [
                0,
                x,
                5,
                x,
                8,
                x
            ],
            [
                x,
                3,
                x,
                7,
                x,
                10
            ],
            [
                1,
                x,
                6,
                x,
                9,
                x
            ],
            [
                x,
                4,
                x,
                x,
                x,
                x
            ]
        ];
        grimm.setAdjacent(0, [1, 2, 3]);
        grimm.setAdjacent(1, [0, 3, 4]);
        grimm.setAdjacent(2, [0, 3, 5]);
        grimm.setAdjacent(3, [
            0,
            1,
            2,
            4,
            5,
            6
        ]);
        grimm.setAdjacent(4, [1, 3, 6]);
        grimm.setAdjacent(5, [2, 3, 6, 7]);
        grimm.setAdjacent(6, [3, 4, 5, 7]);
        grimm.setAdjacent(7, [5, 6, 8, 9]);
        grimm.setAdjacent(8, [7, 9, 10]);
        grimm.setAdjacent(9, [7, 8, 10]);
        grimm.setAdjacent(10, [8, 9]);
        for (var i = 0; i < 10; i++) {
            if (i < 2) {
                grimm.setColumn(i, 1);
            }
            else if (i < 5) {
                grimm.setColumn(i, 2);
            }
            else if (i < 7) {
                grimm.setColumn(i, 3);
            }
            else if (i < 8) {
                grimm.setColumn(i, 4);
            }
            else if (i < 10) {
                grimm.setColumn(i, 5);
            }
            else if (i == 10) {
                grimm.setColumn(i, 6);
            }
        }
    })();
    //Mischief X X X 4 X 9 X X 2 X 7 X 0 1 X 5 X A X X 3 X 8 X X X X 6 X B
    var mischief = app.mischief = new World(12, "Mischief at Mugwarts", 12);
    (() => {
        var x = null;
        mischief.layout = [
            [
                x,
                x,
                x,
                4,
                x,
                9
            ],
            [
                x,
                x,
                2,
                x,
                7,
                x
            ],
            [
                0,
                1,
                x,
                5,
                x,
                10
            ],
            [
                x,
                x,
                3,
                x,
                8,
                x
            ],
            [
                x,
                x,
                x,
                6,
                x,
                11
            ]
        ];
        mischief.setAdjacent(0, [1]);
        mischief.setAdjacent(1, [0, 2, 3]);
        mischief.setAdjacent(2, [1, 3, 4, 5]);
        mischief.setAdjacent(3, [1, 2, 5]);
        mischief.setAdjacent(4, [2, 5, 7]);
        mischief.setAdjacent(5, [
            2,
            3,
            4,
            6,
            7,
            8
        ]);
        mischief.setAdjacent(6, [3, 5, 8]);
        mischief.setAdjacent(7, [4, 5, 8, 9, 10]);
        mischief.setAdjacent(8, [5, 6, 7, 10, 11]);
        mischief.setAdjacent(9, [7, 10]);
        mischief.setAdjacent(10, [7, 8, 9, 11]);
        mischief.setAdjacent(11, [8, 10]);
        for (var i = 0; i < 10; i++) {
            if (i < 1) {
                mischief.setColumn(i, 1);
            }
            else if (i < 2) {
                mischief.setColumn(i, 2);
            }
            else if (i < 4) {
                mischief.setColumn(i, 3);
            }
            else if (i < 7) {
                mischief.setColumn(i, 4);
            }
            else if (i < 9) {
                mischief.setColumn(i, 5);
            }
            else if (i < 12) {
                mischief.setColumn(i, 6);
            }
        }
    })();
    // X X 6 X X X 3 X 8 X 0 X X X B X 4 X 9 X 1 X X X C X 5 X A X 2 X 7 X D
    var player = app.player = new World(16, "Ready Player 2", 14);
    (function () {
        player.setAdjacent(0, [1, 3, 4]);
        player.setAdjacent(1, [0, 2, 4, 5]);
        player.setAdjacent(2, [1, 5]);
        player.setAdjacent(3, [0, 4, 6]);
        player.setAdjacent(4, [0, 1, 3, 5]);
        player.setAdjacent(5, [1, 2, 4, 7]);
        player.setAdjacent(6, [3, 8]);
        player.setAdjacent(7, [5, 10]);
        player.setAdjacent(8, [6, 9, 11]);
        player.setAdjacent(9, [8, 10, 11, 12]);
        player.setAdjacent(10, [7, 9, 12, 13]);
        player.setAdjacent(11, [8, 9, 12]);
        player.setAdjacent(12, [9, 10, 11, 13]);
        player.setAdjacent(13, [10, 12]);
        var x = null;
        player.layout = [
            [
                x, x, 6, x, x
            ],
            [
                x, 3, x, 8, x
            ],
            [
                0, x, x, x, 11
            ],
            [
                x, 4, x, 9, x
            ],
            [
                1, x, x, x, 12
            ],
            [
                x, 5, x, 10, x
            ],
            [2, x, 7, x, 13]
        ];
        for (var i = 0; i < 10; i++) {
            if (i < 3) {
                player.setColumn(i, 1);
            }
            else if (i < 6) {
                player.setColumn(i, 2);
            }
            else if (i < 8) {
                player.setColumn(i, 3);
            }
            else if (i < 11) {
                player.setColumn(i, 4);
            }
            else if (i < 15) {
                player.setColumn(i, 5);
            }
        }
    })();
    // Idols through Time 0 X X X X X X X 7 X 1 X 5 X A X 4 X 8 X 2 X 6 X B X X X 9
    // X 3 X X X X
    var itt = app.itt = new World(23, "Idols Through Time", 12);
    (function () {
        itt.setAdjacent(0, [1]);
        itt.setAdjacent(1, [0, 2, 4]);
        itt.setAdjacent(2, [1, 3, 4]);
        itt.setAdjacent(3, [2]);
        itt.setAdjacent(4, [1, 2, 5, 6]);
        itt.setAdjacent(5, [4, 6, 7, 8]);
        itt.setAdjacent(6, [4, 5, 8, 9]);
        itt.setAdjacent(7, [5, 8, 10]);
        itt.setAdjacent(8, [
            5,
            6,
            7,
            9,
            10,
            11
        ]);
        itt.setAdjacent(9, [6, 11]);
        itt.setAdjacent(10, [7, 8, 11]);
        itt.setAdjacent(11, [8, 9, 10]);
        var x = null;
        itt.layout = [
            [
                0, x, x, x, x
            ],
            [
                x, x, x, 7, x
            ],
            [
                1, x, 5, x, 10
            ],
            [
                x, 4, x, 8, x
            ],
            [
                2, x, 6, x, 11
            ],
            [
                x, x, x, 9, x
            ],
            [3, x, x, x, x]
        ];
        for (var i = 0; i <= 11; i++) {
            if (i < 4) {
                itt.setColumn(i, 1);
            }
            else if (i < 5) {
                itt.setColumn(i, 2);
            }
            else if (i < 7) {
                itt.setColumn(i, 3);
            }
            else if (i < 10) {
                itt.setColumn(i, 4);
            }
            else if (i < 12) {
                itt.setColumn(i, 5);
            }
        }
    })();
    // Amusement Park 0 X X X X X 4 X 8 X 1 X 6 X B X X X 9 X 2 X 7 X C X 5 X A X 3 X
    // X X X
    var park = app.park = new World(25, "Amusement Park of Doom", 13);
    (function () {
        park.setAdjacent(0, [1, 4]);
        park.setAdjacent(1, [0, 2, 4]);
        park.setAdjacent(2, [1, 3, 5]);
        park.setAdjacent(3, [2, 5]);
        park.setAdjacent(4, [0, 1, 6]);
        park.setAdjacent(5, [2, 3, 7]);
        park.setAdjacent(6, [4, 7, 8, 9]);
        park.setAdjacent(7, [5, 6, 9, 10]);
        park.setAdjacent(8, [6, 9, 11]);
        park.setAdjacent(9, [
            6,
            7,
            8,
            10,
            11,
            12
        ]);
        park.setAdjacent(10, [7, 9, 12]);
        park.setAdjacent(11, [8, 9, 12]);
        park.setAdjacent(12, [9, 10, 11]);
        var x = null;
        park.layout = [
            [
                0, x, x, x, x
            ],
            [
                x, 4, x, 8, x
            ],
            [
                1, x, 6, x, 11
            ],
            [
                x, x, x, 9, x
            ],
            [
                2, x, 7, x, 12
            ],
            [
                x, 5, x, 10, x
            ],
            [3, x, x, x, x]
        ];
        for (var i = 0; i < 10; i++) {
            if (i < 4) {
                park.setColumn(i, 1);
            }
            else if (i < 6) {
                park.setColumn(i, 2);
            }
            else if (i < 8) {
                park.setColumn(i, 3);
            }
            else if (i < 11) {
                park.setColumn(i, 4);
            }
            else if (i < 13) {
                park.setColumn(i, 5);
            }
        }
    })();
    // approx line 311649 of gamedata
    //
    var gardeners = app.gardeners = new World(17, "Gardeners of the Galaxy", 12);
    (() => {
        var x = null;
        gardeners.layout = [
            [
                0, 2, 4, 8, 10
            ],
            [
                1, 3, 5, 9, 11
            ],
            [
                x, x, 6, x, x
            ],
            [x, x, 7, x, x]
        ];
        gardeners
            .layout
            .map(row => row.map((spot, column) => {
            if (spot != null) {
                gardeners.setColumn(spot, column);
            }
        }));
        var adjacents = [
            [
                0,
                [1, 2, 3]
            ],
            [
                1,
                [0, 3]
            ],
            [
                2,
                [0, 3, 4, 5]
            ],
            [
                3,
                [0, 1, 2, 5, 6]
            ],
            // top of tree
            [
                4,
                [2, 5, 8]
            ],
            [
                5,
                [
                    2,
                    3,
                    4,
                    6,
                    8,
                    9
                ]
            ],
            [
                6,
                [3, 5, 7, 9]
            ],
            // bottom of tree
            [7, [6]
            ],
            [
                8,
                [4, 5, 9, 10]
            ],
            [
                9,
                [5, 6, 8, 10, 11]
            ],
            [
                10,
                [8, 9, 11]
            ],
            [
                11,
                [9, 10]
            ]
        ];
        adjacents.map(spotWithAdj => gardeners.setAdjacent(spotWithAdj[0], spotWithAdj[1]));
    })();
    var carnival = new World(4, "Carnival of Sorrows", 9);
    var newMoon = new World(5, "Emo's New Moon", 12);
    var getWorldById = my.getWorldById = id => {
        var worlds = [worldsWake,
            descent,
            ghostbeard,
            carnival,
            newMoon,
            grimm,
            mischief,
            player,
            itt,
            park,
            gardeners
        ];
        var world = worlds.find(w => w.id == id);
        if (!(world != null))
            console.error("worldId not implemented" + id);
        return world;
    };
    var critChance = 1;
    var globalDps = 1;
    var globalGold = 1;
    my.setDPS = function (id) {
        var crusader = getCrusader(id);
        dpsChar = crusader;
    };
    //Set Up Formation
    var currentWorld = worldsWake;
    // this is a checksum variable, nothing should DEPEND on this.
    app.currentWorldId = currentWorld.id;
    // formation[0]=emo; formation[7]=sasha; formation[2]=kaine; formation[3]=panda;
    // setDPS("Emo"); Set base values for the formation crusaders and calculate
    var doCalculation = (cru, formationIds) => {
        if (cru.calculate) {
            cru.calculate(formationIds);
        }
    };
    /**
     * @param {Array<string>} formationIds
     * @return {Object} globalDps and globalGold container
     */
    my.calculateMultipliers = formationIds => {
        var globalDps = 1;
        var globalGold = 1;
        // some of the methods this calls rely on the global state =/ have not worked on
        // cleaning all that out yet
        app.formationIds = formationIds;
        jsonData
            .crusaders
            .filter(cru => formationIds.includes(cru.id))
            .map(cru => {
            // set them all up BEFORE you do any calculations
            crusaderSetup(cru);
            return cru;
        })
            .map(cru => {
            var globalIsOk = typeof (globalDps) === "number" && !isNaN(globalDps);
            if (app.throw === true) {
                doCalculation(cru, formationIds);
                if (globalIsOk && !(typeof (globalDps) === "number" && !isNaN(globalDps)))
                    throw Error("global was busted by " + cru);
            }
            else
                try {
                    doCalculation(cru, formationIds);
                }
                catch (ex) {
                    console.error('failed to calculate for ', cru);
                }
            if (cru.globalDps != null && !isNaN(cru.globalDps))
                globalDps *= cru.globalDps || 1;
            if (globalIsOk && !(typeof (globalDps) === "number" && !isNaN(globalDps)))
                throw Error("global was busted by " + cru);
            globalGold *= cru.globalGold || 1;
        });
        var result = {
            globalDps: globalDps,
            globalGold: globalGold
        };
        return result;
    };
    my.setWorldById = (worldId, formationIds) => {
        var nextWorld = getWorldById(worldId);
        if (nextWorld != null) {
            currentWorld = nextWorld;
            // // apparently chicken + egg, get if(formationIds != null)
            my.calculateMultipliers(formationIds);
        }
        else {
            console.error("no world found for id:" + worldId);
        }
    };
    // for (var i in formation) {  formation[i].calculate();  globalDps *=
    // formation[i].globalDps;  globalGold *= formation[i].globalGold;  critChance
    // += formation[i].critChance; } for (var i in formation) {
    // formation[i].calculate(); } Optional Arguments we might need
    var countShots = true;
    var underAttack = false;
    var monstersOnscreen = 0;
    var numAttacking = 0;
    var littlefootXP = 0;
    var killedThisStage = 0;
    var currentStage = 0;
})(findJsParent(), false);
//# sourceMappingURL=mathCalc.js.map