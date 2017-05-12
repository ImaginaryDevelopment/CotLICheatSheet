#mocha
assert = require 'assert'
# hello world test, make sure that a simple test works
describe 'Array',
  () ->
    describe '#indexOf()',
      () ->
        it 'should return -1 when the value is not present',
          () -> assert.equal -1, [1,2,3].indexOf 4

extensions = require '../js/allHelpers'