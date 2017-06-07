#coffeelint: disable=no_backticks
#the following transpiler comment(s) is/are for eslint
`/// <reference path="../node_modules/@types/node/index.d.ts" />`
#coffeelint: enable=no_backticks
### global describe it require ###
# mocha

assert = require 'assert'
assertIsFunction = (t) -> assert.equal t, "function"
# hello world test, make sure that a simple test works
describe 'Array',
  () ->
    describe '#indexOf()',
      () ->
        it 'should return -1 when the value is not present',
          () -> assert.equal -1, [1,2,3].indexOf 4