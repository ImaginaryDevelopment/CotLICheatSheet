#mocha
assert = require 'assert'

# hello world test, make sure that a simple test works
describe 'Array',
  () ->
    describe '#indexOf()',
      () ->
        it 'should return -1 when the value is not present',
          () -> assert.equal -1, [1,2,3].indexOf 4
eptracker = require '../js/eptracker.react.js'
describe 'getCrusaderDps',
    () ->
      describe 'given null',
          () ->
            it 'should not return a number',
              () ->
                result = eptracker.getCrusaderDps(null)
                throw new Error "Test failed" if typeof(result) is "number"