#coffeelint: disable=no_backticks
#the following transpiler comment(s) is/are for eslint
`/// <reference path="../node_modules/@types/node/index.d.ts" />`
#coffeelint: enable=no_backticks
### global describe it require ###
# mocha

assert = require 'assert'
assertIsFunction = (t) -> assert.equal t, "function"
# hello world test, make sure that a simple test works
describe 'Array', ->
  describe '#indexOf()', ->
    it 'should return -1 when the value is not present',
      -> assert.equal -1, [1,2,3].indexOf 4

# https://nodejs.org/api/assert.html
describe 'assert', ->
  describe 'throws', ->
    it 'should pass when the delegate throws', ->
      assert.throws ->
        throw Error "test"
    it 'should pass when the delegate throws matching message', ->
      assert.throws ->
        throw Error "test",/^test$/

LootMod = require('../js/domain/loot')

bigUpperBound = 2000
# 0 = none, 1 = common, 2 = uncommon, 3=rare, 4 epic, 5 = legendary

describe 'LootV1 module', ->
  LootV1 = LootMod.LootV1
  #bushwhacker has an id 5 gear item =(
  it "should return true for a V1 number 0-5", ->
    expected = true
    for i in [0..5]
      actual = LootV1.getIsV1 i
      assert.equal actual,expected
  it "should return false for a V2 number >= 6", ->
    expected = false
    for i in [6..bigUpperBound]
      actual = LootV1.getIsV1 i
      assert.equal actual,expected

describe 'LootV2 module', ->
  LootV2 = LootMod.LootV2
  makeGear = (lootId,golden,rarity) ->
    {golden,lootId,rarity}
  describe 'getLootIdFromLootIdOrCompound', ->
    it 'should work on a number >= 6', ->
      for i in [6..bigUpperBound]
        expected = i
        actual = LootV2.getLootIdFromLootIdOrCompound i
        assert.equal actual,expected
    it 'should work on a string >=6', ->
      for i in [6..bigUpperBound]
        expected = i.toString()
        actual = LootV2.getLootIdFromLootIdOrCompound expected
        assert.equal actual,expected
    it 'should work on a compound string >=6', ->
      for i in [6..bigUpperBound]
        expected = i.toString()
        arg = i + "_"
        actual = LootV2.getLootIdFromLootIdOrCompound arg
        assert.equal actual,expected
  describe 'getIsGolden', ->
    it 'should work on a number >= 6', ->
      for i in [6..bigUpperBound]
        expected = false
        refGear = [makeGear i,expected]
        actual = LootV2.getIsGolden refGear,i
        assert.equal actual,expected
    it 'should work on a string >=6', ->
      for i in [6..bigUpperBound]
        expected = false
        refGear = [makeGear i,expected]
        actual = LootV2.getIsGolden refGear,i.toString()
        assert.equal actual,expected
    it 'should work on a compound string >=6', ->
      for i in [6..bigUpperBound]
        expected = false
        refGear = [makeGear i,expected]
        arg = i.toString() + "_"
        actual = LootV2.getIsGolden refGear, arg
        assert.equal actual,expected
    it 'should fail on no refGear passed', ->
      assert.throws ->
        LootV2.getIsGolden ""
  describe 'getRarityByItemId', ->
    it 'should work on a number', ->
      expected = 2
      refGear = [makeGear 7,false,expected]
      actual = LootV2.getRarityByItemId 7, refGear
      assert.equal actual,expected


describe 'Loot module', ->
  Loot = LootMod.Loot
  it "should exist", ->
    assert.notEqual Loot, undefined

  it "should be able to get legendary level", ->
    expected = 3
    actual = Loot.getLLevel "846_3"
    assert.equal actual,expected

  it "should be able to get a V1 legendary level", ->
    expected = 4
    actual = Loot.getLLevel "5g4"
    assert.equal actual,expected

