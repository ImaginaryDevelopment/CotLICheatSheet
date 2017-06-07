/// <reference path="../node_modules/@types/node/index.d.ts" />;

/* global describe it require */
var assert, assertIsFunction;

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
