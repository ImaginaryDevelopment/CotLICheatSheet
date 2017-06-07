/**
 * @typedef {Object} Loot
 * @property {number} lootId
 * @property {number} slot
 * @property {number} rarity
 * @property {string} name
*/
// until this thing is made into more conventional modules
var app = (typeof module !== "undefined" && module && module.exports
    || typeof module !== "undefined" && module)
    || typeof global !== "undefined" && global
    || window;
//loot tracking will use V1 whenever the crusader's loot data isn't in data.js (simple compound string of rarity,isGolden,legendary level)
var LootV1 = app.LootV1 = (function () {
    var my = {};
    // 0 is none, 1 is common, 2 is uncommon, 3 is rare, 4 epic, 5 legendary
    // examples 1, "1", "4g", "5g2"
    /**
     *
     * @param {number | string} itemIdentifier
     */
    var getIsV1 = itemIdentifier => {
        if (!itemIdentifier)
            return itemIdentifier == 0;
        if (typeof (itemIdentifier) == "number" && itemIdentifier <= 5)
            return true;
        if (typeof (itemIdentifier) == "string") {
            if (itemIdentifier.length == 1 && +itemIdentifier <= 5)
                return true;
            // V2 loot can have an _ now
            var index1 = itemIdentifier.indexOf("_");
            var index2 = itemIdentifier.indexOf("g");
            if (index1 == 1 || index2 == 1 || (index1 < 0 && index2 < 0 && +itemIdentifier <= 5))
                return true;
        }
        return false;
    };
    my.getIsV1 = getIsV1;
    /**
     *
     * @param {number | string} itemRarityCompound
     * @return {number}
     */
    var getRarityByItemId = itemRarityCompound => !(itemRarityCompound != null) ? 0 : itemRarityCompound && typeof (itemRarityCompound) === "number" ? itemRarityCompound : +itemRarityCompound[0];
    my.getRarityByItemId = getRarityByItemId;
    /**
     *
     * @param {number | string} itemRarityCompound
     */
    var getIsGolden = itemRarityCompound => !(itemRarityCompound != null) || typeof (itemRarityCompound) != "string" || itemRarityCompound.length < 2 || itemRarityCompound[1] !== "g" ? "" : " golden";
    my.getIsGolden = getIsGolden;
    /**
     * @param {number | string} id
     * @return {number}
     */
    var getLLevel = (id) => {
        if (!id)
            return undefined;
        if (typeof (id) != "string")
            return null;
        var lIndex = id.indexOf("_");
        if (lIndex < 1)
            lIndex = id.indexOf("g");
        if (lIndex < 1 || id.length <= lIndex + 1)
            return null;
        var lLevel = id.slice(lIndex + 1);
        return +lLevel;
    };
    my.getLLevel = getLLevel;
    /**
     * @param {number | string} id
     * @param {number} level
     */
    var changeLLevel = (id, level) => {
        var rarity = my.getRarityByItemId(id);
        var isGolden = my.getIsGolden(id);
        var result = rarity + (isGolden ? "g" : "_") + level;
        return result;
    };
    my.changeLLevel = changeLLevel;
    return my;
}());
var LootV2 = app.LootV2 = (function () {
    var my = {};
    /**
     * @param {number | string} lootIdOrCompound
    */
    var getLootIdFromLootIdOrCompound = lootIdOrCompound => {
        var isCompoundish = typeof (lootIdOrCompound) == "string" && (lootIdOrCompound.indexOf("_") >= 0 || lootIdOrCompound.indexOf("g") >= 0);
        var lootId;
        if (isCompoundish) {
            var compoundIndex_ = lootIdOrCompound.indexOf("_");
            var compoundIndexG = lootIdOrCompound.indexOf("g");
            lootId = +lootIdOrCompound.slice(0, Math.max(compoundIndex_, compoundIndexG));
        }
        else
            lootId = +lootIdOrCompound;
        // if(!(lootId != null) || lootId < 5 || typeof lootId !=="number" || isNaN(lootId) || Number.isNaN(lootId))
        //   debugger;
        return lootId;
    };
    my.getLootIdFromLootIdOrCompound = getLootIdFromLootIdOrCompound;
    /**
    * @param {Array<Loot>} refGear
    * @param {number | string} lootIdOrCompound
    * @return boolean
    */
    var getIsGolden = (loot, lootIdOrCompound) => {
        var lootId = getLootIdFromLootIdOrCompound(lootIdOrCompound);
        // can't fallback to compound string possibility, the only way we'd have one is if this item was in the data before
        var item = loot.find(g => g.lootId == lootId);
        return item && item.golden === true;
    };
    my.getIsGolden = getIsGolden;
    // how would we define a V2? as a valid lootId or an item obtained from looking up the lootId?
    // my.getIsV2 = ???
    /**
     * @param {number | string} lootIdOrCompound
     * @param {Array<Loot>} refGear
     */
    var getRarityByItemId = (lootIdOrCompound, loot) => {
        var lootId = my.getLootIdFromLootIdOrCompound(lootIdOrCompound);
        if (!(loot != null)) {
            console.warn('no loot provided', lootIdOrCompound);
            if (app && app.throw === true)
                throw Error('no refGear provided' + lootIdOrCompound);
            // debugger;
            return 0;
        }
        var item = loot.find(g => g.lootId == lootId);
        // if(!(item != null) || !(item.rarity != null) || isNaN(item.rarity))
        //   debugger;
        return item && item.rarity;
    };
    my.getRarityByItemId = getRarityByItemId;
    // should return the legendary level if legendary
    // should return 0 on non-legendary rarity items
    // should return undefined if refGear is not provided (in the event refGear for a specific crusader is not loaded)
    // should return 1 for any legendary rarity level where it a legendary level wasn't provided in the compound
    my.getLLevel = (compound, loot) => {
        if (!(compound != null))
            return undefined;
        // this case is semi-expected, loot may not always be present for a crusader
        if (!(loot != null)) {
            return undefined;
        }
        if (typeof (compound) != "string" && typeof (compound) != "number") {
            console.warn("bad value passed as compound, expected number, string, or undefined", compound);
            return null;
        }
        var x = compound.toString();
        var compoundIndex = x.indexOf("_");
        if (compoundIndex >= 0 && x.length > compoundIndex)
            return x.slice(compoundIndex + 1);
        // if there is no _ and it is rarity 5, then fallback to 1
        var rarity = getRarityByItemId(compound, loot);
        if (rarity == 5)
            return 1;
        return null;
    };
    my.changeLLevel = (lootIdOrCompound, level) => {
        var lootId = my.getLootIdFromLootIdOrCompound(lootIdOrCompound);
        if (lootIdOrCompound != null && !(lootId != null))
            console.warn('changeLLevel', lootIdOrCompound, level);
        if (level != null && level > 1)
            return lootId + "_" + level;
        return lootId;
    };
    return my;
}());
var Loot = app.Loot = (function () {
    var my = {};
    // id can be V1 compound, lootId, or lootIdCompound (containing legendary level)
    my.getRarityByItemId = (id, refGear) => {
        if (!(id != null)) {
            return null;
        }
        if (LootV1.getIsV1(id)) {
            var v1Result = LootV1.getRarityByItemId(id);
            return v1Result;
        }
        var v2Result = LootV2.getRarityByItemId(id, refGear);
        return v2Result;
    };
    my.getIsGolden = (id, refGear) => {
        if (!(id != null))
            return null;
        if (LootV1.getIsV1(id)) {
            return LootV1.getIsGolden(id);
        }
        return LootV2.getIsGolden(refGear, id);
    };
    // return either the rarity compound like we used to store, or the lootId
    my.getGearInfo = g => g ? [g.s0 || g.slot0, g.s1 || g.slot1, g.s2 || g.slot2] : [0, 0, 0];
    my.getSlotRarities = (id, refGear) => (my.getGearInfo(id)).map(s => my.getRarityByItemId(s, refGear));
    my.getLootFromId = (id, refGear) => {
        // this could try to go get a lootId, why doesn't it try?
        if (LootV1.getIsV1(id)) {
            console.warn('getLootFromId found V1Loot, ignoring', id);
            return null;
        }
        var lootId = LootV2.getLootIdFromLootIdOrCompound(id);
        return refGear.find(g => g.lootId == lootId);
    };
    my.getLLevel =
        /**
         * @param {string | number} id
         * @param {Array<Loot>} refGear
         */
        (id, refGear) => {
            if (LootV1.getIsV1(id))
                return LootV1.getLLevel(id);
            return LootV2.getLLevel(id, refGear);
        };
    my.changeLLevel = (id, level) => {
        if (LootV1.getIsV1(id)) {
            var result = LootV1.changeLLevel(id, level);
            return result;
        }
        var result = LootV2.changeLLevel(id, level);
        return result;
    };
    return my;
}());
//# sourceMappingURL=loot.js.map