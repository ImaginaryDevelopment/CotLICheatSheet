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

  # should return the legendary level if legendary
  # should return 0 on non-legendary rarity items
  # in the event refGear for a specific crusader is not loaded
  #   should return undefined if refGear is not provided
  # in the event legendary level wasn't provided
  # and it is legendary rarity
  #   should return 1
  describe 'getLLevel', ->
    getLLevel = (lootId,rarity,input) ->
      refGear = [makeGear lootId, false, rarity]
      actual = LootV2.getLLevel input,refGear
    it 'should return the legendary level if legendary', ->
      expected = 2
      actual = getLLevel 8, 5, "8_2"
      assert.equal actual,expected
    it 'should return 0 on non-legendary', ->
      expected = 0
      actual = getLLevel 10, 4, "10_"
      assert.equal actual,expected
    it 'should return undefined for no refGear', ->
      expected = undefined
      actual = LootV2.getLLevel "11_", undefined
      assert.equal actual,expected

    it 'should work on a number', ->
      expected = 1
      actual = getLLevel 8, 5, 8
      assert.equal actual,expected

    it 'should return null for items not found', ->
      expected = null
      refGear = []
      actual = LootV2.getLLevel 8, refGear
      assert.equal actual,expected
    it 'should work on a golden', ->
      expected = 1
      refGear = [makeGear 6,true,5]
      actual = LootV2.getLLevel 6, refGear
      assert.equal actual,expected
    it 'should return 0 on a non-legendary', ->
      expected = 0
      refGear = [makeGear 9,false,4]
      actual = LootV2.getLLevel 8,refGear
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

