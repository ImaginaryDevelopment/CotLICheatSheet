#mocha
assert = require 'assert'

# import { React } from 'react'

# hello world test, make sure that a simple test works
describe 'Array',
  () ->
    describe '#indexOf()',
      () ->
        it 'should return -1 when the value is not present',
          () -> assert.equal -1, [1,2,3].indexOf 4

global.React = require('react')

global.ReactDOM = require('react-dom')

# React = require 'react'
# # React = react.React
# reactDom = require 'react-dom'

global.jsonData = {}
eptracker = require '../js/eptracker.react'
describe 'getCrusaderDps',
    () ->
      describe 'given null',
          () ->
            it 'should not return a number',
              () ->
                result = eptracker.getCrusaderDps(null)
                throw new Error "Test failed" if typeof(result) is "number"