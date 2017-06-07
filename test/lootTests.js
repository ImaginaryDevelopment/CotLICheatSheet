/// <reference path="../node_modules/@types/node/index.d.ts" />;

/* global describe it require */
var LootMod, assert, assertIsFunction, bigUpperBound;

assert = require('assert');

assertIsFunction = function(t) {
  return assert.equal(t, "function");
};

describe('Array', function() {
  return describe('#indexOf()', function() {
    return it('should return -1 when the value is not present', function() {
      return assert.equal(-1, [1, 2, 3].indexOf(4));
    });
  });
});

describe('assert', function() {
  return describe('throws', function() {
    it('should pass when the delegate throws', function() {
      return assert.throws(function() {
        throw Error("test");
      });
    });
    return it('should pass when the delegate throws matching message', function() {
      return assert.throws(function() {
        throw Error("test", /^test$/);
      });
    });
  });
});

LootMod = require('../js/domain/loot');

bigUpperBound = 2000;

describe('LootV1 module', function() {
  var LootV1;
  LootV1 = LootMod.LootV1;
  it("should return true for a V1 number 0-5", function() {
    var actual, expected, i, j, results;
    expected = true;
    results = [];
    for (i = j = 0; j <= 5; i = ++j) {
      actual = LootV1.getIsV1(i);
      results.push(assert.equal(actual, expected));
    }
    return results;
  });
  return it("should return false for a V2 number >= 6", function() {
    var actual, expected, i, j, ref, results;
    expected = false;
    results = [];
    for (i = j = 6, ref = bigUpperBound; 6 <= ref ? j <= ref : j >= ref; i = 6 <= ref ? ++j : --j) {
      actual = LootV1.getIsV1(i);
      results.push(assert.equal(actual, expected));
    }
    return results;
  });
});

describe('LootV2 module', function() {
  var LootV2, makeGear;
  LootV2 = LootMod.LootV2;
  makeGear = function(lootId, golden, rarity) {
    return {
      golden: golden,
      lootId: lootId,
      rarity: rarity
    };
  };
  describe('getLootIdFromLootIdOrCompound', function() {
    it('should work on a number >= 6', function() {
      var actual, expected, i, j, ref, results;
      results = [];
      for (i = j = 6, ref = bigUpperBound; 6 <= ref ? j <= ref : j >= ref; i = 6 <= ref ? ++j : --j) {
        expected = i;
        actual = LootV2.getLootIdFromLootIdOrCompound(i);
        results.push(assert.equal(actual, expected));
      }
      return results;
    });
    it('should work on a string >=6', function() {
      var actual, expected, i, j, ref, results;
      results = [];
      for (i = j = 6, ref = bigUpperBound; 6 <= ref ? j <= ref : j >= ref; i = 6 <= ref ? ++j : --j) {
        expected = i.toString();
        actual = LootV2.getLootIdFromLootIdOrCompound(expected);
        results.push(assert.equal(actual, expected));
      }
      return results;
    });
    return it('should work on a compound string >=6', function() {
      var actual, arg, expected, i, j, ref, results;
      results = [];
      for (i = j = 6, ref = bigUpperBound; 6 <= ref ? j <= ref : j >= ref; i = 6 <= ref ? ++j : --j) {
        expected = i.toString();
        arg = i + "_";
        actual = LootV2.getLootIdFromLootIdOrCompound(arg);
        results.push(assert.equal(actual, expected));
      }
      return results;
    });
  });
  describe('getIsGolden', function() {
    it('should work on a number >= 6', function() {
      var actual, expected, i, j, ref, refGear, results;
      results = [];
      for (i = j = 6, ref = bigUpperBound; 6 <= ref ? j <= ref : j >= ref; i = 6 <= ref ? ++j : --j) {
        expected = false;
        refGear = [makeGear(i, expected)];
        actual = LootV2.getIsGolden(refGear, i);
        results.push(assert.equal(actual, expected));
      }
      return results;
    });
    it('should work on a string >=6', function() {
      var actual, expected, i, j, ref, refGear, results;
      results = [];
      for (i = j = 6, ref = bigUpperBound; 6 <= ref ? j <= ref : j >= ref; i = 6 <= ref ? ++j : --j) {
        expected = false;
        refGear = [makeGear(i, expected)];
        actual = LootV2.getIsGolden(refGear, i.toString());
        results.push(assert.equal(actual, expected));
      }
      return results;
    });
    it('should work on a compound string >=6', function() {
      var actual, arg, expected, i, j, ref, refGear, results;
      results = [];
      for (i = j = 6, ref = bigUpperBound; 6 <= ref ? j <= ref : j >= ref; i = 6 <= ref ? ++j : --j) {
        expected = false;
        refGear = [makeGear(i, expected)];
        arg = i.toString() + "_";
        actual = LootV2.getIsGolden(refGear, arg);
        results.push(assert.equal(actual, expected));
      }
      return results;
    });
    return it('should fail on no refGear passed', function() {
      return assert.throws(function() {
        return LootV2.getIsGolden("");
      });
    });
  });
  describe('getRarityByItemId', function() {
    return it('should work on a number', function() {
      var actual, expected, refGear;
      expected = 2;
      refGear = [makeGear(7, false, expected)];
      actual = LootV2.getRarityByItemId(7, refGear);
      return assert.equal(actual, expected);
    });
  });
  return describe('getLLevel', function() {
    var getLLevel;
    getLLevel = function(lootId, rarity, input) {
      var actual, refGear;
      refGear = [makeGear(lootId, false, rarity)];
      return actual = LootV2.getLLevel(input, refGear);
    };
    it('should return the legendary level if legendary', function() {
      var actual, expected;
      expected = 2;
      actual = getLLevel(8, 5, "8_2");
      return assert.equal(actual, expected);
    });
    it('should return 0 on non-legendary', function() {
      var actual, expected;
      expected = 0;
      actual = getLLevel(10, 4, "10_");
      return assert.equal(actual, expected);
    });
    it('should return undefined for no refGear', function() {
      var actual, expected;
      expected = void 0;
      actual = LootV2.getLLevel("11_", void 0);
      return assert.equal(actual, expected);
    });
    it('should work on a number', function() {
      var actual, expected;
      expected = 1;
      actual = getLLevel(8, 5, 8);
      return assert.equal(actual, expected);
    });
    it('should work on a non-golden', function() {
      var actual, expected, refGear;
      expected = 1;
      refGear = [makeGear(9, false, 5)];
      actual = LootV2.getLLevel(8, refGear);
      return assert.equal(actual, expected);
    });
    return it('should return 0 on a non-legendary', function() {
      var actual, expected, refGear;
      expected = 0;
      refGear = [makeGear(9, false, 4)];
      actual = LootV2.getLLevel(8, refGear);
      return assert.equal(actual, expected);
    });
  });
});

describe('Loot module', function() {
  var Loot;
  Loot = LootMod.Loot;
  it("should exist", function() {
    return assert.notEqual(Loot, void 0);
  });
  it("should be able to get legendary level", function() {
    var actual, expected;
    expected = 3;
    actual = Loot.getLLevel("846_3");
    return assert.equal(actual, expected);
  });
  return it("should be able to get a V1 legendary level", function() {
    var actual, expected;
    expected = 4;
    actual = Loot.getLLevel("5g4");
    return assert.equal(actual, expected);
  });
});
