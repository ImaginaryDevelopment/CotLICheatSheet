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
var Loot = require('../js/domain/loot');
describe('loot module', () =>{
 it("should exist", () =>{
     console.log(Loot);
    //  assert.ifError(global.Loot);
    assert.notEqual(Loot, undefined);

 })
});

// })(global);