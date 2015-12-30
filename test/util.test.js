var util = require('../util.js');
var should = require('should');

describe("test/util.test.js", function () {
    it("Common case 1", function () {
        var originString = "Apple is usually heavier than orange.";
        var beforeString = "usually ";
        var afterString = " than";
        util.sliceString(originString, beforeString, afterString).should.equal("heavier");
    });
});