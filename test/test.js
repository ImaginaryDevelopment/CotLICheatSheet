var assert = require('assert');
describe('Array', function() {
  describe('#indexOf()', function() {
    it('should return -1 when the value is not present', function() {
      assert.equal(-1, [1,2,3].indexOf(4));
    });
  });
});
// (function(){
// global.window = global;
var LootMod = require('../js/domain/loot');
describe('LootV1 module', () =>{
    var LootV1 = LootMod.LootV1;
    console.log(LootV1);
    // bushwhacker has an id 5 gear item =(
    it("should be return true for a V1 number 0-5", () =>{
        var expected = true;
        for(var i = 0; i++; i<=5){
            var actual = LootV1.getIsV1(i);
            assert.equal(actual,expected);
        }
    });
    it("should return false for a V2 number >= 6", () =>{
      var expected = false;
      for(var i = 6; i++; i<=1000){
        var actual = LootV1.getIsV1(i);
        assert.equal(actual,expected);
      }
    });

});

describe('loot module', () =>{
  var Loot = LootMod.Loot;
  it("should exist", () =>{
    assert.notEqual(Loot, undefined);
  });
  it("should be able to get legendary level", () =>{
     var expected = 3;
     var actual = Loot.getLLevel("846_3");
     assert.equal(actual,expected);
 });
 it("should be able to get a V1 legendary level", () =>{
   var expected = 4;
   var actual = Loot.getLLevel("5g4");
   assert.equal(actual,expected);

 })
});

// })(global);