var fs = require("fs");
var request = require("superagent");
var async = require("async");

var pageParser = require("./pageParser.js");

var domain = "http://share.popgo.org";
var searchPagePostfix = "/search.php?title=&groups=&uploader=&sorts=&orderby=&page=";
var fullUrl = domain + searchPagePostfix;
var lastPageNumber = 3296;
var numberOfConcurrency = 10;
var tryFail = 5;
var overallTryFail = 20;

var failedUrl = [];

var fetchUrlOneByOne = function (urlNumber, database, whenPageIsLoaded) {
    console.log("Start to load page", urlNumber);
    var url = fullUrl + urlNumber.toString();

    request
        .get(url)
        .end(function (err, res) {
            if (err) {
                console.log("An error is happend");
                console.log("Stack trace: ", err.stack);
                if (tryFail !== 0) {
                    fetchUrlOneByOne(urlNumber, database, whenPageIsLoaded);
                    tryFail--;
                } else {
                    tryFail = 5;
                    fetchUrlOneByOne(urlNumber + 1, database, whenPageIsLoaded);
                    failedUrl.push(parseInt(urlNumber));
                }
            } else {
                console.log("Page", urlNumber, "is loaded");
                var isVisitedPage = pageParser[domain](res.text, database);
                whenPageIsLoaded();
                if (isVisitedPage) {
                    console.log("stopped");
                    return;
                } else {
                    fetchUrlOneByOne(urlNumber + 1, database, whenPageIsLoaded);
                }
            }
        });
};

var fetchUrl = function (urlNumber, database, callback) {
    console.log("Start to load page", urlNumber);
    var url = fullUrl + urlNumber.toString();

    request
        .get(url)
        .end(function (err, res) {
            if (err) {
                callback(err);
                console.log("An error is happend");
                console.log("Stack trace: ", err.stack);
                failedUrl.push(parseInt(urlNumber));
            } else {
                pageParser[domain](res.text, database);
                console.log("Page", urlNumber, "is loaded");
                callback();
            }
        });
};

module.exports.getOneByOne = function (database, whenPageIsLoaded) {
    fetchUrlOneByOne(1, database, whenPageIsLoaded);
};

module.exports.getAll = function (database, whenFinish) {
    var urlNumbers = [];
    for (var i = 1; i < lastPageNumber + 1; i++) {
        urlNumbers.push(i);
    }

    async.eachLimit(urlNumbers, numberOfConcurrency, function (urlNumber, callback) {
        fetchUrl(urlNumber, database, callback);
    }, function (err) {
        if (err) {
            console.log("End error is happend");
            console.log("Stack trace: ", err.stack);
        }

        console.log("finished");
        if (failedUrl.length) {
            console.log("The following page failed.", failedUrl.reduce(function (pre, cur) {
                return pre + ", " + cur;
            }));
        }

        whenFinish();
    });
};
